import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';

// Interfaces
interface AppData {
  name: string;
  requests: number;
}

interface DeviceData {
  type: string;
  requests: number;
}

interface PositionData {
  position: string;
  requests: number;
}

interface BrowserData {
  name: string;
  requests: number;
}

interface BidFloorData {
  range: string;
  requests: number;
}

interface PublisherData {
  name: string;
  requests: number;
}

interface DashboardMetrics {
  totalRequests: string;
  avgBidFloor: string;
}

interface DashboardData {
  apps: AppData[];
  devices: DeviceData[];
  positions: PositionData[];
  browsers: BrowserData[];
  bidFloors: BidFloorData[];
  publishers: PublisherData[];
}

@Component({
  selector: 'advertising-analytics',
  templateUrl: './advertising-analytics.component.html',
  styleUrl: './advertising-analytics.component.less'
})
export class AdvertisingAnalyticsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('appsChart', { static: true }) appsChartRef!: ElementRef;
  @ViewChild('devicePieChart', { static: true }) devicePieChartRef!: ElementRef;
  @ViewChild('positionChart', { static: true }) positionChartRef!: ElementRef;
  @ViewChild('browserChart', { static: true }) browserChartRef!: ElementRef;
  @ViewChild('bidfloorChart', { static: true }) bidfloorChartRef!: ElementRef;
  @ViewChild('publisherChart', { static: true }) publisherChartRef!: ElementRef;
  @ViewChild('tooltip', { static: true }) tooltipRef!: ElementRef;

  private tooltip: any;
  private svgElements: any[] = [];

  // Chart dimensions
  private margin = { top: 20, right: 20, bottom: 60, left: 80 };
  private width = 400 - this.margin.left - this.margin.right;
  private height = 300 - this.margin.top - this.margin.bottom;

  // Color schemes
  private colorScheme = d3.scaleOrdinal(d3.schemeSet3);
  private colorScheme2 = d3.scaleOrdinal(d3.schemeCategory10);



  // Component data
  metrics: DashboardMetrics = {
    totalRequests: '81.8B',
    avgBidFloor: '$10.9'
  };

  data: DashboardData = {
    apps: [
      { name: "Pluto TV", requests: 11.9 },
      { name: "Samsung TV Plus", requests: 7.6 },
      { name: "Not Available", requests: 7.1 },
      { name: "Philo", requests: 4.4 },
      { name: "Atmosphere", requests: 3.8 },
      { name: "plutotv", requests: 3.0 },
      { name: "WatchFree", requests: 1.6 },
      { name: "LG Channels", requests: 1.5 },
      { name: "SAMSUNG TV PLUS", requests: 1.1 },
      { name: "Pluto TV - It's Free TV", requests: 1.0 }
    ],

    devices: [
      { type: "Set Top Box[NR1]", requests: 53.0 },
      { type: "Connected TV", requests: 28.8 }
    ],

    positions: [
      { position: "Not Available", requests: 81.8 },
      { position: "Above the Fold", requests: 0.001 },
      { position: "Fullscreen", requests: 0.001 },
      { position: "Header", requests: 0.000 },
      { position: "Footer", requests: 0.000 },
      { position: "Below the Fold", requests: 0.000 }
    ],

    browsers: [
      { name: "Not Available", requests: 36.59 },
      { name: "Tizen Browser", requests: 14.34 },
      { name: "Chrome", requests: 9.99 },
      { name: "Amazon Silk", requests: 8.47 },
      { name: "Safari", requests: 3.49 },
      { name: "Android Browser", requests: 3.40 },
      { name: "MIUI Browser", requests: 2.70 },
      { name: "LG webOS Browser", requests: 2.35 },
      { name: "Opera", requests: 0.17 }
    ],

    bidFloors: [
      { range: "0.00-0.05", requests: 13.3 },
      { range: "20.00-25.00", requests: 9.5 },
      { range: "6.50-7.00", requests: 5.6 },
      { range: "15.00-16.00", requests: 4.7 },
      { range: "18.00-19.00", requests: 4.5 },
      { range: "8.00-8.50", requests: 4.1 },
      { range: "10.00-11.00", requests: 3.8 },
      { range: "12.00-13.00", requests: 3.6 },
      { range: "16.00-17.00", requests: 3.2 },
      { range: "13.00-14.00", requests: 3.2 }
    ],

    publishers: [
      { name: "Not Available", requests: 37.8 },
      { name: "LG Ads Solutions", requests: 4.0 },
      { name: "Vizio", requests: 3.3 },
      { name: "Paramount Global", requests: 2.9 },
      { name: "LG Ads AE", requests: 2.5 },
      { name: "Rarefied Atmosphere, Inc.", requests: 2.4 },
      { name: "Glewed.tv", requests: 2.1 },
      { name: "Wurl", requests: 2.0 },
      { name: "Origin Media, Inc", requests: 1.8 },
      { name: "Krush Media", requests: 1.3 }
    ]
  };


  browserData = this.data.browsers.map((item: any) => {
    let total = Number(0);
    total = total + (item.requests);
    return { "category": item.name, "count": item.requests, "percent": 100 * (item.requests / total) };
  }) as any;

  private colorScheme3 = d3.scaleSequential((t) =>
    d3.interpolateViridis(t * 1 + 0.1)).domain([0, this.data.bidFloors.length]);

  ngAfterViewInit(): void {
    this.tooltip = d3.select(this.tooltipRef.nativeElement);
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    // Clean up D3 elements
    this.svgElements.forEach(svg => { if (svg) svg.remove(); });
  }

  private initializeCharts(): void {
    this.createAppsChart();
    this.createDevicePieChart();
    this.createPositionChart();
    // this.createBrowserChart();
    this.createBidFloorChart();
    this.createPublisherChart();
  }

  private showTooltip(event: MouseEvent, d: any, value: number | null = null): void {
    const content = value !== null ?
      `<strong>${d}</strong><br/>Value: ${value}%` :
      `<strong>${d.name || d.position || d.type || d.range}</strong><br/>Requests: ${d.requests}%`;

    this.tooltip
      .style("opacity", 1)
      .html(content)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
  }

  private hideTooltip(): void {
    this.tooltip.style("opacity", 0);
  }

  private createAppsChart(): void {
    const svg = d3.select(this.appsChartRef.nativeElement)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.svgElements.push(svg);

    const g = svg.append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.data.apps, d => d.requests) || 0])
      .range([0, this.width]);

    const yScale = d3.scaleBand()
      .domain(this.data.apps.map(d => d.name))
      .range([0, this.height])
      .padding(0.1);

    g.selectAll(".bar")
      .data(this.data.apps)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => yScale(d.name) || 0)
      .attr("width", d => xScale(d.requests))
      .attr("height", yScale.bandwidth())
      // .attr("fill", (d, i) => this.colorScheme(i.toString()))
      .attr("fill", (d, i) => this.colorScheme3(i))
      .on("mouseover", (event, d) => this.showTooltip(event, d))
      .on("mouseout", () => this.hideTooltip());

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "10px");
  }

  private createDevicePieChart(): void {
    const radius = Math.min(this.width, this.height) / 2;
    const svg = d3.select(this.devicePieChartRef.nativeElement)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.svgElements.push(svg);

    const g = svg.append("g")
      .attr("transform", `translate(${(this.width + this.margin.left + this.margin.right) / 2},${(this.height + this.margin.top + this.margin.bottom) / 2})`);

    const pie = d3.pie<DeviceData>()
      .value(d => d.requests)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<DeviceData>>()
      .innerRadius(0)
      .outerRadius(radius - 10);

    const arcs = g.selectAll(".arc")
      .data(pie(this.data.devices))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("class", "pie-slice")
      .attr("d", arc)
      .attr("fill", (d, i) => this.colorScheme(i.toString()))
      // .attr("fill", (d, i) => this.colorScheme3(i))
      .on("mouseover", (event, d) => this.showTooltip(event, d.data.type, d.data.requests))
      .on("mouseout", () => this.hideTooltip());

    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(d => `${d.data.requests}%`);
  }

  private createPositionChart(): void {
    const svg = d3.select(this.positionChartRef.nativeElement)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.svgElements.push(svg);

    const g = svg.append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // Filter out zero values and use log scale
    const filteredData = this.data.positions.filter(d => d.requests > 0);

    const xScale = d3.scaleBand()
      .domain(filteredData.map(d => d.position))
      .range([0, this.width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.requests) as [number, number])
      .range([this.height, 0]);

    g.selectAll(".bar")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.position) || 0)
      .attr("y", d => yScale(d.requests))
      .attr("width", xScale.bandwidth())
      .attr("height", d => this.height - yScale(d.requests))
      .attr("fill", (d, i) => this.colorScheme(i.toString()))
      .on("mouseover", (event, d) => this.showTooltip(event, d))
      .on("mouseout", () => this.hideTooltip());

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale).tickFormat(d3.format(".3s")));
  }

  private createBrowserChart(): void {
    const radius = Math.min(this.width, this.height) / 2;
    const svg = d3.select(this.browserChartRef.nativeElement)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.svgElements.push(svg);

    const g = svg.append("g")
      .attr("transform", `translate(${(this.width + this.margin.left + this.margin.right) / 2},${(this.height + this.margin.top + this.margin.bottom) / 2})`);

    const pie = d3.pie<BrowserData>()
      .value(d => d.requests)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<BrowserData>>()
      .innerRadius(radius * 0.4)
      .outerRadius(radius - 10);

    const topBrowsers = this.data.browsers.slice(0, 8);
    const arcs = g.selectAll(".arc")
      .data(pie(topBrowsers))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("class", "pie-slice")
      .attr("d", arc)
      .attr("fill", (d, i) => this.colorScheme2(i.toString()))
      .on("mouseover", (event, d) => this.showTooltip(event, d.data.name, d.data.requests))
      .on("mouseout", () => this.hideTooltip());

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, 20)`);

    const legendItems = legend.selectAll(".legend-item")
      .data(this.data.browsers.slice(0, 6))
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d, i) => this.colorScheme2(i.toString()));

    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "11px")
      .text(d => `${d.name.substring(0, 15)}...`);
  }

  private createBidFloorChart(): void {
    const svg = d3.select(this.bidfloorChartRef.nativeElement)
      .append("svg")
      .attr('viewBox', [0, -10, this.width * 1.4, this.height * 1.4].join(' '))
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.svgElements.push(svg);

    const g = svg.append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    const xScale = d3.scaleBand()
      .domain(this.data.bidFloors.map(d => d.range))
      .range([0, this.width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data.bidFloors, d => d.requests) || 0])
      .range([this.height, 0]);

    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(this.data.bidFloors, d => d.requests) || 0])
      .range([0, 30]);

    g.selectAll(".bubble")
      .data(this.data.bidFloors)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", d => (xScale(d.range) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.requests))
      .attr("r", d => radiusScale(d.requests))
      .attr("fill", (d, i) => this.colorScheme3(i * 2))
      .attr("opacity", 0.7)
      .on("mouseover", (event, d) => this.showTooltip(event, d))
      .on("mouseout", () => this.hideTooltip());

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));
  }

  private createPublisherChart(): void {
    const svg = d3.select(this.publisherChartRef.nativeElement)
      .append("svg")
      // .attr('viewBox', [0, 0, this.width, this.height].join(' '))
      .attr("width", this.width + this.margin.left + this.margin.right + 80)
      .attr("height", this.height + this.margin.top + this.margin.bottom + 30);

    this.svgElements.push(svg);

    const root = d3.hierarchy({ children: this.data.publishers } as any)
      .sum((d: any) => d.requests)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap()
      .tile(d3.treemapBinary)
      .size([this.width + this.margin.left + this.margin.right + 60, this.height + this.margin.top + this.margin.bottom])
      .padding(1)
      (root);

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    leaf.append("rect")
      .attr("fill", (d, i) => this.colorScheme3(i))
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("opacity", 0.8)
      .attr("cursor", "pointer")
      .on("mousemove", (event, d) => this.showTooltip(event, d.data))
      .on("mouseover", (event, d) => this.showTooltip(event, d.data))
      .on("mouseout", () => this.hideTooltip());

    leaf.append("text")
      .attr("x", 4)
      .attr("y", 16)
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text(d => {
        const name = (d.data as PublisherData).name;
        return name.length > 15 ? name.substring(0, 15) + "..." : name;
      });

    leaf.append("text")
      .attr("x", 4)
      .attr("y", 30)
      .style("font-size", "12px")
      .style("fill", "white")
      .text(d => `${(d.data as PublisherData).requests}%`);
  }
}