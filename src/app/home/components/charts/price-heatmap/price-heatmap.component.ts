import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

@Component({
  selector: 'price-heatmap',
  templateUrl: './price-heatmap.component.html',
  styleUrls: ['./price-heatmap.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class PriceHeatmapComponent implements OnInit {
  data: any[] = [];
  heatmapData: any[] = [];
  channels: string[] = [];
  priceRanges: string[] = [];
  isLoading: boolean = true;

  private svg: any;
  private parentElement: any;
  private margins = { top: 80, right: 100, bottom: 80, left: 120 };
  private height: number = 500;
  private width: number = 700;

  constructor(
    private element: ElementRef,
    private http: HttpClient
  ) {
    this.parentElement = element.nativeElement;
  }

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.http.get('assets/datasets/Region,Channel,Percent_1,Price_From.txt', { responseType: 'text' }).subscribe(data => {
      this.parseCSVData(data);
      this.isLoading = false;
      if (this.data.length > 0) {
        this.processHeatmapData();
        this.renderChart();
      }
    });
  }

  private parseCSVData(csvData: string) {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');

    this.data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    }).filter(d => d.Price_From_1 && d.Price_To_1 && d.Percent_1);

    this.channels = [...new Set(this.data.map(d => d.Channel))];
  }

  private processHeatmapData() {
    // Create price range bins
    const priceFromValues = this.data.map(d => +d.Price_From_1).filter(d => !isNaN(d));
    const priceToValues = this.data.map(d => +d.Price_To_1).filter(d => !isNaN(d));
    const minPrice = Math.min(...priceFromValues);
    const maxPrice = Math.max(...priceToValues);

    // Create 10 price range bins
    const numBins = 10;
    const binSize = (maxPrice - minPrice) / numBins;
    this.priceRanges = [];

    for (let i = 0; i < numBins; i++) {
      const rangeStart = minPrice + (i * binSize);
      const rangeEnd = minPrice + ((i + 1) * binSize);
      this.priceRanges.push(`$${rangeStart.toFixed(2)}-$${rangeEnd.toFixed(2)}`);
    }

    // Create heatmap matrix
    this.heatmapData = [];

    this.channels.forEach(channel => {
      this.priceRanges.forEach((priceRange, rangeIndex) => {
        const rangeStart = minPrice + (rangeIndex * binSize);
        const rangeEnd = minPrice + ((rangeIndex + 1) * binSize);

        // Find data points that fall within this price range and channel
        const matchingData = this.data.filter(d =>
          d.Channel === channel &&
          +d.Price_From_1 >= rangeStart &&
          +d.Price_From_1 < rangeEnd
        );

        const avgPercent = matchingData.length > 0
          ? matchingData.reduce((sum, d) => sum + (+d.Percent_1), 0) / matchingData.length
          : 0;

        this.heatmapData.push({
          channel: channel,
          priceRange: priceRange,
          value: avgPercent,
          count: matchingData.length
        });
      });
    });
  }

  private renderChart() {
    this.destroyChart();
    this.createHeatmap();
  }

  private createHeatmap() {
    const margin = this.margins;
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    this.svg = d3.select(this.parentElement)
      .select('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(this.priceRanges)
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(this.channels)
      .range([0, height])
      .padding(0.05);

    const maxValue = d3.max(this.heatmapData, d => d.value) || 100;
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, maxValue]);

    // Create heatmap cells
    g.selectAll('.heatmap-cell')
      .data(this.heatmapData)
      .enter().append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', (d: { priceRange: string; }) => xScale(d.priceRange))
      .attr('y', (d: { channel: string; }) => yScale(d.channel))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', (d: any) => d.value > 0 ? colorScale(d.value) : '#f0f0f0')
      .attr('stroke', '#white')
      .attr('stroke-width', 1)
      .on('mouseover', function (event: { pageX: number; pageY: number; }, d: { channel: any; priceRange: any; value: number; count: any; }) {
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`
          <strong>Channel:</strong> ${d.channel}<br/>
          <strong>Price Range:</strong> ${d.priceRange}<br/>
          <strong>Avg Percentage:</strong> ${d.value.toFixed(1)}%<br/>
          <strong>Data Points:</strong> ${d.count}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function () {
        d3.selectAll('.tooltip').remove();
      });

    // Add value labels on cells
    g.selectAll('.cell-label')
      .data(this.heatmapData.filter(d => d.value > 0))
      .enter().append('text')
      .attr('class', 'cell-label')
      .attr('x', (d: { priceRange: string; }) => xScale(d.priceRange) + xScale.bandwidth() / 2)
      .attr('y', (d: { channel: string; }) => yScale(d.channel) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', (d: { value: number; }) => d.value > maxValue * 0.6 ? 'white' : 'black')
      .style('font-weight', 'bold')
      .text((d: { value: number; }) => d.value.toFixed(0));

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Add labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Channel');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Price Range');

    // Add title
    this.svg.append('text')
      .attr('x', this.width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Price Range vs Channel Heatmap');

    // Add color legend
    this.createColorLegend(g, width, height, colorScale, maxValue);
  }

  private createColorLegend(g: any, width: number, height: number, colorScale: any, maxValue: number) {
    const legendWidth = 200;
    const legendHeight = 10;
    const legendX = width - legendWidth;
    const legendY = -50;

    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    // Create gradient
    const defs = this.svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      gradient.append('stop')
        .attr('offset', `${(i / numStops) * 100}%`)
        .attr('style', `stop-color:${colorScale(maxValue * (i / numStops))};stop-opacity:1`);
    }

    // Add legend rectangle
    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)')
      .style('stroke', '#333')
      .style('stroke-width', 1);

    // Add legend labels
    legend.append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 15)
      .style('font-size', '12px')
      .text('0%');

    legend.append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 15)
      .attr('text-anchor', 'end')
      .style('font-size', '12px')
      .text(`${maxValue.toFixed(0)}%`);

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Average Percentage');
  }

  private destroyChart() {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }
}