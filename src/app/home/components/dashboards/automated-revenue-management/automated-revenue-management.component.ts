import { Component, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

interface DailyData {
  date: string;
  sessions: number;
  impressions: number;
  pageViews: number;
  adsImpressions: number;
  fillRate: number;
  sessionRPM: number;
  pageRPM: number;
  parsedDate?: Date;
}

interface ArmData {
  date: string;
  arm: string;
  fillRate: number;
  sessionRPM: number;
  pageRPM: number;
  revenue: number;
  sessions: number;
  impressions: number;
}

interface FloorData {
  floor: number;
  values: number[];
}

interface FloorDataSet {
  low: FloorData[];
  mid: FloorData[];
  high: FloorData[];
}

@Component({
  selector: 'automated-revenue-management',
  templateUrl: './automated-revenue-management.component.html',
  styleUrl: "./automated-revenue-management.component.less",
  encapsulation: ViewEncapsulation.None
})
export class AutomatedRevenueManagement implements AfterViewInit {
  @ViewChild('dailyChart', { static: true }) dailyChartRef!: ElementRef;
  @ViewChild('scatterChart', { static: true }) scatterChartRef!: ElementRef;
  @ViewChild('heatmapLow', { static: true }) heatmapLowRef!: ElementRef;
  @ViewChild('heatmapMid', { static: true }) heatmapMidRef!: ElementRef;
  @ViewChild('heatmapHigh', { static: true }) heatmapHighRef!: ElementRef;
  @ViewChild('armComparisonChart', { static: true }) armComparisonChartRef!: ElementRef;

  // Tooltip properties
  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipContent = '';

  // Data properties
  private dailyData: DailyData[] = [
    { date: "2022-04-13", sessions: 39536, impressions: 0, pageViews: 39142, adsImpressions: 24877, fillRate: 0, sessionRPM: 0, pageRPM: 0 },
    { date: "2022-04-12", sessions: 41274, impressions: 36447, pageViews: 42878, adsImpressions: 35638, fillRate: 63, sessionRPM: 0.33, pageRPM: 0.31 },
    { date: "2022-04-11", sessions: 42632, impressions: 35409, pageViews: 44444, adsImpressions: 34764, fillRate: 61, sessionRPM: 0.34, pageRPM: 0.32 },
    { date: "2022-04-10", sessions: 30074, impressions: 30610, pageViews: 31702, adsImpressions: 29850, fillRate: 71, sessionRPM: 0.35, pageRPM: 0.34 },
    { date: "2022-04-09", sessions: 45606, impressions: 61637, pageViews: 47566, adsImpressions: 42888, fillRate: 73, sessionRPM: 0.28, pageRPM: 0.26 },
    { date: "2022-04-08", sessions: 55221, impressions: 69812, pageViews: 58149, adsImpressions: 66612, fillRate: 77, sessionRPM: 0.32, pageRPM: 0.31 }
  ];

  private armData: ArmData[] = [
    { date: "2022-03-17", arm: "Low", fillRate: 57, sessionRPM: 0.44, pageRPM: 0.42, revenue: 33.04, sessions: 44545, impressions: 77432 },
    { date: "2022-03-17", arm: "Mid", fillRate: 56, sessionRPM: 0.43, pageRPM: 0.41, revenue: 30.38, sessions: 47438, impressions: 48443 },
    { date: "2022-03-17", arm: "High", fillRate: 52, sessionRPM: 0.39, pageRPM: 0.36, revenue: 18.75, sessions: 47226, impressions: 40371 },
    { date: "2022-03-18", arm: "Low", fillRate: 54, sessionRPM: 0.27, pageRPM: 0.25, revenue: 0, sessions: 0, impressions: 44468 },
    { date: "2022-03-18", arm: "Mid", fillRate: 48, sessionRPM: 0.26, pageRPM: 0.25, revenue: 4.88, sessions: 18732, impressions: 8858 },
    { date: "2022-03-18", arm: "High", fillRate: 39, sessionRPM: 0.26, pageRPM: 0.25, revenue: 4.71, sessions: 17642, impressions: 3770 },
    { date: "2022-03-25", arm: "Low", fillRate: 75, sessionRPM: 0.37, pageRPM: 0.35, revenue: 8.03, sessions: 21441, impressions: 15647 },
    { date: "2022-03-25", arm: "Mid", fillRate: 70, sessionRPM: 0.23, pageRPM: 0.22, revenue: 8.66, sessions: 37502, impressions: 18611 },
    { date: "2022-03-25", arm: "High", fillRate: 45, sessionRPM: 0.23, pageRPM: 0.22, revenue: 3.40, sessions: 36695, impressions: 15945 }
  ];

  private floorData: FloorDataSet = {
    low: [
      { floor: 0.02, values: [1960, 2330, 3750, 4810, 2360, 1810, 1006, 360, 130, 140, 110, 110, 100, 670, 1530, 1450, 2300, 1790, 3840, 1950, 1470, 1470, 1390, 0] },
      { floor: 0.05, values: [32200, 30950, 35300, 27500, 26450, 17010, 10060, 5070, 2480, 1430, 980, 1190, 2400, 3380, 9810, 13790, 19800, 21640, 23500, 30450, 21900, 22770, 24820, 0] },
      { floor: 0.07, values: [3000, 3300, 2360, 1500, 1750, 1376, 1570, 370, 160, 270, 30, 140, 400, 1300, 2330, 2790, 2840, 3090, 3150, 2820, 3130, 2960, 4130, 0] },
      { floor: 0.10, values: [11700, 12320, 13300, 2980, 1620, 7760, 5830, 2180, 940, 340, 290, 340, 320, 1380, 2490, 1680, 7330, 7610, 7900, 9650, 8810, 10190, 10320, 0] }
    ],
    mid: [
      { floor: 0.02, values: [1910, 2120, 6390, 3680, 2550, 1820, 980, 630, 160, 50, 30, 50, 350, 1516, 1400, 1840, 1620, 2630, 2400, 1920, 1530, 2640, 0, 0] },
      { floor: 0.05, values: [27300, 29000, 28350, 25810, 22860, 15970, 8470, 3870, 1880, 1610, 910, 1150, 2500, 3480, 8860, 13400, 18990, 20330, 18140, 19120, 19350, 20960, 20230, 0] },
      { floor: 0.07, values: [3000, 3850, 4670, 4190, 3450, 3320, 2320, 1140, 750, 420, 270, 390, 970, 1410, 3090, 3260, 3990, 4430, 3710, 4900, 4820, 4330, 3840, 0] },
      { floor: 0.10, values: [1720, 2190, 1530, 12840, 12190, 2350, 770, 330, 140, 60, 300, 510, 1340, 2340, 1930, 1690, 1730, 2960, 1730, 1520, 1470, 1340, 0, 0] }
    ],
    high: [
      { floor: 0.02, values: [2060, 1850, 5460, 6060, 2430, 1440, 710, 360, 290, 20, 110, 50, 130, 590, 1170, 1350, 1490, 1940, 1870, 1890, 1670, 1500, 2230, 0] },
      { floor: 0.05, values: [24870, 27200, 31440, 32550, 30390, 13660, 9260, 4340, 2020, 1120, 1020, 890, 2190, 3820, 9120, 14150, 17840, 18890, 16810, 19010, 17600, 20690, 22310, 0] },
      { floor: 0.07, values: [3130, 3450, 1910, 1520, 2700, 1130, 880, 460, 190, 220, 110, 210, 840, 1240, 3110, 2740, 3010, 2290, 2710, 2350, 2480, 2870, 3330, 0] },
      { floor: 0.10, values: [3960, 4080, 3730, 3870, 4010, 2730, 1410, 1020, 450, 170, 90, 230, 700, 1390, 3040, 2470, 2910, 2640, 2770, 3450, 4190, 3380, 3990, 0] }
    ]
  };

  // Helper functions
  private parseDate = d3.timeParse("%Y-%m-%d");
  private formatDate = d3.timeFormat("%b %d");

  ngAfterViewInit(): void {
    // Initialize all charts after view is ready
    setTimeout(() => {
      this.createDailyChart();
      this.createScatterChart();
      this.createHeatmap(this.floorData.low, this.heatmapLowRef.nativeElement, "Low Arm");
      this.createHeatmap(this.floorData.mid, this.heatmapMidRef.nativeElement, "Mid Arm");
      this.createHeatmap(this.floorData.high, this.heatmapHighRef.nativeElement, "High Arm");
      this.createArmComparisonChart();
    }, 0);
  }

  private showTooltip(content: string, event: MouseEvent): void {
    this.tooltipVisible = true;
    this.tooltipContent = content;
    this.tooltipX = event.pageX + 10;
    this.tooltipY = event.pageY - 10;
  }

  private hideTooltip(): void {
    this.tooltipVisible = false;
  }

  private createDailyChart(): void {
    const margin = { top: 20, right: 80, bottom: 50, left: 70 };
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.bottom - margin.top;

    const svg = d3.select(this.dailyChartRef.nativeElement)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse dates
    this.dailyData.forEach(d => d.parsedDate = this.parseDate(d.date)!);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(this.dailyData, d => d.parsedDate!) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.dailyData, d => Math.max(d.sessions, d.pageViews, d.adsImpressions))!])
      .range([height, 0]);

    const yScale2 = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat("" as any)
      );

    // Axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(this.formatDate as any));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(yScale2));

    // Lines
    const line = d3.line<DailyData>()
      .x(d => xScale(d.parsedDate!))
      .y(d => yScale(d.sessions))
      .curve(d3.curveMonotoneX);

    const line2 = d3.line<DailyData>()
      .x(d => xScale(d.parsedDate!))
      .y(d => yScale(d.pageViews))
      .curve(d3.curveMonotoneX);

    const line3 = d3.line<DailyData>()
      .x(d => xScale(d.parsedDate!))
      .y(d => yScale2(d.fillRate))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(this.dailyData)
      .attr("fill", "none")
      .attr("stroke", "#3498db")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.append("path")
      .datum(this.dailyData)
      .attr("fill", "none")
      .attr("stroke", "#e74c3c")
      .attr("stroke-width", 2)
      .attr("d", line2);

    g.append("path")
      .datum(this.dailyData.filter(d => d.fillRate > 0))
      .attr("fill", "none")
      .attr("stroke", "#2ecc71")
      .attr("stroke-width", 2)
      .attr("d", line3);

    // Points
    g.selectAll(".dot-sessions")
      .data(this.dailyData)
      .enter().append("circle")
      .attr("class", "dot-sessions")
      .attr("cx", d => xScale(d.parsedDate!))
      .attr("cy", d => yScale(d.sessions))
      .attr("r", 4)
      .attr("fill", "#3498db")
      .on("mouseover", (event, d) => {
        this.showTooltip(`<strong>${this.formatDate(d.parsedDate!)}</strong><br/>Sessions: ${d.sessions.toLocaleString()}`, event);
      })
      .on("mouseout", () => this.hideTooltip());

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 150}, 20)`);

    legend.append("rect")
      .attr("width", 140)
      .attr("height", 80)
      .attr("fill", "white")
      .attr("stroke", "#ddd")
      .attr("rx", 4);

    const legendItems = [
      { color: "#3498db", label: "Sessions" },
      { color: "#e74c3c", label: "Page Views" },
      { color: "#2ecc71", label: "Fill Rate %" }
    ];

    legendItems.forEach((item, i) => {
      const g_legend = legend.append("g")
        .attr("transform", `translate(10, ${20 + i * 20})`);

      g_legend.append("line")
        .attr("x1", 0)
        .attr("x2", 15)
        .attr("stroke", item.color)
        .attr("stroke-width", 2);

      g_legend.append("text")
        .attr("x", 20)
        .attr("y", 4)
        .attr("font-size", "12px")
        .text(item.label);
    });
  }

  private createScatterChart(): void {
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.bottom - margin.top;

    const svg = d3.select(this.scatterChartRef.nativeElement)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.armData, d => d.fillRate)!])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.armData, d => d.sessionRPM)!])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(["Low", "Mid", "High"])
      .range(["#3498db", "#f39c12", "#e74c3c"]);

    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat("" as any)
      );

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("" as any)
      );

    // Axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));

    // Labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Session RPM ($)");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .text("Fill Rate (%)");

    // Points
    g.selectAll(".dot")
      .data(this.armData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.fillRate))
      .attr("cy", d => yScale(d.sessionRPM))
      .attr("r", d => Math.sqrt(d.revenue) * 2 + 3)
      .attr("fill", d => colorScale(d.arm) as string)
      .attr("opacity", 0.7)
      .on("mouseover", (event, d) => {
        this.showTooltip(`<strong>${d.arm} Arm</strong><br/>Date: ${d.date}<br/>Fill Rate: ${d.fillRate}%<br/>Session RPM: $${d.sessionRPM}<br/>Revenue: $${d.revenue}`, event);
      })
      .on("mouseout", () => this.hideTooltip());

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 100}, 20)`);

    legend.append("rect")
      .attr("width", 90)
      .attr("height", 80)
      .attr("fill", "white")
      .attr("stroke", "#ddd")
      .attr("rx", 4);

    ["Low", "Mid", "High"].forEach((arm, i) => {
      const g_legend = legend.append("g")
        .attr("transform", `translate(10, ${20 + i * 20})`);

      g_legend.append("circle")
        .attr("cx", 8)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", colorScale(arm) as string);

      g_legend.append("text")
        .attr("x", 20)
        .attr("y", 4)
        .attr("font-size", "12px")
        .text(arm + " Arm");
    });
  }

  private createHeatmap(data: FloorData[], container: HTMLElement, title: string): void {
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const cellSize = 15;
    const width = 24 * cellSize + margin.left + margin.right;
    const height = data.length * cellSize + margin.top + margin.bottom;

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get max value for color scale
    const maxValue = d3.max(data, d => d3.max(d.values))!;

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxValue]);

    // Create cells
    data.forEach((row, i) => {
      row.values.forEach((value, j) => {
        g.append("rect")
          .attr("x", j * cellSize)
          .attr("y", i * cellSize)
          .attr("width", cellSize - 1)
          .attr("height", cellSize - 1)
          .attr("fill", value === 0 ? "#f8f8f8" : colorScale(value))
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .on("mouseover", (event) => {
            if (value > 0) {
              this.showTooltip(`Floor: $${row.floor}<br/>Hour: ${j}:00<br/>Impressions: ${value.toLocaleString()}`, event);
            }
          })
          .on("mouseout", () => this.hideTooltip());
      });
    });

    // Y-axis labels (floor prices)
    data.forEach((row, i) => {
      g.append("text")
        .attr("x", -5)
        .attr("y", i * cellSize + cellSize / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .text(`$${row.floor}`);
    });

    // X-axis labels (hours)
    for (let j = 0; j < 24; j++) {
      g.append("text")
        .attr("x", j * cellSize + cellSize / 2)
        .attr("y", data.length * cellSize + 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(j.toString());
    }

    // Axis labels
    g.append("text")
      .attr("x", -40)
      .attr("y", data.length * cellSize / 2)
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90, -40, ${data.length * cellSize / 2})`)
      .attr("font-size", "12px")
      .text("Floor Price");

    g.append("text")
      .attr("x", 12 * cellSize)
      .attr("y", data.length * cellSize + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Hour of Day");

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 100}, 20)`);

    legend.append("rect")
      .attr("width", 90)
      .attr("height", 80)
      .attr("fill", "white")
      .attr("stroke", "#ddd")
      .attr("rx", 4);

    const legendValues = [0, maxValue / 2, maxValue];
    legendValues.forEach((value, i) => {
      const g_legend = legend.append("g")
        .attr("transform", `translate(10, ${20 + i * 20})`);

      g_legend.append("rect")
        .attr("x", 0)
        .attr("y", -6)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", colorScale(value));

      g_legend.append("text")
        .attr("x", 18)
        .attr("y", 4)
        .attr("font-size", "12px")
        .text(value.toLocaleString());
    });
  }

  private createArmComparisonChart(): void {
    const margin = { top: 20, right: 20, bottom: 80, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.bottom - margin.top;

    const svg = d3.select(this.armComparisonChartRef.nativeElement)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Group data by date
    const groupedData = d3.group(this.armData, d => d.date);
    const dates = Array.from(groupedData.keys()).sort();

    const xScale = d3.scaleBand()
      .domain(dates)
      .range([0, width])
      .padding(0.1);

    const xSubScale = d3.scaleBand()
      .domain(["Low", "Mid", "High"])
      .range([0, xScale.bandwidth()])
      .padding(0.05);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.armData, d => d.sessionRPM)!])
      .range([height, 0]);

    const colorScale = d3.scaleSequential((t) =>
      d3.interpolateViridis(t * 1 + 0.1)).domain([0, this.armData.length]);


    // d3.scaleOrdinal()
    //   .domain(["Low", "Mid", "High"])
    //   .range(["#3498db", "#f39c12", "#e74c3c"]);

    // Axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => this.formatDate(this.parseDate(d)!)))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));

    // Bars
    dates.forEach(date => {
      const dateData = groupedData.get(date)!;
      dateData.forEach((d, i) => {
        g.append("rect")
          .attr("x", xScale(date)! + xSubScale(d.arm)!)
          .attr("y", yScale(d.sessionRPM))
          .attr("width", xSubScale.bandwidth())
          .attr("height", height - yScale(d.sessionRPM))
          .attr("fill", colorScale(i) as string)
          .on("mouseover", (event) => {
            this.showTooltip(`<strong>${d.arm} Arm</strong><br/>Date: ${this.formatDate(this.parseDate(d.date)!)}<br/>Session RPM: ${d.sessionRPM}<br/>Fill Rate: ${d.fillRate}%<br/>Revenue: ${d.revenue}`, event);
          })
          .on("mouseout", () => this.hideTooltip());
      });
    });

    // Y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Session RPM ($)");

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 100}, 20)`);

    legend.append("rect")
      .attr("width", 90)
      .attr("height", 80)
      .attr("fill", "white")
      .attr("stroke", "#ddd")
      .attr("rx", 4);

    ["Low", "Mid", "High"].forEach((arm, i) => {
      const g_legend = legend.append("g")
        .attr("transform", `translate(10, ${20 + i * 20})`);

      g_legend.append("rect")
        .attr("x", 0)
        .attr("y", -6)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", colorScale(i) as string);

      g_legend.append("text")
        .attr("x", 18)
        .attr("y", 4)
        .attr("font-size", "12px")
        .text(arm + " Arm");
    });
  }
}