// tariff-visualization.component.ts
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

interface LegendState {
  [key: string]: boolean;
}

interface HistoricalData {
  year: number;
  rate: number;
}

interface TariffEvent {
  year: number;
  name: string;
  y: number;
}

interface BarData {
  category: string;
  initial: number;
  additional1: number;
  additional2: number;
}

@Component({
  selector: 'tariff-visualization',
  templateUrl: './tarrif-visualization.component.html',
  styleUrl: './tarrif-visualization.component.less'
})
export class TariffVisualizationComponent implements OnInit, AfterViewInit {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGElement>;

  private width = 800;
  private height = 600;
  private margin = { top: 60, right: 40, bottom: 140, left: 60 };

  legendState: LegendState = {
    "Initial level": true,
    "Additional up to April 2": true,
    "Additional after April 2": true
  };

  legendItems = [
    { label: "Initial level", color: "#b22222" },
    { label: "Additional up to April 2", color: "#e74c3c" },
    { label: "Additional after April 2", color: "#f8a1a1" }
  ];

  private historicalData: HistoricalData[] = [
    { year: 1820, rate: 40 },
    { year: 1825, rate: 45 },
    { year: 1828, rate: 57 }, // Tariff of Abominations
    { year: 1832, rate: 45 },
    { year: 1835, rate: 40 },
    { year: 1840, rate: 32 },
    { year: 1845, rate: 28 },
    { year: 1850, rate: 20 },
    { year: 1855, rate: 18 },
    { year: 1860, rate: 15 },
    { year: 1862, rate: 37 }, // Morrill tariffs
    { year: 1865, rate: 45 },
    { year: 1870, rate: 42 },
    { year: 1875, rate: 30 },
    { year: 1880, rate: 28 },
    { year: 1885, rate: 30 },
    { year: 1890, rate: 27 },
    { year: 1895, rate: 30 },
    { year: 1900, rate: 28 },
    { year: 1905, rate: 25 },
    { year: 1910, rate: 27 },
    { year: 1915, rate: 25 },
    { year: 1920, rate: 26 },
    { year: 1925, rate: 24 },
    { year: 1930, rate: 18 },
    { year: 1932, rate: 25 }, // Smoot-Hawley effect
    { year: 1935, rate: 20 },
    { year: 1940, rate: 15 },
    { year: 1945, rate: 13 },
    { year: 1947, rate: 15 }, // GATT
    { year: 1950, rate: 13 },
    { year: 1955, rate: 11 },
    { year: 1960, rate: 8 },
    { year: 1965, rate: 7 },
    { year: 1970, rate: 6.5 },
    { year: 1975, rate: 6 },
    { year: 1980, rate: 5.5 },
    { year: 1985, rate: 5 },
    { year: 1990, rate: 4 },
    { year: 1995, rate: 3.5 },
    { year: 2000, rate: 2.5 },
    { year: 2005, rate: 2 },
    { year: 2010, rate: 1.8 },
    { year: 2015, rate: 1.7 },
    { year: 2020, rate: 2.5 },
    { year: 2023, rate: 3.5 },
    { year: 2024, rate: 5 },
    { year: 2025, rate: 10 }
  ];

  private tariffEvents: TariffEvent[] = [
    { year: 1828, name: "Tariff of Abominations", y: 60 },
    { year: 1861, name: "Morrill tariffs", y: 55 },
    { year: 1930, name: "Smoot-Hawley", y: 28 },
    { year: 1947, name: "GATT", y: 16 },
    { year: 2025, name: "April 1, 2025", y: 10 }
  ];

  private barData: BarData[] = [
    { category: "On imports to the US", initial: 2, additional1: 20, additional2: 3 },
    { category: "On US exports", initial: 5, additional1: 0, additional2: 8 },
    { category: "World average", initial: 4, additional1: 0, additional2: 3 }
  ];

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    // Small delay to ensure DOM is fully rendered
    setTimeout(() => {
      this.createVisualization();
    }, 100);
  }

  getButtonClass(label: string): string {
    return `legend-button ${this.legendState[label] ? 'legend-button-active' : 'legend-button-inactive'}`;
  }

  toggleLegendItem(label: string): void {
    this.legendState[label] = !this.legendState[label];
    this.updateVisualization();
  }

  private createVisualization(): void {
    this.clearSvg();
    this.drawChart();
    this.addInitialAnimations();
  }

  private addInitialAnimations(): void {
    const svg = d3.select(this.svgRef.nativeElement);

    // Animate bars on initial load
    svg.selectAll(".initial-level, .additional1, .additional2")
      .attr("height", 0)
      .attr("y", this.height / 2 - this.margin.bottom)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr("height", function () { return d3.select(this).attr("data-height"); })
      .attr("y", function () { return d3.select(this).attr("data-y"); });

    // Animate line chart
    const path = svg.select("path");
    const totalLength = (path.node() as any)?.getTotalLength() || 0;

    if (totalLength > 0) {
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    }
  }

  private updateVisualization(): void {
    // Instead of clearing and redrawing, just update the bars with animation
    this.updateBarsWithAnimation();
  }

  private clearSvg(): void {
    d3.select(this.svgRef.nativeElement).selectAll("*").remove();
  }

  private drawChart(): void {
    const svg = d3.select(this.svgRef.nativeElement)
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([1820, 2025])
      .range([this.margin.left, this.width - this.margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 65])
      .range([this.height / 2 - this.margin.bottom, this.margin.top]);

    // Create line generator
    const line = d3.line<HistoricalData>()
      .x((d: any) => xScale(d.year))
      .y((d: any) => yScale(d.rate))
      .curve(d3.curveCardinal.tension(0.5));

    this.drawUpperChart(svg, xScale, yScale, line);
    this.drawLowerChart(svg);
    this.drawTitle(svg);
  }

  private drawUpperChart(svg: any, xScale: any, yScale: any, line: any): void {
    const upperChart = svg.append("g");

    // Add x-axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues([1850, 1900, 1950, 2000])
      .tickFormat(d3.format("d") as any);

    upperChart.append("g")
      .attr("transform", `translate(0, ${this.height / 2 - this.margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("font-size", "12px");

    // Add gridlines
    upperChart.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data([0, 20, 40, 60])
      .enter()
      .append("line")
      .attr("x1", this.margin.left)
      .attr("y1", (d: any) => yScale(d))
      .attr("x2", this.width - this.margin.right)
      .attr("y2", (d: any) => yScale(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);

    // Add y-axis labels
    upperChart.append("g")
      .selectAll(".y-label")
      .data([0, 20, 40, 60])
      .enter()
      .append("text")
      .attr("class", "y-label")
      .attr("x", this.margin.left - 10)
      .attr("y", (d: any) => yScale(d))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "12px")
      .text((d: any) => d + "%");

    // Draw the main line
    upperChart.append("path")
      .datum(this.historicalData)
      .attr("fill", "none")
      .attr("stroke", "#e63946")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Highlight recent spike
    upperChart.append("path")
      .datum(this.historicalData.filter((d: any) => d.year >= 2020))
      .attr("fill", "none")
      .attr("stroke", "#e63946")
      .attr("stroke-width", 4)
      .attr("d", line);

    // Add event markers
    this.drawEventMarkers(upperChart, xScale, yScale);

    // Add recent annotations
    this.drawRecentAnnotations(upperChart);

    // Add chart title
    upperChart.append("text")
      .attr("x", this.width / 2)
      .attr("y", this.margin.top - 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Effective average tariff rate, United States");
  }

  private drawEventMarkers(upperChart: any, xScale: any, yScale: any): void {
    const events = upperChart.selectAll(".event")
      .data(this.tariffEvents)
      .enter()
      .append("g")
      .attr("class", "event");

    // Vertical dashed lines
    events.append("line")
      .attr("x1", (d: any) => xScale(d.year))
      .attr("y1", yScale(0))
      .attr("x2", (d: any) => xScale(d.year))
      .attr("y2", (d: any) => yScale(d.y) - 10)
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Event circles
    events.append("circle")
      .attr("cx", (d: any) => xScale(d.year))
      .attr("cy", (d: any) => yScale(d.y) - 10)
      .attr("r", 5)
      .attr("fill", "white")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5);

    // Event labels
    events.append("text")
      .attr("x", (d: any) => xScale(d.year))
      .attr("y", (d: any) => yScale(d.y) - 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .text((d: any) => d.name);
  }

  private drawRecentAnnotations(upperChart: any): void {
    const recentEvents = [
      { x: this.width - this.margin.right - 100, y: 80, label: "April 9", details: "(90 day pause + more China tariffs)" },
      { x: this.width - this.margin.right - 100, y: 95, label: "April 2" }
    ];

    const annotations = upperChart.append("g").attr("class", "recent-events");

    annotations.selectAll(".recent-event")
      .data(recentEvents)
      .enter()
      .append("text")
      .attr("x", (d: any) => d.x)
      .attr("y", (d: any) => d.y)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .text((d: any) => d.label);

    annotations.append("text")
      .attr("x", recentEvents[0].x)
      .attr("y", recentEvents[0].y + 12)
      .attr("text-anchor", "start")
      .attr("font-size", "9px")
      .attr("fill", "#666")
      .text(recentEvents[0].details);
  }

  private drawLowerChart(svg: any): void {
    const lowerChart = svg.append("g")
      .attr("transform", `translate(0, ${this.height / 2})`);

    // Lower chart scales
    const xBarScale = d3.scaleBand()
      .domain(this.barData.map((d: any) => d.category))
      .range([this.margin.left + 50, this.width - this.margin.right - 50])
      .padding(0.3);

    const yBarScale = d3.scaleLinear()
      .domain([0, 30])
      .range([this.height / 2 - this.margin.bottom, this.margin.top]);

    // Add gridlines
    lowerChart.append("g")
      .selectAll("line")
      .data([0, 10, 20, 30])
      .enter()
      .append("line")
      .attr("x1", this.margin.left)
      .attr("y1", (d: any) => yBarScale(d))
      .attr("x2", this.width - this.margin.right)
      .attr("y2", (d: any) => yBarScale(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);

    // Add y-axis labels
    lowerChart.append("g")
      .selectAll(".y-label")
      .data([0, 10, 20, 30])
      .enter()
      .append("text")
      .attr("x", this.margin.left - 10)
      .attr("y", (d: any) => yBarScale(d))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "12px")
      .text((d: any) => d + "%");

    this.drawBars(lowerChart, xBarScale, yBarScale);
    this.drawLegend(lowerChart);
  }

  private drawBars(lowerChart: any, xBarScale: any, yBarScale: any): void {
    const barGroups = lowerChart.selectAll(".bar-group")
      .data(this.barData)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", (d: any) => `translate(${xBarScale(d.category)}, 0)`);

    // Initial level bars
    barGroups.append("rect")
      .attr("class", "initial-level bar-rect")
      .attr("x", 0)
      .attr("y", (d: any) => yBarScale(d.initial))
      .attr("width", xBarScale.bandwidth())
      .attr("height", (d: any) => yBarScale(0) - yBarScale(d.initial))
      .attr("data-y", (d: any) => yBarScale(d.initial))
      .attr("data-height", (d: any) => yBarScale(0) - yBarScale(d.initial))
      .attr("fill", this.legendState["Initial level"] ? "#b22222" : "transparent")
      .attr("opacity", this.legendState["Initial level"] ? 1 : 0.2);

    // Additional level 1 bars
    barGroups.append("rect")
      .attr("class", "additional1 bar-rect")
      .attr("x", 0)
      .attr("y", (d: any) => {
        return this.legendState["Initial level"] ?
          yBarScale(d.initial + d.additional1) :
          yBarScale(d.additional1);
      })
      .attr("width", xBarScale.bandwidth())
      .attr("height", (d: any) => {
        return this.legendState["Initial level"] ?
          yBarScale(d.initial) - yBarScale(d.initial + d.additional1) :
          yBarScale(0) - yBarScale(d.additional1);
      })
      .attr("data-y", (d: any) => {
        return this.legendState["Initial level"] ?
          yBarScale(d.initial + d.additional1) :
          yBarScale(d.additional1);
      })
      .attr("data-height", (d: any) => {
        return this.legendState["Initial level"] ?
          yBarScale(d.initial) - yBarScale(d.initial + d.additional1) :
          yBarScale(0) - yBarScale(d.additional1);
      })
      .attr("fill", this.legendState["Additional up to April 2"] ? "#e74c3c" : "transparent")
      .attr("opacity", this.legendState["Additional up to April 2"] ? 1 : 0.2);

    // Additional level 2 bars
    barGroups.append("rect")
      .attr("class", "additional2 bar-rect")
      .attr("x", 0)
      .attr("y", (d: any) => {
        if (this.legendState["Initial level"] && this.legendState["Additional up to April 2"]) {
          return yBarScale(d.initial + d.additional1 + d.additional2);
        } else if (this.legendState["Initial level"]) {
          return yBarScale(d.initial + d.additional2);
        } else if (this.legendState["Additional up to April 2"]) {
          return yBarScale(d.additional1 + d.additional2);
        } else {
          return yBarScale(d.additional2);
        }
      })
      .attr("width", xBarScale.bandwidth())
      .attr("height", (d: any) => {
        if (this.legendState["Initial level"] && this.legendState["Additional up to April 2"]) {
          return yBarScale(d.initial + d.additional1) - yBarScale(d.initial + d.additional1 + d.additional2);
        } else if (this.legendState["Initial level"]) {
          return yBarScale(d.initial) - yBarScale(d.initial + d.additional2);
        } else if (this.legendState["Additional up to April 2"]) {
          return yBarScale(d.additional1) - yBarScale(d.additional1 + d.additional2);
        } else {
          return yBarScale(0) - yBarScale(d.additional2);
        }
      })
      .attr("data-y", (d: any) => {
        if (this.legendState["Initial level"] && this.legendState["Additional up to April 2"]) {
          return yBarScale(d.initial + d.additional1 + d.additional2);
        } else if (this.legendState["Initial level"]) {
          return yBarScale(d.initial + d.additional2);
        } else if (this.legendState["Additional up to April 2"]) {
          return yBarScale(d.additional1 + d.additional2);
        } else {
          return yBarScale(d.additional2);
        }
      })
      .attr("data-height", (d: any) => {
        if (this.legendState["Initial level"] && this.legendState["Additional up to April 2"]) {
          return yBarScale(d.initial + d.additional1) - yBarScale(d.initial + d.additional1 + d.additional2);
        } else if (this.legendState["Initial level"]) {
          return yBarScale(d.initial) - yBarScale(d.initial + d.additional2);
        } else if (this.legendState["Additional up to April 2"]) {
          return yBarScale(d.additional1) - yBarScale(d.additional1 + d.additional2);
        } else {
          return yBarScale(0) - yBarScale(d.additional2);
        }
      })
      .attr("fill", this.legendState["Additional after April 2"] ? "#f8a1a1" : "transparent")
      .attr("opacity", this.legendState["Additional after April 2"] ? 1 : 0.2);

    // Category labels
    barGroups.append("text")
      .attr("x", xBarScale.bandwidth() / 2)
      .attr("y", this.height / 2 - this.margin.bottom + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text((d: any) => d.category);
  }

  private updateBarsWithAnimation(): void {
    const svg = d3.select(this.svgRef.nativeElement);
    const lowerChart = svg.select("g").select("g");

    // Get scales (reconstruct them)
    const xBarScale = d3.scaleBand()
      .domain(this.barData.map((d: any) => d.category))
      .range([this.margin.left + 50, this.width - this.margin.right - 50])
      .padding(0.3);

    const yBarScale = d3.scaleLinear()
      .domain([0, 30])
      .range([this.height / 2 - this.margin.bottom, this.margin.top]);

    // Update initial level bars with animation
    svg.selectAll(".initial-level")
      .transition()
      .duration(500)
      .ease(d3.easeCircleOut)
      .attr("y", (d: any) => yBarScale(d.initial))
      .attr("height", (d: any) => yBarScale(0) - yBarScale(d.initial))
      .attr("fill", this.legendState["Initial level"] ? "#b22222" : "transparent")
      .attr("opacity", this.legendState["Initial level"] ? 1 : 0.2);

    // Update additional1 bars with animation
    svg.selectAll(".additional1")
      .transition()
      .duration(500)
      .ease(d3.easeCircleOut)
      .attr("y", (d: any) => {
        return this.legendState["Initial level"] ?
          yBarScale(d.initial + d.additional1) :
          yBarScale(d.additional1);
      })
      .attr("height", (d: any) => {
        return this.legendState["Initial level"] ?
          yBarScale(d.initial) - yBarScale(d.initial + d.additional1) :
          yBarScale(0) - yBarScale(d.additional1);
      })
      .attr("fill", this.legendState["Additional up to April 2"] ? "#e74c3c" : "transparent")
      .attr("opacity", this.legendState["Additional up to April 2"] ? 1 : 0.2);

    // Update additional2 bars with animation
    svg.selectAll(".additional2")
      .transition()
      .duration(500)
      .ease(d3.easeCircleOut)
      .attr("y", (d: any) => {
        if (this.legendState["Initial level"] && this.legendState["Additional up to April 2"]) {
          return yBarScale(d.initial + d.additional1 + d.additional2);
        } else if (this.legendState["Initial level"]) {
          return yBarScale(d.initial + d.additional2);
        } else if (this.legendState["Additional up to April 2"]) {
          return yBarScale(d.additional1 + d.additional2);
        } else {
          return yBarScale(d.additional2);
        }
      })
      .attr("height", (d: any) => {
        if (this.legendState["Initial level"] && this.legendState["Additional up to April 2"]) {
          return yBarScale(d.initial + d.additional1) - yBarScale(d.initial + d.additional1 + d.additional2);
        } else if (this.legendState["Initial level"]) {
          return yBarScale(d.initial) - yBarScale(d.initial + d.additional2);
        } else if (this.legendState["Additional up to April 2"]) {
          return yBarScale(d.additional1) - yBarScale(d.additional1 + d.additional2);
        } else {
          return yBarScale(0) - yBarScale(d.additional2);
        }
      })
      .attr("fill", this.legendState["Additional after April 2"] ? "#f8a1a1" : "transparent")
      .attr("opacity", this.legendState["Additional after April 2"] ? 1 : 0.2);

    // Update legend boxes with animation
    svg.selectAll(".legend-item rect:first-child")
      .transition()
      .duration(300)
      .attr("fill", (d: any) => this.legendState[d.label] ? d.color : "#e0e0e0");
  }

  private drawLegend(lowerChart: any): void {
    const legend = lowerChart.append("g")
      .attr("transform", `translate(${this.margin.left + 50}, ${this.height / 2 - this.margin.top - 20})`);

    const legendItems = legend.selectAll(".legend-item")
      .data(this.legendItems)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d: any, i: any) => `translate(0, ${i * 20})`)
      .style("cursor", "pointer");

    // Legend boxes
    legendItems.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d: any) => this.legendState[d.label] ? d.color : "#e0e0e0")
      .attr("stroke", "#333")
      .attr("stroke-width", 1);

    // Legend text
    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 10)
      .attr("font-size", "12px")
      .text((d: any) => d.label);

    // Click handlers
    legendItems.append("rect")
      .attr("width", 180)
      .attr("height", 20)
      .attr("transform", "translate(0, -10)")
      .attr("fill", "transparent")
      .on("click", (event: any, d: any) => {
        this.toggleLegendItem(d.label);
      });
  }

  private drawTitle(svg: any): void {
    svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("US tariffs are highest in a century, global tariffs are also rising sharply");
  }
}