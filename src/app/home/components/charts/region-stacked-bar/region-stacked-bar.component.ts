import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

@Component({
  selector: 'region-stacked-bar',
  templateUrl: './region-stacked-bar.component.html',
  styleUrls: ['./region-stacked-bar.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class RegionStackedBarComponent implements OnInit {
  data: any[] = [];
  regions: string[] = [];
  channels: string[] = [];
  selectedRegion: string = 'Latin America';
  isLoading: boolean = true;

  private svg: any;
  private parentElement: any;
  private margins = { top: 20, right: 30, bottom: 60, left: 80 };
  private height: number = 400;
  private width: number = 600;

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
        this.selectedRegion = this.regions[0];
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
    });

    this.regions = [...new Set(this.data.map(d => d.Region))];
    this.channels = [...new Set(this.data.map(d => d.Channel))];
  }

  onRegionChange(event: any) {
    this.selectedRegion = event.target.value;
    this.renderChart();
  }

  private renderChart() {
    this.destroyChart();
    const regionData = this.data.filter(d => d.Region === this.selectedRegion);
    if (!regionData.length) return;

    // Group by channel and aggregate percentages
    const channelGroups = d3.group(regionData, d => d.Channel);
    const stackedData: any[] = [];

    channelGroups.forEach((values, channel) => {
      const entry: any = { Channel: channel };
      values.forEach((d, i) => {
        entry[`Range_${i + 1}`] = +d.Percent_1 || 0;
        entry[`Range_${i + 1}_2`] = +d.Percent_2 || 0;
      });
      stackedData.push(entry);
    });

    this.createStackedBarChart(stackedData);
  }

  private createStackedBarChart(data: any[]) {
    const margin = this.margins;
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    this.svg = d3.select(this.parentElement)
      .select('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get all percentage keys
    const keys = Object.keys(data[0]).filter(k => k !== 'Channel');

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.Channel))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(d3.schemeCategory10);

    // Stack data
    const stack = d3.stack().keys(keys);
    const stackedData = stack(data);

    // Create bars
    g.selectAll('.layer')
      .data(stackedData)
      .enter().append('g')
      .attr('class', 'layer')
      .attr('fill', (d: { key: string; }) => color(d.key))
      .selectAll('rect')
      .data((d: any) => d)
      .enter().append('rect')
      .attr('x', (d: { data: { Channel: string; }; }) => x(d.data.Channel))
      .attr('y', (d: d3.NumberValue[]) => y(d[1]))
      .attr('height', (d: d3.NumberValue[]) => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .on('mouseover', function (event: { pageX: number; pageY: number; }, d: any) {
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Channel: ${d.data.Channel}<br/>Value: ${d[1] - d[0]}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function () {
        d3.selectAll('.tooltip').remove();
      });

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Add labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Percentage (%)');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .text('Channel');
  }

  private destroyChart() {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }
}