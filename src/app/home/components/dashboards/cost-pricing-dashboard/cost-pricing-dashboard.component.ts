import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'cost-pricing-dashboard',
  templateUrl: './cost-pricing-dashboard.component.html',
  styleUrls: ['./cost-pricing-dashboard.component.less']
})
export class CostPricingDashboardComponent implements OnInit {
  // Data
  advertiserData = [
    { rank: 1, name: "google.com", avgCPM: 17.71, medianCPM: 25.85 },
    { rank: 2, name: "nine-elements.com", avgCPM: 12.45, medianCPM: 12.13 },
    { rank: 3, name: "intuit.com", avgCPM: 10.64, medianCPM: 11.96 },
    { rank: 4, name: "logistic.com", avgCPM: 9.21, medianCPM: 9.30 },
    { rank: 5, name: "cigna.com", avgCPM: 9.20, medianCPM: 9.59 },
    { rank: 6, name: "postman.com", avgCPM: 8.64, medianCPM: 9.41 },
    { rank: 7, name: "legalland.com", avgCPM: 8.59, medianCPM: 9.18 },
    { rank: 8, name: "simpli.fi", avgCPM: 8.39, medianCPM: 8.92 },
    { rank: 9, name: "alight.com", avgCPM: 7.15, medianCPM: 8.65 },
    { rank: 10, name: "smartruff.com", avgCPM: 6.02, medianCPM: 8.52 },
    { rank: 11, name: "zoom.com", avgCPM: 7.43, medianCPM: 8.40 },
    { rank: 12, name: "nationalgeographic.com", avgCPM: 8.31, medianCPM: 8.18 },
    { rank: 13, name: "burberry.com", avgCPM: 16.62, medianCPM: 8.08 },
    { rank: 14, name: "linkedin.com", avgCPM: 7.09, medianCPM: 8.04 }
  ];

  publisherData = [
    { rank: 1, name: "www.cnn.com", avgCPM: 1.26, medianCPM: 0.54 },
    { rank: 2, name: "www.theguardian.com", avgCPM: 1.75, medianCPM: 1.58 },
    { rank: 3, name: "www.reuters.com", avgCPM: 0.80, medianCPM: 0.41 },
    { rank: 4, name: "www.bbc.com", avgCPM: 1.58, medianCPM: 1.43 },
    { rank: 5, name: "www.businessinsider.com", avgCPM: 1.75, medianCPM: 1.08 },
    { rank: 6, name: "www.cnet.com", avgCPM: 2.12, medianCPM: 1.42 },
    { rank: 7, name: "www.dailymail.co.uk", avgCPM: 0.55, medianCPM: 0.16 },
    { rank: 8, name: "dragonball.fandom.com", avgCPM: 0.94, medianCPM: 0.72 },
    { rank: 9, name: "hearthstone.fandom.com", avgCPM: 1.10, medianCPM: 0.62 },
    { rank: 10, name: "internetsubscription.lan", avgCPM: 1.09, medianCPM: 0.98 },
    { rank: 11, name: "killall.fandom.com", avgCPM: 0.32, medianCPM: 0.12 },
    { rank: 12, name: "ultimatepopculture.fandom", avgCPM: 0.37, medianCPM: 0.22 },
    { rank: 13, name: "alocrevi.go.com", avgCPM: 2.46, medianCPM: 2.37 },
    { rank: 14, name: "techwareuntoday.com", avgCPM: 0.70, medianCPM: 0.48 }
  ];

  // Color schemes
  colors = {
    advertiser: '#376e3d',
    publisher: '#6e2c1a',
    gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
  };

  // Tooltip element
  tooltip: any;

  ngOnInit() {
    // Initialize tooltip
    this.tooltip = d3.select("#tooltip");

    // Create all visualizations
    this.createComparisonChart();
    this.createScatterPlot();
    this.createDonutCharts();
    this.createLineChart();
    this.createAreaChart();
    this.createHeatmap();
  }

  // Tooltip functions
  showTooltip(event: any, content: string) {
    this.tooltip.transition().duration(200).style("opacity", 1);
    this.tooltip.html(content)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
  }

  hideTooltip() {
    this.tooltip.transition().duration(200).style("opacity", 0);
  }

  // 1. Comparative Bar Chart
  createComparisonChart() {
    const margin = { top: 20, right: 30, bottom: 150, left: 80 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.bottom - margin.top;

    const svg = d3.select("#comparison-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Combine data
    const combinedData: any[] = [];
    this.advertiserData.forEach(d => combinedData.push({ ...d, type: 'Advertiser' }));
    this.publisherData.forEach(d => combinedData.push({ ...d, type: 'Publisher' }));

    const x0 = d3.scaleBand()
      .domain(d3.range(1, 15) as any)
      .range([0, width])
      .padding(0.1);

    const x1 = d3.scaleBand()
      .domain(['Advertiser', 'Publisher'])
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(combinedData, (d: any) => d.avgCPM)])
      .range([height, 0]);

    // Add grid
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("" as any)
      );

    // Add bars
    const groups = g.selectAll(".group")
      .data(d3.range(1, 15))
      .enter().append("g")
      .attr("class", "group")
      .attr("transform", (d: any) => `translate(${x0(d)},0)`);

    groups.selectAll(".bar")
      .data((d: any) => {
        const adv = this.advertiserData.find(item => item.rank === d);
        const pub = this.publisherData.find(item => item.rank === d);
        return [
          { rank: d, type: 'Advertiser', avgCPM: adv.avgCPM, name: adv.name },
          { rank: d, type: 'Publisher', avgCPM: pub.avgCPM, name: pub.name }
        ];
      })
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (d: any) => x1(d.type))
      .attr("y", (d: any) => y(d.avgCPM))
      .attr("width", x1.bandwidth())
      .attr("height", (d: any) => height - y(d.avgCPM))
      .attr("fill", (d: any) => d.type === 'Advertiser' ? this.colors.advertiser : this.colors.publisher)
      .on("mouseover", (event: any, d: any) => {
        this.showTooltip(event, `<strong>${d.name}</strong><br/>Rank: ${d.rank}<br/>Avg CPM: $${d.avgCPM}`);
      })
      .on("mouseout", () => this.hideTooltip());

    // Add axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Ranking");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Average CPM ($)");

    // Legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${margin.left + width - 100}, ${margin.top - 20})`);

    legend.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", this.colors.advertiser);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text("Advertisers");

    legend.append("rect")
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", this.colors.publisher);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 37)
      .text("Publishers");
  }

  // 2. Scatter Plot
  createScatterPlot() {
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const container = d3.select("#scatter-plot")
      .style("display", "flex")
      .style("justify-content", "space-around")
      .style("flex-wrap", "wrap");

    // Advertiser scatter plot
    const advSvg = container.append("div")
      .style("margin", "20px")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const advG = advSvg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    advSvg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Advertisers");

    const advXScale = d3.scaleLinear()
      .domain(d3.extent(this.advertiserData, (d: any) => d.avgCPM))
      .range([0, width]);

    const advYScale = d3.scaleLinear()
      .domain(d3.extent(this.advertiserData, (d: any) => d.medianCPM))
      .range([height, 0]);

    const advColor = d3.scaleSequential(d3.interpolateRainbow)
      .domain([0, this.advertiserData.length - 1]);

    advG.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(advXScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Average CPM ($)");

    advG.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(advYScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Median CPM ($)");

    advG.selectAll(".scatter-dot")
      .data(this.advertiserData)
      .enter().append("circle")
      .attr("class", "scatter-dot")
      .attr("cx", (d: any) => advXScale(d.avgCPM))
      .attr("cy", (d: any) => advYScale(d.medianCPM))
      .attr("r", 6)
      .attr("fill", (_d: any, i: number) => advColor(i) as any)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", (event: any, d: any) => {
        this.showTooltip(event, `<strong>${d.name}</strong><br/>Avg: $${d.avgCPM}<br/>Median: $${d.medianCPM}`);
      })
      .on("mouseout", () => this.hideTooltip());

    // Publisher scatter plot
    const pubSvg = container.append("div")
      .style("margin", "20px")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const pubG = pubSvg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    pubSvg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Publishers");

    const pubXScale = d3.scaleLinear()
      .domain(d3.extent(this.publisherData, (d: any) => d.avgCPM))
      .range([0, width]);

    const pubYScale = d3.scaleLinear()
      .domain(d3.extent(this.publisherData, (d: any) => d.medianCPM))
      .range([height, 0]);

    const pubColor = d3.scaleSequential(d3.interpolateRainbow)
      .domain([0, this.publisherData.length - 1]);

    pubG.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(pubXScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Average CPM ($)");

    pubG.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(pubYScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Median CPM ($)");

    pubG.selectAll(".scatter-dot")
      .data(this.publisherData)
      .enter().append("circle")
      .attr("class", "scatter-dot")
      .attr("cx", (d: any) => pubXScale(d.avgCPM))
      .attr("cy", (d: any) => pubYScale(d.medianCPM))
      .attr("r", 6)
      .attr("fill", (_d: any, i: number) => pubColor(i) as any)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", (event: any, d: any) => {
        this.showTooltip(event, `<strong>${d.name}</strong><br/>Avg: $${d.avgCPM}<br/>Median: $${d.medianCPM}`);
      })
      .on("mouseout", () => this.hideTooltip());
  }
  createDonutCharts() {
    const radius = 120;
    const innerRadius = 60;
    const hoverRadius = radius * 1.05;
    const hoverInnerRadius = innerRadius * 0.95;
    const animationDuration = 300;

    // Advertiser donut
    this.createDonut(this.advertiserData, "#advertiser-donut", "Top Advertisers", radius, innerRadius, hoverRadius, hoverInnerRadius, animationDuration);

    // Publisher donut
    this.createDonut(this.publisherData, "#publisher-donut", "Top Publishers", radius, innerRadius, hoverRadius, hoverInnerRadius, animationDuration);
  }

  private createDonut(data: any[], containerId: string, title: string,
    radius: number, innerRadius: number, hoverRadius: number,
    hoverInnerRadius: number, animationDuration: number) {
    // Clear previous chart
    d3.select(containerId).html("");

    const svg = d3.select(containerId)
      .append("svg")
      .attr("width", radius * 2 + 400)
      .attr("height", radius * 2 + 100)
      .attr("viewBox", `200 0 ${radius * 2 + 20} ${radius * 2 + 100}`);

    const g = svg.append("g")
      .attr("transform", `translate(${radius + 50},${radius + 50})`);

    const pie = d3.pie()
      .value((d: any) => d.avgCPM)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const hoverArc = d3.arc()
      .innerRadius(hoverInnerRadius)
      .outerRadius(hoverRadius);

    const color = d3.scaleSequential((t) =>
      d3.interpolateViridis(t * 1 + 0.1)).domain([0, this.colors.gradient.length]);


    // d3.scaleOrdinal()
    // .range(this.colors.gradient);

    // Store the pie data
    const pieData = pie(data.slice(0, 6));

    // Create arcs
    const arcs = g.selectAll(".donut-segment")
      .data(pieData)
      .enter().append("g")
      .attr("class", "donut-segment");

    // Add the path elements with initial state
    const paths = arcs.append("path")
      .attr("d", (d: any) => arc(d) as any)
      .attr("fill", (d: any, i: number) => color(i as any) as any)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8)
      .on("mouseover", (event: any, d: any) => {
        // Animate the hovered segment
        d3.select(event.currentTarget)
          .transition()
          .duration(animationDuration)
          .attr("d", hoverArc(d))
          .attr("opacity", 1);

        // Show tooltip
        const percentage = (d.data.avgCPM / d3.sum(data, (d: any) => d.avgCPM) * 100).toFixed(1);
        this.showTooltip(event, `<strong>${d.data.name}</strong><br/>CPM: $${d.data.avgCPM}<br/>Percentage: ${percentage}%`);
      })
      .on("mouseout", (event: any) => {
        // Animate back to original state
        d3.select(event.currentTarget)
          .transition()
          .duration(animationDuration)
          .attr("d", (d: any) => arc(d) as any)
          .attr("opacity", 0.8);

        this.hideTooltip();
      });

    // Add initial animation
    paths.each(function (d: any, i: number) {
      const path = d3.select(this);
      path.attr("d", arc({
        startAngle: d.startAngle,
        endAngle: d.startAngle, // Start with 0 length
        innerRadius: innerRadius,
        outerRadius: radius
      }))
        .transition()
        .duration(animationDuration)
        .delay(i * 50) // Stagger the animations
        .attr("d", arc(d));
    });

    // Add title
    svg.append("text")
      .attr("x", radius + 50)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .text(title);

    // Center text - Total CPM
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(`${d3.sum(data, (d: any) => d.avgCPM).toFixed(0)}`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text("Total CPM");

    // Add legend
    this.addLegend(svg, data.slice(0, 6), color, radius);
  }

  // createDonutCharts() {
  //   const radius = 120;
  //   const innerRadius = 60;

  //   // Advertiser donut
  //   this.createDonut(this.advertiserData, "#advertiser-donut", "Top Advertisers");

  //   // Publisher donut
  //   this.createDonut(this.publisherData, "#publisher-donut", "Top Publishers");
  // }

  // private createDonut(data: any[], containerId: string, title: string) {
  //   const radius = 120;
  //   const innerRadius = 60;

  //   const svg = d3.select(containerId)
  //     .append("svg")
  //     .attr("width", radius * 2 + 100)
  //     .attr("height", radius * 2 + 100);

  //   const g = svg.append("g")
  //     .attr("transform", `translate(${radius + 50},${radius + 50})`);

  //   const pie = d3.pie()
  //     .value((d: any) => d.avgCPM)
  //     .sort(null);

  //   const arc = d3.arc()
  //     .innerRadius(innerRadius)
  //     .outerRadius(radius);

  //   // Create hover arc with larger outer radius
  //   const hoverArc = d3.arc()
  //     .innerRadius(innerRadius)
  //     .outerRadius(radius + 10);

  //   const color = d3.scaleOrdinal()
  //     .range(this.colors.gradient);

  //   const arcs = g.selectAll(".donut-segment")
  //     .data(pie(data.slice(0, 6))) // Top 6 for visibility
  //     .enter().append("g")
  //     .attr("class", "donut-segment");

  //   const paths = arcs.append("path")
  //     .attr("d", (d: any) => arc(d))
  //     .attr("fill", (d: any, i: number) => color(i as any) as any)
  //     .style("stroke", "#fff")
  //     .style("stroke-width", "2px")
  //     .style("cursor", "pointer")
  //     .style("transition", "all 0.3s ease")
  //     .on("mouseover", function (event: any, d: any) {
  //       // Expand the hovered segment
  //       d3.select(this)
  //         .transition()
  //         .duration(200)
  //         .attr("d", hoverArc(d))
  //         .style("filter", "brightness(1.1)")
  //         .style("stroke-width", "3px");

  //       // Dim other segments
  //       arcs.selectAll("path").filter(function () {
  //         return this !== event.target;
  //       })
  //         .transition()
  //         .duration(200)
  //         .style("opacity", 0.6);

  //       // Update center text with hovered segment data
  //       centerText.transition()
  //         .duration(200)
  //         .style("opacity", 0)
  //         .on("end", function () {
  //           d3.select(this)
  //             .text(`${d.data.avgCPM.toFixed(1)}`)
  //             .transition()
  //             .duration(200)
  //             .style("opacity", 1);
  //         });

  //       centerSubtext.transition()
  //         .duration(200)
  //         .style("opacity", 0)
  //         .on("end", function () {
  //           d3.select(this)
  //             .text(d.data.name)
  //             .transition()
  //             .duration(200)
  //             .style("opacity", 1);
  //         });
  //     })
  //     .on("mousemove", (event: any, d: any) => {
  //       const percentage = (d.data.avgCPM / d3.sum(data, (d: any) => d.avgCPM) * 100).toFixed(1);
  //       this.showTooltip(event, `
  //         <strong>${d.data.name}</strong><br/>
  //         CPM: $${d.data.avgCPM.toFixed(2)}<br/>
  //         Percentage: ${percentage}%
  //       `);
  //     })
  //     .on("mouseout", (event: any, d: any) => {
  //       // Reset the hovered segment
  //       d3.select(this as any)
  //         .transition()
  //         .duration(200)
  //         .attr("d", arc(d))
  //         .style("filter", "none")
  //         .style("stroke-width", "2px");

  //       // Restore opacity to all segments
  //       arcs.selectAll("path")
  //         .transition()
  //         .duration(200)
  //         .style("opacity", 1);

  //       // Restore center text
  //       centerText.transition()
  //         .duration(200)
  //         .style("opacity", 0)
  //         .on("end", () => {
  //           d3.select(this as any)
  //             .text(`${d3.sum(data, (d: any) => d.avgCPM).toFixed(0)}`)
  //             .transition()
  //             .duration(200)
  //             .style("opacity", 1);
  //         });

  //       centerSubtext.transition()
  //         .duration(200)
  //         .style("opacity", 0)
  //         .on("end", () => {
  //           d3.select(this as any)
  //             .text("Total CPM")
  //             .transition()
  //             .duration(200)
  //             .style("opacity", 1);
  //         });

  //       this.hideTooltip();
  //     });

  //   // Add title
  //   svg.append("text")
  //     .attr("x", radius + 50)
  //     .attr("y", 30)
  //     .attr("text-anchor", "middle")
  //     .style("font-weight", "bold")
  //     .style("font-size", "16px")
  //     .style("fill", "#333")
  //     .text(title);

  //   // Center text (main value)
  //   const centerText = g.append("text")
  //     .attr("text-anchor", "middle")
  //     .attr("dy", "0.35em")
  //     .style("font-size", "18px")
  //     .style("font-weight", "bold")
  //     .style("fill", "#333")
  //     .style("transition", "opacity 0.3s ease")
  //     .text(`${d3.sum(data, (d: any) => d.avgCPM).toFixed(0)}`);

  //   // Center subtext
  //   const centerSubtext = g.append("text")
  //     .attr("text-anchor", "middle")
  //     .attr("dy", "1.5em")
  //     .style("font-size", "12px")
  //     .style("fill", "#666")
  //     .style("transition", "opacity 0.3s ease")
  //     .text("Total CPM");

  //   // Add legend
  //   this.addLegend(svg, data.slice(0, 6), color, radius);
  // }

  private addLegend(svg: any, data: any[], color: any, radius: number) {
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${radius * 2 + 70}, 50)`);

    const legendItems = legend.selectAll(".legend-item")
      .data(data)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d: any, i: number) => `translate(0, ${i * 25})`);

    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (d: any, i: number) => color(i as any) as any)
      .attr("rx", 3);

    legendItems.append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text((d: any) => {
        const name = d.name.length > 12 ? d.name.substring(0, 12) + "..." : d.name;
        return `${name} ($${d.avgCPM.toFixed(1)})`;
      });
  }

  // 3. Donut Charts
  // createDonutCharts() {
  //   const radius = 120;
  //   const innerRadius = 60;

  //   // Advertiser donut
  //   this.createDonut(this.advertiserData, "#advertiser-donut", "Top Advertisers");

  //   // Publisher donut
  //   this.createDonut(this.publisherData, "#publisher-donut", "Top Publishers");
  // }

  // private createDonut(data: any[], containerId: string, title: string) {
  //   const radius = 120;
  //   const innerRadius = 60;

  //   const svg = d3.select(containerId)
  //     .append("svg")
  //     .attr("width", radius * 2 + 100)
  //     .attr("height", radius * 2 + 100);

  //   const g = svg.append("g")
  //     .attr("transform", `translate(${radius + 50},${radius + 50})`);

  //   const pie = d3.pie()
  //     .value((d: any) => d.avgCPM)
  //     .sort(null);

  //   const arc = d3.arc()
  //     .innerRadius(innerRadius)
  //     .outerRadius(radius);

  //   const color = d3.scaleOrdinal()
  //     .range(this.colors.gradient);

  //   const arcs = g.selectAll(".donut-segment")
  //     .data(pie(data.slice(0, 6))) // Top 6 for visibility
  //     .enter().append("g")
  //     .attr("class", "donut-segment");

  //   arcs.append("path")
  //     .attr("d", (d: any) => arc(d))
  //     .attr("fill", (d: any, i: number) => color(i as any) as any)
  //     .on("mousemove", (event: any, d: any) => {
  //       this.showTooltip(event, `<strong>${d.data.name}</strong><br/>CPM: ${d.data.avgCPM}<br/>Percentage: ${(d.data.avgCPM / d3.sum(data, (d: any) => d.avgCPM) * 100).toFixed(1)}%`);
  //     })
  //     .on("mouseout", () => this.hideTooltip());

  //   // Add title
  //   svg.append("text")
  //     .attr("x", radius + 50)
  //     .attr("y", 30)
  //     .attr("text-anchor", "middle")
  //     .style("font-weight", "bold")
  //     .style("font-size", "16px")
  //     .text(title);

  //   // Center text
  //   g.append("text")
  //     .attr("text-anchor", "middle")
  //     .attr("dy", "0.35em")
  //     .style("font-size", "18px")
  //     .style("font-weight", "bold")
  //     .text(`${d3.sum(data, (d: any) => d.avgCPM).toFixed(0)}`);

  //   g.append("text")
  //     .attr("text-anchor", "middle")
  //     .attr("dy", "1.5em")
  //     .style("font-size", "12px")
  //     .style("fill", "#666")
  //     .text("Total CPM");
  // }

  // 4. Line Chart
  // createLineChart() {
  //   const margin = { top: 20, right: 30, bottom: 50, left: 80 };
  //   const width = 1000 - margin.left - margin.right;
  //   const height = 400 - margin.top - margin.bottom;

  //   const svg = d3.select("#line-chart")
  //     .append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom);

  //   const g = svg.append("g")
  //     .attr("transform", `translate(${margin.left},${margin.top})`);

  //   const x = d3.scaleLinear()
  //     .domain([1, 14])
  //     .range([0, width]);

  //   const y = d3.scaleLinear()
  //     .domain([0, d3.max([...this.advertiserData, ...this.publisherData], (d: any) => d.avgCPM)])
  //     .range([height, 0]);

  //   // Add grid
  //   g.append("g")
  //     .attr("class", "grid")
  //     .call(d3.axisLeft(y)
  //       .tickSize(-width)
  //       .tickFormat("" as any)
  //     );

  //   const line = d3.line()
  //     .x((d: any) => x(d.rank))
  //     .y((d: any) => y(d.avgCPM))
  //     .curve(d3.curveMonotoneX);

  //   // Advertiser line
  //   g.append("path")
  //     .datum(this.advertiserData)
  //     .attr("class", "line")
  //     .attr("d", (d: any) => line(d))
  //     .attr("stroke", this.colors.advertiser)
  //     .attr("stroke-width", 3);

  //   // Publisher line
  //   g.append("path")
  //     .datum(this.publisherData)
  //     .attr("class", "line")
  //     .attr("d", (d: any) => line(d))
  //     .attr("stroke", this.colors.publisher)
  //     .attr("stroke-width", 3);

  //   // Add dots
  //   g.selectAll(".adv-dot")
  //     .data(this.advertiserData)
  //     .enter().append("circle")
  //     .attr("class", "adv-dot")
  //     .attr("cx", (d: any) => x(d.rank))
  //     .attr("cy", (d: any) => y(d.avgCPM))
  //     .attr("r", 5)
  //     .attr("fill", this.colors.advertiser)
  //     .attr("stroke", "white")
  //     .attr("stroke-width", 2)
  //     .on("mouseover", (event: any, d: any) => {
  //       this.showTooltip(event, `<strong>${d.name}</strong><br/>Rank: ${d.rank}<br/>Avg CPM: ${d.avgCPM}`);
  //     })
  //     .on("mouseout", () => this.hideTooltip());

  //   g.selectAll(".pub-dot")
  //     .data(this.publisherData)
  //     .enter().append("circle")
  //     .attr("class", "pub-dot")
  //     .attr("cx", (d: any) => x(d.rank))
  //     .attr("cy", (d: any) => y(d.avgCPM))
  //     .attr("r", 5)
  //     .attr("fill", this.colors.publisher)
  //     .attr("stroke", "white")
  //     .attr("stroke-width", 2)
  //     .on("mouseover", (event: any, d: any) => {
  //       this.showTooltip(event, `<strong>${d.name}</strong><br/>Rank: ${d.rank}<br/>Avg CPM: ${d.avgCPM}`);
  //     })
  //     .on("mouseout", () => this.hideTooltip());

  //   // Add axes
  //   g.append("g")
  //     .attr("class", "axis")
  //     .attr("transform", `translate(0,${height})`)
  //     .call(d3.axisBottom(x))
  //     .append("text")
  //     .attr("x", width / 2)
  //     .attr("y", 35)
  //     .attr("fill", "black")
  //     .style("text-anchor", "middle")
  //     .text("Ranking Position");

  //   g.append("g")
  //     .attr("class", "axis")
  //     .call(d3.axisLeft(y))
  //     .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", -60)
  //     .attr("x", -height / 2)
  //     .attr("fill", "black")
  //     .style("text-anchor", "middle")
  //     .text("Average CPM ($)");

  //   // Legend
  //   const legend = svg.append("g")
  //     .attr("class", "legend")
  //     .attr("transform", `translate(${margin.left + width - 150}, ${margin.top + 20})`);

  //   legend.append("line")
  //     .attr("x1", 0)
  //     .attr("x2", 20)
  //     .attr("y1", 5)
  //     .attr("y2", 5)
  //     .attr("stroke", this.colors.advertiser)
  //     .attr("stroke-width", 3);

  //   legend.append("text")
  //     .attr("x", 25)
  //     .attr("y", 9)
  //     .text("Advertisers");

  //   legend.append("line")
  //     .attr("x1", 0)
  //     .attr("x2", 20)
  //     .attr("y1", 25)
  //     .attr("y2", 25)
  //     .attr("stroke", this.colors.publisher)
  //     .attr("stroke-width", 3);

  //   legend.append("text")
  //     .attr("x", 25)
  //     .attr("y", 29)
  //     .text("Publishers");
  // }
  createLineChart() {
    const margin = { top: 40, right: 30, bottom: 60, left: 80 };  // Increased margins for better label visibility
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear any existing chart
    d3.select("#line-chart").html("");

    const svg = d3.select("#line-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale - ranking from 1 to 14
    const x = d3.scaleLinear()
      .domain([1, 14])
      .range([0, width])
      .nice();

    // Y scale - based on max CPM value
    const maxCPM = d3.max([...this.advertiserData, ...this.publisherData], (d: any) => d.avgCPM);
    const y = d3.scaleLinear()
      .domain([0, maxCPM * 1.1])  // Add 10% padding at top
      .range([height, 0])
      .nice();

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("" as any)
      );

    // Create line generator
    const line = d3.line()
      .x((d: any) => x(d.rank))
      .y((d: any) => y(d.avgCPM))
      .curve(d3.curveMonotoneX);

    // Draw advertiser line
    g.append("path")
      .datum(this.advertiserData.sort((a: any, b: any) => a.rank - b.rank))
      .attr("class", "line")
      .attr("d", line as any)
      .attr("stroke", this.colors.advertiser)
      .attr("stroke-width", 3)
      .attr("fill", "none");

    // Draw publisher line
    g.append("path")
      .datum(this.publisherData.sort((a: any, b: any) => a.rank - b.rank))
      .attr("class", "line")
      .attr("d", line as any)
      .attr("stroke", this.colors.publisher)
      .attr("stroke-width", 3)
      .attr("fill", "none");

    // Add advertiser dots
    g.selectAll(".adv-dot")
      .data(this.advertiserData)
      .enter().append("circle")
      .attr("class", "adv-dot")
      .attr("cx", (d: any) => x(d.rank))
      .attr("cy", (d: any) => y(d.avgCPM))
      .attr("r", 6)
      .attr("fill", this.colors.advertiser)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", (event: any, d: any) => {
        this.showTooltip(event, `<strong>${d.name}</strong><br/>Rank: ${d.rank}<br/>Avg CPM: $${d.avgCPM.toFixed(2)}`);
      })
      .on("mouseout", () => this.hideTooltip());

    // Add publisher dots
    g.selectAll(".pub-dot")
      .data(this.publisherData)
      .enter().append("circle")
      .attr("class", "pub-dot")
      .attr("cx", (d: any) => x(d.rank))
      .attr("cy", (d: any) => y(d.avgCPM))
      .attr("r", 6)
      .attr("fill", this.colors.publisher)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", (event: any, d: any) => {
        this.showTooltip(event, `<strong>${d.name}</strong><br/>Rank: ${d.rank}<br/>Avg CPM: $${d.avgCPM.toFixed(2)}`);
      })
      .on("mouseout", () => this.hideTooltip());

    // Add X axis
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(14))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#333")
      .style("font-size", "14px")
      .style("text-anchor", "middle")
      .text("Ranking Position");

    // Add Y axis
    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("fill", "#333")
      .style("font-size", "14px")
      .style("text-anchor", "middle")
      .text("Average CPM ($)");

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${margin.left + width - 180}, ${margin.top + 20})`);

    // Advertiser legend
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", 10)
      .attr("y2", 10)
      .attr("stroke", this.colors.advertiser)
      .attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 40)
      .attr("y", 14)
      .style("font-size", "14px")
      .text("Advertisers");

    // Publisher legend
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", 30)
      .attr("y2", 30)
      .attr("stroke", this.colors.publisher)
      .attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 40)
      .attr("y", 34)
      .style("font-size", "14px")
      .text("Publishers");
  }
  // 5. Area Chart
  createAreaChart() {
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#area-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate cumulative data
    const advCumulative: any[] = [];
    const pubCumulative: any[] = [];
    let advSum = 0, pubSum = 0;

    this.advertiserData.forEach((d: any) => {
      advSum += d.avgCPM;
      advCumulative.push({ rank: d.rank, cumulative: advSum });
    });

    this.publisherData.forEach((d: any) => {
      pubSum += d.avgCPM;
      pubCumulative.push({ rank: d.rank, cumulative: pubSum });
    });

    const x = d3.scaleLinear()
      .domain([1, 14])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, Math.max(advSum, pubSum)])
      .range([height, 0]);

    const area = d3.area()
      .x((d: any) => x(d.rank))
      .y0(height)
      .y1((d: any) => y(d.cumulative))
      .curve(d3.curveMonotoneX);

    // Add areas
    g.append("path")
      .datum(advCumulative)
      .attr("class", "area")
      .attr("d", (d: any) => area(d))
      .attr("fill", this.colors.advertiser)
      .attr("opacity", 0.6);

    g.append("path")
      .datum(pubCumulative)
      .attr("class", "area")
      .attr("d", (d: any) => area(d))
      .attr("fill", this.colors.publisher)
      .attr("opacity", 0.6);

    // Add axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Ranking Position");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Cumulative CPM ($)");

    // Legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${margin.left + width - 150}, ${margin.top + 20})`);

    legend.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", this.colors.advertiser)
      .attr("opacity", 0.6);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text("Advertisers");

    legend.append("rect")
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", this.colors.publisher)
      .attr("opacity", 0.6);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 37)
      .text("Publishers");
  }

  // 6. Heatmap
  createHeatmap() {
    const margin = { top: 20, right: 30, bottom: 100, left: 200 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#heatmap")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare data for heatmap
    const heatmapData: any[] = [];
    const topAdvertisers = this.advertiserData.slice(0, 7);
    const topPublishers = this.publisherData.slice(0, 7);

    topAdvertisers.forEach((adv: any) => {
      topPublishers.forEach((pub: any) => {
        heatmapData.push({
          advertiser: adv.name.replace('www.', '').substring(0, 15),
          publisher: pub.name.replace('www.', '').substring(0, 15),
          value: Math.random() * (adv.avgCPM + pub.avgCPM) / 2 // Simulated interaction value
        });
      });
    });

    const xScale = d3.scaleBand()
      .domain(topPublishers.map((d: any) => d.name.replace('www.', '').substring(0, 15)))
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(topAdvertisers.map((d: any) => d.name.replace('www.', '').substring(0, 15)))
      .range([0, height])
      .padding(0.05);

    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateViridis)
      .domain([0, d3.max(heatmapData, (d: any) => d.value)]);

    // Add rectangles
    g.selectAll(".heatmap-cell")
      .data(heatmapData)
      .enter().append("rect")
      .attr("class", "heatmap-cell")
      .attr("x", (d: any) => xScale(d.publisher))
      .attr("y", (d: any) => yScale(d.advertiser))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d: any) => colorScale(d.value))
      .on("mouseover", (event: any, d: any) => {
        this.showTooltip(event, `<strong>Interaction Score</strong><br/>Advertiser: ${d.advertiser}<br/>Publisher: ${d.publisher}<br/>Value: ${d.value.toFixed(2)}`);
      })
      .on("mouseout", () => this.hideTooltip());

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

    // Add labels
    svg.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", height + margin.top + 80)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Publishers");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 60)
      .attr("x", -(margin.top + height / 2))
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Advertisers");
  }
}


