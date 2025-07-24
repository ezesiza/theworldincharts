import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-diverging-radial-bar',
  templateUrl: './diverging-radial-bar.component.html',
  styleUrl: './diverging-radial-bar.component.less'
})
export class DivergingRadialBarComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('legendContainer', { static: true }) legendContainer!: ElementRef;

  data: any[] = [];
  activatedRoute: string = '';
  chartLoading: boolean = true;
  order: string = 'Incident';
  isLoading = true;
  width = 900;
  height = Math.min(this.width, 1000);
  margin = { top: 20, right: 20, bottom: 130, left: 20 };
  svg: any;
  chartScale: number = 1;
  circleScale: number = 1;
  enableZoom: boolean = true;
  showLegend: boolean = true;
  selectedSectors: Set<string> = new Set();

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngAfterViewInit(): void {
    this.route.url.subscribe(data => {
      this.activatedRoute = data[0].path;
    });
    this.loadData();
  }

  onOrderChange(order: string) {
    this.order = order;
    this.sortData();
    this.renderChart();
  }

  onScaleChange(scale: number) {
    this.chartScale = scale;
    this.renderChart();
  }

  onCircleScaleChange(scale: number) {
    this.circleScale = scale;
    this.renderChart();
  }

  onZoomToggle(enabled: boolean) {
    this.enableZoom = enabled;
    this.renderChart();
  }

  onLegendToggle(enabled: boolean) {
    this.showLegend = enabled;
    this.renderChart();
  }

  onLegendItemClick(sector: string) {
    if (this.selectedSectors.has(sector)) {
      this.selectedSectors.delete(sector);
    } else {
      this.selectedSectors.add(sector);
    }
    // If all are selected, reset
    if (this.selectedSectors.size === this.data.length) {
      this.selectedSectors.clear();
    }
    this.renderChart();
  }

  resetLegendSelection() {
    this.selectedSectors.clear();
    this.renderChart();
  }

  loadData() {
    this.http.get('assets/datasets/unemployment.csv', { responseType: 'text' }).subscribe(csvText => {
      const data = d3.csvParse(csvText, d3.autoType);
      this.data = data;
      this.chartLoading = false;
      this.sortData();
      this.renderChart();
      this.isLoading = false;
    });
  }

  sortData() {
    this.data.sort((a, b) => d3.ascending(a[this.order], b[this.order]));
  }

  renderChart() {
    // Remove previous chart
    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
    this.legendContainer.nativeElement.innerHTML = '';

    const width = this.width * this.chartScale;
    const height = this.height * this.chartScale;
    const margin = this.margin;
    const data = this.data;

    const svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('viewBox', [-width / 2, -height / 2, width, height].join(' '))
      .style('padding-top', `${margin.top}px`);

    // Add a main group for zoom/drag
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Scales
    const y = d3.scaleLinear()
      .domain([0, 20])
      .range([0, -Math.PI]);

    const paddingScale = d3.scaleLinear()
      .domain([0, data.length + 1])
      .range([80 * this.circleScale, (height / 2) * this.circleScale]);

    const legendScale = d3.scaleLinear()
      .domain([0, data.length + 1])
      // .range([20 * this.circleScale, (height - margin.bottom - 60) * this.circleScale]);
      .range([20, (height - margin.bottom - 60)]);

    // Arc generator
    const arcGen = d3.arc()
      .startAngle(0);

    const arc = (d: any, i: number, dir: number, year: string) =>
      arcGen({
        innerRadius: paddingScale(i) - 20,
        outerRadius: paddingScale(i + 1) - 20,
        startAngle: 30,
        endAngle: dir * y(d[year])
      });

    // 2019 paths
    const group2019 = mainGroup.append('g')
      .attr('class', 'temp')
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('opacity', 1)
      .attr('data-state', (d: any) => `${d.sector}`)
      .attr('fill', '#7f8c8d')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('d', (d: any, i: number) => arc(d, i, 1, 'sept2019'));

    // 2020 paths
    const group2020 = mainGroup.append('g')
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('opacity', 1)
      .attr('data-state', (d: any) => `${d.sector}`)
      .attr('fill', '#d35400')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('d', (d: any, i: number) => arc(d, i, -1, 'sept2020'));

    // Conditionally attach mousemove/mouseleave
    if (this.selectedSectors.size === 0) {
      group2019
        .on('mousemove', (event: any, d: any) => this.mousemove(event, d, svg))
        .on('mouseleave', () => this.mouseleave(svg));
      group2020
        .on('mousemove', (event: any, d: any) => this.mousemove(event, d, svg))
        .on('mouseleave', () => this.mouseleave(svg));
    } else {
      group2019.on('mousemove', null).on('mouseleave', null);
      group2020.on('mousemove', null).on('mouseleave', null);
    }

    // Add zoom and drag behavior
    const zoomed = (event: any) => {
      mainGroup.attr('transform', event.transform);
    };
    if (this.enableZoom) {
      (svg as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>).call(d3.zoom<SVGSVGElement, unknown>().on('zoom', zoomed));
    }
    // Optionally, you can add drag to the mainGroup if you want to allow drag without zoom:
    // mainGroup.call(d3.drag()
    //   .on('drag', (event: any) => {
    //     mainGroup.attr('transform', `translate(${event.x},${event.y})`);
    //   })
    // );

    // Remove the SVG legend code
    // Instead, render the legend as HTML
    if (this.showLegend) {
      // Add Reset Selection item
      let legendItems = `<div style="font-size: ${10}px; margin-bottom: ${8}px; cursor:pointer; color:#1976d2; font-weight:bold;" id="reset-legend-selection">Reset Selection</div>`;
      legendItems += this.data.map((d: any) =>
        `<div class="legend-item${this.selectedSectors.size > 0 && !this.selectedSectors.has(d.sector) ? ' legend-blur' : ''}" data-sector="${d.sector}" style="font-size: ${10}px; margin-bottom: ${4}px; cursor:pointer;${this.selectedSectors.size > 0 && !this.selectedSectors.has(d.sector) ? 'opacity:0.2;' : ''}">
          <span style='font-weight:bold;'>${d.sector}</span> <span style='color:#888;'>+${d.change} pts</span>
        </div>`
      ).join('');
      this.legendContainer.nativeElement.innerHTML = legendItems;
      // Add click handlers
      Array.from(this.legendContainer.nativeElement.querySelectorAll('.legend-item')).forEach((el: any) => {
        el.onclick = () => this.onLegendItemClick(el.getAttribute('data-sector'));
      });
      const resetBtn = this.legendContainer.nativeElement.querySelector('#reset-legend-selection');
      if (resetBtn) {
        resetBtn.onclick = () => this.resetLegendSelection();
      }
    } else {
      this.legendContainer.nativeElement.innerHTML = '';
    }

    // Highlight/blur arcs based on selection
    if (this.selectedSectors.size > 0 && this.selectedSectors.size < this.data.length) {
      d3.select(this.chartContainer.nativeElement).selectAll('[data-state]')
        .attr('opacity', (d: any) => this.selectedSectors.has(d.sector) ? 1 : 0.2);
    } else {
      d3.select(this.chartContainer.nativeElement).selectAll('[data-state]')
        .attr('opacity', 1);
    }

    // Years header
    const yearHeader = svg.append('g')
      .attr('font-size', 25)
      .attr('font-weight', 'bold')
      .attr('transform', `translate(-${width / 2} -${height / 2 - margin.top})`);

    yearHeader.append('text')
      .attr('fill', '#7f8c8d')
      .attr('x', width / 2 - 60)
      .text('2019');
    yearHeader.append('text')
      .attr('fill', '#d35400')
      .attr('x', width / 2 + 5)
      .text('2020');

    // Y Axis
    this.yAxis(mainGroup, y, paddingScale, data, margin, height);
  }

  yAxis(group: any, y: any, paddingScale: any, data: any[], margin: any, height: number) {
    // Left axis
    group.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .selectAll('g')
      .data(d3.range(0, 21, 5))
      .join('g')
      .each((d: any, i: number, nodes: any[]) => {
        d3.select(nodes[i])
          .append('path')
          .attr('stroke', '#000')
          .attr('stroke-opacity', 0.2)
          .attr('d', () => {
            const p1 = d3.pointRadial(y(d), paddingScale(0) - 40);
            const p2 = d3.pointRadial(y(d), paddingScale(data.length / 2));
            return `M${p1[0]},${p1[1]}L${p2[0]},${p2[1]}`;
          });
        d3.select(nodes[i])
          .append('text')
          .attr('x', d3.pointRadial(y(d), 60)[0])
          .attr('y', d3.pointRadial(y(d), 60)[1])
          .text(`${d3.range(0, 21, 5)[i]}%`);
      });

    // Right axis
    group.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .selectAll('g')
      .data(d3.range(0, 21, 5))
      .join('g')
      .each((d: any, i: number, nodes: any[]) => {
        d3.select(nodes[i])
          .append('path')
          .attr('stroke', '#000')
          .attr('stroke-opacity', 0.2)
          .attr('d', () => {
            const p1 = d3.pointRadial(-y(d), paddingScale(0) - 40);
            const p2 = d3.pointRadial(-y(d), paddingScale(data.length / 2));
            return `M${p1[0]},${p1[1]}L${p2[0]},${p2[1]}`;
          });
        d3.select(nodes[i])
          .append('text')
          .attr('x', d3.pointRadial(-y(d), 60)[0])
          .attr('y', d3.pointRadial(-y(d), 60)[1])
          .text(`${d3.range(0, 21, 5)[i]}%`);
      });
  }

  mousemove(event: any, d: any, svg: any): void {
    d3.selectAll(`[data-state]`).attr('opacity', 0.2);
    d3.selectAll(`[data-state="${d.sector}"]`).attr('opacity', 1);
    d3.selectAll(`[data-state="${d.sector}"]`).style('display', 'block');
    d3.selectAll(`.sector[data-state="${d.sector}"]`).attr('font-size', 18);
  }

  mouseleave(svg: any): void {
    d3.selectAll(`[data-state]`).attr('opacity', 1);
    d3.selectAll('.title').style('display', 'none');
    d3.selectAll('.sector').attr('font-size', 10);
  }
}
