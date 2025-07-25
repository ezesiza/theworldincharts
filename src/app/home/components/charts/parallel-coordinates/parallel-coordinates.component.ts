import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

@Component({
  selector: 'parallel-coordinates',
  templateUrl: './parallel-coordinates.component.html',
  styleUrls: ['./parallel-coordinates.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ParallelCoordinatesComponent implements OnInit {
  data: any[] = [];
  dimensions: string[] = [];
  isLoading: boolean = true;
  selectedRegion: string = 'All';
  regions: string[] = [];

  private svg: any;
  private parentElement: any;
  private margins = { top: 60, right: 100, bottom: 60, left: 100 };
  private height: number = 500;
  private width: number = 900;

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

    const rawData = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    }).filter(d => d.Percent_1 && d.Price_From_1 && d.Price_To_1);

    // Process data for parallel coordinates
    this.data = rawData.map(d => ({
      Region: d.Region,
      Channel: d.Channel,
      Percent_1: +d.Percent_1 || 0,
      Percent_2: +d.Percent_2 || 0,
      Price_From_1: +d.Price_From_1 || 0,
      Price_To_1: +d.Price_To_1 || 0,
      Price_From_2: +d.Price_From_2 || 0,
      Price_To_2: +d.Price_To_2 || 0,
      Price_Range_1: (+d.Price_To_1 || 0) - (+d.Price_From_1 || 0),
      Price_Range_2: (+d.Price_To_2 || 0) - (+d.Price_From_2 || 0)
    }));

    this.regions = ['All', ...new Set(this.data.map(d => d.Region))];

    // Define dimensions for parallel coordinates
    this.dimensions = ['Percent_1', 'Percent_2', 'Price_From_1', 'Price_To_1', 'Price_Range_1'];
  }

  onRegionChange(event: any) {
    this.selectedRegion = event.target.value;
    this.renderChart();
  }

  private renderChart() {
    this.destroyChart();
    this.createParallelCoordinates();
  }

  private createParallelCoordinates() {
    const margin = this.margins;
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    this.svg = d3.select(this.parentElement)
      .select('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter data by selected region
    const filteredData = this.selectedRegion === 'All'
      ? this.data
      : this.data.filter(d => d.Region === this.selectedRegion);

    // Create scales for each dimension
    const scales: { [key: string]: d3.ScaleLinear<number, number> } = {};
    this.dimensions.forEach(dim => {
      const extent = d3.extent(filteredData, d => d[dim]) as [number, number];
      scales[dim] = d3.scaleLinear()
        .domain(extent)
        .range([height, 0]);
    });

    // X scale for positioning dimensions
    const xScale = d3.scalePoint()
      .domain(this.dimensions)
      .range([0, width]);

    // Color scale by channel
    const channels = [...new Set(filteredData.map(d => d.Channel))];
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(channels);

    // Line generator
    const line = d3.line()
      .defined(d => !isNaN(d[1]))
      .x(d => d[0])
      .y(d => d[1]);

    // Add background lines
    g.append('g')
      .attr('class', 'background')
      .selectAll('path')
      .data(filteredData)
      .enter().append('path')
      .attr('d', (d: { [x: string]: d3.NumberValue; }) => {
        const points = this.dimensions.map(dim => [xScale(dim), scales[dim](d[dim])]) as any;
        return line(points);
      })
      .style('fill', 'none')
      .style('stroke', '#ddd')
      .style('stroke-width', 1)
      .style('opacity', 0.3);

    // Add foreground lines
    const foreground = g.append('g')
      .attr('class', 'foreground')
      .selectAll('path')
      .data(filteredData)
      .enter().append('path')
      .attr('d', (d: { [x: string]: d3.NumberValue; }) => {
        const points = this.dimensions.map(dim => [xScale(dim), scales[dim](d[dim])]) as any;
        return line(points);
      })
      .style('fill', 'none')
      .style('stroke', (d: { Channel: string; }) => colorScale(d.Channel))
      .style('stroke-width', 2)
      .style('opacity', 0.7)
      .on('mouseover', (event: { pageX: number; pageY: number; }, d: { Region: any; Channel: any; Percent_1: any; Percent_2: any; Price_From_1: any; Price_Range_1: number; }) => {
        // Highlight this line
        d3.select(this as any)
          .style('stroke-width', 3)
          .style('opacity', 1);

        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`
          <strong>Region:</strong> ${d.Region}<br/>
          <strong>Channel:</strong> ${d.Channel}<br/>
          <strong>Percent 1:</strong> ${d.Percent_1}%<br/>
          <strong>Percent 2:</strong> ${d.Percent_2}%<br/>
          <strong>Price From 1:</strong> $${d.Price_From_1}<br/>
          <strong>Price Range 1:</strong> $${d.Price_Range_1.toFixed(2)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        d3.select(this as any)
          .style('stroke-width', 2)
          .style('opacity', 0.7);
        d3.selectAll('.tooltip').remove();
      });

    // Add dimension axes
    const dimensionGroups = g.selectAll('.dimension')
      .data(this.dimensions)
      .enter().append('g')
      .attr('class', 'dimension')
      .attr('transform', (d: string) => `translate(${xScale(d)},0)`);

    // Add axis lines and labels
    dimensionGroups.append('g')
      .attr('class', 'axis')
      .each((d: string | number) => {
        d3.select(this as any).call(d3.axisLeft(scales[d]));
      });

    // Add dimension labels
    dimensionGroups.append('text')
      .style('text-anchor', 'middle')
      .attr('y', -9)
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text((d: string) => d.replace(/_/g, ' '));

    // Add title
    this.svg.append('text')
      .attr('x', this.width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text(`Parallel Coordinates Plot - Multi-Variable Comparison${this.selectedRegion !== 'All' ? ` (${this.selectedRegion})` : ''}`);

    // Add legend
    this.createLegend(g, width, height, colorScale, channels);

    // Add brushing functionality
    this.addBrushing(dimensionGroups, scales, filteredData, foreground);
  }

  private createLegend(g: any, width: number, height: number, colorScale: any, channels: string[]) {
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 20)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(channels)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d: any, i: number) => `translate(0, ${i * 20})`);

    legendItems.append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('y1', 0)
      .attr('y2', 0)
      .style('stroke', (d: any) => colorScale(d))
      .style('stroke-width', 3);

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text((d: any) => d);
  }

  private addBrushing(dimensionGroups: any, scales: any, data: any[], foreground: any) {
    const actives: { [key: string]: [number, number] } = {};

    dimensionGroups.append('g')
      .attr('class', 'brush')
      .each((d: string | number) => {
        const brush = d3.brushY()
          .extent([[-10, 0], [10, (this as any).parentNode.querySelector('.axis').getBBox().height]])
          .on('brush end', function (event) {
            if (event.selection) {
              actives[d] = event.selection.map(scales[d].invert);
            } else {
              delete actives[d];
            }

            // Update line visibility based on brushes
            foreground.style('display', (lineData: any) => {
              return Object.keys(actives).every(key => {
                const [min, max] = actives[key];
                return lineData[key] >= Math.min(min, max) && lineData[key] <= Math.max(min, max);
              }) ? null : 'none';
            });
          });

        d3.select(this as any).call(brush as any);
      });
  }

  private destroyChart() {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }
}