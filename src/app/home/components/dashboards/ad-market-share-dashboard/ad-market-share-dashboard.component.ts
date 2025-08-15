import { Component, AfterViewInit, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'ad-market-share-dashboard',
  templateUrl: './ad-market-share-dashboard.component.html',
  styleUrls: ['./ad-market-share-dashboard.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class AdTechMarketShareComponent implements AfterViewInit {
  private data = [
    // Left column
    { domain: "google.com", percent: 78.3 },
    { domain: "smartadserver.com", percent: 5.7 },
    { domain: "rubiconproject.com", percent: 4.8 },
    { domain: "indexexchange.com", percent: 1.6 },
    { domain: "yoav.com", percent: 1.3 },
    { domain: "pubmatic.com", percent: 1.3 },
    { domain: "openx.com", percent: 1.1 },
    { domain: "ironarc.com", percent: 1.0 },
    { domain: "pubmatic.com", percent: 0.8 },
    { domain: "inmobi.com", percent: 0.6 },
    { domain: "triplelift.com", percent: 0.6 },
    { domain: "themediarigid.com", percent: 0.6 },
    { domain: "sovrn.com", percent: 0.4 },
    { domain: "appnexus.com", percent: 0.3 },
    { domain: "onetag.com", percent: 0.2 },
    { domain: "media.net", percent: 0.2 },

    // Middle column
    { domain: "google.com", percent: 88.2 },
    { domain: "rubiconproject.com", percent: 0.5 },
    { domain: "sovrn.com", percent: 0.3 },
    { domain: "indexexchange.com", percent: 0.2 },
    { domain: "pubmatic.com", percent: 0.2 },
    { domain: "yieldmo.com", percent: 0.1 },
    { domain: "appnexus.com", percent: 0.1 },
    { domain: "contextweb.com", percent: 0.1 },
    { domain: "smartadserver.com", percent: 0.1 },
    { domain: "themediarigid.com", percent: 0.1 },
    { domain: "inmobi.com", percent: 0.0 },
    { domain: "openx.com", percent: 0.0 },
    { domain: "[ADSTXT_AD_SYSTEM_DOMAIN]", percent: 0.0 },
    { domain: "fyber.com", percent: 0.0 },
    { domain: "gumgum.com", percent: 0.0 },
    { domain: "yahoo.com", percent: 0.0 },

    // Right column
    { domain: "google.com", percent: 82.1 },
    { domain: "pubmatic.com", percent: 4.0 },
    { domain: "indexexchange.com", percent: 4.0 },
    { domain: "openx.com", percent: 3.9 },
    { domain: "smartadserver.com", percent: 2.4 },
    { domain: "onetag.com", percent: 1.3 },
    { domain: "rubiconproject.com", percent: 1.0 },
    { domain: "appnexus.com", percent: 0.5 },
    { domain: "xandr.com", percent: 0.2 },
    { domain: "[ADSTXT_AD_SYSTEM_DOMAIN]", percent: 0.1 },
    { domain: "media.net", percent: 0.1 },
    { domain: "yahoo.com", percent: 0.1 },
    { domain: "adform.com", percent: 0.1 },
    { domain: "improvedigital.com", percent: 0.0 },
    { domain: "rhythmone.com", percent: 0.0 },
    { domain: "stroeer.com", percent: 0.0 }
  ];

  private finalData: any[] = [];
  googleShare = 0;
  top3Share = 0;
  top10Share = 0;
  activeTab = 'treemap';

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit(): void {
    this.processData();
    this.renderMetrics();
    this.renderVisualization();
  }

  private processData(): void {
    // Aggregate data by domain across all columns
    const aggregatedData: { [key: string]: number } = {};
    this.data.forEach(item => {
      if (aggregatedData[item.domain]) {
        aggregatedData[item.domain] += item.percent;
      } else {
        aggregatedData[item.domain] = item.percent;
      }
    });

    // Convert to array and sort
    this.finalData = Object.entries(aggregatedData)
      .map(([domain, totalPercent]) => ({
        domain,
        totalPercent,
        scaledValue: Math.pow(totalPercent, 1.5) * 2 // For bubble chart
      }))
      .sort((a, b) => b.totalPercent - a.totalPercent);

    // Calculate metrics
    this.googleShare = this.finalData[0].totalPercent;
    this.top3Share = this.finalData.slice(0, 3).reduce((sum, item) => sum + item.totalPercent, 0);
    this.top10Share = this.finalData.slice(0, 10).reduce((sum, item) => sum + item.totalPercent, 0);
  }

  private renderMetrics(): void {
    // Metrics are displayed in the template using Angular binding
  }

  private renderVisualization(): void {
    switch (this.activeTab) {
      case 'treemap':
        this.drawTreemap();
        break;
      case 'barchart':
        this.drawBarChart();
        break;
      case 'piechart':
        this.drawPieChart();
        break;
      case 'bubble':
        this.drawBubbleChart();
        break;
    }
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.renderVisualization();
  }

  private drawTreemap(): void {
    const container = this.elementRef.nativeElement.querySelector('#visualization-container');
    container.innerHTML = '';

    const width = 900;
    const height = 500;
    const margin = { top: 30, right: 30, bottom: 70, left: 70 };

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(this.finalData.map(d => d.domain))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), this.finalData.length).reverse());

    // Tooltip
    const tooltip = d3.select(container).append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Hierarchical data structure for treemap
    const root = d3.hierarchy({ children: this.finalData })
      .sum((d: any) => d.totalPercent)
      .sort((a, b) => b.value - a.value);

    // Treemap layout
    d3.treemap()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .padding(1)
      (root as any);

    // Create cells
    const cell = svg.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    cell.append("rect")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("fill", (d: any) => color(d.data.domain) as any)
      .on("mouseover", function (event: any, d: any) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`<strong>${d.data.domain}</strong><br/>${d.data.totalPercent.toFixed(1)}% market share`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);

        d3.select(this).attr("stroke", null);
      });

    // Add labels
    cell.append("text")
      .attr("class", "treemap-label")
      .selectAll("tspan")
      .data((d: any) => [d.data.domain, `${d.data.totalPercent.toFixed(1)}%`])
      .enter().append("tspan")
      .attr("x", 4)
      .attr("y", (d: any, i: number) => 12 + i * 10)
      .text((d: any) => d);

    // Add title
    svg.append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Ad Tech Market Share (Treemap)");
  }

  private drawBarChart(): void {
    const container = this.elementRef.nativeElement.querySelector('#visualization-container');
    container.innerHTML = '';

    const width = 900;
    const height = 500;
    const margin = { top: 50, right: 30, bottom: 70, left: 70 };

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter to top 15 domains
    const top15 = this.finalData.slice(0, 15);

    // X axis
    const x = d3.scaleBand()
      .range([0, width - margin.left - margin.right])
      .domain(top15.map(d => d.domain))
      .padding(0.2);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(top15, (d: any) => d.totalPercent) || 100])
      .range([height - margin.top - margin.bottom, 0]);

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add axis labels
    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", height - margin.top - margin.bottom + 40)
      .style("text-anchor", "middle")
      .text("Ad Tech Domain");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -(height - margin.top - margin.bottom) / 2)
      .style("text-anchor", "middle")
      .text("Market Share (%)");

    // Tooltip
    const tooltip = d3.select(container).append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Bars
    svg.selectAll("bar")
      .data(top15)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (d: any) => x(d.domain) || 0)
      .attr("y", (d: any) => y(d.totalPercent))
      .attr("width", x.bandwidth())
      .attr("height", (d: any) => height - margin.top - margin.bottom - y(d.totalPercent))
      .attr("fill", "#3498db")
      .on("mouseover", function (event: any, d: any) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`<strong>${d.domain}</strong><br/>${d.totalPercent.toFixed(1)}% market share`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select(this).attr("fill", "#e74c3c");
      })
      .on("mouseout", function () {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);

        d3.select(this).attr("fill", "#3498db");
      });

    // Add value labels on top of bars
    svg.selectAll(".text")
      .data(top15)
      .enter().append("text")
      .attr("x", (d: any) => (x(d.domain) || 0) + x.bandwidth() / 2)
      .attr("y", (d: any) => y(d.totalPercent) - 5)
      .attr("text-anchor", "middle")
      .text((d: any) => d.totalPercent.toFixed(1) + "%")
      .style("font-size", "10px")
      .style("fill", "#333");

    // Add title
    svg.append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Top 15 Ad Tech Domains by Market Share");
  }

  private drawPieChart(): void {
    const container = this.elementRef.nativeElement.querySelector('#visualization-container');
    container.innerHTML = '';

    const width = 900;
    const height = 500;
    const margin = { top: 50, right: 30, bottom: 30, left: 30 };
    const radius = Math.min(width, height) / 2 - margin.top;

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Prepare data for pie chart (Google vs Others)
    const googleShare = this.finalData[0].totalPercent;
    const othersShare = 100 - googleShare;
    const pieData = [
      { name: "Google", value: googleShare },
      { name: "All Others", value: othersShare }
    ];

    // Pie layout
    const pie = d3.pie()
      .value((d: any) => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Tooltip
    const tooltip = d3.select(container).append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Draw arcs
    const arcs = svg.selectAll("arc")
      .data(pie(pieData as any))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", (d: any) => arc(d) || '')
      .attr("fill", (d: any, i: number) => i === 0 ? "#4285F4" : "#EA4335")
      .on("mouseover", function (event: any, d: any) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`<strong>${d.data.name}</strong><br/>${d.data.value.toFixed(1)}% market share`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);

        d3.select(this).attr("stroke", null);
      });

    // Add labels
    arcs.append("text")
      .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d: any) => `${d.data.name}: ${d.data.value.toFixed(1)}%`)
      .style("font-size", "12px")
      .style("fill", "white");

    // Add title
    svg.append("text")
      .attr("y", -height / 2 + 20)
      .attr("text-anchor", "middle")
      .text("Google Dominance in Ad Tech Market")
      .style("font-size", "16px")
      .style("font-weight", "bold");
  }

  private drawBubbleChart(): void {
    const container = this.elementRef.nativeElement.querySelector('#visualization-container');
    container.innerHTML = '';

    const width = 900;
    const height = 700;
    const margin = { top: 50, right: 20, bottom: 20, left: 20 };

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip
    const tooltip = d3.select(container).append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(this.finalData.map(d => d.domain))
      .range(d3.quantize(t => d3.interpolateRainbow(t * 0.8 + 0.1), this.finalData.length));

    // Hierarchical data structure for circle packing
    const root = d3.hierarchy({ children: this.finalData })
      .sum((d: any) => d.scaledValue)
      .sort((a: any, b: any) => b.value - a.value);

    // Circle packing layout
    const pack = d3.pack()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .padding(3);

    pack(root as any);

    // Create bubbles
    const node = svg.selectAll(".node")
      .data(root.leaves())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    // Add circles
    node.append("circle")
      .attr("class", "bubble")
      .attr("r", (d: any) => d.r)
      .attr("fill", (d: any) => color(d.data.domain) as any)
      .on("mouseover", function (event: any, d: any) {
        // Highlight bubble
        d3.select(this)
          .attr("stroke", "#333")
          .attr("stroke-width", 2);

        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`<strong>${d.data.domain}</strong><br/>${d.data.totalPercent.toFixed(1)}% market share`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        // Remove highlight
        d3.select(this)
          .attr("stroke", "white")
          .attr("stroke-width", 1.5);

        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add labels
    node.append("text")
      .attr("class", "bubble-label")
      .attr("dy", ".3em")
      .text((d: any) => {
        // Only show label if there's enough space
        return d.r > 20 ? d.data.domain :
          d.r > 10 ? d.data.domain.split('.')[0] : "";
      })
      .style("font-size", (d: any) => {
        // Dynamic font sizing based on bubble size
        const baseSize = Math.min(12, d.r / 3);
        return `${baseSize}px`;
      });

    // Add title
    svg.append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Ad Tech Market Share (Circle Packing)");

    // Add subtitle
    svg.append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("Bubble size represents market share percentage");
  }
}