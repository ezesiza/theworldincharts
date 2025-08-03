import { Component, ElementRef, AfterViewInit, HostListener, ViewChild, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

// chart-data.interface.ts
export interface ChartDataPoint {
  name: string;
  value: number;
  upper: number;
  lower: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

@Component({
  selector: 'performance-metrics',
  templateUrl: './performance-metrics.component.html',
  styleUrl: './performance-metrics.component.less',
  encapsulation: ViewEncapsulation.None
})
export class PerformanceMetricsComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('chartContainer', { static: true }) private chartContainer!: ElementRef;

  data: ChartDataPoint[] = [
    { name: "OKK", value: -3.9, upper: -1.8, lower: -3.9 },
    { name: "A lugr", value: -2.4, upper: -2.4, lower: -2.4 },
    { name: "Heleana", value: -1.8, upper: 0.8, lower: -2.5 },
    { name: "Saltudas", value: -1.8, upper: -1.8, lower: -2.5 },
    { name: "Agnianto", value: -1.7, upper: -1.7, lower: -1.7 },
    { name: "Astura", value: -1.5, upper: -1.5, lower: -3.5 },
    { name: "Concordia", value: -1.3, upper: -1.3, lower: -2.8 },
    { name: "Xyrao Sympany", value: -0.8, upper: -0.8, lower: -0.8 },
    { name: "CSS", value: 0.7, upper: 0.7, lower: -1.8 },
    { name: "KPT", value: 1.9, upper: 1.9, lower: -1.2 },
    { name: "Swica", value: 2.6, upper: 2.6, lower: 2.6 },
    { name: "Mutual", value: 3.9, upper: 3.9, lower: 3.9 },
    { name: "Visana", value: 6.2, upper: 6.2, lower: 6.2 }
  ];
  title: string = 'Performance Metrics Chart';
  dimensions: ChartDimensions = {
    width: 900,
    height: 500,
    margin: { top: 40, right: 40, bottom: 80, left: 60 }
  };

  private svg: any;
  private tooltip: any;

  constructor() { }

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.svg) {
      this.svg.remove();
    }
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;

    // Clear any existing chart
    d3.select(element).selectAll('*').remove();

    // Create SVG
    this.svg = d3.select(element)
      .append('svg')
      .attr('width', this.dimensions.width)
      .attr('height', this.dimensions.height);

    // Create tooltip
    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    this.updateChart();
  }

  private updateChart(): void {
    if (!this.data || this.data.length === 0) return;

    const { width, height, margin } = this.dimensions;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear existing content
    this.svg.selectAll('.chart-content').remove();

    // Create main group
    const g = this.svg.append('g')
      .attr('class', 'chart-content')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(this.data.map(d => d.name))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(this.data.flatMap(d => [d.value, d.upper, d.lower])) as [number, number])
      .nice()
      .range([chartHeight, 0]);

    // Add grid lines
    this.addGridLines(g, yScale, chartWidth);

    // Add zero line
    this.addZeroLine(g, yScale, chartWidth);

    // Create bars
    this.createBars(g, xScale, yScale);

    // Add confidence intervals
    this.addConfidenceIntervals(g, xScale, yScale);

    // Add value labels
    this.addValueLabels(g, xScale, yScale);

    // Add axes
    this.addAxes(g, xScale, yScale, chartHeight);
  }

  private addGridLines(g: any, yScale: any, width: number): void {
    g.selectAll('.grid-line')
      .data(yScale.ticks())
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d: number) => yScale(d))
      .attr('y2', (d: number) => yScale(d))
      .style('stroke', '#e0e0e0')
      .style('stroke-width', 1);
  }

  private addZeroLine(g: any, yScale: any, width: number): void {
    g.append('line')
      .attr('class', 'zero-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .style('stroke', '#666')
      .style('stroke-width', 2);
  }

  private createBars(g: any, xScale: any, yScale: any): void {

    const colorScheme3 = d3.scaleSequential((t) =>
      d3.interpolateViridis(t * 1 + 0.1)).domain([0, this.data.length]);

    g.selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: ChartDataPoint) => xScale(d.name))
      .attr('width', xScale.bandwidth())
      .attr('y', (d: ChartDataPoint) => d.value >= 0 ? yScale(d.value) : yScale(0))
      .attr('height', (d: ChartDataPoint) => Math.abs(yScale(d.value) - yScale(0)))
      .attr('fill', (d: any, i: number) => colorScheme3(i))
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: ChartDataPoint) => this.showTooltip(event, d))
      .on('mouseout', () => this.hideTooltip())
      .on('mousemove', (event: MouseEvent) => this.moveTooltip(event));
  }

  private addConfidenceIntervals(g: any, xScale: any, yScale: any): void {
    const dataWithIntervals = this.data.filter(d => d.upper !== d.lower);

    // Add confidence interval lines
    g.selectAll('.confidence-interval')
      .data(dataWithIntervals)
      .enter()
      .append('line')
      .attr('class', 'confidence-interval')
      .attr('x1', (d: ChartDataPoint) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('x2', (d: ChartDataPoint) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y1', (d: ChartDataPoint) => yScale(d.upper))
      .attr('y2', (d: ChartDataPoint) => yScale(d.lower))
      .style('stroke', 'orange')
      .style('stroke-width', 2);

    // Add arrows and dots
    this.addArrowsAndDots(g, dataWithIntervals, xScale, yScale);
  }

  private addArrowsAndDots(g: any, data: ChartDataPoint[], xScale: any, yScale: any): void {
    // Upper arrows
    g.selectAll('.arrow-up')
      .data(data)
      .enter()
      .append('polygon')
      .attr('class', 'arrow-up')
      .attr('points', (d: ChartDataPoint) => {
        const x = xScale(d.name) + xScale.bandwidth() / 2;
        const y = yScale(d.upper);
        return `${x - 4},${y + 8} ${x},${y} ${x + 4},${y + 8}`;
      })
      .style('fill', 'orange')
      .style('stroke', 'orange')
      .style('stroke-width', 2);

    // Lower arrows
    g.selectAll('.arrow-down')
      .data(data)
      .enter()
      .append('polygon')
      .attr('class', 'arrow-down')
      .attr('points', (d: ChartDataPoint) => {
        const x = xScale(d.name) + xScale.bandwidth() / 2;
        const y = yScale(d.lower);
        return `${x - 4},${y - 8} ${x},${y} ${x + 4},${y - 8}`;
      })
      .style('fill', 'orange')
      .style('stroke', 'orange')
      .style('stroke-width', 2);

    // Upper dots
    g.selectAll('.dot-upper')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: ChartDataPoint) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('cy', (d: ChartDataPoint) => yScale(d.upper))
      .attr('r', 4)
      .attr('fill', 'orange');

    // Lower dots
    g.selectAll('.dot-lower')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: ChartDataPoint) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('cy', (d: ChartDataPoint) => yScale(d.lower))
      .attr('r', 4)
      .attr('fill', 'orange');
  }

  private addValueLabels(g: any, xScale: any, yScale: any): void {
    g.selectAll('.value-label')
      .data(this.data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d: ChartDataPoint) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y', (d: ChartDataPoint) => {
        return d.value >= 0 ? yScale(d.value) - 5 : yScale(d.value) + 15;
      })
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text((d: ChartDataPoint) => d.value);
  }

  private addAxes(g: any, xScale: any, yScale: any, height: number): void {
    // X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '12px');

    // Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .style('font-size', '12px');
  }

  private showTooltip(event: MouseEvent, data: ChartDataPoint): void {
    const tooltipContent = `
      <strong>${data.name}</strong><br/>
      Value: ${data.value}<br/>
      ${data.upper !== data.lower ? `Range: ${data.lower} to ${data.upper}` : ''}
    `;

    this.tooltip
      .style('visibility', 'visible')
      .html(tooltipContent);

    this.moveTooltip(event);
  }

  private hideTooltip(): void {
    this.tooltip.style('visibility', 'hidden');
  }

  private moveTooltip(event: MouseEvent): void {
    this.tooltip
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px');
  }
}