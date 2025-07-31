import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

export interface BreachData {
  company: string;
  industry: string;
  breachType: string;
  securityPosture: 'weak' | 'moderate' | 'strong';
  impactLevel: 'minor' | 'moderate' | 'major';
  recordsAffected: number;
}

interface MatrixData {
  security: string;
  impact: string;
  count: number;
  avgRecords: number;
  x: number;
  y: number;
}

@Component({
  selector: 'data-breach-impact',
  templateUrl: './data-breach-impact.component.html',
  styleUrl: './data-breach-impact.component.less',
  encapsulation: ViewEncapsulation.None
})
export class DataBreachImpactComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('legend', { static: true }) legend!: ElementRef;
  @ViewChild('tooltip', { static: true }) tooltip!: ElementRef;

  @ViewChild('heatmap') heatmap!: ElementRef;
  @ViewChild('forceLayout') forceLayout!: ElementRef;
  @ViewChild('jitteredScatter') jitteredScatter!: ElementRef;
  @ViewChild('sunburst') sunburst!: ElementRef;
  @ViewChild('violinPlot') violinPlot!: ElementRef;

  @ViewChild('treemapContainer') treemapContainer!: ElementRef;
  @ViewChild('legendContainer') legendContainer!: ElementRef;
  @ViewChild('tooltip') tooltip999!: ElementRef;

  private svg: any;
  private margin = { top: 40, right: 40, bottom: 80, left: 80 };
  private width = 700 - this.margin.left - this.margin.right;
  private height = 500 - this.margin.top - this.margin.bottom;

  private breachData: BreachData[] = [
    {
      company: "Zumpano Patricios Law",
      industry: "Legal Services",
      breachType: "Data Breach",
      securityPosture: "weak",
      impactLevel: "major",
      recordsAffected: 25000
    },
    {
      company: "Mount Vernon Property",
      industry: "Property Management",
      breachType: "Akira Ransomware",
      securityPosture: "weak",
      impactLevel: "major",
      recordsAffected: 15000
    },
    {
      company: "JPS Engineers",
      industry: "Engineering",
      breachType: "Beast Ransomware",
      securityPosture: "moderate",
      impactLevel: "major",
      recordsAffected: 8000
    },
    {
      company: "Chevalier Group",
      industry: "Conglomerate",
      breachType: "Beast Ransomware Gang",
      securityPosture: "weak",
      impactLevel: "major",
      recordsAffected: 50000
    },
    {
      company: "TechStart Inc",
      industry: "Technology",
      breachType: "Data Breach",
      securityPosture: "strong",
      impactLevel: "minor",
      recordsAffected: 1200
    },
    {
      company: "MedCare Solutions",
      industry: "Healthcare",
      breachType: "Phishing Attack",
      securityPosture: "moderate",
      impactLevel: "moderate",
      recordsAffected: 5500
    },
    {
      company: "Financial Advisors LLC",
      industry: "Finance",
      breachType: "Insider Threat",
      securityPosture: "strong",
      impactLevel: "moderate",
      recordsAffected: 3200
    },
    {
      company: "Retail Chain Corp",
      industry: "Retail",
      breachType: "POS Malware",
      securityPosture: "weak",
      impactLevel: "moderate",
      recordsAffected: 12000
    },
    {
      company: "University System",
      industry: "Education",
      breachType: "Database Breach",
      securityPosture: "moderate",
      impactLevel: "minor",
      recordsAffected: 2800
    },
    {
      company: "Manufacturing Co",
      industry: "Manufacturing",
      breachType: "Ransomware",
      securityPosture: "strong",
      impactLevel: "major",
      recordsAffected: 18000
    }
  ];

  private isInitialized = false;
  activeViz: string = 'heatmap';
  securityLevels = ['weak', 'moderate', 'strong'];
  impactLevels = ['minor', 'moderate', 'major'];

  breachData999: BreachData[] = [
    { company: "Zumpano Patricios Law", industry: "Legal Services", breachType: "Data Breach", securityPosture: "weak", impactLevel: "major", recordsAffected: 25000 },
    { company: "Mount Vernon Property", industry: "Property Management", breachType: "Akira Ransomware", securityPosture: "weak", impactLevel: "major", recordsAffected: 15000 },
    { company: "JPS Engineers", industry: "Engineering", breachType: "Beast Ransomware", securityPosture: "moderate", impactLevel: "major", recordsAffected: 8000 },
    { company: "Chevalier Group", industry: "Conglomerate", breachType: "Beast Ransomware Gang", securityPosture: "weak", impactLevel: "major", recordsAffected: 50000 },
    { company: "TechStart Inc", industry: "Technology", breachType: "Data Breach", securityPosture: "strong", impactLevel: "minor", recordsAffected: 1200 },
    { company: "MedCare Solutions", industry: "Healthcare", breachType: "Phishing Attack", securityPosture: "moderate", impactLevel: "moderate", recordsAffected: 5500 },
    { company: "Financial Advisors LLC", industry: "Finance", breachType: "Insider Threat", securityPosture: "strong", impactLevel: "moderate", recordsAffected: 3200 },
    { company: "Retail Chain Corp", industry: "Retail", breachType: "POS Malware", securityPosture: "weak", impactLevel: "moderate", recordsAffected: 12000 },
    { company: "University System", industry: "Education", breachType: "Database Breach", securityPosture: "moderate", impactLevel: "minor", recordsAffected: 2800 },
    { company: "Manufacturing Co", industry: "Manufacturing", breachType: "Ransomware", securityPosture: "strong", impactLevel: "major", recordsAffected: 18000 },
    { company: "Legal Firm B", industry: "Legal Services", breachType: "Data Breach", securityPosture: "weak", impactLevel: "major", recordsAffected: 22000 },
    { company: "Property Co B", industry: "Property Management", breachType: "Ransomware", securityPosture: "weak", impactLevel: "major", recordsAffected: 16000 },
    { company: "Tech Startup B", industry: "Technology", breachType: "Phishing Attack", securityPosture: "strong", impactLevel: "minor", recordsAffected: 800 },
    { company: "Healthcare B", industry: "Healthcare", breachType: "Data Breach", securityPosture: "moderate", impactLevel: "moderate", recordsAffected: 6200 }
  ];

  private securityScale = { weak: 0, moderate: 1, strong: 2 };
  private impactScale = { minor: 0, moderate: 1, major: 2 };

  ngOnInit(): void {
    // this.createChart();
  }

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {

    setTimeout(() => {
      this.isInitialized = true;
      this.initializeCharts();
    }, 100);
  }

  private initializeCharts(): void {
    // if (this.activeViz === 'heatmap' && this.heatmap?.nativeElement) {
    //   this.createHeatmap();
    // }
    // if (this.activeViz === 'force' && this.forceLayout?.nativeElement) {
    //   this.createForceLayout();
    // }
    // if (this.activeViz === 'jitter' && this.jitteredScatter?.nativeElement) {
    //   this.createJitteredScatter();
    // }
    // if (this.activeViz === 'sunburst' && this.sunburst?.nativeElement) {
    //   this.createSunburst();
    // }
    // if (this.activeViz === 'violin' && this.violinPlot?.nativeElement) {
    //   this.createViolinPlot();
    // }

    if (!this.isInitialized) return;

    switch (this.activeViz) {
      case 'heatmap':
        if (this.heatmap?.nativeElement) this.createHeatmap();
        break;
      case 'force':
        if (this.forceLayout?.nativeElement) this.createForceLayout();
        break;
      case 'jitter':
        if (this.jitteredScatter?.nativeElement) this.createJitteredScatter();
        break;
      case 'sunburst':
        if (this.sunburst?.nativeElement) this.createSunburst();
        break;
      case 'violin':
        if (this.violinPlot?.nativeElement) this.createViolinPlot();
        break;
      case 'treemap':
        if (this.treemapContainer?.nativeElement) this.createTreemap();
        break;
    }
  }

  showVisualization(type: string): void {
    if (this.activeViz === type) return; // Prevent unnecessary re-rendering
    this.cdr.detectChanges();
    this.activeViz = type;
    // Destroy existing visualizations
    this.clearVisualizations();
    // Create new visualization
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private clearVisualizations(): void {
    // Clear all visualization containers
    const containers = [
      this.heatmap,
      this.forceLayout,
      this.jitteredScatter,
      this.sunburst,
      this.treemapContainer,
      this.violinPlot
    ];

    containers.forEach(container => {
      if (container?.nativeElement) {
        container.nativeElement.innerHTML = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.svg) {
      this.svg.remove();
    }
    // Clean up all visualizations
    this.clearVisualizations();
  }

  private createChart(): void {
    // Create SVG container
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.setupScales();
    this.createAxes();
    this.createGridLines();
    this.createBubbles();
    this.createLegend();
  }

  private setupScales(): void {
    // Define scales
    this.xScale = d3.scaleLinear()
      .domain([-0.2, 2.2])
      .range([0, this.width]);

    this.yScale = d3.scaleLinear()
      .domain([-0.2, 2.2])
      .range([this.height, 0]);

    this.sizeScale = d3.scaleSqrt()
      .domain(d3.extent(this.breachData, d => d.recordsAffected) as [number, number])
      .range([8, 35]);

    this.colorScale = d3.scaleOrdinal()
      .domain([
        "Data Breach", "Akira Ransomware", "Beast Ransomware",
        "Beast Ransomware Gang", "Phishing Attack", "Insider Threat",
        "POS Malware", "Database Breach", "Ransomware"
      ])
      .range([
        "#e74c3c", "#3498db", "#f39c12", "#9b59b6", "#1abc9c",
        "#34495e", "#e67e22", "#2ecc71", "#e91e63"
      ]);
  }

  private xScale: any;
  private yScale: any;
  private sizeScale: any;
  private colorScale: any;

  private createAxes(): void {
    // X-axis
    const xAxis = this.svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale)
        .tickValues([0, 1, 2])
        .tickFormat((d: any) => ['Weak', 'Moderate', 'Strong'][d]));

    xAxis.append('text')
      .attr('class', 'axis-label')
      .attr('x', this.width / 2)
      .attr('y', 50)
      .style('text-anchor', 'middle')
      .style('fill', '#2c3e50')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Security Posture →');

    // Y-axis
    const yAxis = this.svg.append('g')
      .attr('class', 'axis y-axis')
      .call(d3.axisLeft(this.yScale)
        .tickValues([0, 1, 2])
        .tickFormat((d: any) => ['Minor', 'Moderate', 'Major'][d]));

    yAxis.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -this.height / 2)
      .style('text-anchor', 'middle')
      .style('fill', '#2c3e50')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('← Impact Level');
  }

  private createGridLines(): void {
    // Vertical grid lines
    this.svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data([0, 1, 2])
      .enter()
      .append('line')
      .attr('x1', (d: number) => this.xScale(d))
      .attr('x2', (d: number) => this.xScale(d))
      .attr('y1', 0)
      .attr('y2', this.height)
      .attr('stroke', '#f0f0f0')
      .attr('stroke-width', 1);

    // Horizontal grid lines
    this.svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data([0, 1, 2])
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', this.width)
      .attr('y1', (d: number) => this.yScale(d))
      .attr('y2', (d: number) => this.yScale(d))
      .attr('stroke', '#f0f0f0')
      .attr('stroke-width', 1);
  }

  private createBubbles(): void {
    const tooltip = d3.select(this.tooltip.nativeElement);

    this.svg.selectAll('.bubble')
      .data(this.breachData)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('cx', (d: BreachData) =>
        this.xScale(this.securityScale[d.securityPosture]) + (Math.random() - 0.5) * 20)
      .attr('cy', (d: BreachData) =>
        this.yScale(this.impactScale[d.impactLevel]) + (Math.random() - 0.5) * 20)
      .attr('r', (d: BreachData) => this.sizeScale(d.recordsAffected))
      .attr('fill', (d: BreachData) => this.colorScale(d.breachType))
      .style('stroke', '#fff')
      .style('stroke-width', '2px')
      .style('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: BreachData) => {
        d3.select(event.currentTarget as Element)
          .style('stroke', '#333')
          .style('opacity', 1)
          .style('stroke-width', '3px');

        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${d.company}</strong><br>
            <strong>Industry:</strong> ${d.industry}<br>
            <strong>Breach Type:</strong> ${d.breachType}<br>
            <strong>Security Posture:</strong> ${d.securityPosture}<br>
            <strong>Impact Level:</strong> ${d.impactLevel}<br>
            <strong>Records Affected:</strong> ${d.recordsAffected.toLocaleString()}
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', (event: MouseEvent) => {
        d3.select(event.currentTarget as Element)
          .style('stroke', '#fff')
          .style('opacity', 0.8)
          .style('stroke-width', '2px');

        tooltip.style('visibility', 'hidden');
      });
  }

  private createLegend(): void {
    const legendContainer = d3.select(this.legend.nativeElement);

    // Clear existing legend
    legendContainer.selectAll('*').remove();

    // Breach types legend
    const breachTypesDiv = legendContainer
      .append('div')
      .style('text-align', 'center')
      .style('margin-bottom', '20px');

    breachTypesDiv
      .append('div')
      .style('font-weight', 'bold')
      .style('margin-bottom', '10px')
      .style('color', '#2c3e50')
      .text('Breach Types');

    const legendItemsContainer = breachTypesDiv
      .append('div')
      .style('display', 'flex')
      .style('flex-wrap', 'wrap')
      .style('justify-content', 'center')
      .style('gap', '15px');

    const uniqueBreachTypes = [...new Set(this.breachData.map(d => d.breachType))];

    uniqueBreachTypes.forEach(breachType => {
      const legendItem = legendItemsContainer
        .append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('gap', '5px');

      legendItem
        .append('div')
        .style('width', '12px')
        .style('height', '12px')
        .style('border-radius', '50%')
        .style('background-color', this.colorScale(breachType));

      legendItem
        .append('span')
        .style('font-size', '12px')
        .style('color', '#666')
        .text(breachType);
    });

    // Size legend
    legendContainer
      .append('div')
      .style('text-align', 'center')
      .style('font-weight', 'bold')
      .style('color', '#2c3e50')
      .text('Bubble Size = Records Affected');
  }

  // Public method to update data
  public updateData(newData: BreachData[]): void {
    this.breachData = newData;
    this.svg.remove();
    this.createChart();
  }



  // Child views

  private createHeatmap(): void {
    const margin = { top: 40, right: 100, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select(this.heatmap.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create matrix data
    const matrixData: MatrixData[] = [];
    this.securityLevels.forEach((security, i) => {
      this.impactLevels.forEach((impact, j) => {
        const count = this.breachData.filter(d =>
          d.securityPosture === security && d.impactLevel === impact
        ).length;
        const avgRecords = d3.mean(this.breachData.filter(d =>
          d.securityPosture === security && d.impactLevel === impact
        ), d => d.recordsAffected) || 0;

        matrixData.push({
          security,
          impact,
          count,
          avgRecords,
          x: i,
          y: j
        });
      });
    });

    const xScale = d3.scaleBand()
      .domain(this.securityLevels)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(this.impactLevels)
      .range([0, height])
      .padding(0.1);

    const colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([0, d3.max(matrixData, d => d.count)]);

    // Create heatmap cells
    svg.selectAll('.heatmap-cell')
      .data(matrixData)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', d => xScale(d.security)!)
      .attr('y', d => yScale(d.impact)!)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.count))
      .attr('stroke', '#fff')
      .on('mouseover', (event: MouseEvent, d: MatrixData) => {
        this.showTooltip(event, `
          <strong>${d.security} security, ${d.impact} impact</strong><br>
          Incidents: ${d.count}<br>
          Avg Records: ${Math.round(d.avgRecords).toLocaleString()}
        `);
      })
      .on('mouseout', () => this.hideTooltip());

    // Add text labels
    svg.selectAll('.cell-text')
      .data(matrixData)
      .enter()
      .append('text')
      .attr('class', 'cell-text')
      .attr('x', d => xScale(d.security)! + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.impact)! + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', d => d.count > 2 ? 'white' : 'black')
      .text(d => d.count);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    // Add labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text('Security Posture');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text('Impact Level');

    // Add legend
    const legendWidth = 100;
    const legendHeight = 20;
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 0)`);

    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(matrixData, d => d.count)])
      .range([0, legendWidth]);

    legend.append('g')
      .selectAll('rect')
      .data(d3.range(0, 1, 0.1))
      .enter().append('rect')
      .attr('x', d => legendScale(d * d3.max(matrixData, d => d.count)))
      .attr('y', 0)
      .attr('width', legendWidth / 10)
      .attr('height', legendHeight)
      .attr('fill', d => colorScale(d * d3.max(matrixData, d => d.count)));

    legend.append('text')
      .attr('x', legendWidth / 5.5)
      .attr('y', legendHeight + 20)
      .attr('text-anchor', 'middle')
      .text('Incident Count');
  }

  private createForceLayout(): void {
    const width = 600;
    const height = 400;
    const margin = { top: 60, right: 40, bottom: 60, left: 80 }; // Increased margins

    // Clear previous content
    this.forceLayout.nativeElement.innerHTML = '';

    // Create main SVG
    const svg = d3.select(this.forceLayout.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // Create main group for the chart
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('class', 'force-simulation');

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create simulation with adjusted forces
    const simulation = d3.forceSimulation(this.breachData as any)
      .force('x', d3.forceX((d: any) => {
        const securityScale = {
          weak: width * 0.2,
          moderate: width * 0.5,
          strong: width * 0.8
        } as any;
        return securityScale[d.securityPosture];
      }).strength(0.8))
      .force('y', d3.forceY((d: any) => {
        const impactScale = {
          minor: height * 0.8,
          moderate: height * 0.5,
          major: height * 0.2
        } as any;
        return impactScale[d.impactLevel];
      }).strength(0.8))
      .force('collision', d3.forceCollide((d: any) => Math.sqrt(d.recordsAffected / 1000) + 5))
      .force('charge', d3.forceManyBody().strength(-50));

    // Add background grid lines (optional - helps with positioning)
    const xPositions = [width * 0.2, width * 0.5, width * 0.8];
    const yPositions = [height * 0.2, height * 0.5, height * 0.8];

    // Vertical grid lines
    chartGroup.selectAll('.grid-line-vertical')
      .data(xPositions)
      .enter()
      .append('line')
      .attr('class', 'grid-line-vertical')
      .attr('x1', d => d)
      .attr('x2', d => d)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Horizontal grid lines
    chartGroup.selectAll('.grid-line-horizontal')
      .data(yPositions)
      .enter()
      .append('line')
      .attr('class', 'grid-line-horizontal')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => d)
      .attr('y2', d => d)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Create bubbles
    const nodes = chartGroup.selectAll('.bubble')
      .data(this.breachData)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('r', (d: any) => Math.sqrt(d.recordsAffected / 1000) + 3)
      .attr('fill', (d: any) => colorScale(d.breachType))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('opacity', 0.8)
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.showTooltip(event, `
          <strong>${d.company}</strong><br>
          Security: ${d.securityPosture}<br>
          Impact: ${d.impactLevel}<br>
          Records: ${d.recordsAffected.toLocaleString()}
        `);
      })
      .on('mouseout', () => this.hideTooltip());

    simulation.on('tick', () => {
      nodes
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

    // X-axis labels (Security Posture) - positioned above the chart
    chartGroup.append('text')
      .attr('x', width * 0.2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text('Weak');

    chartGroup.append('text')
      .attr('x', width * 0.5)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text('Moderate');

    chartGroup.append('text')
      .attr('x', width * 0.8)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text('Strong');

    // Y-axis labels (Impact Level) - positioned to the left of the chart
    chartGroup.append('text')
      .attr('x', -20)
      .attr('y', height * 0.2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em') // Vertical centering
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text('Major');

    chartGroup.append('text')
      .attr('x', -20)
      .attr('y', height * 0.5)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text('Moderate');

    chartGroup.append('text')
      .attr('x', -20)
      .attr('y', height * 0.8)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text('Minor');

    // X-axis title
    chartGroup.append('text')
      .attr('x', width / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text('Security Posture');

    // Y-axis title
    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text('Impact Level');

    // Add chart border (optional)
    chartGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);
  }

  private createJitteredScatter(): void {
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(this.jitteredScatter.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const securityScale = { weak: 0, moderate: 1, strong: 2 };
    const impactScale = { minor: 0, moderate: 1, major: 2 };

    const xScale = d3.scaleLinear().domain([-0.5, 2.5]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-0.5, 2.5]).range([height, 0]);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Smart jittering with collision detection
    const positions: any[] = [];
    const jitteredData = this.breachData.map(d => {
      let x: any, y: any, attempts = 0;
      const baseX = securityScale[d.securityPosture];
      const baseY = impactScale[d.impactLevel];
      const radius = Math.sqrt(d.recordsAffected / 2000) + 5;

      do {
        const jitterX = (Math.random() - 0.5) * 0.6;
        const jitterY = (Math.random() - 0.5) * 0.6;
        x = baseX + jitterX;
        y = baseY + jitterY;
        attempts++;
      } while (attempts < 50 && positions.some(pos =>
        Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2) < (pos.radius + radius) / 50
      ));

      positions.push({ x, y, radius });
      return { ...d, jitterX: x, jitterY: y, radius };
    });

    // Create bubbles
    svg.selectAll('.bubble')
      .data(jitteredData)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('cx', (d: any) => xScale(d.jitterX))
      .attr('cy', (d: any) => yScale(d.jitterY))
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => colorScale(d.breachType))
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.showTooltip(event, `
          <strong>${d.company}</strong><br>
          Security: ${d.securityPosture}<br>
          Impact: ${d.impactLevel}<br>
          Records: ${d.recordsAffected.toLocaleString()}
        `);
      })
      .on('mouseout', () => this.hideTooltip());

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickValues([0, 1, 2])
        .tickFormat(d => ['Weak', 'Moderate', 'Strong'][d as number]));

    svg.append('g')
      .call(d3.axisLeft(yScale)
        .tickValues([0, 1, 2])
        .tickFormat(d => ['Minor', 'Moderate', 'Major'][d as number]));
  }

  private createSunburst(): void {
    const width = 600;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 10;

    const svg = d3.select(this.sunburst.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .attr('class', 'sunburst');

    // Create hierarchical data
    const hierarchyData = {
      name: 'root',
      children: this.securityLevels.map(security => ({
        name: security,
        children: this.impactLevels.map(impact => ({
          name: impact,
          children: this.breachData
            .filter(d => d.securityPosture === security && d.impactLevel === impact)
            .map(d => ({
              name: d.breachType,
              value: d.recordsAffected,
              data: d
            }))
        })).filter((d: any) => d.children.length > 0)
      })).filter((d: any) => d.children.length > 0)
    };

    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value || 0);

    const partition = d3.partition()
      .size([2 * Math.PI, radius]);

    partition(root as any);

    const arc = d3.arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .innerRadius((d: any) => d.y0)
      .outerRadius((d: any) => d.y1);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll('path')
      .data(root.descendants())
      .enter()
      .append('path')
      .attr('d', (d: any) => arc(d))
      .attr('fill', (d: any) => colorScale(d.data.name))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', (event: MouseEvent, d: any) => {
        if (d.data.data) {
          this.showTooltip(event, `
            <strong>${d.data.data.company}</strong><br>
            Security: ${d.data.data.securityPosture}<br>
            Impact: ${d.data.data.impactLevel}<br>
            Breach: ${d.data.data.breachType}<br>
            Records: ${d.data.data.recordsAffected.toLocaleString()}
          `);
        }
      })
      .on('mouseout', () => this.hideTooltip());
  }

  private createViolinPlot(): void {
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(this.violinPlot.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(this.securityLevels)
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(this.breachData, d => d.recordsAffected) as [number, number])
      .range([height, 0]);

    // Create violin shapes for each security level
    this.securityLevels.forEach(security => {
      const data = this.breachData.filter(d => d.securityPosture === security);
      const x = xScale(security)!;
      const violinWidth = xScale.bandwidth();

      // Simple histogram for violin shape
      const bins = d3.histogram()
        .domain(yScale.domain() as any)
        .thresholds(8)
        (data.map(d => d.recordsAffected));

      const maxBinLength = d3.max(bins, d => d.length) || 0;

      bins.forEach((bin: any) => {
        const binHeight = yScale(bin.x0!) - yScale(bin.x1!);
        const binWidth = (bin.length / maxBinLength) * violinWidth / 2;

        // Left side of violin
        svg.append('rect')
          .attr('x', x + violinWidth / 2 - binWidth)
          .attr('y', yScale(bin.x1!))
          .attr('width', binWidth)
          .attr('height', binHeight)
          .attr('fill', '#3498db')
          .attr('opacity', 0.7);

        // Right side of violin
        svg.append('rect')
          .attr('x', x + violinWidth / 2)
          .attr('y', yScale(bin.x1!))
          .attr('width', binWidth)
          .attr('height', binHeight)
          .attr('fill', '#3498db')
          .attr('opacity', 0.7);
      });

      // Add individual points
      data.forEach((d, i) => {
        svg.append('circle')
          .attr('cx', x + violinWidth / 2 + (Math.random() - 0.5) * violinWidth * 0.3)
          .attr('cy', yScale(d.recordsAffected))
          .attr('r', 3)
          .attr('fill', '#e74c3c')
          .attr('opacity', 0.8)
          .on('mouseover', (event: MouseEvent) => {
            this.showTooltip(event, `
              <strong>${d.company}</strong><br>
              Security: ${d.securityPosture}<br>
              Records: ${d.recordsAffected.toLocaleString()}
            `);
          })
          .on('mouseout', () => this.hideTooltip());
      });
    });

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    // Add labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text('Security Posture');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text('Records Affected');
  }

  private createTreemap(): void {

    const impactScale = {
      major: 5,
      moderate: 3,
      minor: 1
    } as any;

    // Color scale for breach types
    // const colorScale = d3.scale(d3.schemeAccent)
    //   // .domain(["Data Breach", "Akira Ransomware", "Beast Ransomware", "Beast Ransomware Gang"])
    //   .domain(this.breachData.map((item: any) => item.company))
    const colorScale = d3.scaleSequential((t) =>
      d3.interpolateViridis(t * 1 + 0.1)).domain([0, this.breachData.length]);

    // Nest data hierarchically: industry -> company
    const root = d3.hierarchy({
      name: "root",
      children: this.breachData.map(d => ({
        name: d.industry,
        children: [{
          name: d.company,
          breachType: d.breachType,
          value: impactScale[d.impactLevel] || 1
        }]
      }))
    })
      .sum((d: any) => d.value || 0)
      .sort((a, b) => b.value - a.value) as any;

    // Create treemap layout
    const treemap = d3.treemap()
      .size([800, 600])
      .padding(1);

    treemap(root);

    // Draw the treemap
    const svg = d3.select(this.treemapContainer?.nativeElement)
      .append('svg')
      .attr('width', 800)
      .attr('height', 600);

    /*  const chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .attr('class', 'force-simulation'); */

    const tiles = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .attr('class', 'treemap');

    tiles.append('rect')
      .attr('class', 'tile')
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', (d: any, i) => colorScale(i) as any)
      .append('title')
      .text((d: any) => `${d.data.name}\nBreach: ${d.data.breachType}\nImpact: Major`);

    // Add labels
    tiles.append('text')
      .attr('class', 'label')
      .attr('x', (d: any) => (d.x1 - d.x0) / 2)
      .attr('y', (d: any) => (d.y1 - d.y0) / 2)
      .text((d: any) => d.data.name.split(' ')[0])
      .style('display', (d: any) => (d.x1 - d.x0 > 50 && d.y1 - d.y0 > 30) ? 'block' : 'none')
      .style('fill', 'white')
      .style('font-size', (d: any) => `${Math.min(16, (d.x1 - d.x0))}px`)
      .style('display', (d: any) => (d.x1 - d.x0 > 50 && d.y1 - d.y0 > 30) ? 'block' : 'none')

    // Add legend
    const legend = d3.select(this.treemapContainer.nativeElement);
    const breachTypes = Array.from(new Set(this.breachData.map(d => d.breachType)));

    breachTypes.forEach((type, i) => {
      legend.append('div')
        .attr('class', 'treemap-legend-item')
        .html(`<div class="legend-color" style="background-color:${colorScale(i)}"></div>${type}`);
    });
  }

  private showTooltip(event: MouseEvent, content: string): void {
    const tooltip = d3.select(this.tooltip.nativeElement);
    tooltip.style('visibility', 'visible')
      .html(content)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 10}px`);
  }

  private hideTooltip(): void {
    d3.select(this.tooltip.nativeElement).style('visibility', 'hidden');
  }
}