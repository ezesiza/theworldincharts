import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'animated-area',
  templateUrl: './animated-area.component.html',
  styleUrl: './animated-area.component.less'
})
export class AnimatedAreaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  areaLoading = true;
  private svg: any;
  private width = 400;
  private height = 250; // Increased from 125
  private margin = 25;
  private tickInterval = 500;
  private timeWindow = 60000;
  private animation = true;
  private n = 120;
  private colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 4]);
  private fill = this.colorScale(0);
  private fill2 = this.colorScale(1);
  private fill3 = this.colorScale(2);
  private fill4 = this.colorScale(3);
  private fill5 = this.colorScale(4);
  private data: { date: number; value: number }[] = [];
  private x: any;
  private y: any;
  private xAxis: any;
  private yAxis: any;
  private area: any;
  private path: any;
  private xG: any;
  private yG: any;
  private color: any;
  private chart: any;
  private dataSub?: Subscription;
  private data2: { date: number; value: number }[] = [];
  private area2: any;
  private path2: any;
  private data3: { date: number; value: number }[] = [];
  private area3: any;
  private path3: any;
  private data4: { date: number; value: number }[] = [];
  private area4: any;
  private path4: any;
  private data5: { date: number; value: number }[] = [];
  private area5: any;
  private path5: any;

  // Utility function to initialize a data array
  private generateData(n: number, tickInterval: number, initialValue: number, min: number, max: number): { date: number; value: number }[] {
    let currentValue = initialValue;
    const now = Date.now();
    const timeWindow = this.timeWindow;
    return d3.range(n).map((d, i) => {
      let rand = (Math.random() - 0.5) * 0.2;
      currentValue = currentValue + rand < min || currentValue + rand > max
        ? currentValue - rand
        : currentValue + rand;
      // Evenly space data from now - timeWindow to now
      const date = now - timeWindow + i * (timeWindow / (n - 1));
      return {
        date,
        value: currentValue
      };
    });
  }

  // Utility function to refresh a data array
  private refreshDataArray(data: { date: number; value: number }[], n: number, tickInterval: number, min: number, max: number): { date: number; value: number }[] {
    const now = Date.now();
    const timeWindow = this.timeWindow;
    // Remove points older than now - timeWindow
    let newData = data.filter(d => d.date >= now - timeWindow);
    // If empty, add a new point at now
    if (newData.length === 0) {
      newData.push({ date: now, value: (min + max) / 2 });
    }
    // Append new point at 'now'
    let lastValue = newData.length > 0 ? newData[newData.length - 1].value : (min + max) / 2;
    let rand = (Math.random() - 0.5) * 0.2;
    let newValue = lastValue + rand;
    newValue = Math.max(min, Math.min(max, newValue)); // Clamp to [min, max]
    newData.push({ date: now, value: newValue });
    // If too many points, trim from the start
    if (newData.length > n) {
      newData = newData.slice(newData.length - n);
    }
    return newData;
  }

  // Animate a select element (can be used in the template)
  animateSelect(select: HTMLElement) {
    d3.select(select)
      .style('font-size', '0px')
      .interrupt()
      .transition()
      .ease(d3.easePoly)
      .duration(200)
      .style('width', '20px')
      .transition()
      .ease(d3.easeBounce)
      .duration(300)
      .style('font-size', '12px')
      .style('width', '100px');
  }

  // Helper for animating chart elements
  private t(g: any, action: (g: any) => void) {
    g.interrupt().transition().ease(d3.easeLinear).duration(this.tickInterval).call(action);
  }

  // Helper to get min/max across all layers
  private getYDomain(): [number, number] {
    const allValues = [
      ...this.data.map(d => d.value),
      ...this.data2.map(d => d.value),
      ...this.data3.map(d => d.value),
      ...this.data4.map(d => d.value),
      ...this.data5.map(d => d.value),
    ];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const margin = 0.1 * (max - min || 1); // avoid zero margin
    return [min - margin, max + margin];
  }

  ngAfterViewInit(): void {
    this.data = this.generateData(this.n, this.tickInterval, 1.0, 0.4, 1.6);
    this.data2 = this.generateData(this.n, this.tickInterval, 0.8, 0.4, 1.6);
    this.data3 = this.generateData(this.n, this.tickInterval, 1.2, 0.4, 1.6);
    this.data4 = this.generateData(this.n, this.tickInterval, 0.6, 0.4, 1.6);
    this.data5 = this.generateData(this.n, this.tickInterval, 1.4, 0.4, 1.6);
    this.createChart();
    this.dataSub = interval(this.tickInterval).subscribe(() => {
      this.areaLoading = false;
      this.data = this.refreshDataArray(this.data, this.n, this.tickInterval, 0.4, 1.6);
      this.data2 = this.refreshDataArray(this.data2, this.n, this.tickInterval, 0.4, 1.6);
      this.data3 = this.refreshDataArray(this.data3, this.n, this.tickInterval, 0.4, 1.6);
      this.data4 = this.refreshDataArray(this.data4, this.n, this.tickInterval, 0.4, 1.6);
      this.data5 = this.refreshDataArray(this.data5, this.n, this.tickInterval, 0.4, 1.6);
      this.updateChart();
    });
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
  }

  private createChart() {
    const element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth || 400;
    const gradientId = 'area-gradient';
    const gradientId2 = 'area-gradient2';
    const gradientId3 = 'area-gradient3';
    const gradientId4 = 'area-gradient4';
    const gradientId5 = 'area-gradient5';
    d3.select(element).selectAll('*').remove();
    this.svg = d3.select(element)
      .append('svg')
      .attr('viewBox', [0, 0, this.width, this.height].join(' '))
      .attr('width', this.width)
      .attr('height', this.height);

    // Gradient 1
    const defs = this.svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', '100%')
      .attr('x2', 0)
      .attr('y2', '40%');
    gradient.selectAll('stop')
      .data(d3.ticks(0, 1, 10))
      .join('stop')
      .attr('offset', (d: number) => d)
      .attr('stop-opacity', (d: number) => d)
      .attr('stop-color', d3.interpolate('white', this.fill));

    // Gradient 2
    const gradient2 = defs.append('linearGradient')
      .attr('id', gradientId2)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', '100%')
      .attr('x2', 0)
      .attr('y2', '40%');
    gradient2.selectAll('stop')
      .data(d3.ticks(0, 1, 10))
      .join('stop')
      .attr('offset', (d: number) => d)
      .attr('stop-opacity', (d: number) => d)
      .attr('stop-color', d3.interpolate('white', this.fill2));

    // Gradient 3
    const gradient3 = defs.append('linearGradient')
      .attr('id', gradientId3)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', '100%')
      .attr('x2', 0)
      .attr('y2', '40%');
    gradient3.selectAll('stop')
      .data(d3.ticks(0, 1, 10))
      .join('stop')
      .attr('offset', (d: number) => d)
      .attr('stop-opacity', (d: number) => d)
      .attr('stop-color', d3.interpolate('white', this.fill3));

    // Gradient 4
    const gradient4 = defs.append('linearGradient')
      .attr('id', gradientId4)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', '100%')
      .attr('x2', 0)
      .attr('y2', '40%');
    gradient4.selectAll('stop')
      .data(d3.ticks(0, 1, 10))
      .join('stop')
      .attr('offset', (d: number) => d)
      .attr('stop-opacity', (d: number) => d)
      .attr('stop-color', d3.interpolate('white', this.fill4));

    // Gradient 5
    const gradient5 = defs.append('linearGradient')
      .attr('id', gradientId5)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', '100%')
      .attr('x2', 0)
      .attr('y2', '40%');
    gradient5.selectAll('stop')
      .data(d3.ticks(0, 1, 10))
      .join('stop')
      .attr('offset', (d: number) => d)
      .attr('stop-opacity', (d: number) => d)
      .attr('stop-color', d3.interpolate('white', this.fill5));

    // Set x domain to only show data within the last timeWindow
    const now = Date.now();
    this.x = d3.scaleTime()
      .domain([now - this.timeWindow, now])
      .range([this.margin * 2, this.width + this.margin]);
    // Static y domain
    this.y = d3.scaleLinear()
      .domain([0, 2])
      .range([this.height - this.margin, this.margin * 0.5]);

    this.area = d3.area<any>()
      .curve(d3.curveLinear)
      .x((d: any) => this.x(d.date))
      .y0(this.y(0))
      .y1((d: any) => this.y(d.value));
    this.area2 = d3.area<any>()
      .curve(d3.curveLinear)
      .x((d: any) => this.x(d.date))
      .y0(this.y(0))
      .y1((d: any) => this.y(d.value));
    this.area3 = d3.area<any>()
      .curve(d3.curveLinear)
      .x((d: any) => this.x(d.date))
      .y0(this.y(0))
      .y1((d: any) => this.y(d.value));
    this.area4 = d3.area<any>()
      .curve(d3.curveLinear)
      .x((d: any) => this.x(d.date))
      .y0(this.y(0))
      .y1((d: any) => this.y(d.value));
    this.area5 = d3.area<any>()
      .curve(d3.curveLinear)
      .x((d: any) => this.x(d.date))
      .y0(this.y(0))
      .y1((d: any) => this.y(d.value));

    this.xAxis = (g: any) => g.attr('transform', `translate(0, ${this.y.range()[0]})`)
      .call(d3.axisBottom(this.x).tickSizeOuter(0));
    this.yAxis = (g: any) => g.attr('transform', `translate(${this.x.range()[0]})`)
      .call(d3.axisLeft(this.y).ticks(3).tickSizeOuter(this.margin))
      .call((g: any) => g.style('fill', 'white'))
      .call((g: any) => g.select('.domain').style('stroke', 'white'))
      .call((g: any) => g.selectAll('.tick > text').attr('dx', -this.margin * 0.2))
      .call((g: any) => g.selectAll('.tick > line').attr('x1', -this.margin * 0.2).attr('x2', -this.margin * 0.4));

    this.xG = this.svg.append('g').attr('transform', `translate(0, ${this.height - this.margin})`);
    this.yG = this.svg.append('g');

    // Draw the areas from bottom to top
    this.path5 = this.svg.append('path')
      .datum(this.data5)
      .attr('stroke', this.fill5)
      .attr('fill', `url(#${gradientId5})`)
      .attr('d', this.area5)
      .attr('opacity', 0.7);
    this.path4 = this.svg.append('path')
      .datum(this.data4)
      .attr('stroke', this.fill4)
      .attr('fill', `url(#${gradientId4})`)
      .attr('d', this.area4)
      .attr('opacity', 0.7);
    this.path3 = this.svg.append('path')
      .datum(this.data3)
      .attr('stroke', this.fill3)
      .attr('fill', `url(#${gradientId3})`)
      .attr('d', this.area3)
      .attr('opacity', 0.7);
    this.path2 = this.svg.append('path')
      .datum(this.data2)
      .attr('stroke', this.fill2)
      .attr('fill', `url(#${gradientId2})`)
      .attr('d', this.area2)
      .attr('opacity', 0.8);
    this.path = this.svg.append('path')
      .datum(this.data)
      .attr('stroke', this.fill)
      .attr('fill', `url(#${gradientId})`)
      .attr('d', this.area)
      .attr('opacity', 0.9);

    this.xG.call(this.xAxis);
    this.yG.call(this.yAxis);
  }

  private updateChart() {
    // Set x domain to only show data within the last timeWindow
    const now = Date.now();
    this.x.domain([now - this.timeWindow, now]);
    // Static y domain
    this.y.domain([0, 2]);
    // Always update area paths with latest data
    this.path.datum(this.data);
    this.path2.datum(this.data2);
    this.path3.datum(this.data3);
    this.path4.datum(this.data4);
    this.path5.datum(this.data5);
    // Animate area and x-axis transitions, but NOT y-axis
    this.t(this.path, (g: any) => g.attr('d', this.area));
    this.t(this.path2, (g: any) => g.attr('d', this.area2));
    this.t(this.path3, (g: any) => g.attr('d', this.area3));
    this.t(this.path4, (g: any) => g.attr('d', this.area4));
    this.t(this.path5, (g: any) => g.attr('d', this.area5));
    this.t(this.xG, (g: any) => this.xAxis(g));
    this.yG.call(this.yAxis); // No transition for y-axis
  }
}
