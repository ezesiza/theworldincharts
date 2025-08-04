// cpm-dashboard.component.ts
import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';


interface CPMData {
  site: string;
  minCPM: number | null;
  maxCPM: number | null;
  clearingPrice: number | null;
  hCPM: number | null;
}


@Component({
  selector: 'cost-pricing-dashboard',
  templateUrl: './cost-pricing-dashboard.component.html',
  styleUrl: './cost-pricing-dashboard.component.less',
  encapsulation: ViewEncapsulation.None
})
export class CostPricingDashboardComponent implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('legendContainer', { static: true }) legendContainer!: ElementRef;

  selectedView = 'all';
  selectedMetric = 'minCPM';
  selectedComparison = 'minmax';
  selectedSort = 'minCPM';
  scatterX = 'minCPM';
  scatterY = 'maxCPM';

  data: CPMData[] = [
    { site: "cnn.com", minCPM: 0.01, maxCPM: 7.09, clearingPrice: 0.97, hCPM: 6.55 },
    { site: "site1", minCPM: 0.01, maxCPM: 0.41, clearingPrice: 0.28, hCPM: null },
    { site: "site2", minCPM: 0.00, maxCPM: 2.41, clearingPrice: 0.23, hCPM: 15.34 },
    { site: "site3", minCPM: 0.04, maxCPM: 3.03, clearingPrice: 0.34, hCPM: null },
    { site: "site4", minCPM: 0.04, maxCPM: 7.09, clearingPrice: 3.60, hCPM: 30.07 },
    { site: "site5", minCPM: 0.00, maxCPM: 4.29, clearingPrice: 0.85, hCPM: 71.20 },
    { site: "site6", minCPM: 0.01, maxCPM: 0.95, clearingPrice: 0.19, hCPM: 26.20 },
    { site: "site7", minCPM: 0.00, maxCPM: 5.74, clearingPrice: 0.26, hCPM: 3.05 },
    { site: "site8", minCPM: 0.00, maxCPM: 3.03, clearingPrice: 0.30, hCPM: 9.22 }
  ];

  colors = {
    minCPM: '#27ae60',
    maxCPM: '#3498db',
    clearingPrice: '#f39c12',
    hCPM: '#e74c3c'
  };

  metricNames = {
    minCPM: 'Min CPM',
    maxCPM: 'Max CPM',
    clearingPrice: 'Clearing Price',
    hCPM: 'Header CPM'
  };

  ngOnInit() {
    this.updateChart();
  }

  getMaxValue(data: CPMData[], metrics: string[]): number {
    let max = 0;
    data.forEach(d => {
      metrics.forEach(metric => {
        const value = d[metric as keyof CPMData] as number;
        if (value !== null && value > max) {
          max = value;
        }
      });
    });
    return max;
  }

  renderBarChart(currentData: CPMData[], metricsToShow: string[]) {
    const chart = d3.select(this.chartContainer.nativeElement);
    const legend = d3.select(this.legendContainer.nativeElement);
    const maxValue = this.getMaxValue(currentData, metricsToShow);
    const scaleWidth = 400;

    // Create legend
    metricsToShow.forEach(metric => {
      legend.append("span")
        .attr("class", "legend-item")
        .style("background", this.colors[metric as keyof typeof this.colors])
        .text(this.metricNames[metric as keyof typeof this.metricNames]);
    });

    // Create chart rows
    currentData.forEach(d => {
      const row = chart.append("div").attr("class", "bar-row");
      row.append("div").attr("class", "label").text(d.site);

      const barContainer = row.append("div").attr("class", "bar-container");

      metricsToShow.forEach(metric => {
        const value = d[metric as keyof CPMData] as number;
        if (value !== null) {
          const metricRow = barContainer.append("div");
          metricRow.append("div")
            .attr("class", "metric-label")
            .text(this.metricNames[metric as keyof typeof this.metricNames]);

          const bar = metricRow.append("div")
            .attr("class", "bar")
            .style("width", Math.max(2, (value / maxValue) * scaleWidth) + "px")
            .style("background", `linear-gradient(90deg, ${this.colors[metric as keyof typeof this.colors]}, ${this.colors[metric as keyof typeof this.colors]}dd)`)
            .attr("title", `${this.metricNames[metric as keyof typeof this.metricNames]}: $${value.toFixed(2)}`);

          bar.append("div")
            .attr("class", "value-label")
            .text(`$${value.toFixed(2)}`);
        }
      });
    });
  }

  renderScatterPlot() {
    const xMetric = this.scatterX;
    const yMetric = this.scatterY;

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(this.chartContainer.nativeElement).append("svg")
      .attr("class", "chart-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const filteredData = this.data.filter(d =>
      d[xMetric as keyof CPMData] !== null && d[yMetric as keyof CPMData] !== null
    );

    const xScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d[xMetric as keyof CPMData] as number) as [number, number])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d[yMetric as keyof CPMData] as number) as [number, number])
      .range([height, 0]);

    // Add axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + 35)
      .style("text-anchor", "middle")
      .text(this.metricNames[xMetric as keyof typeof this.metricNames]);

    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .text(this.metricNames[yMetric as keyof typeof this.metricNames]);

    // Add dots
    g.selectAll(".dot")
      .data(filteredData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 6)
      .attr("cx", d => xScale(d[xMetric as keyof CPMData] as number))
      .attr("cy", d => yScale(d[yMetric as keyof CPMData] as number))
      .style("fill", this.colors[xMetric as keyof typeof this.colors])
      .on("mouseover", (event, d) => {
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .html(`${d.site}<br/>${this.metricNames[xMetric as keyof typeof this.metricNames]}: $${(d[xMetric as keyof CPMData] as number).toFixed(2)}<br/>${this.metricNames[yMetric as keyof typeof this.metricNames]}: $${(d[yMetric as keyof CPMData] as number).toFixed(2)}`);
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove();
      });
  }

  renderLineChart() {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(this.chartContainer.nativeElement).append("svg")
      .attr("class", "chart-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(this.data.map(d => d.site))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => Math.max(d.minCPM || 0, d.maxCPM || 0, d.clearingPrice || 0, d.hCPM || 0)) as number])
      .range([height, 0]);

    // Add axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));

    // Draw lines for each metric
    const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];

    metrics.forEach(metric => {
      const line = d3.line<CPMData>()
        .x(d => (xScale(d.site) as number) + xScale.bandwidth() / 2)
        .y(d => yScale(d[metric as keyof CPMData] as number || 0))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(this.data)
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", this.colors[metric as keyof typeof this.colors]);

      // Add points
      g.selectAll(`.dot-${metric}`)
        .data(this.data.filter(d => d[metric as keyof CPMData] !== null))
        .enter().append("circle")
        .attr("class", `dot dot-${metric}`)
        .attr("r", 4)
        .attr("cx", d => (xScale(d.site) as number) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d[metric as keyof CPMData] as number))
        .style("fill", this.colors[metric as keyof typeof this.colors]);
    });

    // Add legend
    const legend = d3.select(this.legendContainer.nativeElement);
    metrics.forEach(metric => {
      legend.append("span")
        .attr("class", "legend-item")
        .style("background", this.colors[metric as keyof typeof this.colors])
        .text(this.metricNames[metric as keyof typeof this.metricNames]);
    });
  }

  renderPieChart() {
    const metric = this.selectedMetric;
    const validData = this.data.filter(d => d[metric as keyof CPMData] !== null);

    const width = 500;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3.select(this.chartContainer.nativeElement).append("svg")
      .attr("class", "chart-svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<CPMData>()
      .value(d => d[metric as keyof CPMData] as number)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const colorScale = d3.scaleOrdinal()
      .domain(validData.map(d => d.site))
      .range(d3.schemeSet3);

    const arcs = g.selectAll(".pie-slice")
      .data(pie(validData))
      .enter().append("g")
      .attr("class", "pie-slice");

    arcs.append("path")
      .attr("d", arc as any)
      .style("fill", d => colorScale(d.data.site) as string)
      .on("mouseover", (event, d) => {
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .html(`${d.data.site}<br/>${this.metricNames[metric as keyof typeof this.metricNames]}: $${(d.data[metric as keyof CPMData] as number).toFixed(2)}`);
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove();
      });

    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d as any)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(d => d.data.site);
  }

  renderHeatmap() {
    const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];
    const sites = this.data.map(d => d.site);

    const margin = { top: 50, right: 30, bottom: 100, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(this.chartContainer.nativeElement).append("svg")
      .attr("class", "chart-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(metrics)
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(sites)
      .range([0, height])
      .padding(0.05);

    const allValues: number[] = [];
    this.data.forEach(d => {
      metrics.forEach(metric => {
        const value = d[metric as keyof CPMData] as number;
        if (value !== null) allValues.push(value);
      });
    });

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain(d3.extent(allValues) as [number, number]);

    // Create heatmap cells
    this.data.forEach(site => {
      metrics.forEach(metric => {
        const value = site[metric as keyof CPMData] as number;
        if (value !== null) {
          g.append("rect")
            .attr("class", "heatmap-cell")
            .attr("x", xScale(metric) as number)
            .attr("y", yScale(site.site) as number)
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", colorScale(value))
            .on("mouseover", (event) => {
              const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .html(`${site.site}<br/>${this.metricNames[metric as keyof typeof this.metricNames]}: $${value.toFixed(2)}`);
            })
            .on("mouseout", () => {
              d3.selectAll(".tooltip").remove();
            });
        }
      });
    });

    // Add axes
    g.selectAll(".x-label")
      .data(metrics)
      .enter().append("text")
      .attr("class", "axis-label")
      .attr("x", d => (xScale(d) as number) + xScale.bandwidth() / 2)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .text(d => this.metricNames[d as keyof typeof this.metricNames]);

    g.selectAll(".y-label")
      .data(sites)
      .enter().append("text")
      .attr("class", "axis-label")
      .attr("x", -10)
      .attr("y", d => (yScale(d) as number) + yScale.bandwidth() / 2)
      .style("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .text(d => d);
  }

  renderBoxPlot() {
    const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(this.chartContainer.nativeElement).append("svg")
      .attr("class", "chart-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(metrics)
      .range([0, width])
      .padding(0.2);

    let allValues: number[] = [];
    metrics.forEach(metric => {
      this.data.forEach(d => {
        const value = d[metric as keyof CPMData] as number;
        if (value !== null) allValues.push(value);
      });
    });

    const yScale = d3.scaleLinear()
      .domain(d3.extent(allValues) as [number, number])
      .range([height, 0]);

    metrics.forEach(metric => {
      const values = this.data
        .filter(d => d[metric as keyof CPMData] !== null)
        .map(d => d[metric as keyof CPMData] as number)
        .sort(d3.ascending);

      if (values.length > 0) {
        const q1 = d3.quantile(values, 0.25) as number;
        const median = d3.quantile(values, 0.5) as number;
        const q3 = d3.quantile(values, 0.75) as number;
        const min = values[0];
        const max = values[values.length - 1];

        const boxWidth = xScale.bandwidth() * 0.6;
        const x = (xScale(metric) as number) + xScale.bandwidth() / 2;

        // Draw box
        g.append("rect")
          .attr("x", x - boxWidth / 2)
          .attr("y", yScale(q3))
          .attr("width", boxWidth)
          .attr("height", yScale(q1) - yScale(q3))
          .style("fill", this.colors[metric as keyof typeof this.colors])
          .style("opacity", 0.7);

        // Draw median line
        g.append("line")
          .attr("x1", x - boxWidth / 2)
          .attr("x2", x + boxWidth / 2)
          .attr("y1", yScale(median))
          .attr("y2", yScale(median))
          .style("stroke", "black")
          .style("stroke-width", 2);

        // Draw whiskers
        g.append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", yScale(min))
          .attr("y2", yScale(q1))
          .style("stroke", "black");

        g.append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", yScale(q3))
          .attr("y2", yScale(max))
          .style("stroke", "black");
      }
    });

    // Add axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => this.metricNames[d as keyof typeof this.metricNames]));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));
  }

  renderRadarChart() {
    // Normalize data for radar chart
    const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];
    const sites = this.data.slice(0, 5); // Show top 5 sites for clarity

    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2 - 80;

    const svg = d3.select(this.chartContainer.nativeElement).append("svg")
      .attr("class", "chart-svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Get max values for normalization
    const maxValues: { [key: string]: number } = {};
    metrics.forEach(metric => {
      maxValues[metric] = d3.max(this.data, d => d[metric as keyof CPMData] as number || 0) as number;
    });

    const angleSlice = Math.PI * 2 / metrics.length;

    // Draw grid circles
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      g.append("circle")
        .attr("r", radius * level / levels)
        .style("fill", "none")
        .style("stroke", "#ccc")
        .style("stroke-dasharray", "3,3");
    }

    // Draw axis lines and labels
    metrics.forEach((metric, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .style("stroke", "#999");

      g.append("text")
        .attr("x", x * 1.1)
        .attr("y", y * 1.1)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(this.metricNames[metric as keyof typeof this.metricNames]);
    });

    // Draw data for each site
    sites.forEach((site, siteIndex) => {
      const points: [number, number][] = [];
      metrics.forEach((metric, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const value = site[metric as keyof CPMData] as number || 0;
        const normalizedValue = value / maxValues[metric];
        const x = Math.cos(angle) * radius * normalizedValue;
        const y = Math.sin(angle) * radius * normalizedValue;
        points.push([x, y]);
      });

      const lineGenerator = d3.line().curve(d3.curveLinearClosed);
      const color = d3.schemeCategory10[siteIndex % 10];

      g.append("path")
        .datum(points)
        .attr("d", lineGenerator)
        .style("fill", color)
        .style("fill-opacity", 0.2)
        .style("stroke", color)
        .style("stroke-width", 2);

      // Add dots for each data point
      points.forEach((point, i) => {
        g.append("circle")
          .attr("cx", point[0])
          .attr("cy", point[1])
          .attr("r", 4)
          .style("fill", color)
          .style("stroke", "white")
          .style("stroke-width", 2)
          .on("mouseover", (event) => {
            const tooltip = d3.select("body").append("div")
              .attr("class", "tooltip")
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px")
              .html(`${site.site}<br/>${this.metricNames[metrics[i] as keyof typeof this.metricNames]}: ${(site[metrics[i] as keyof CPMData] as number || 0).toFixed(2)}`);
          })
          .on("mouseout", () => {
            d3.selectAll(".tooltip").remove();
          });
      });
    });

    // Add legend
    const legend = d3.select(this.legendContainer.nativeElement);
    sites.forEach((site, i) => {
      const color = d3.schemeCategory10[i % 10];
      legend.append("span")
        .attr("class", "legend-item")
        .style("background", color)
        .text(site.site);
    });
  }

  updateChart() {
    const chart = d3.select(this.chartContainer.nativeElement);
    const legend = d3.select(this.legendContainer.nativeElement);

    chart.selectAll("*").remove();
    legend.selectAll("*").remove();

    let currentData = [...this.data];
    let metricsToShow: string[] = [];

    switch (this.selectedView) {
      case 'all':
        metricsToShow = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];
        this.renderBarChart(currentData, metricsToShow);
        break;
      case 'single':
        metricsToShow = [this.selectedMetric];
        this.renderBarChart(currentData, metricsToShow);
        break;
      case 'comparison':
        if (this.selectedComparison === 'minmax') metricsToShow = ['minCPM', 'maxCPM'];
        else if (this.selectedComparison === 'clearingh') metricsToShow = ['clearingPrice', 'hCPM'];
        else if (this.selectedComparison === 'maxh') metricsToShow = ['maxCPM', 'hCPM'];
        this.renderBarChart(currentData, metricsToShow);
        break;
      case 'sorted':
        metricsToShow = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];
        currentData.sort((a, b) => {
          const aVal = a[this.selectedSort as keyof CPMData] as number || 0;
          const bVal = b[this.selectedSort as keyof CPMData] as number || 0;
          return bVal - aVal;
        });
        this.renderBarChart(currentData, metricsToShow);
        break;
      case 'scatter':
        this.renderScatterPlot();
        break;
      case 'line':
        this.renderLineChart();
        break;
      case 'pie':
        this.renderPieChart();
        break;
      case 'heatmap':
        this.renderHeatmap();
        break;
      case 'box':
        this.renderBoxPlot();
        break;
      case 'radar':
        this.renderRadarChart();
        break;
    }
  }
}