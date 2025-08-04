import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'cpm-dashboard',
    templateUrl: './cpm.component.html',
    styleUrls: ['./cpm.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class CpmDashboardComponent implements OnInit {
    data = [
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
    } as any;

    metricNames = {
        minCPM: 'Min CPM',
        maxCPM: 'Max CPM',
        clearingPrice: 'Clearing Price',
        hCPM: 'Header CPM'
    } as any;

    viewType = 'all';
    selectedMetric = 'minCPM';
    comparisonType = 'minmax';
    sortType = 'minCPM';
    scatterX = 'minCPM';
    scatterY = 'maxCPM';

    gridMode = false;
    gridCharts: string[] = ['scatter', 'line', 'pie', 'heatmap', 'box', 'radar'];
    gridColumns = 2;

    ngOnInit() {
        this.updateChart();
    }

    getMaxValue(data: any[], metrics: string[]): number {
        let max = 0;
        data.forEach((d: any) => {
            metrics.forEach(metric => {
                if (d[metric] !== null && d[metric] > max) {
                    max = d[metric];
                }
            });
        });
        return max;
    }

    renderBarChart(currentData: any[], metricsToShow: string[]) {
        const chart = d3.select("#chart");
        const legend = d3.select("#legend");
        const maxValue = this.getMaxValue(currentData, metricsToShow);
        const scaleWidth = 400;

        // Create legend
        metricsToShow.forEach(metric => {
            legend.append("span")
                .attr("class", "legend-item")
                .style("background", this.colors[metric])
                .text(this.metricNames[metric]);
        });

        // Create chart rows
        currentData.forEach((d: any) => {
            const row = chart.append("div").attr("class", "bar-row");
            row.append("div").attr("class", "label").text(d.site);

            const barContainer = row.append("div").attr("class", "bar-container");

            metricsToShow.forEach(metric => {
                const value = d[metric];
                if (value !== null) {
                    const metricRow = barContainer.append("div");
                    metricRow.append("div")
                        .attr("class", "metric-label")
                        .text(this.metricNames[metric]);

                    const bar = metricRow.append("div")
                        .attr("class", "bar")
                        .style("width", Math.max(2, (value / maxValue) * scaleWidth) + "px")
                        .style("background", `linear-gradient(90deg, ${this.colors[metric]}, ${this.colors[metric]}dd)`)
                        .attr("title", `${this.metricNames[metric]}: $${value.toFixed(2)}`);

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

        const svg = d3.select("#chart").append("svg")
            .attr("class", "chart-svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const filteredData = this.data.filter((d: any) => d[xMetric] !== null && d[yMetric] !== null);

        const xScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, (d: any) => d[xMetric]))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, (d: any) => d[yMetric]))
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
            .text(this.metricNames[xMetric]);

        g.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -35)
            .attr("x", -height / 2)
            .style("text-anchor", "middle")
            .text(this.metricNames[yMetric]);

        // Add dots
        g.selectAll(".dot")
            .data(filteredData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 6)
            .attr("cx", (d: any) => xScale(d[xMetric]))
            .attr("cy", (d: any) => yScale(d[yMetric]))
            .style("fill", this.colors[xMetric])
            .on("mouseover", (event, d: any) => {
                const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .html(`${d.site}<br/>${this.metricNames[xMetric]}: $${d[xMetric].toFixed(2)}<br/>${this.metricNames[yMetric]}: $${d[yMetric].toFixed(2)}`);
            })
            .on("mouseout", () => {
                d3.selectAll(".tooltip").remove();
            });
    }

    renderLineChart() {
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chart").append("svg")
            .attr("class", "chart-svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(this.data.map((d: any) => d.site))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, (d: any) => Math.max(d.minCPM || 0, d.maxCPM || 0, d.clearingPrice || 0, d.hCPM || 0))])
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
            const line = d3.line()
                .x((d: any) => xScale(d.site) + xScale.bandwidth() / 2)
                .y((d: any) => yScale(d[metric] || 0))
                .curve(d3.curveMonotoneX);

            g.append("path")
                .datum(this.data)
                .attr("class", "line")
                .attr("d", line as any)
                .style("stroke", this.colors[metric]);

            // Add points
            g.selectAll(`.dot-${metric}`)
                .data(this.data.filter((d: any) => d[metric] !== null))
                .enter().append("circle")
                .attr("class", `dot dot-${metric}`)
                .attr("r", 4)
                .attr("cx", (d: any) => xScale(d.site) + xScale.bandwidth() / 2)
                .attr("cy", (d: any) => yScale(d[metric]))
                .style("fill", this.colors[metric]).on("mouseover", (event, d: any) => {
                    const tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px")
                        .html(`${d.site}<br/>${this.metricNames[metric]}: $${d[metric].toFixed(2)}`);
                })
                .on("mouseout", () => {
                    d3.selectAll(".tooltip").remove();
                });
        });

        // Add legend
        const legend = d3.select("#legend");
        metrics.forEach(metric => {
            legend.append("span")
                .attr("class", "legend-item")
                .style("background", this.colors[metric])
                .text(this.metricNames[metric]);
        });
    }

    renderPieChart() {
        const metric = this.selectedMetric;
        const validData = this.data.filter((d: any) => d[metric] !== null);

        const width = 600;
        const height = 400;
        const radius = Math.min(width, height) / 2 - 40;

        const svg = d3.select("#chart").append("svg")
            .attr("class", "chart-svg")
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie()
            .value((d: any) => d[metric])
            .sort(null);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const colorScale = d3.scaleOrdinal()
            .domain(validData.map((d: any) => d.site))
            .range(d3.schemeSet3);

        const arcs = g.selectAll(".pie-slice")
            .data(pie(validData as any))
            .enter().append("g")
            .attr("class", "pie-slice");

        arcs.append("path")
            .attr("d", arc as any)
            .style("fill", (d: any) => colorScale(d.data.site) as any)
            .on("mouseover", (event, d: any) => {
                const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .html(`${d.data.site}<br/>${this.metricNames[metric]}: $${d.data[metric].toFixed(2)}`);
            })
            .on("mouseout", () => {
                d3.selectAll(".tooltip").remove();
            });

        // Add legend
        const legendItemSize = 18;
        const legendSpacing = 4;
        const legendPadding = 10;

        const legendGroup = svg.append("g")
            .attr("class", "pie-legend")
            .attr("transform", `translate(${width - 150}, ${legendPadding})`);

        validData.forEach((d: any, i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(20, ${i * (legendItemSize + legendSpacing) + 20})`);

            legendItem.append("rect")
                .attr("width", legendItemSize)
                .attr("height", legendItemSize)
                .style("fill", colorScale(d.site) as any);
            legendItem.append("text")
                .attr("x", legendItemSize)
                .attr("y", legendItemSize - 5)
                .style("font-size", "12px")
                .text(`${d.site} ($${d[metric].toFixed(2)})`);
        });

        arcs.append("text")
            .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text((d: any) => d.data.site);


    }

    renderHeatmap() {
        const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];
        const sites = this.data.map((d: any) => d.site);

        const margin = { top: 50, right: 30, bottom: 100, left: 100 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chart").append("svg")
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
        this.data.forEach((d: any) => {
            metrics.forEach(metric => {
                if (d[metric] !== null) allValues.push(d[metric]);
            });
        });

        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain(d3.extent(allValues));

        // Create heatmap cells
        this.data.forEach((site: any) => {
            metrics.forEach((metric: any) => {
                if (site[metric] !== null) {
                    g.append("rect")
                        .attr("class", "heatmap-cell")
                        .attr("x", xScale(metric))
                        .attr("y", yScale(site.site))
                        .attr("width", xScale.bandwidth())
                        .attr("height", yScale.bandwidth())
                        .style("fill", colorScale(site[metric]))
                        .on("mouseover", (event) => {
                            const tooltip = d3.select("body").append("div")
                                .attr("class", "tooltip")
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 10) + "px")
                                .html(`${site.site}<br/>${this.metricNames[metric]}: $${site[metric].toFixed(2)}`);
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
            .attr("x", (d: any) => xScale(d) + xScale.bandwidth() / 2)
            .attr("y", -10)
            .style("text-anchor", "middle")
            .text((d: any) => this.metricNames[d]);

        g.selectAll(".y-label")
            .data(sites)
            .enter().append("text")
            .attr("class", "axis-label")
            .attr("x", -10)
            .attr("y", (d: any) => yScale(d) + yScale.bandwidth() / 2)
            .style("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text((d: any) => d);
    }

    renderBoxPlot() {
        const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];

        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chart").append("svg")
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
            this.data.forEach((d: any) => {
                if (d[metric] !== null) allValues.push(d[metric]);
            });
        });

        const yScale = d3.scaleLinear()
            .domain(d3.extent(allValues))
            .range([height, 0]);

        metrics.forEach(metric => {
            const values = this.data.filter((d: any) => d[metric] !== null).map((d: any) => d[metric]).sort(d3.ascending);

            if (values.length > 0) {
                const q1 = d3.quantile(values, 0.25);
                const median = d3.quantile(values, 0.5);
                const q3 = d3.quantile(values, 0.75);
                const min = values[0];
                const max = values[values.length - 1];

                const boxWidth = xScale.bandwidth() * 0.6;
                const x = xScale(metric) + xScale.bandwidth() / 2;

                // Draw box
                g.append("rect")
                    .attr("x", x - boxWidth / 2)
                    .attr("y", yScale(q3))
                    .attr("width", boxWidth)
                    .attr("height", yScale(q1) - yScale(q3))
                    .style("fill", this.colors[metric])
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
            .call(d3.axisBottom(xScale).tickFormat((d: any) => this.metricNames[d]));

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

        const svg = d3.select("#chart").append("svg")
            .attr("class", "chart-svg")
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Get max values for normalization
        const maxValues: { [key: string]: number } = {};
        metrics.forEach(metric => {
            maxValues[metric] = d3.max(this.data, (d: any) => d[metric] || 0);
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
                .text(this.metricNames[metric]);
        });

        // Draw data for each site
        sites.forEach((site: any, siteIndex: any) => {
            const points: [number, number][] = [];
            metrics.forEach((metric, i) => {
                const angle = i * angleSlice - Math.PI / 2;
                const value = site[metric] || 0;
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
                            .html(`${site.site}<br/>${this.metricNames[metrics[i]]}: $${(site[metrics[i]] || 0).toFixed(2)}`);
                    })
                    .on("mouseout", () => {
                        d3.selectAll(".tooltip").remove();
                    });
            });
        });

        // Add legend
        const legend = d3.select("#legend");
        sites.forEach((site, i) => {
            const color = d3.schemeCategory10[i % 10];
            legend.append("span")
                .attr("class", "legend-item")
                .style("background", color)
                .text(site.site);
        });
    }

    updateChart() {
        const chart = d3.select("#chart");
        const legend = d3.select("#legend");

        chart.selectAll("*").remove();
        legend.selectAll("*").remove();

        let currentData = [...this.data];
        let metricsToShow: string[] = [];

        switch (this.viewType) {
            case 'grid':
                this.gridMode = true;
                this.renderGrid();
                break;
            case 'all':
                metricsToShow = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];
                this.renderBarChart(currentData, metricsToShow);
                break;
            case 'single':
                metricsToShow = [this.selectedMetric];
                this.renderBarChart(currentData, metricsToShow);
                break;
            case 'comparison':
                if (this.comparisonType === 'minmax') metricsToShow = ['minCPM', 'maxCPM'];
                else if (this.comparisonType === 'clearingh') metricsToShow = ['clearingPrice', 'hCPM'];
                else if (this.comparisonType === 'maxh') metricsToShow = ['maxCPM', 'hCPM'];
                this.renderBarChart(currentData, metricsToShow);
                break;
            case 'sorted':
                metricsToShow = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];
                currentData.sort((a: any, b: any) => {
                    const aVal = a[this.sortType] || 0;
                    const bVal = b[this.sortType] || 0;
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
            default:
                this.gridMode = false
                this.renderBarChart(currentData, metricsToShow)
        }
    }

    renderGrid() {
        const chartContainer = d3.select("#chart") as any;
        chartContainer.selectAll("*").remove();

        const containerWidth = chartContainer.node()?.getBoundingClientRect().width || 800;
        const chartWidth = (containerWidth / this.gridColumns) - 40;
        const chartHeight = 350;

        // Create grid container with enhanced spacing
        const gridContainer = chartContainer.append("div")
            .attr("class", "grid-container")
            .style("display", "grid")
            .style("grid-template-columns", `repeat(${this.gridColumns}, 1fr)`)
            .style("gap", "25px")
            .style("gap", "55px")
            .style("padding", "15px");

        // Render each selected chart in the grid
        this.gridCharts.forEach((chartType, index) => {
            const chartDiv = gridContainer.append("div")
                .attr("class", "grid-chart")
                .style("width", "100%")
                .style("height", `${chartHeight}px`)
                .style("background", "white")
                .style("border-radius", "10px")
                .style("padding", "20px")
                .style("margin", "5px")
                .style("box-shadow", "0 4px 8px rgba(0,0,0,0.1)");

            // Add chart title with better spacing
            chartDiv.append("h3")
                .style("margin", "0 0 15px 0")
                .style("padding-bottom", "10px")
                .style("border-bottom", "1px solid #eee")
                .style("font-size", "16px")
                .style("color", "#2c3e50")
                .text(this.getChartTitle(chartType));

            // Create SVG container with proper margins
            const svg = chartDiv.append("svg")
                .attr("width", "100%")
                .attr("height", chartHeight - 50) // Adjusted for title and padding
                .style("margin-top", "10px");

            // Render the appropriate chart
            switch (chartType) {
                case 'scatter':
                    this.renderScatterPlotInGrid(svg, chartWidth, chartHeight - 40);
                    break;
                case 'line':
                    this.renderLineChartInGrid(svg, chartWidth, chartHeight - 40);
                    break;
                case 'pie':
                    this.renderPieChartInGrid(svg, chartWidth, chartHeight - 40);
                    break;
                case 'heatmap':
                    this.renderHeatmapInGrid(svg, chartWidth, chartHeight - 40);
                    break;
                case 'box':
                    this.renderBoxPlotInGrid(svg, chartWidth, chartHeight - 40);
                    break;
                case 'radar':
                    this.renderRadarChartInGrid(svg, chartWidth, chartHeight - 40);
                    // this.renderRadarChart()
                    break;
            }
        });
    }

    getChartTitle(chartType: string): string {
        const titles: { [key: string]: string } = {
            'scatter': 'Scatter Plot',
            'line': 'Line Chart',
            'pie': 'Pie Chart',
            'heatmap': 'Heatmap',
            'box': 'Box Plot',
            'radar': 'Radar Chart'
        };
        return titles[chartType] || chartType;
    }

    // Grid versions of chart rendering functions
    renderScatterPlotInGrid(svg: any, width: number, height: number) {
        const xMetric = this.scatterX;
        const yMetric = this.scatterY;

        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const filteredData = this.data.filter((d: any) => d[xMetric] !== null && d[yMetric] !== null);

        const xScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, (d: any) => d[xMetric]))
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, (d: any) => d[yMetric]))
            .range([innerHeight, 0]);

        // Add axes
        g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).ticks(5));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale).ticks(5));

        // Add dots
        g.selectAll(".dot")
            .data(filteredData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 4)
            .attr("cx", (d: any) => xScale(d[xMetric]))
            .attr("cy", (d: any) => yScale(d[yMetric]))
            .style("fill", this.colors[xMetric]).on("mouseover", (event: any, d: any) => {
                const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .html(`${d.site}<br/>${this.metricNames[xMetric]}: $${d[xMetric].toFixed(2)}<br/>${this.metricNames[yMetric]}: $${d[yMetric].toFixed(2)}`);
            })
            .on("mouseout", () => {
                d3.selectAll(".tooltip").remove();
            });
    }

    renderLineChartInGrid(svg: any, width: number, height: number) {
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(this.data.map(d => d.site))
            .range([0, innerWidth])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => Math.max(d.minCPM || 0, d.maxCPM || 0, d.clearingPrice || 0, d.hCPM || 0))])
            .range([innerHeight, 0]);

        // Add axes
        g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale).ticks(5));

        // Draw lines for each metric
        const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];

        metrics.forEach(metric => {
            const line = d3.line()
                .x((d: any) => xScale(d.site) + xScale.bandwidth() / 2)
                .y((d: any) => yScale(d[metric] || 0))
                .curve(d3.curveMonotoneX);

            g.append("path")
                .datum(this.data)
                .attr("class", "line")
                .attr("d", line as any)
                .style("stroke", this.colors[metric]);

            // Add points
            g.selectAll(`.dot-${metric}`)
                .data(this.data.filter((d: any) => d[metric] !== null))
                .enter().append("circle")
                .attr("class", `dot dot-${metric}`)
                .attr("r", 4)
                .attr("cx", (d: any) => xScale(d.site) + xScale.bandwidth() / 2)
                .attr("cy", (d: any) => yScale(d[metric]))
                .style("fill", this.colors[metric]).on("mouseover", (event: any, d: any) => {
                    const tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px")
                        .html(`${d.site}<br/>${this.metricNames[metric]}: $${d[metric].toFixed(2)}`);
                })
                .on("mouseout", () => {
                    d3.selectAll(".tooltip").remove();
                });
        });
    }

    renderPieChartInGrid(svg: any, width: number, height: number) {
        const metric = this.selectedMetric;
        const validData = this.data.filter((d: any) => d[metric] !== null);

        const radius = Math.min(width, height) / 2 - 20;

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie()
            .value((d: any) => d[metric])
            .sort(null);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const colorScale = d3.scaleOrdinal()
            .domain(validData.map(d => d.site))
            .range(d3.schemeSet3);

        const arcs = g.selectAll(".pie-slice")
            .data(pie(validData as any))
            .enter().append("g")
            .attr("class", "pie-slice");

        arcs.append("path")
            .attr("d", arc)
            .style("fill", (d: any) => colorScale(d.data.site)).on("mouseover", (event: any, d: any) => {
                const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .html(`${d.data.site}<br/>${this.metricNames[this.selectedMetric]}: $${d.data[this.selectedMetric].toFixed(2)}`);
            })
            .on("mouseout", () => {
                d3.selectAll(".tooltip").remove();
            });

        // Add compact legend for grid view
        const legendItemSize = 12;
        const legendSpacing = 2;
        const legendWidth = 120;

        const legendGroup = svg.append("g")
            .attr("class", "pie-legend")
            .attr("transform", `translate(${width - legendWidth + 30}, 20)`);

        validData.forEach((d, i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(0, ${i * (legendItemSize + legendSpacing)})`);

            legendItem.append("rect")
                .attr("width", legendItemSize)
                .attr("height", legendItemSize)
                .style("fill", colorScale(d.site));

            legendItem.append("text")
                .attr("x", legendItemSize + 3)
                .attr("y", legendItemSize - 2)
                .style("font-size", "10px")
                .text(d.site.substring(0, 10) + (d.site.length > 10 ? "..." : ""));
        });
    }

    renderHeatmapInGrid(svg: any, width: number, height: number) {
        const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];
        const sites = this.data.map(d => d.site);

        const margin = { top: 30, right: 20, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(metrics)
            .range([0, innerWidth])
            .padding(0.05);

        const yScale = d3.scaleBand()
            .domain(sites)
            .range([0, innerHeight])
            .padding(0.05);

        const allValues: number[] = [];
        this.data.forEach((d: any) => {
            metrics.forEach((metric: any) => {
                if (d[metric] !== null) allValues.push(d[metric]);
            });
        });

        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain(d3.extent(allValues));

        // Create heatmap cells
        this.data.forEach((site: any) => {
            metrics.forEach((metric: any) => {
                if (site[metric] !== null) {
                    g.append("rect")
                        .attr("class", "heatmap-cell")
                        .attr("x", xScale(metric))
                        .attr("y", yScale(site.site))
                        .attr("width", xScale.bandwidth())
                        .attr("height", yScale.bandwidth())
                        .style("fill", colorScale(site[metric])).on("mouseover", (event: any) => {
                            const tooltip = d3.select("body").append("div")
                                .attr("class", "tooltip")
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 10) + "px")
                                .html(`${site.site}<br/>${this.metricNames[metric]}: $${site[metric].toFixed(2)}`);
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
            .attr("x", (d: any) => xScale(d) + xScale.bandwidth() / 2)
            .attr("y", -10)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .text((d: any) => this.metricNames[d]);

        g.selectAll(".y-label")
            .data(sites)
            .enter().append("text")
            .attr("class", "axis-label")
            .attr("x", -10)
            .attr("y", (d: any) => yScale(d) + yScale.bandwidth() / 2)
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .attr("dominant-baseline", "middle")
            .text((d: any) => d);
    }

    renderBoxPlotInGrid(svg: any, width: number, height: number) {
        const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];

        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(metrics)
            .range([0, innerWidth])
            .padding(0.2);

        let allValues: number[] = [];
        metrics.forEach(metric => {
            this.data.forEach((d: any) => {
                if (d[metric] !== null) allValues.push(d[metric]);
            });
        });

        const yScale = d3.scaleLinear()
            .domain(d3.extent(allValues))
            .range([innerHeight, 0]);

        metrics.forEach(metric => {
            const values = this.data.filter((d: any) => d[metric] !== null).map((d: any) => d[metric]).sort(d3.ascending);

            if (values.length > 0) {
                const q1 = d3.quantile(values, 0.25);
                const median = d3.quantile(values, 0.5);
                const q3 = d3.quantile(values, 0.75);
                const min = values[0];
                const max = values[values.length - 1];

                const boxWidth = xScale.bandwidth() * 0.6;
                const x = xScale(metric) + xScale.bandwidth() / 2;

                // Draw box
                g.append("rect")
                    .attr("x", x - boxWidth / 2)
                    .attr("y", yScale(q3))
                    .attr("width", boxWidth)
                    .attr("height", yScale(q1) - yScale(q3))
                    .style("fill", this.colors[metric])
                    .style("opacity", 0.7).on("mouseover", (event: any) => {
                        const tooltip = d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px")
                            .html(`${metric}<br/>${this.metricNames[metric]}: $${median}`);
                    })
                    .on("mouseout", () => {
                        d3.selectAll(".tooltip").remove();
                    });

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
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).tickFormat(d => this.metricNames[d]));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale).ticks(5));
    }

    renderRadarChartInGrid(svg: any, width: number, height: number) {
        const metrics = ['minCPM', 'maxCPM', 'clearingPrice', 'hCPM'];
        const sites = this.data.slice(0, 5); // Show top 3 sites in grid for clarity

        const radius = Math.min(width, height) / 2 - 20;

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Get max values for normalization
        const maxValues: { [key: string]: number } = {};
        metrics.forEach(metric => {
            maxValues[metric] = d3.max(this.data, (d: any) => d[metric] || 0);
        });

        const angleSlice = Math.PI * 2 / metrics.length;

        // Draw grid circles
        const levels = 3;
        for (let level = 1; level <= levels; level++) {
            g.append("circle")
                .attr("r", radius * level / levels)
                .style("fill", "none")
                .style("stroke", "#ccc")
                .style("stroke-dasharray", "3,3");
        }

        // Draw data for each site
        sites.forEach((site: any, siteIndex) => {
            const points: [number, number][] = [];
            metrics.forEach((metric, i) => {
                const angle = i * angleSlice - Math.PI / 2;
                const value = site[metric] || 0;
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
                .style("stroke-width", 2).on("mouseover", (event: any, i: any) => {
                    const tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px")
                        .html(`${site.site}<br/>${this.metricNames[metrics[i]]}: $${(site[metrics[i]] || 0).toFixed(2)}`);
                })
                .on("mouseout", () => {
                    d3.selectAll(".tooltip").remove();
                });

            // Add dots for each data point
            points.forEach((point, i) => {
                g.append("circle")
                    .attr("cx", point[0])
                    .attr("cy", point[1])
                    .attr("r", 4)
                    .style("fill", color)
                    .style("stroke", "white")
                    .style("stroke-width", 2)
                    .on("mouseover", (event: any) => {
                        const tooltip = d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px")
                            .html(`${site.site}<br/>${this.metricNames[metrics[i]]}: $${(site[metrics[i]] || 0).toFixed(2)}`);
                    })
                    .on("mouseout", () => {
                        d3.selectAll(".tooltip").remove();
                    });
            });
        });
    }

    toggleGridMode() {
        this.gridMode = !this.gridMode;
    }
    toggleChartSelection(chartType: string) {
        const index = this.gridCharts.indexOf(chartType);
        if (index === -1) {
            // Add to selection
            this.gridCharts.push(chartType);
        } else {
            // Remove from selection
            this.gridCharts.splice(index, 1);
        }
        this.updateChart();
    }
}