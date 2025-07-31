import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

interface BotFlagData {
  label: string;
  value: number;
  color: string;
}

interface GeoAsnData {
  label: string;
  value: number;
  asn: string;
}

@Component({
  selector: 'network-data-viz',
  templateUrl: './network-data-viz.component.html',
  styleUrl: './network-data-viz.component.less',
  encapsulation: ViewEncapsulation.None
})
export class NetworkDataVizComponent implements AfterViewInit, OnDestroy {
  @ViewChild('botFlagsChart', { static: true }) botFlagsChartRef!: ElementRef;
  @ViewChild('geoAsnChart', { static: true }) geoAsnChartRef!: ElementRef;
  @ViewChild('tooltip', { static: true }) tooltipRef!: ElementRef;

  private tooltip: any;
  private botFlagsSvg: any;
  private geoAsnSvg: any;

  // Chart dimensions
  private margin = { top: 20, right: 20, bottom: 120, left: 100 };
  private width = 500 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.bottom - this.margin.top;

  // Data
  private botFlagsData: BotFlagData[] = [
    { label: "80.7%", value: 80.7, color: "#ff9999" },
    { label: "56.5%", value: 56.5, color: "#99ccff" },
    { label: "16.4%", value: 16.4, color: "#cccccc" },
    { label: "16.4%", value: 16.4, color: "#ff6666" },
    { label: "embed.ctv.wireless1 (15.4%)", value: 15.4, color: "#66cc66" },
    { label: "8%", value: 8, color: "#ffcccc" },
    { label: "6.9%", value: 6.9, color: "#ccddff" },
    { label: "6.9%", value: 6.9, color: "#ffddcc" },
    { label: "3.8%", value: 3.8, color: "#ddccff" },
    { label: "2%", value: 2, color: "#ccffcc" }
  ];

  private geoAsnData: GeoAsnData[] = [
    { label: "T-MOBILE-AS21928", value: 49.5, asn: "AS21928" },
    { label: "CELLCO-PART", value: 40.3, asn: "AS6167" },
    { label: "SPACEX-STARLINK", value: 4.7, asn: "AS14593" },
    { label: "ATT-MOBILITY-LLC-AS20057", value: 3.3, asn: "AS20057" },
    { label: "BOOST-MOBILE", value: 0.9, asn: "AS398378" },
    { label: "C-SPIRE-WIRELESS", value: 0.3, asn: "AS15212" },
    { label: "Advance Wireless Network", value: 0.2, asn: "AS131445" },
    { label: "SURFAIRWIRELESS-IN-02", value: 0.2, asn: "AS13428" },
    { label: "EVERYWHERE-WIRELESS-LLC", value: 0.2, asn: "AS17210" },
    { label: "GETWIRELESS", value: 0.1, asn: "AS32278" }
  ];

  ngAfterViewInit(): void {
    this.tooltip = d3.select(this.tooltipRef.nativeElement);
    this.createBotFlagsChart();
    this.createGeoAsnChart();
  }

  ngOnDestroy(): void {
    // Clean up D3 elements
    if (this.botFlagsSvg) {
      this.botFlagsSvg.remove();
    }
    if (this.geoAsnSvg) {
      this.geoAsnSvg.remove();
    }
  }

  private showTooltip(event: MouseEvent, d: any): void {
    this.tooltip
      .style("opacity", 1)
      .html(`<strong>${d.label}</strong><br/>Value: ${d.value}%`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
  }

  private showGeoTooltip(event: MouseEvent, d: GeoAsnData): void {
    this.tooltip
      .style("opacity", 1)
      .html(`<strong>${d.label}</strong><br/>ASN: ${d.asn}<br/>Percentage: ${d.value}%`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
  }

  private hideTooltip(): void {
    this.tooltip.style("opacity", 0);
  }

  private createBotFlagsChart(): void {
    const container = d3.select(this.botFlagsChartRef.nativeElement);

    this.botFlagsSvg = container
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    const g = this.botFlagsSvg.append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    const xScale = d3.scaleBand()
      .domain(this.botFlagsData.map((d, i) => i.toString()))
      .range([0, this.width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.botFlagsData, d => d.value) || 0])
      .range([this.height, 0]);

    // Create bars
    g.selectAll(".bar")
      .data(this.botFlagsData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d: any, i: { toString: () => string; }) => xScale(i.toString()) || 0)
      .attr("y", (d: { value: d3.NumberValue; }) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d: { value: d3.NumberValue; }) => this.height - yScale(d.value))
      .attr("fill", (d: { color: any; }) => d.color)
      .on("mouseover", (event: MouseEvent, d: any) => this.showTooltip(event, d))
      .on("mouseout", () => this.hideTooltip());

    // Add axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(xScale).tickFormat((d, i) => `${i + 1}`));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale).tickFormat(d => d + "%"));

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Percentage");

    g.append("text")
      .attr("transform", `translate(${this.width / 2}, ${this.height + this.margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Bot Flags Categories");
  }

  private createGeoAsnChart(): void {
    const container = d3.select(this.geoAsnChartRef.nativeElement);

    this.geoAsnSvg = container
      .append("svg")
      .attr('viewBox', [-100, 0, this.width * 1.6, this.height * 1.6].join(' '))
      .attr("width", this.width + this.margin.left + this.margin.right + 100)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    const g = this.geoAsnSvg.append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.geoAsnData, d => d.value) || 0])
      .range([0, this.width]);

    const yScale = d3.scaleBand()
      .domain(this.geoAsnData.map(d => d.label))
      .range([0, this.height])
      .padding(0.1);

    const colorScale = d3.scaleSequential(d3.interpolateGreens)
      .domain([0, d3.max(this.geoAsnData, d => d.value) || 0]);

    // Create bars
    g.selectAll(".bar")
      .data(this.geoAsnData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d: { label: string; }) => yScale(d.label) || 0)
      .attr("width", (d: { value: d3.NumberValue; }) => xScale(d.value))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d: { value: d3.NumberValue; }) => colorScale(d.value))
      .on("mouseover", (event: MouseEvent, d: GeoAsnData) => this.showGeoTooltip(event, d))
      .on("mouseout", () => this.hideTooltip());

    // Add value labels on bars
    g.selectAll(".bar-label")
      .data(this.geoAsnData)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d: { value: d3.NumberValue; }) => xScale(d.value) + 5)
      .attr("y", (d: { label: string; }) => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("fill", "#333")
      .text((d: { value: string; }) => d.value + "%");

    // Add axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => d + "%"));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "10px");

    // Add axis labels
    g.append("text")
      .attr("transform", `translate(${this.width / 2}, ${this.height + this.margin.bottom - 60})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Percentage");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left - 100)
      .attr("x", 0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Network Providers (ASN)");
  }
}