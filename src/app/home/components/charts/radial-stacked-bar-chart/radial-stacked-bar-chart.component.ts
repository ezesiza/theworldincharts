import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-radial-stacked-bar-chart',
  templateUrl: './radial-stacked-bar-chart.component.html',
  styleUrls: ['./radial-stacked-bar-chart.component.less']
})
export class RadialStackedBarChartComponent implements OnInit {
  @ViewChild('chartContainer') private chartContainer!: ElementRef;

  private data: any[] = [];
  private svg: any;
  private width = 928;
  private height = 928;
  private innerRadius = 180;
  private outerRadius = Math.min(this.width, this.height) / 2;
  private margin = { top: 20, right: 20, bottom: 20, left: 20 };
  private radius: number = Math.min(this.width, this.height) / 2;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData() {

    try {
      // Load your CSV data here
      const csvData = (await d3.csv('assets/datasets/age_csv_data.csv'));
      this.data = csvData.columns.slice(1).flatMap((age) => csvData.map((d: any) => ({ state: d.State, age, population: d[age] })));

      // Transform the data
      this.createChart();
    } catch (error) {
      console.error('Error loading data:', error);
    }

  }



  private createChart() {

    // Create the SVG container
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [-this.width / 2, -this.height / 2, this.width, this.height])
      .attr('style', 'width: 100%; height: auto; font: 10px sans-serif;');
    console.log(this.data);
    // Stack the data
    // const series = d3.stack<any, any>()
    //   .keys(d3.union(this.data.map(d => d.age)))
    //   .value((d: any, key: any) => d[key].population)
    //   (d3.index(this.data, d => d.state, d => d.age));

    const series = d3.stack()
      .keys(d3.union(this.data.map(d => d.age))) // distinct series keys, in input order
      // .value(([, D], key) => D.get(key).population) 
      .value((d: any, key: any) => {
        console.log(d[1].get(key));
        return d[1].get(key).population
      })
      (d3.index(this.data, d => d.state, d => d.age) as any);


    // Scales
    const x = d3.scaleBand()
      .domain(this.data.map(d => d.state))
      .range([0, 2 * Math.PI])
      .align(0);

    const y = d3.scaleRadial()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .range([this.innerRadius, this.outerRadius]);

    const color = d3.scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(d3.schemeSpectral[series.length])
      .unknown('#ccc');

    const arc = d3.arc()
      .innerRadius((d: any) => y(d[0]))
      .outerRadius((d: any) => y(d[1]))
      .startAngle((d: any) => x(d.data[0]))
      .endAngle((d: any) => x(d.data[0]) + x.bandwidth())
      .padAngle(1.5 / this.innerRadius)
      .padRadius(this.innerRadius);

    // Draw the arcs
    this.svg.append('g')
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('fill', (d: { key: string; }) => color(d.key))
      .selectAll('path')
      .data((D: { map: (arg0: (d: any) => any) => any; key: any; }) => D.map((d: { key: any; }) => (d.key = D.key, d)))
      .join('path')
      .attr('d', arc)
      .append('title')
      .text((d: { data: { get: (arg0: any) => { (): any; new(): any; population: number; }; }[]; key: any; }) => `${d.data[0]} ${d.key}\n${this.formatValue(d.data[1].get(d.key).population)}`);

    // Add x-axis
    this.drawXAxis(x);

    // Add y-axis
    this.drawYAxis(y);

    // Add legend
    this.drawLegend(color);
  }

  private drawXAxis(x: any) {
    this.svg.append('g')
      .attr('text-anchor', 'middle')
      .selectAll('g')
      .data(x.domain())
      .join('g')
      .attr('transform', (d: any) => `
          rotate(${((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
          translate(${this.innerRadius},0)
        `)
      .call((g: { append: (arg0: string) => { (): any; new(): any; attr: { (arg0: string, arg1: number): { (): any; new(): any; attr: { (arg0: string, arg1: string): { (): any; new(): any; attr: { (arg0: string, arg1: number): { (): any; new(): any; attr: { (arg0: string, arg1: any): any; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; }; }) => g.append('line')
        .attr('x2', -5)
        .attr('stroke', '#000'))
      .call((g: { append: (arg0: string) => { (): any; new(): any; attr: { (arg0: string, arg1: (d: any) => "rotate(90)translate(0,16)" | "rotate(-90)translate(0,-9)"): { (): any; new(): any; text: { (arg0: (d: any) => any): any; new(): any; }; }; new(): any; }; }; }) => g.append('text')
        .attr('transform', (d: any) => (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
          ? 'rotate(90)translate(0,16)'
          : 'rotate(-90)translate(0,-9)')
        .text((d: any) => d));
  }

  private drawYAxis(y: any) {
    this.svg.append('g')
      .attr('text-anchor', 'middle')
      .call((g: any) => g.append('text')
        .attr('y', (d: any) => -y(y.ticks(5).pop()))
        .attr('dy', '-1em')
        .text('Population'))
      .call((g: any) => g.selectAll('g')
        .data(y.ticks(5).slice(1))
        .join('g')
        .attr('fill', 'none')
        .call((g: any) => g.append('circle')
          .attr('stroke', '#000')
          .attr('stroke-opacity', 0.5)
          .attr('r', y))
        .call((g: any) => g.append('text')
          .attr('y', (d: any) => -y(d))
          .attr('dy', '0.35em')
          .attr('stroke', '#fff')
          .attr('stroke-width', 5)
          .text(y.tickFormat(5, 's'))
          .clone(true)
          .attr('fill', '#000')
          .attr('stroke', 'none')));
  }

  private drawLegend(color: any) {
    this.svg.append('g')
      .selectAll('g')
      .data(color.domain())
      .join('g')
      .attr('transform', (d: any, i: number, nodes: any) =>
        `translate(-40,${(nodes.length / 2 - i - 1) * 20})`)
      .call((g: { append: (arg0: string) => { (): any; new(): any; attr: { (arg0: string, arg1: number): { (): any; new(): any; attr: { (arg0: string, arg1: number): { (): any; new(): any; attr: { (arg0: string, arg1: any): any; new(): any; }; }; new(): any; }; }; new(): any; }; }; }) => g.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', color))
      .call((g: { append: (arg0: string) => { (): any; new(): any; attr: { (arg0: string, arg1: number): { (): any; new(): any; attr: { (arg0: string, arg1: number): { (): any; new(): any; attr: { (arg0: string, arg1: any): any; new(): any; }; }; new(): any; }; }; new(): any; }; }; }) => g.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .text((d: any) => d));
  }

  private formatValue(x: number): string {
    return isNaN(x) ? 'N/A' : x.toLocaleString('en');
  }
}