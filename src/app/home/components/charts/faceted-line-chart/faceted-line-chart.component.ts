import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

@Component({
  selector: 'faceted-line-chart',
  templateUrl: './faceted-line-chart.component.html',
  styleUrls: ['./faceted-line-chart.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class FacetedLineChartComponent implements OnInit {
  data: any[] = [];
  regions: string[] = [];
  channels: string[] = [];
  isLoading: boolean = true;

  private svg: any;
  private parentElement: any;
  private margins = { top: 20, right: 30, bottom: 60, left: 80 };
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
    }).filter(d => d.Price_From_1 && d.Percent_1); // Filter out empty price ranges

    this.regions = [...new Set(this.data.map(d => d.Region))];
    this.channels = [...new Set(this.data.map(d => d.Channel))];
  }

  private renderChart() {
    this.destroyChart();

    // Process data for line charts
    const processedData = this.processDataForLines();
    this.createFacetedLineChart(processedData);
  }

  private processDataForLines() {
    const nested = d3.group(this.data, d => d.Region, d => d.Channel);
    const processedData: any[] = [];

    nested.forEach((channels, region) => {
      channels.forEach((values, channel) => {
        const lineData = values
          .filter(d => d.Price_From_1 && d.Percent_1)
          .map(d => ({
            x: +d.Price_From_1,
            y: +d.Percent_1,
            region: region,
            channel: channel
          }))
          .sort((a, b) => a.x - b.x);

        if (lineData.length > 0) {
          processedData.push({
            region: region,
            channel: channel,
            values: lineData
          });
        }
      });
    });

    return processedData;
  }

  private createFacetedLineChart(data: any[]) {
    const margin = this.margins;
    const facetWidth = 500;
    const facetHeight = 300;
    const cols = 2;

    // Calculate total dimensions
    const totalWidth = cols * facetWidth + (cols + 1) * margin.left;
    const rows = Math.ceil(data.length / cols);
    const totalHeight = rows * (facetHeight + margin.top + margin.bottom);

    this.svg = d3.select(this.parentElement)
      .select('svg')
      .attr('width', totalWidth)
      .attr('height', totalHeight);

    // Global scales
    const allValues = data.flatMap(d => d.values);
    const xExtent = d3.extent(allValues, d => d.x);
    const yExtent = d3.extent(allValues, d => d.y);

    const xScale = d3.scaleTime()
      .domain(xExtent)
      .range([0, facetWidth - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([facetHeight - margin.top - margin.bottom, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(this.channels);

    const line = d3.line()
      .x((d: any) => xScale(d.x))
      .y((d: any) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Create facets
    data.forEach((d, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const offsetX = col * (facetWidth + margin.left) + margin.left;
      const offsetY = row * (facetHeight + margin.top + margin.bottom) + margin.top;

      const g = this.svg.append('g')
        .attr('transform', `translate(${offsetX}, ${offsetY})`);

      // Add title
      g.append('text')
        .attr('x', (facetWidth - margin.left - margin.right) / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', '14px')
        .text(`${d.region} - ${d.channel}`);

      // Add axes
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${facetHeight - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(5));

      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).ticks(10));

      // Add line
      g.append('path')
        .datum(d.values)
        .attr('fill', 'none')
        .attr('stroke', colorScale(d.channel))
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add dots
      g.selectAll('.dot')
        .data(d.values)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', (point: { x: d3.NumberValue; }) => xScale(point.x))
        .attr('cy', (point: { y: d3.NumberValue; }) => yScale(point.y))
        .attr('r', 3)
        .attr('fill', colorScale(d.channel))
        .on('mouseover', function (event: { pageX: number; pageY: number; }, point: { x: any; y: any; }) {
          const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

          tooltip.transition().duration(200).style('opacity', .9);
          tooltip.html(`Price: $${point.x}<br/>Percent: ${point.y}%`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
          d3.selectAll('.tooltip').remove();
        });
    });

    // Add overall labels
    this.svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', 0 - (totalHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Percentage (%)');

    this.svg.append('text')
      .attr('transform', `translate(${totalWidth / 2}, ${totalHeight - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Price From ($)');
  }

  private destroyChart() {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }
}