import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

@Component({
  selector: 'interactive-scatter',
  templateUrl: './interactive-scatter.component.html',
  styleUrls: ['./interactive-scatter.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class InteractiveScatterComponent implements OnInit {
  data: any[] = [];
  filteredData: any[] = [];
  regions: string[] = [];
  channels: string[] = [];
  selectedRegion: string = 'All';
  selectedChannel: string = 'All';
  isLoading: boolean = true;

  private svg: any;
  private parentElement: any;
  private margins = { top: 60, right: 150, bottom: 80, left: 80 };
  private height: number = 500;
  private width: number = 800;

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
        this.filteredData = [...this.data];
        this.renderChart();
      }
    });
  }

  private parseCSVData(csvData: string) {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');

    const rawData = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    }).filter(d => d.Percent_1 && d.Price_From_1);

    // Process data for scatter plot
    this.data = rawData.map(d => ({
      Region: d.Region,
      Channel: d.Channel,
      Price: +d.Price_From_1 || 0,
      TransactionPercent: +d.Percent_1 || 0,
      Price2: +d.Price_From_2 || 0,
      TransactionPercent2: +d.Percent_2 || 0,
      PriceRange: (+d.Price_To_1 || 0) - (+d.Price_From_1 || 0)
    })).filter(d => d.Price > 0 && d.TransactionPercent > 0);

    this.regions = ['All', ...new Set(this.data.map(d => d.Region))];
    this.channels = ['All', ...new Set(this.data.map(d => d.Channel))];
  }

  onRegionChange(event: any) {
    this.selectedRegion = event.target.value;
    this.filterData();
    this.renderChart();
  }

  onChannelChange(event: any) {
    this.selectedChannel = event.target.value;
    this.filterData();
    this.renderChart();
  }

  private filterData() {
    this.filteredData = this.data.filter(d => {
      const regionMatch = this.selectedRegion === 'All' || d.Region === this.selectedRegion;
      const channelMatch = this.selectedChannel === 'All' || d.Channel === this.selectedChannel;
      return regionMatch && channelMatch;
    });
  }

  private renderChart() {
    this.destroyChart();
    this.createScatterPlot();
  }

  private createScatterPlot() {
    const margin = this.margins;
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    this.svg = d3.select(this.parentElement)
      .select('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (this.filteredData.length === 0) {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#666')
        .text('No data available for selected filters');
      return;
    }

    // Scales
    const xExtent = d3.extent(this.filteredData, d => d.Price) as [number, number];
    const yExtent = d3.extent(this.filteredData, d => d.TransactionPercent) as [number, number];
    const sizeExtent = d3.extent(this.filteredData, d => d.PriceRange) as [number, number];

    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, width])
      .nice();

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([height, 0])
      .nice();

    const sizeScale = d3.scaleSqrt()
      .domain(sizeExtent)
      .range([3, 15]);

    // Color scales
    const uniqueChannels = [...new Set(this.filteredData.map(d => d.Channel))];
    const uniqueRegions = [...new Set(this.filteredData.map(d => d.Region))];

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(uniqueChannels);

    const shapeScale = d3.scaleOrdinal(['circle', 'square', 'triangle'])
      .domain(uniqueRegions);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat('' as any)
      );

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('' as any)
      );

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        const { transform } = event;

        // Update scales
        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);

        // Update axes
        g.select('.x-axis').call(d3.axisBottom(newXScale));
        g.select('.y-axis').call(d3.axisLeft(newYScale));

        // Update points
        g.selectAll('.data-point')
          .attr('cx', (d: { Price: any; }) => newXScale(d.Price))
          .attr('cy', (d: { TransactionPercent: any; }) => newYScale(d.TransactionPercent));

        // Update grid
        g.select('.grid').selectAll('line')
          .attr('x1', (d: any) => newXScale(d))
          .attr('x2', (d: any) => newXScale(d));
      });

    this.svg.call(zoom);

    // Add data points
    const points = g.selectAll('.data-point')
      .data(this.filteredData)
      .enter().append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d: { Price: d3.NumberValue; }) => xScale(d.Price))
      .attr('cy', (d: { TransactionPercent: d3.NumberValue; }) => yScale(d.TransactionPercent))
      .attr('r', (d: { PriceRange: d3.NumberValue; }) => sizeScale(d.PriceRange))
      .attr('fill', (d: { Channel: string; }) => colorScale(d.Channel))
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .style('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', (event: { pageX: number; pageY: number; }, d: { Region: any; Channel: any; Price: number; TransactionPercent: any; PriceRange: number; }) => {
        // Highlight point
        d3.select(this as any)
          .attr('stroke-width', 2)
          .style('opacity', 1);

        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`
          <strong>Region:</strong> ${d.Region}<br/>
          <strong>Channel:</strong> ${d.Channel}<br/>
          <strong>Price:</strong> $${d.Price.toFixed(2)}<br/>
          <strong>Transaction %:</strong> ${d.TransactionPercent}%<br/>
          <strong>Price Range:</strong> $${d.PriceRange.toFixed(2)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        d3.select(this as any)
          .attr('stroke-width', 0.5)
          .style('opacity', 0.7);
        d3.selectAll('.tooltip').remove();
      })
      .on('click', function (event: any, d: { Channel: any; }) {
        // Add click interaction - could highlight related points
        const relatedPoints = g.selectAll('.data-point')
          .filter((point: { Channel: any; }) => point.Channel === d.Channel);

        relatedPoints
          .transition().duration(300)
          .attr('stroke-width', 3)
          .style('opacity', 1);

        setTimeout(() => {
          relatedPoints
            .transition().duration(300)
            .attr('stroke-width', 0.5)
            .style('opacity', 0.7);
        }, 1500);
      });

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Transaction Percentage (%)');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Price ($)');

    // Add title
    this.svg.append('text')
      .attr('x', this.width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Interactive Scatter Plot: Price vs Transaction %');

    // Add legends
    this.createColorLegend(g, width, height, colorScale, uniqueChannels);
    this.createSizeLegend(g, width, height, sizeScale, sizeExtent);

    // Add brushing for selection
    this.addBrushing(g, width, height, xScale, yScale, points);
  }

  private createColorLegend(g: any, width: number, height: number, colorScale: any, channels: string[]) {
    const legend = g.append('g')
      .attr('class', 'color-legend')
      .attr('transform', `translate(${width + 20}, 20)`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', -5)
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text('Channels');

    const legendItems = legend.selectAll('.legend-item')
      .data(channels)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d: any, i: number) => `translate(0, ${i * 20 + 10})`);

    legendItems.append('circle')
      .attr('cx', 6)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', (d: any) => colorScale(d));

    legendItems.append('text')
      .attr('x', 16)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .text((d: any) => d);
  }

  private createSizeLegend(g: any, width: number, height: number, sizeScale: any, sizeExtent: [number, number]) {
    const legend = g.append('g')
      .attr('class', 'size-legend')
      .attr('transform', `translate(${width + 20}, ${height - 80})`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', -5)
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text('Price Range');

    const sizeLegendData = [
      { value: sizeExtent[0], size: sizeScale(sizeExtent[0]) },
      { value: (sizeExtent[0] + sizeExtent[1]) / 2, size: sizeScale((sizeExtent[0] + sizeExtent[1]) / 2) },
      { value: sizeExtent[1], size: sizeScale(sizeExtent[1]) }
    ];

    const sizeLegendItems = legend.selectAll('.size-legend-item')
      .data(sizeLegendData)
      .enter().append('g')
      .attr('class', 'size-legend-item')
      .attr('transform', (d: any, i: number) => `translate(0, ${i * 25 + 15})`);

    sizeLegendItems.append('circle')
      .attr('cx', 15)
      .attr('cy', 0)
      .attr('r', (d: { size: any; }) => d.size)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    sizeLegendItems.append('text')
      .attr('x', 35)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .text((d: { value: number; }) => `$${d.value.toFixed(1)}`);
  }

  private addBrushing(g: any, width: number, height: number, xScale: any, yScale: any, points: any) {
    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on('start brush', function (event) {
        if (event.selection) {
          const [[x0, y0], [x1, y1]] = event.selection;

          points.classed('selected', (d: any) => {
            const x = xScale(d.Price);
            const y = yScale(d.TransactionPercent);
            return x >= x0 && x <= x1 && y >= y0 && y <= y1;
          });

          points.style('opacity', (d: any) => {
            const x = xScale(d.Price);
            const y = yScale(d.TransactionPercent);
            return (x >= x0 && x <= x1 && y >= y0 && y <= y1) ? 1 : 0.3;
          });
        } else {
          points.classed('selected', false);
          points.style('opacity', 0.7);
        }
      });

    g.append('g')
      .attr('class', 'brush')
      .call(brush);
  }

  private destroyChart() {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }
}