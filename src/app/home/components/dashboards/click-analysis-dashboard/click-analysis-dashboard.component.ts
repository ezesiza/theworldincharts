// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-click-analysis-dashboard',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './click-analysis-dashboard.component.html',
//   styleUrl: './click-analysis-dashboard.component.less'
// })
// export class ClickAnalysisDashboardComponent {

// }
import { Component, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'click-analysis-dashboard',
  templateUrl: './click-analysis-dashboard.component.html',
  styleUrls: ['./click-analysis-dashboard.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ClickAnalysisDashboardComponent implements AfterViewInit {
  // ViewChild references for each chart container
  @ViewChild('scatterChart') scatterChart!: ElementRef;
  @ViewChild('densityChart') densityChart!: ElementRef;
  @ViewChild('xHistogram') xHistogram!: ElementRef;
  @ViewChild('yHistogram') yHistogram!: ElementRef;
  @ViewChild('combinedChart') combinedChart!: ElementRef;
  @ViewChild('clusterChart') clusterChart!: ElementRef;
  @ViewChild('distanceChart') distanceChart!: ElementRef;
  @ViewChild('sequenceChart') sequenceChart!: ElementRef;
  @ViewChild('radialChart') radialChart!: ElementRef;

  // Common dimensions
  private margin = { top: 20, right: 40, bottom: 40, left: 50 };
  private width = 400;
  private height = 300;
  private combinedWidth = 800;
  private combinedHeight = 500;
  private combinedMargin = { top: 30, right: 100, bottom: 60, left: 80 };

  // Scales
  private xScale = d3.scaleLinear().domain([0, 500]).range([0, this.width]);
  private yScale = d3.scaleLinear().domain([0, 900]).range([this.height, 0]);
  private colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 10]);

  // Dataset
  clickData = [
    // Main cluster in center-lower area
    { x: 180, y: 650 }, { x: 185, y: 655 }, { x: 175, y: 660 }, { x: 190, y: 665 },
    { x: 170, y: 670 }, { x: 195, y: 675 }, { x: 165, y: 680 }, { x: 200, y: 685 },
    { x: 160, y: 690 }, { x: 205, y: 695 }, { x: 155, y: 700 }, { x: 210, y: 705 },
    { x: 150, y: 710 }, { x: 215, y: 715 }, { x: 145, y: 720 }, { x: 220, y: 725 },
    { x: 140, y: 730 }, { x: 225, y: 735 }, { x: 135, y: 740 }, { x: 230, y: 745 },
    // Secondary vertical cluster
    { x: 180, y: 400 }, { x: 175, y: 420 }, { x: 185, y: 440 }, { x: 170, y: 460 },
    { x: 190, y: 480 }, { x: 165, y: 500 }, { x: 195, y: 520 }, { x: 160, y: 540 },
    { x: 200, y: 560 }, { x: 155, y: 580 }, { x: 205, y: 600 }, { x: 150, y: 620 },
    // Scattered upper clicks
    { x: 120, y: 120 }, { x: 250, y: 150 }, { x: 300, y: 180 }, { x: 80, y: 200 },
    { x: 350, y: 220 }, { x: 100, y: 250 }, { x: 280, y: 280 }, { x: 150, y: 300 },
    { x: 320, y: 320 }, { x: 200, y: 350 }, { x: 400, y: 380 }, { x: 50, y: 100 },
    // Left edge clicks
    { x: 50, y: 400 }, { x: 60, y: 500 }, { x: 70, y: 600 }, { x: 80, y: 700 },
    { x: 90, y: 800 }, { x: 55, y: 450 }, { x: 65, y: 550 }, { x: 75, y: 650 },
    // Right scattered clicks
    { x: 450, y: 200 }, { x: 480, y: 300 }, { x: 420, y: 400 }, { x: 460, y: 500 },
    { x: 440, y: 600 }, { x: 470, y: 700 }, { x: 430, y: 800 }, { x: 490, y: 250 },
    // Additional dense center area
    { x: 180, y: 640 }, { x: 185, y: 645 }, { x: 175, y: 650 }, { x: 190, y: 655 },
    { x: 170, y: 660 }, { x: 195, y: 665 }, { x: 165, y: 670 }, { x: 200, y: 675 },
    { x: 182, y: 652 }, { x: 178, y: 658 }, { x: 188, y: 662 }, { x: 172, y: 668 },
    // More realistic UI interaction points
    { x: 300, y: 100 }, { x: 320, y: 120 }, { x: 340, y: 140 }, { x: 360, y: 160 },
    { x: 100, y: 100 }, { x: 120, y: 80 }, { x: 140, y: 90 }, { x: 160, y: 110 }
  ];

  // Tooltip
  private tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  ngAfterViewInit(): void {
    this.createScatterPlot();
    this.createDensityHeatmap();
    this.createXHistogram();
    this.createYHistogram();
    this.createCombinedChart();
    this.createClusterAnalysis();
    this.createDistanceAnalysis();
    this.createSequenceHeatmap();
    this.createRadialChart();
    this.generateStatistics();
    this.setupAnimations();
  }

  private createScatterPlot(): void {
    const svg = d3.select(this.scatterChart.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Grid
    g.append('g').attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale).tickSize(-this.height))
      .selectAll('line').attr('class', 'grid-line');
    g.append('g').call(d3.axisLeft(this.yScale).tickSize(-this.width))
      .selectAll('line').attr('class', 'grid-line');

    // Axes
    // g.append('g').attr('class', 'axis').attr('transform', `translate(0,${this.height})`)
    //   .call(d3.axisBottom(this.xScale));
    // g.append('g').attr('class', 'axis').call(d3.axisLeft(this.yScale));

    // Points
    g.selectAll('.click-point')
      .data(this.clickData)
      .enter().append('circle')
      .attr('class', 'click-point')
      .attr('cx', d => this.xScale(d.x))
      .attr('cy', d => this.yScale(d.y))
      .attr('r', 3)
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.tooltip.transition().duration(200).style('opacity', .9);
        this.tooltip.html(`Position: (${d.x}, ${d.y})`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => this.tooltip.transition().duration(500).style('opacity', 0));

    // Labels
    g.append('text')
      .attr('transform', `translate(${this.width / 2}, ${this.height + 35})`)
      .style('text-anchor', 'middle').style('font-size', '12px')
      .text('X Position (pixels)');
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35).attr('x', -this.height / 2)
      .style('text-anchor', 'middle').style('font-size', '12px')
      .text('Y Position');
  }

  private createDensityHeatmap(): void {
    const svg = d3.select(this.densityChart.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Create density grid
    const gridSize = 20;
    const densityData: any[] = [];
    for (let x = 0; x <= 500; x += gridSize) {
      for (let y = 0; y <= 900; y += gridSize) {
        const count = this.clickData.filter(d =>
          d.x >= x && d.x < x + gridSize &&
          d.y >= y && d.y < y + gridSize
        ).length;
        if (count > 0) {
          densityData.push({ x, y, count });
        }
      }
    }

    // Draw density rectangles
    g.selectAll('.density-rect')
      .data(densityData)
      .enter().append('rect')
      .attr('class', 'density-rect')
      .attr('x', d => this.xScale(d.x))
      .attr('y', d => this.yScale(d.y + gridSize))
      .attr('width', this.xScale(gridSize))
      .attr('height', this.yScale(0) - this.yScale(gridSize))
      .attr('fill', d => this.colorScale(d.count))
      .attr('stroke', 'none')
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.tooltip.transition().duration(200).style('opacity', .9);
        this.tooltip.html(`Density: ${d.count} clicks<br>Area: (${d.x}-${d.x + gridSize}, ${d.y}-${d.y + gridSize})`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => this.tooltip.transition().duration(500).style('opacity', 0));

    // Axes
    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale));
    g.append('g').attr('class', 'axis').call(d3.axisLeft(this.yScale));

    // Labels
    g.append('text')
      .attr('transform', `translate(${this.width / 2}, ${this.height + 35})`)
      .style('text-anchor', 'middle').style('font-size', '12px')
      .text('X Position (pixels)');
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35).attr('x', -this.height / 2)
      .style('text-anchor', 'middle').style('font-size', '12px')
      .text('Y Position');
  }

  private createXHistogram(): void {
    const svg = d3.select(this.xHistogram.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const bins = d3.histogram()
      .domain(this.xScale.domain() as any)
      .thresholds(this.xScale.ticks(20))
      .value((d: any) => d.x)(this.clickData as any);

    const yMax = d3.max(bins, (d: any) => d.length) || 0;
    const yScaleHist = d3.scaleLinear().domain([0, yMax]).range([this.height, 0]);
    const gridSize = 20;

    g.selectAll('.histogram-bar')
      .data(bins)
      .enter().append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', (d: any) => this.xScale(d.x0))
      .attr('y', (d: any) => yScaleHist(d.length))
      .attr('width', (d: any) => this.xScale(d.x1) - this.xScale(d.x0) - 1)
      .attr('height', (d: any) => this.height - yScaleHist(d.length))
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.tooltip.transition().duration(200).style('opacity', .9);
        this.tooltip.html(`Position: (${d.x0}, ${d.x1})`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => this.tooltip.transition().duration(500).style('opacity', 0));

    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale));
    g.append('g').attr('class', 'axis').call(d3.axisLeft(yScaleHist));

    g.append('text')
      .attr('transform', `translate(${this.width / 2}, ${this.height + 35})`)
      .style('text-anchor', 'middle').style('font-size', '12px')
      .text('X Position (pixels)');
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35).attr('x', -this.height / 2)
      .style('text-anchor', 'middle').style('font-size', '12px')
      .text('Frequency');
  }

  private createYHistogram(): void {
    const svg = d3.select(this.yHistogram.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const bins = d3.histogram()
      .domain(this.yScale.domain() as any)
      .thresholds(this.yScale.ticks(30))
      .value((d: any) => d.y)(this.clickData as any);

    const xMax = d3.max(bins, (d: any) => d.length) || 0;
    const xScaleHist = d3.scaleLinear().domain([0, xMax]).range([0, this.width]);

    g.selectAll('.histogram-bar')
      .data(bins)
      .enter().append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', 0)
      .attr('y', (d: any) => this.yScale(d.x1))
      .attr('width', (d: any) => xScaleHist(d.length))
      .attr('height', (d: any) => this.yScale(d.x0) - this.yScale(d.x1) - 1);

    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(xScaleHist));
    g.append('g').attr('class', 'axis').call(d3.axisLeft(this.yScale));

    g.append('text')
      .attr('transform', `translate(${this.width / 2}, ${this.height + 35})`)
      .style('text-anchor', 'middle').style('font-size', '12px')
      .text('Frequency');
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35).attr('x', -this.height / 2)
      .style('text-anchor', 'middle').style('font-size', '12px')
      .text('Y Position (pixels)');
  }

  private createCombinedChart(): void {
    const svg = d3.select(this.combinedChart.nativeElement)
      .append('svg')
      .attr('width', this.combinedWidth + this.combinedMargin.left + this.combinedMargin.right)
      .attr('height', this.combinedHeight + this.combinedMargin.top + this.combinedMargin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${this.combinedMargin.left},${this.combinedMargin.top})`);

    const xScaleCombined = d3.scaleLinear().domain([0, 500]).range([0, this.combinedWidth]);
    const yScaleCombined = d3.scaleLinear().domain([0, 900]).range([this.combinedHeight, 0]);

    // Grid
    g.append('g').attr('transform', `translate(0,${this.combinedHeight})`)
      .call(d3.axisBottom(xScaleCombined)
        .tickSize(-this.combinedHeight))
      .selectAll('line').attr('class', 'grid-line');

    g.append('g')
      .call(d3.axisLeft(yScaleCombined).tickSize(-this.combinedWidth))
      .selectAll('line')
      .attr('class', 'grid-line');

    // Density contours
    const contours = d3.contours()
      .size([50, 90])
      .thresholds(8);

    const densityGrid = new Array(50 * 90).fill(0);
    this.clickData.forEach(d => {
      const x = Math.floor(d.x / 10);
      const y = Math.floor(d.y / 10);
      if (x < 50 && y < 90) {
        densityGrid[y * 50 + x]++;
      }
    });

    g.append('g')
      .selectAll('path')
      .data(contours(densityGrid))
      .enter().append('path')
      .attr('d', d3.geoPath(d3.geoIdentity().scale(10)))
      .attr('fill', 'none')
      .attr('stroke', (d: any) => d3.interpolateViridis(d.value / 10))
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    // Click points
    g.selectAll('.click-point-combined')
      .data(this.clickData)
      .enter().append('circle')
      .attr('class', 'click-point-combined')
      .attr('cx', d => xScaleCombined(d.x))
      .attr('cy', d => yScaleCombined(d.y))
      .attr('r', 3)
      .attr('fill', '#ff6b6b')
      .attr('stroke', '#ee5a52')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8);

    // Axes
    // g.append('g').attr('class', 'axis').attr('transform', `translate(0,${this.combinedHeight})`)
    //   .call(d3.axisBottom(xScaleCombined));
    // g.append('g').attr('class', 'axis').call(d3.axisLeft(yScaleCombined));

    // Labels
    g.append('text')
      .attr('transform', `translate(${this.combinedWidth / 2}, ${this.combinedHeight + 50})`)
      .style('text-anchor', 'middle').style('font-size', '14px').style('font-weight', 'bold')
      .text('X Position (pixels)');
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50).attr('x', -this.combinedHeight / 2)
      .style('text-anchor', 'middle').style('font-size', '14px').style('font-weight', 'bold')
      .text('Y Position (pixels)');
  }

  private createClusterAnalysis(): void {
    const svg = d3.select(this.clusterChart.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Simple K-means clustering (k=5)
    const k = 5;
    const clusters = this.kMeansClustering(this.clickData, k);

    // Draw cluster centers
    g.selectAll('.cluster-center')
      .data(clusters.centers)
      .enter().append('circle')
      .attr('class', 'cluster-center')
      .attr('cx', (d: any) => this.xScale(d.x))
      .attr('cy', (d: any) => this.yScale(d.y))
      .attr('r', 8)
      .attr('fill', 'black')
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    // Draw clustered points
    g.selectAll('.cluster-point')
      .data(this.clickData.map((d, i) => ({ ...d, cluster: clusters.assignments[i] })))
      .enter().append('circle')
      .attr('class', (d: any) => `cluster-point cluster-${d.cluster}`)
      .attr('cx', (d: any) => this.xScale(d.x))
      .attr('cy', (d: any) => this.yScale(d.y))
      .attr('r', 4);

    // Axes and labels
    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale));
    g.append('g').attr('class', 'axis').call(d3.axisLeft(this.yScale));
  }

  private createDistanceAnalysis(): void {
    const centerX = 250, centerY = 450;
    const distances = this.clickData.map(d => ({
      distance: Math.sqrt(Math.pow(d.x - centerX, 2) + Math.pow(d.y - centerY, 2)),
      ...d
    }));

    const svg = d3.select(this.distanceChart.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const bins = d3.histogram()
      .domain([0, d3.max(distances, (d: any) => d.distance) || 0])
      .thresholds(15)
      .value((d: any) => d.distance)(distances as any);

    const yMax = d3.max(bins, (d: any) => d.length) || 0;
    const yScaleHist = d3.scaleLinear().domain([0, yMax]).range([this.height, 0]);
    const xScaleDist = d3.scaleLinear().domain([0, d3.max(distances, (d: any) => d.distance) || 0]).range([0, this.width]);

    g.selectAll('.distance-bar')
      .data(bins)
      .enter().append('rect')
      .attr('class', 'distance-bar')
      .attr('x', (d: any) => xScaleDist(d.x0))
      .attr('y', (d: any) => yScaleHist(d.length))
      .attr('width', (d: any) => xScaleDist(d.x1) - xScaleDist(d.x0) - 1)
      .attr('height', (d: any) => this.height - yScaleHist(d.length))
      .attr("cursor", "pointer")
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.tooltip.transition().duration(200).style('opacity', .9);
        this.tooltip.html(`Position: (${d.x0}, ${d.x1})`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => this.tooltip.transition().duration(500).style('opacity', 0));

    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(xScaleDist));
    g.append('g').attr('class', 'axis').call(d3.axisLeft(yScaleHist));
  }

  private createSequenceHeatmap(): void {
    const svg = d3.select(this.sequenceChart.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Add sequence numbers to clicks
    const sequencedClicks = this.clickData.map((d, i) => ({ ...d, sequence: i + 1 }));
    const colorScaleSeq = d3.scaleSequential(d3.interpolateSpectral)
      .domain([1, this.clickData.length]);

    // Create time-based grid
    const timeGridSize = 15;
    const timeData: any[] = [];
    for (let x = 0; x <= 500; x += timeGridSize) {
      for (let y = 0; y <= 900; y += timeGridSize) {
        const clicksInCell = sequencedClicks.filter(d =>
          d.x >= x && d.x < x + timeGridSize &&
          d.y >= y && d.y < y + timeGridSize
        );
        if (clicksInCell.length > 0) {
          const avgSequence = d3.mean(clicksInCell, (d: any) => d.sequence) || 0;
          timeData.push({ x, y, avgSequence, count: clicksInCell.length });
        }
      }
    }

    g.selectAll('.sequence-rect')
      .data(timeData)
      .enter().append('rect')
      .attr('class', 'sequence-rect')
      .attr('x', (d: any) => this.xScale(d.x))
      .attr('y', (d: any) => this.yScale(d.y + timeGridSize))
      .attr('width', this.xScale(timeGridSize))
      .attr('height', this.yScale(0) - this.yScale(timeGridSize))
      .attr('fill', (d: any) => colorScaleSeq(d.avgSequence))
      .attr('opacity', 0.8);

    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale));
    g.append('g').attr('class', 'axis').call(d3.axisLeft(this.yScale));
  }

  private createRadialChart(): void {
    const svg = d3.select(this.radialChart.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${(this.width + this.margin.left + this.margin.right) / 2},${(this.height + this.margin.top + this.margin.bottom) / 2})`);

    const centerX = 250, centerY = 450;
    const maxRadius = 200;

    // Convert to polar coordinates
    const polarData = this.clickData.map(d => {
      const dx = d.x - centerX;
      const dy = d.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx); // Returns angle in radians
      return {
        distance: Math.min(distance, maxRadius),
        angle: angle,
        originalX: d.x,
        originalY: d.y
      };
    });

    // Create radial histogram
    const angleScale = d3.scaleLinear()
      .domain([-Math.PI, Math.PI])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, maxRadius])
      .range([20, 120]);

    // Draw concentric circles with labels
    [40, 80, 120].forEach((r, i) => {
      g.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);

      // Add radius labels
      g.append('text')
        .attr('x', 0)
        .attr('y', -r + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(`${Math.round(radiusScale.invert(r))}px`);
    });

    // Draw angle lines with labels (every 45 degrees)
    const angleLabels = ['0°', '45°', '90°', '135°', '180°', '225°', '270°', '315°'];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 120 * Math.cos(angle))
        .attr('y2', 120 * Math.sin(angle))
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);

      // Add angle labels
      // if (i % 2 === 0) { // Only show every other label for clarity
      g.append('text')
        .attr('x', 130 * Math.cos(angle))
        .attr('y', 130 * Math.sin(angle))
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(angleLabels[i]);
      // }
    }

    // Add center label
    g.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text('Center');

    // Use currentRadialSize instead of hardcoded 120
    // const radiusScale = d3.scaleLinear()
    // .domain([0, maxRadius])
    // .range([20, this.currentRadialSize]);

    // Update all references to 120 to use this.currentRadialSize
    // For example:
    g.append('circle')
      .attr('r', this.currentRadialSize)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2');

    // Plot points with tooltip
    g.selectAll('.polar-point')
      .data(polarData)
      .enter().append('circle')
      .attr('class', 'polar-point')
      .attr('cx', (d: any) => radiusScale(d.distance) * Math.cos(d.angle))
      .attr('cy', (d: any) => radiusScale(d.distance) * Math.sin(d.angle))
      .attr('r', 4)
      .attr('fill', '#e17055')
      .attr('opacity', 0.7)
      .on('mouseover', (event: MouseEvent, d: any) => {
        // Calculate original position
        const angleDeg = (d.angle * 180 / Math.PI).toFixed(1);

        this.tooltip.transition()
          .duration(200)
          .style('opacity', .9);

        this.tooltip.html(`
          <strong>Position:</strong> (${d.originalX}, ${d.originalY})<br>
          <strong>Distance from center:</strong> ${d.distance.toFixed(1)}px<br>
          <strong>Angle:</strong> ${angleDeg}°
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        this.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // // Add chart title
    // svg.append('text')
    //   .attr('x', (this.width + this.margin.left + this.margin.right) / 2)
    //   .attr('y', 20)
    //   .attr('text-anchor', 'middle')
    //   .style('font-size', '14px')
    //   .style('font-weight', 'bold')
    //   .text('Radial Distribution of Clicks');
  }

  // Add this property to your component
  private currentRadialSize = 120;

  // Add this method to handle slider changes
  onRadialSizeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentRadialSize = parseInt(value, 10);
    document.getElementById('radialSizeValue')!.textContent = value + 'px';
    this.updateRadialChartSize();
  }

  resetRadialSize(): void {
    // Reset to default value
    const defaultValue = 120;
    this.currentRadialSize = defaultValue;

    // Update the slider UI
    const slider = document.getElementById('radialSize') as HTMLInputElement;
    slider.value = defaultValue.toString();
    document.getElementById('radialSizeValue')!.textContent = `${defaultValue}px`;

    // Update the chart
    this.updateRadialChartSize();
  }

  // Add this method to update the chart
  private updateRadialChartSize(): void {
    const svg = d3.select(this.radialChart.nativeElement).select('svg');

    if (svg.empty()) return;

    const g = svg.select('g');

    // Update concentric circles
    [40, 80, 120].forEach((r, i) => {
      const scaledRadius = r * (this.currentRadialSize / 120);
      g.select(`circle:nth-child(${i + 1})`)
        .attr('r', scaledRadius);

      let indx = 0;

      // Update radius labels position
      g.selectAll('text')
        .filter((d: any, index: number, nodes: any) => {
          indx = index;
          return nodes[index].textContent.includes('px')
        })
        .each(function (this: any, d: any, i: number, nodes: any) {
          if (i === Math.floor(indx / 2)) { // Match labels to circles
            d3.select(this)
              .attr('y', -scaledRadius + 5);
          }
        });
    });

    // Update angle lines
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      g.select(`line:nth-child(${i + 5})`) // Adjust index based on your actual DOM structure
        .attr('x2', this.currentRadialSize * Math.cos(angle))
        .attr('y2', this.currentRadialSize * Math.sin(angle));

      // Update angle labels position
      if (i % 2 === 0) {
        g.selectAll('text')
          .filter((d: any, index: number, nodes: any) =>
            nodes[index].textContent.includes('°'))
          .each(function (this: any, d: any, j: number, nodes: any) {
            if (j === i / 2) {
              d3.select(this)
                .attr('x', (this.currentRadialSize + 10) * Math.cos(angle))
                .attr('y', (this.currentRadialSize + 10) * Math.sin(angle));
            }
          });
      }
    }

    // Update points position
    g.selectAll('.polar-point')
      .attr('cx', (d: any) => {
        const scaledDistance = (d.distance / 200) * this.currentRadialSize;
        return scaledDistance * Math.cos(d.angle);
      })
      .attr('cy', (d: any) => {
        const scaledDistance = (d.distance / 200) * this.currentRadialSize;
        return scaledDistance * Math.sin(d.angle);
      });
  }

  private kMeansClustering(data: any[], k: number): any {
    // Initialize centroids randomly
    let centroids: any[] = [];
    for (let i = 0; i < k; i++) {
      const randomPoint = data[Math.floor(Math.random() * data.length)];
      centroids.push({
        x: randomPoint.x + (Math.random() - 0.5) * 100,
        y: randomPoint.y + (Math.random() - 0.5) * 100
      });
    }

    let assignments = new Array(data.length);
    let hasChanged = true;
    let iterations = 0;

    while (hasChanged && iterations < 50) {
      hasChanged = false;

      // Assign points to nearest centroid
      for (let i = 0; i < data.length; i++) {
        let minDistance = Infinity;
        let cluster = 0;

        for (let j = 0; j < k; j++) {
          const distance = Math.sqrt(
            Math.pow(data[i].x - centroids[j].x, 2) +
            Math.pow(data[i].y - centroids[j].y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            cluster = j;
          }
        }

        if (assignments[i] !== cluster) {
          hasChanged = true;
          assignments[i] = cluster;
        }
      }

      // Update centroids
      for (let j = 0; j < k; j++) {
        const clusterPoints = data.filter((_, i) => assignments[i] === j);
        if (clusterPoints.length > 0) {
          centroids[j] = {
            x: d3.mean(clusterPoints, (d: any) => d.x),
            y: d3.mean(clusterPoints, (d: any) => d.y)
          };
        }
      }

      iterations++;
    }

    return { centers: centroids, assignments: assignments };
  }

  private generateStatistics(): void {
    const totalClicks = this.clickData.length;
    const avgX = d3.mean(this.clickData, (d: any) => d.x)?.toFixed(1) || '0';
    const avgY = d3.mean(this.clickData, (d: any) => d.y)?.toFixed(1) || '0';
    const stdX = d3.deviation(this.clickData, (d: any) => d.x)?.toFixed(1) || '0';
    const stdY = d3.deviation(this.clickData, (d: any) => d.y)?.toFixed(1) || '0';

    // Basic stats
    document.getElementById('basic-stats')!.innerHTML = `
      <strong>Total Clicks:</strong> ${totalClicks}<br>
      <strong>Average Position:</strong> (${avgX}, ${avgY})<br>
      <strong>Standard Deviation:</strong> X: ${stdX}, Y: ${stdY}<br>
      <strong>Canvas Size:</strong> 360×800 pixels
    `;

    // Pattern analysis
    const centerClicks = this.clickData.filter(d => d.x > 150 && d.x < 250 && d.y > 600).length;
    const upperClicks = this.clickData.filter(d => d.y < 300).length;
    const edgeClicks = this.clickData.filter(d => d.x < 100 || d.x > 400).length;

    document.getElementById('pattern-stats')!.innerHTML = `
      <strong>Center Cluster:</strong> ${centerClicks} clicks (${(centerClicks / totalClicks * 100).toFixed(1)}%)<br>
      <strong>Upper Area:</strong> ${upperClicks} clicks (${(upperClicks / totalClicks * 100).toFixed(1)}%)<br>
      <strong>Edge Clicks:</strong> ${edgeClicks} clicks (${(edgeClicks / totalClicks * 100).toFixed(1)}%)<br>
      <strong>Main Hotspot:</strong> Y: 650-750px region
    `;

    // Hotspot analysis
    const maxDensityArea = 'Center-Lower (150-250, 650-750)';
    const clickConcentration = ((centerClicks / totalClicks) * 100).toFixed(1);

    document.getElementById('hotspot-stats')!.innerHTML = `
      <strong>Primary Hotspot:</strong> ${maxDensityArea}<br>
      <strong>Concentration:</strong> ${clickConcentration}% in 13% of area<br>
      <strong>Vertical Bias:</strong> Strong lower-screen preference<br>
      <strong>Interaction Type:</strong> UI element focused
    `;

    // Distribution metrics
    const medianX = d3.median(this.clickData, (d: any) => d.x)?.toFixed(1) || '0';
    const medianY = d3.median(this.clickData, (d: any) => d.y)?.toFixed(1) || '0';
    const q1Y = d3.quantile(this.clickData.map((d: any) => d.y).sort((a, b) => a - b), 0.25)?.toFixed(1) || '0';
    const q3Y = d3.quantile(this.clickData.map((d: any) => d.y).sort((a, b) => a - b), 0.75)?.toFixed(1) || '0';

    document.getElementById('distribution-stats')!.innerHTML = `
      <strong>Median Position:</strong> (${medianX}, ${medianY})<br>
      <strong>Y Quartiles:</strong> Q1: ${q1Y}, Q3: ${q3Y}<br>
      <strong>Distribution:</strong> Right-skewed vertically<br>
      <strong>Engagement Zone:</strong> Lower 60% of screen
    `;
  }

  private setupAnimations(): void {
    d3.selectAll('.click-point, .click-point-combined')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d: any, i: number) => i * 10)
      .style('opacity', 0.8);

    d3.selectAll('.histogram-bar')
      .style('opacity', 0)
      .transition()
      .duration(1500)
      .delay((d: any, i: number) => i * 50)
      .style('opacity', 1);
  }

  onGridSizeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    document.getElementById('gridSizeValue')!.textContent = value + 'px';
    d3.select(this.densityChart.nativeElement).select('svg').remove();
    this.createDensityHeatmap();
  }

  onClusterRadiusChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    document.getElementById('clusterRadiusValue')!.textContent = value + 'px';
    d3.select(this.clusterChart.nativeElement).select('svg').remove();
    this.createClusterAnalysis();
  }

  exportData(): void {
    const analysisData = {
      clickData: this.clickData,
      statistics: {
        totalClicks: this.clickData.length,
        averageX: d3.mean(this.clickData, (d: any) => d.x),
        averageY: d3.mean(this.clickData, (d: any) => d.y),
        standardDeviationX: d3.deviation(this.clickData, (d: any) => d.x),
        standardDeviationY: d3.deviation(this.clickData, (d: any) => d.y)
      },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'click_analysis_data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  generateReport(): void {
    const report = `
# Click Heatmap Analysis Report
Generated: ${new Date().toLocaleString()}

## Executive Summary
- Total recorded clicks: ${this.clickData.length}
- Primary interaction zone: Lower center area (Y: 600-800px)
- User engagement pattern: Vertical scrolling behavior dominant

## Detailed Findings
### Spatial Distribution
- Average click position: (${d3.mean(this.clickData, (d: any) => d.x)?.toFixed(1) || '0'}, ${d3.mean(this.clickData, (d: any) => d.y)?.toFixed(1) || '0'})
- Standard deviation: X=${d3.deviation(this.clickData, (d: any) => d.x)?.toFixed(1) || '0'}px, Y=${d3.deviation(this.clickData, (d: any) => d.y)?.toFixed(1) || '0'}px

### User Behavior Insights
- ${((this.clickData.filter(d => d.y > 600).length / this.clickData.length * 100).toFixed(1))}% of clicks in lower screen area
- Indicates strong preference for content "below the fold"
- Suggests effective scroll-based engagement

### Recommendations
1. Place key UI elements in the 150-250px horizontal range
2. Important content should be positioned in Y: 600-750px zone
3. Consider vertical layout optimization for better user engagement
    `;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'click_analysis_report.md';
    a.click();
    URL.revokeObjectURL(url);
  }
}



