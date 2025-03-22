// population-comparison.component.ts
import { Component, OnInit, OnDestroy, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface ChartData {
  sharedLabel: string;
  barData1: number;
  barData2: number;
}

@Component({
  selector: 'divergin-bars',
  templateUrl: './diverging-bars.component.html',
  styleUrls: ['./diverging-bars.component.less']
})
export class DivergingBarsComponent implements OnInit, OnDestroy {
  // Data for the chart
  private data: ChartData[] = [
    { "sharedLabel": "Loli", "barData1": 43041, "barData2": 40852 },
    { "sharedLabel": "yoman", "barData1": 38867, "barData2": 36296 },
    { "sharedLabel": "goat", "barData1": 41748, "barData2": 40757 },
    { "sharedLabel": "meat", "barData1": 24831, "barData2": 23624 },
    { "sharedLabel": "Kevin-Chen", "barData1": 15764, "barData2": 15299 },
    { "sharedLabel": "Daniel", "barData1": 17006, "barData2": 16071 },
    { "sharedLabel": "allen-cat", "barData1": 24309, "barData2": 23235 },
    { "sharedLabel": "toosyou", "barData1": 46756, "barData2": 46065 },
    { "sharedLabel": "plant", "barData1": 41923, "barData2": 41704 },
    { "sharedLabel": "water", "barData1": 42565, "barData2": 42159 },
    { "sharedLabel": "bavarage", "barData1": 44316, "barData2": 45468 },
    { "sharedLabel": "cake", "barData1": 42975, "barData2": 44223 },
    { "sharedLabel": "car", "barData1": 36755, "barData2": 39452 },
    { "sharedLabel": "boat", "barData1": 31578, "barData2": 34063 },
    { "sharedLabel": "cloth", "barData1": 10328, "barData2": 11799 },
    { "sharedLabel": "hat", "barData1": 13917, "barData2": 14949 },
    { "sharedLabel": "shoe", "barData1": 7920, "barData2": 8589 },
    { "sharedLabel": "man", "barData1": 9003, "barData2": 10397 },
    { "sharedLabel": "book", "barData1": 14322, "barData2": 16832 },
    { "sharedLabel": "hair", "barData1": 12369, "barData2": 15836 },
    { "sharedLabel": "bed", "barData1": 8710, "barData2": 12377 },
    { "sharedLabel": "haha", "barData1": 5853, "barData2": 12213 }
  ];

  // Chart configuration
  private svg: any;
  private vis: any;
  private bar: any;
  private w: number = 0;
  private h: number = 0;
  private topMargin: number = 15;
  private labelSpace: number = 0;
  private innerMargin: number = 0;
  private outerMargin: number = 10;
  private gap: number = 10;
  private dataRange: number = 0;
  private leftLabel: string = "America";
  private rightLabel: string = "China";
  private chartWidth: number = 0;
  private barWidth: number = 0;
  private yScale: any;
  private total: any;
  private commas = d3.format(",.0f");
  private resizeSubscription: Subscription | null = null;

  constructor(private el: ElementRef, private zone: NgZone, private router: Router) { }

  ngOnInit(): void {
    this.initChart();
    this.drawChart();

    // Setup resize listener
    this.zone.runOutsideAngular(() => {
      this.resizeSubscription = fromEvent(window, 'resize')
        .pipe(debounceTime(300))
        .subscribe(() => {
          this.zone.run(() => {
            this.resize();
          });
        });
    });
  }

  onClose() {
    this.router.navigate(['/'])
  }

  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  private initChart(): void {
    // Calculate the data range for scaling
    this.dataRange = d3.max(this.data.map(d => Math.max(d.barData1, d.barData2))) || 0;

    // Get the content container dimensions
    const contentElement = this.el.nativeElement.querySelector('.content');
    this.w = parseInt(getComputedStyle(contentElement).width, 10);
    this.h = parseInt(getComputedStyle(contentElement).height, 10);

    // Calculate dimensions and scales
    this.updateDimensions();
  }

  private updateDimensions(): void {
    this.labelSpace = 30 + this.w / 100;
    this.innerMargin = this.w / 2 + this.labelSpace;
    this.chartWidth = this.w - this.innerMargin - this.outerMargin;
    this.barWidth = this.h / this.data.length;

    this.yScale = d3.scaleLinear()
      .domain([0, this.data.length])
      .range([0, this.h - this.topMargin]);

    this.total = d3.scaleLinear()
      .domain([0, this.dataRange])
      .range([0, this.chartWidth - this.labelSpace]);
  }

  private drawChart(): void {
    // Create main SVG element
    this.svg = d3.select(this.el.nativeElement.querySelector('#vis'))
      .append('svg')
      .attr('width', this.w)
      .attr('height', this.h);

    // Define gradient for highlights
    const defs = this.svg.append('defs');

    const gradient = defs.append('linearGradient')
      .attr('id', 'myGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#50C9CE');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FFE066');

    // Add title labels
    this.svg.append('text')
      .attr('class', 'firstlabel')
      .text(this.leftLabel)
      .attr('x', this.w - this.innerMargin)
      .attr('y', this.topMargin - 3)
      .attr('text-anchor', 'end');

    this.svg.append('text')
      .attr('class', 'secondlabel')
      .text(this.rightLabel)
      .attr('x', this.innerMargin)
      .attr('y', this.topMargin - 3)
      .attr('text-anchor', 'end');

    // Create bar groups
    this.bar = this.svg.selectAll('g.bar')
      .data(this.data)
      .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', (d: any, i: number) => {
        return `translate(0,${this.yScale(i) + this.topMargin})`;
      });

    // Add background bars for hover
    const wholebar = this.bar.append('rect')
      .attr('class', 'singlebar')
      .attr('width', this.w)
      .attr('height', this.barWidth - this.gap)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    // Add hover effects
    const highlight = (c: string) => {
      return (d: any, i: number) => {
        this.bar.filter((d: any, j: number) => i === j)
          .attr('class', c);
      };
    };

    this.bar
      .on('mouseover', highlight('highlight bar'))
      .on('mouseout', highlight('bar'));

    // Add shared labels
    this.bar.append('text')
      .attr('class', 'shared')
      .attr('x', this.w / 2)
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .text((d: ChartData) => d.sharedLabel);

    // Add left bars (female)
    this.bar.append('rect')
      .attr('class', 'femalebar')
      .attr('classed', '.femalebar')
      .attr('fill', ' #F25F5C')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('height', this.barWidth - this.gap)
      .attr('x', (d: ChartData) => this.innerMargin - this.total(d.barData2) - 2 * this.labelSpace)
      .attr('width', (d: ChartData) => this.total(d.barData2));

    // Add left bar labels
    this.bar.append('text')
      .attr('class', 'femalebar')
      .attr('dx', -10)
      .attr('dy', '1em')
      .attr('text-anchor', 'end')
      .text((d: ChartData) => this.commas(d.barData2))
      .attr('x', (d: ChartData) => this.innerMargin - this.total(d.barData2) - 2 * this.labelSpace);

    // Add right bars (male)
    this.bar.append('rect')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('fill', '#247BA0')
      .attr('height', this.barWidth - this.gap)
      .attr('x', this.innerMargin)
      .attr('width', (d: ChartData) => this.total(d.barData1));

    // Add right bar labels
    this.bar.append('text')
      .attr('class', 'malebar-text')
      .attr('dx', 5)
      .attr('dy', '1em')
      .text((d: ChartData) => this.commas(d.barData1))
      .attr('x', (d: ChartData) => this.innerMargin + this.total(d.barData1));
  }

  public resize(): void {
    // Get updated dimensions
    const contentElement = this.el.nativeElement.querySelector('.content');
    this.w = parseInt(getComputedStyle(contentElement).width, 10);
    this.h = parseInt(getComputedStyle(contentElement).height, 10);

    // Update dimensions and scales
    this.updateDimensions();

    // Update SVG and elements
    this.svg
      .attr('width', this.w)
      .attr('height', this.h);

    // Update title labels
    this.svg.select('.firstlabel')
      .attr('x', this.w - this.innerMargin)
      .attr('y', this.topMargin - 3);

    this.svg.select('.secondlabel')
      .attr('x', this.innerMargin)
      .attr('y', this.topMargin - 3);

    // Update bar positions and dimensions
    this.bar
      .attr('transform', (d: any, i: number) => {
        return `translate(0,${this.yScale(i) + this.topMargin})`;
      });

    this.svg.selectAll('.singlebar')
      .attr('width', this.w)
      .attr('height', this.barWidth - this.gap);

    this.bar.selectAll('.shared')
      .attr('x', this.w / 2);

    this.bar.selectAll('rect.femalebar')
      .attr('x', (d: ChartData) => this.innerMargin - this.total(d.barData2) - 2 * this.labelSpace)
      .attr('width', (d: ChartData) => this.total(d.barData2));

    this.bar.selectAll('rect.malebar')
      .attr('x', this.innerMargin)
      .attr('width', (d: ChartData) => this.total(d.barData1));

    this.bar.selectAll('.malebar-text')
      .attr('x', (d: ChartData) => this.innerMargin + this.total(d.barData1));

    this.bar.selectAll('text.femalebar')
      .attr('x', (d: ChartData) => this.innerMargin - this.total(d.barData2) - 2 * this.labelSpace);
  }

  // Method to handle the generate button click
  public generateRandomData(): void {
    this.data.forEach(item => {
      item.barData1 = Math.random() * this.dataRange;
      item.barData2 = Math.random() * this.dataRange;
    });

    this.refreshChart();
  }

  private refreshChart(): void {
    // Update bars with new data
    const bars = this.svg.selectAll('g.bar')
      .data(this.data);

    bars.selectAll('rect.malebar')
      .transition()
      .attr('width', (d: ChartData) => this.total(d.barData1));

    bars.selectAll('rect.femalebar')
      .transition()
      .attr('x', (d: ChartData) => this.innerMargin - this.total(d.barData2) - 2 * this.labelSpace)
      .attr('width', (d: ChartData) => this.total(d.barData2));

    bars.selectAll('text.malebar-text')
      .text((d: ChartData) => this.commas(d.barData1))
      .transition()
      .attr('x', (d: ChartData) => this.innerMargin + this.total(d.barData1));

    bars.selectAll('text.femalebar')
      .text((d: ChartData) => this.commas(d.barData2))
      .transition()
      .attr('x', (d: ChartData) => this.innerMargin - this.total(d.barData2) - 2 * this.labelSpace);
  }
}