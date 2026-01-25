// top-ads-detail.component.ts
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as d3 from 'd3';

interface DetailMetric {
  label: string;
  value: string | number;
  change?: number;
  color?: string;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

@Component({
  selector: 'top-ads-detail',
  templateUrl: './top-ads-detail.component.html',
  styleUrls: ['./top-ads-detail.component.less']
})
export class TopAdsDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainChart', { static: true }) mainChartRef!: ElementRef;
  @ViewChild('secondaryChart', { static: true }) secondaryChartRef!: ElementRef;
  @ViewChild('tertiaryChart', { static: true }) tertiaryChartRef!: ElementRef;
  @ViewChild('tooltip', { static: true }) tooltip!: ElementRef;

  type: string = '';
  id: string = '';
  name: string = '';

  metrics: DetailMetric[] = [];
  breadcrumbs: { label: string; path?: string }[] = [];

  private resizeListener: any;

  // Comprehensive advertising data (same structure as main component for consistency)
  private allData = this.generateDetailData();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.type = params['type'] || '';
      this.id = params['id'] || '';
      this.name = params['name'] || '';

      this.buildBreadcrumbs();
      this.loadMetrics();

      if (this.mainChartRef) {
        this.renderCharts();
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderCharts(), 100);

    this.resizeListener = () => this.renderCharts();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  goBack(): void {
    this.router.navigate(['/topads']);
  }

  navigateTo(path: string): void {
    if (path) {
      this.router.navigate([path]);
    }
  }

  private buildBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Dashboard', path: '/topads' },
      { label: this.formatType(this.type) },
      { label: this.name }
    ];
  }

  private formatType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'channel': 'Channel Analytics',
      'campaign': 'Campaign Details',
      'audience': 'Audience Segment',
      'device': 'Device Analytics',
      'date': 'Daily Analytics',
      'metric': 'Metric Analysis',
      'funnel_stage': 'Funnel Stage'
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  private loadMetrics(): void {
    // Generate contextual metrics based on type
    switch (this.type) {
      case 'channel':
        this.metrics = this.getChannelMetrics();
        break;
      case 'campaign':
        this.metrics = this.getCampaignMetrics();
        break;
      case 'audience':
        this.metrics = this.getAudienceMetrics();
        break;
      case 'device':
        this.metrics = this.getDeviceMetrics();
        break;
      default:
        this.metrics = this.getDefaultMetrics();
    }
  }

  private getChannelMetrics(): DetailMetric[] {
    const channelData = this.allData.channels.find((c: { id: string; name: string | string[]; }) => c.id === this.id || c.name.includes(this.name));
    if (channelData) {
      return [
        { label: 'Total Spend', value: `$${(channelData.spend / 1000).toFixed(0)}K`, change: 12.5, color: '#e74c3c' },
        { label: 'Impressions', value: `${(channelData.impressions / 1000000).toFixed(1)}M`, change: 8.3, color: '#3498db' },
        { label: 'Clicks', value: `${(channelData.clicks / 1000).toFixed(0)}K`, change: 15.2, color: '#00ACC1' },
        { label: 'Conversions', value: `${(channelData.conversions / 1000).toFixed(1)}K`, change: 22.1, color: '#2ecc71' },
        { label: 'Revenue', value: `$${(channelData.revenue / 1000).toFixed(0)}K`, change: 18.7, color: '#f39c12' },
        { label: 'ROAS', value: `${channelData.roas.toFixed(2)}x`, change: 5.3, color: '#1abc9c' },
        { label: 'CPA', value: `$${channelData.cpa.toFixed(2)}`, change: -8.1, color: '#e67e22' },
        { label: 'CTR', value: `${channelData.ctr.toFixed(2)}%`, change: 3.2, color: '#34495e' }
      ];
    }
    return this.getDefaultMetrics();
  }

  private getCampaignMetrics(): DetailMetric[] {
    let campaignData: any = null;
    for (const channel of this.allData.channels) {
      campaignData = channel.campaigns.find((c: any) => c.id === this.id || c.name.includes(this.name));
      if (campaignData) break;
    }

    if (campaignData) {
      return [
        { label: 'Budget', value: `$${(campaignData.totalBudget / 1000).toFixed(0)}K`, color: '#95a5a6' },
        { label: 'Spend', value: `$${(campaignData.spend / 1000).toFixed(0)}K`, change: 15.2, color: '#e74c3c' },
        { label: 'Impressions', value: `${(campaignData.impressions / 1000000).toFixed(1)}M`, change: 10.5, color: '#3498db' },
        { label: 'Reach', value: `${(campaignData.reach / 1000000).toFixed(1)}M`, change: 8.2, color: '#00ACC1' },
        { label: 'Frequency', value: campaignData.frequency.toFixed(2), color: '#0277BD' },
        { label: 'Conversions', value: campaignData.conversions.toLocaleString(), change: 25.3, color: '#2ecc71' },
        { label: 'Revenue', value: `$${(campaignData.revenue / 1000).toFixed(0)}K`, change: 20.1, color: '#f39c12' },
        { label: 'ROAS', value: `${campaignData.roas.toFixed(2)}x`, change: 12.5, color: '#1abc9c' },
        { label: 'CPA', value: `$${campaignData.cpa.toFixed(2)}`, change: -15.3, color: '#e67e22' },
        { label: 'CTR', value: `${campaignData.ctr.toFixed(2)}%`, change: 5.8, color: '#34495e' }
      ];
    }
    return this.getDefaultMetrics();
  }

  private getAudienceMetrics(): DetailMetric[] {
    const audienceData = this.allData.audienceSegments.find((a: { id: string; name: string | string[]; }) => a.id === this.id || a.name.includes(this.name));
    if (audienceData) {
      return [
        { label: 'Audience Size', value: `${(audienceData.size / 1000000).toFixed(1)}M`, change: 5.2, color: '#3498db' },
        { label: 'Total Spend', value: `$${(audienceData.spend / 1000).toFixed(0)}K`, change: 12.3, color: '#e74c3c' },
        { label: 'Conversions', value: audienceData.conversions.toLocaleString(), change: 18.5, color: '#2ecc71' },
        { label: 'CPA', value: `$${audienceData.cpa.toFixed(2)}`, change: -10.2, color: '#e67e22' },
        { label: 'LTV', value: `$${audienceData.ltv}`, change: 8.7, color: '#00ACC1' },
        { label: 'Age Group', value: audienceData.demographics.ageGroup, color: '#34495e' },
        { label: 'Income Level', value: audienceData.demographics.income, color: '#1abc9c' }
      ];
    }
    return this.getDefaultMetrics();
  }

  private getDeviceMetrics(): DetailMetric[] {
    const deviceData = this.allData.deviceData.filter((d: { device: string; }) => d.device.toLowerCase() === this.id.toLowerCase());
    if (deviceData.length > 0) {
      const totalSpend = d3.sum(deviceData, (d: any) => d.spend);
      const totalConversions = d3.sum(deviceData, (d: any) => d.conversions);
      const totalImpressions = d3.sum(deviceData, (d: any) => d.impressions);
      const totalClicks = d3.sum(deviceData, (d: any) => d.clicks);

      return [
        { label: 'Total Spend', value: `$${(totalSpend / 1000).toFixed(0)}K`, change: 14.2, color: '#e74c3c' },
        { label: 'Impressions', value: `${(totalImpressions / 1000000).toFixed(1)}M`, change: 9.8, color: '#3498db' },
        { label: 'Clicks', value: `${(totalClicks / 1000).toFixed(0)}K`, change: 11.5, color: '#00ACC1' },
        { label: 'Conversions', value: totalConversions.toLocaleString(), change: 20.3, color: '#2ecc71' },
        { label: 'CTR', value: `${((totalClicks / totalImpressions) * 100).toFixed(2)}%`, change: 2.1, color: '#f39c12' },
        { label: 'CPA', value: `$${(totalSpend / totalConversions).toFixed(2)}`, change: -5.8, color: '#e67e22' },
        { label: 'Share of Spend', value: `${((totalSpend / 2847500) * 100).toFixed(1)}%`, color: '#1abc9c' }
      ];
    }
    return this.getDefaultMetrics();
  }

  private getDefaultMetrics(): DetailMetric[] {
    return [
      { label: 'Total Spend', value: '$2.85M', change: 12.5, color: '#e74c3c' },
      { label: 'Impressions', value: '458.8M', change: 8.3, color: '#3498db' },
      { label: 'Conversions', value: '284.8K', change: 22.1, color: '#2ecc71' },
      { label: 'Revenue', value: '$14.24M', change: 18.7, color: '#f39c12' },
      { label: 'ROAS', value: '5.0x', change: 5.3, color: '#1abc9c' },
      { label: 'CPA', value: '$10.00', change: -8.1, color: '#e67e22' }
    ];
  }

  private renderCharts(): void {
    this.clearCharts();

    switch (this.type) {
      case 'channel':
        this.renderChannelCharts();
        break;
      case 'campaign':
        this.renderCampaignCharts();
        break;
      case 'audience':
        this.renderAudienceCharts();
        break;
      case 'device':
        this.renderDeviceCharts();
        break;
      default:
        this.renderDefaultCharts();
    }
  }

  private clearCharts(): void {
    d3.select(this.mainChartRef.nativeElement).selectAll('*').remove();
    d3.select(this.secondaryChartRef.nativeElement).selectAll('*').remove();
    d3.select(this.tertiaryChartRef.nativeElement).selectAll('*').remove();
  }

  private renderChannelCharts(): void {
    const channelData = this.allData.channels.find((c: { id: string; name: string | string[]; }) => c.id === this.id || c.name.includes(this.name));
    if (!channelData) return;

    // Main Chart: Campaign Performance Bar Chart
    this.renderCampaignBars(channelData.campaigns);

    // Secondary Chart: Performance over time
    this.renderPerformanceTrend();

    // Tertiary Chart: Metrics breakdown
    this.renderMetricsRadar(channelData);
  }

  private renderCampaignBars(campaigns: any[]): void {
    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 30, bottom: 60, left: 100 };

    const svg = d3.select(this.mainChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Campaign Performance Breakdown');

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(campaigns, (d: any) => d.roas) || 10])
      .range([0, plotWidth]);

    const yScale = d3.scaleBand()
      .domain(campaigns.map((d: any) => d.name.slice(0, 25)))
      .range([0, plotHeight])
      .padding(0.2);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([3, 8]);

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '10px');

    g.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}x`));

    g.selectAll('.bar')
      .data(campaigns)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d: any) => yScale(d.name.slice(0, 25)) || 0)
      .attr('width', (d: any) => xScale(d.roas))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d: any) => colorScale(d.roas))
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.showTooltip(event, `
          <strong>${d.name}</strong><br/>
          ROAS: ${d.roas.toFixed(2)}x<br/>
          Spend: $${(d.spend / 1000).toFixed(0)}K<br/>
          Conversions: ${d.conversions.toLocaleString()}
        `);
      })
      .on('mouseout', () => this.hideTooltip())
      .on('click', (event: MouseEvent, d: any) => {
        this.router.navigate(['/topads-detail'], {
          queryParams: { type: 'campaign', id: d.id, name: d.name }
        });
      });

    g.selectAll('.bar-label')
      .data(campaigns)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d: any) => xScale(d.roas) + 5)
      .attr('y', (d: any) => (yScale(d.name.slice(0, 25)) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text((d: any) => `${d.roas.toFixed(1)}x`);
  }

  private renderPerformanceTrend(): void {
    const width = 550;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 40, left: 60 };

    const svg = d3.select(this.secondaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Daily Performance Trend');

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Generate trend data
    const trendData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      trendData.push({
        date: date,
        spend: 8000 + Math.random() * 4000,
        conversions: 800 + Math.random() * 400,
        roas: 4.5 + Math.random() * 2
      });
    }

    const xScale = d3.scaleTime()
      .domain(d3.extent(trendData, d => d.date) as [Date, Date])
      .range([0, plotWidth]);

    const yScaleSpend = d3.scaleLinear()
      .domain([0, d3.max(trendData, d => d.spend) || 1])
      .range([plotHeight, 0]);

    const yScaleRoas = d3.scaleLinear()
      .domain([3, 7])
      .range([plotHeight, 0]);

    // Area for spend
    const area = d3.area<any>()
      .x(d => xScale(d.date))
      .y0(plotHeight)
      .y1(d => yScaleSpend(d.spend))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(trendData)
      .attr('d', area)
      .attr('fill', 'rgba(52, 152, 219, 0.3)')
      .attr('stroke', '#3498db')
      .attr('stroke-width', 2);

    // Line for ROAS
    const line = d3.line<any>()
      .x(d => xScale(d.date))
      .y(d => yScaleRoas(d.roas))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(trendData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 2);

    g.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat('%b %d') as any));

    g.append('g')
      .call(d3.axisLeft(yScaleSpend).tickFormat(d => `$${(d as number) / 1000}K`));

    g.append('g')
      .attr('transform', `translate(${plotWidth}, 0)`)
      .call(d3.axisRight(yScaleRoas).tickFormat(d => `${d}x`));

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${plotWidth - 100}, -10)`);

    legend.append('line')
      .attr('x1', 0).attr('y1', 0).attr('x2', 20).attr('y2', 0)
      .attr('stroke', '#3498db').attr('stroke-width', 2);
    legend.append('text')
      .attr('x', 25).attr('y', 4).attr('font-size', '10px').text('Spend');

    legend.append('line')
      .attr('x1', 60).attr('y1', 0).attr('x2', 80).attr('y2', 0)
      .attr('stroke', '#e74c3c').attr('stroke-width', 2);
    legend.append('text')
      .attr('x', 85).attr('y', 4).attr('font-size', '10px').text('ROAS');
  }

  private renderMetricsRadar(data: any): void {
    const width = 400;
    const height = 350;
    const radius = Math.min(width, height) / 2 - 60;

    const svg = d3.select(this.tertiaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Performance Radar');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2 + 10})`);

    const metrics = [
      { axis: 'ROAS', value: data.roas / 8 },
      { axis: 'CTR', value: data.ctr / 3 },
      { axis: 'CPA Efficiency', value: 1 - (data.cpa / 15) },
      { axis: 'Quality Score', value: data.qualityScore / 10 },
      { axis: 'Reach', value: 0.75 },
      { axis: 'Conversion Rate', value: 0.65 }
    ];

    const angleSlice = (Math.PI * 2) / metrics.length;

    // Draw concentric circles
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      g.append('circle')
        .attr('r', (radius / levels) * i)
        .attr('fill', 'none')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);
    }

    // Draw axes
    metrics.forEach((m, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', x).attr('y2', y)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', Math.cos(angle) * (radius + 20))
        .attr('y', Math.sin(angle) * (radius + 20))
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(m.axis);
    });

    // Draw data polygon
    const radarLine = d3.lineRadial<any>()
      .radius(d => d.value * radius)
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    g.append('path')
      .datum(metrics)
      .attr('d', radarLine as any)
      .attr('fill', 'rgba(46, 204, 113, 0.3)')
      .attr('stroke', '#2ecc71')
      .attr('stroke-width', 2);

    // Draw data points
    metrics.forEach((m, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * (m.value * radius);
      const y = Math.sin(angle) * (m.value * radius);

      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 5)
        .attr('fill', '#2ecc71')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    });
  }

  private renderCampaignCharts(): void {
    let campaignData: any = null;
    for (const channel of this.allData.channels) {
      campaignData = channel.campaigns.find((c: any) => c.id === this.id || c.name.includes(this.name));
      if (campaignData) break;
    }

    if (!campaignData) return;

    // Main: Ad Group Performance
    this.renderAdGroupChart(campaignData.adGroups);

    // Secondary: Creative Performance
    const allCreatives = campaignData.adGroups.flatMap((ag: any) => ag.creatives);
    this.renderCreativePerformance(allCreatives);

    // Tertiary: Objective Progress
    this.renderObjectiveProgress(campaignData);
  }

  private renderAdGroupChart(adGroups: any[]): void {
    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 30, bottom: 60, left: 120 };

    const svg = d3.select(this.mainChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Ad Group Performance');

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const maxSpend = d3.max(adGroups, (d: any) => d.spend) || 1;

    const xScale = d3.scaleLinear()
      .domain([0, maxSpend])
      .range([0, plotWidth]);

    const yScale = d3.scaleBand()
      .domain(adGroups.map((d: any) => d.name.slice(0, 20)))
      .range([0, plotHeight])
      .padding(0.3);

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '10px');

    g.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `$${(d as number) / 1000}K`));

    // Stacked bars for spend and conversions value
    adGroups.forEach((ag: any, i: number) => {
      const y = yScale(ag.name.slice(0, 20)) || 0;

      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', xScale(ag.spend))
        .attr('height', yScale.bandwidth())
        .attr('fill', '#3498db')
        .attr('rx', 4);

      g.append('text')
        .attr('x', xScale(ag.spend) + 5)
        .attr('y', y + yScale.bandwidth() / 2 + 4)
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(`$${(ag.spend / 1000).toFixed(0)}K | ${ag.conversions} conv`);
    });
  }

  private renderCreativePerformance(creatives: any[]): void {
    const width = 550;
    const height = 350;
    const margin = { top: 40, right: 80, bottom: 60, left: 60 };

    const svg = d3.select(this.secondaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Creative Performance Matrix');

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(creatives, (d: any) => d.ctr) || 3])
      .range([0, plotWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(creatives, (d: any) => d.cvr) || 10])
      .range([plotHeight, 0]);

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(creatives, (d: any) => d.spend) || 1])
      .range([5, 30]);

    const typeColors: { [key: string]: string } = {
      'video': '#e74c3c',
      'display': '#3498db',
      'native': '#2ecc71',
      'rich_media': '#00ACC1'
    };

    g.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}%`))
      .append('text')
      .attr('x', plotWidth / 2)
      .attr('y', 40)
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .text('Click-Through Rate (CTR)');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -plotHeight / 2)
      .attr('y', -45)
      .attr('fill', '#333')
      .attr('font-size', '12px')
      .text('Conversion Rate (CVR)');

    g.selectAll('.bubble')
      .data(creatives)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('cx', (d: any) => xScale(d.ctr))
      .attr('cy', (d: any) => yScale(d.cvr))
      .attr('r', (d: any) => sizeScale(d.spend))
      .attr('fill', (d: any) => typeColors[d.type] || '#999')
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.showTooltip(event, `
          <strong>${d.name}</strong><br/>
          Type: ${d.type}<br/>
          CTR: ${d.ctr.toFixed(2)}%<br/>
          CVR: ${d.cvr.toFixed(2)}%<br/>
          ROAS: ${d.roas.toFixed(2)}x<br/>
          Spend: $${(d.spend / 1000).toFixed(0)}K
        `);
      })
      .on('mouseout', () => this.hideTooltip());

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 70}, 50)`);

    ['video', 'display', 'native', 'rich_media'].forEach((type, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      g.append('circle')
        .attr('r', 6)
        .attr('fill', typeColors[type]);

      g.append('text')
        .attr('x', 12)
        .attr('y', 4)
        .attr('font-size', '10px')
        .text(type.replace('_', ' '));
    });
  }

  private renderObjectiveProgress(campaign: any): void {
    const width = 400;
    const height = 350;

    const svg = d3.select(this.tertiaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Campaign Status');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Budget utilization donut
    const budgetPercent = (campaign.spend / campaign.totalBudget) * 100;

    const arc = d3.arc<any>()
      .innerRadius(60)
      .outerRadius(90);

    const pie = d3.pie<number>()
      .value(d => d)
      .sort(null);

    const data = [campaign.spend, campaign.totalBudget - campaign.spend];
    const colors = ['#2ecc71', '#ecf0f1'];

    g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc as any)
      .attr('fill', (d, i) => colors[i]);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2ecc71')
      .text(`${budgetPercent.toFixed(0)}%`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 18)
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text('Budget Used');

    // Status info
    const infoY = 120;
    const info = [
      { label: 'Objective', value: campaign.objective.toUpperCase() },
      { label: 'Status', value: campaign.status.toUpperCase() },
      { label: 'End Date', value: campaign.endDate }
    ];

    info.forEach((item, i) => {
      g.append('text')
        .attr('x', 0)
        .attr('y', infoY + i * 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(`${item.label}: `)
        .append('tspan')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(item.value);
    });
  }

  private renderAudienceCharts(): void {
    const audienceData = this.allData.audienceSegments.find((a: { id: string; name: string | string[]; }) => a.id === this.id || a.name.includes(this.name));
    if (!audienceData) {
      this.renderDefaultCharts();
      return;
    }

    this.renderAudienceComparison(audienceData);
    this.renderDemographicsChart(audienceData);
    this.renderLTVProjection(audienceData);
  }

  private renderAudienceComparison(audience: any): void {
    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };

    const svg = d3.select(this.mainChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Audience Comparison');

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Compare this audience with others
    const audiences = this.allData.audienceSegments;

    const xScale = d3.scaleBand()
      .domain(audiences.map((a: { name: string | any[]; }) => a.name.slice(0, 15)))
      .range([0, plotWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(audiences, (a: any) => a.ltv) || 1000] as any)
      .range([plotHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('font-size', '9px');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d}`));

    g.selectAll('.bar')
      .data(audiences)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => xScale(d.name.slice(0, 15)) || 0)
      .attr('y', (d: any) => yScale(d.ltv))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => plotHeight - yScale(d.ltv))
      .attr('fill', (d: any) => d.id === audience.id ? '#e74c3c' : '#3498db')
      .attr('rx', 4)
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.showTooltip(event, `
          <strong>${d.name}</strong><br/>
          LTV: $${d.ltv}<br/>
          CPA: $${d.cpa.toFixed(2)}<br/>
          Size: ${(d.size / 1000000).toFixed(1)}M
        `);
      })
      .on('mouseout', () => this.hideTooltip());
  }

  private renderDemographicsChart(audience: any): void {
    const width = 550;
    const height = 350;

    const svg = d3.select(this.secondaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Demographics Breakdown');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Simulated demographic data
    const demoData = [
      { label: '18-24', value: 15, color: '#3498db' },
      { label: '25-34', value: 35, color: '#2ecc71' },
      { label: '35-44', value: 28, color: '#e74c3c' },
      { label: '45-54', value: 15, color: '#f39c12' },
      { label: '55+', value: 7, color: '#607D8B' }
    ];

    const pie = d3.pie<any>().value(d => d.value).sort(null);
    const arc = d3.arc<any>().innerRadius(0).outerRadius(100);
    const labelArc = d3.arc<any>().innerRadius(110).outerRadius(110);

    const arcs = g.selectAll('.arc')
      .data(pie(demoData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => d.data.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    arcs.append('text')
      .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .text((d: any) => `${d.data.label}: ${d.data.value}%`);

    // Info box
    const infoBox = svg.append('g')
      .attr('transform', `translate(20, ${height - 80})`);

    infoBox.append('rect')
      .attr('width', width - 40)
      .attr('height', 60)
      .attr('fill', '#f8f9fa')
      .attr('rx', 8);

    infoBox.append('text')
      .attr('x', 15)
      .attr('y', 25)
      .attr('font-size', '12px')
      .text(`Age Group: ${audience.demographics.ageGroup} | Gender: ${audience.demographics.gender}`);

    infoBox.append('text')
      .attr('x', 15)
      .attr('y', 45)
      .attr('font-size', '12px')
      .text(`Income Level: ${audience.demographics.income}`);
  }

  private renderLTVProjection(audience: any): void {
    const width = 400;
    const height = 350;
    const margin = { top: 40, right: 20, bottom: 40, left: 50 };

    const svg = d3.select(this.tertiaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('LTV Projection');

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // LTV projection over 12 months
    const ltvData = [];
    let cumulative = 0;
    for (let i = 1; i <= 12; i++) {
      cumulative += audience.ltv * (1 - Math.exp(-0.3 * i)) / 2;
      ltvData.push({ month: i, ltv: cumulative });
    }

    const xScale = d3.scaleLinear()
      .domain([1, 12])
      .range([0, plotWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, audience.ltv])
      .range([plotHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale).ticks(12).tickFormat(d => `M${d}`));

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d}`));

    const area = d3.area<any>()
      .x(d => xScale(d.month))
      .y0(plotHeight)
      .y1(d => yScale(d.ltv))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(ltvData)
      .attr('d', area)
      .attr('fill', 'rgba(46, 204, 113, 0.3)')
      .attr('stroke', '#2ecc71')
      .attr('stroke-width', 2);

    // Target line
    g.append('line')
      .attr('x1', 0)
      .attr('y1', yScale(audience.ltv))
      .attr('x2', plotWidth)
      .attr('y2', yScale(audience.ltv))
      .attr('stroke', '#e74c3c')
      .attr('stroke-dasharray', '5,5');

    g.append('text')
      .attr('x', plotWidth - 5)
      .attr('y', yScale(audience.ltv) - 5)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', '#e74c3c')
      .text(`Target: $${audience.ltv}`);
  }

  private renderDeviceCharts(): void {
    this.renderDeviceBreakdown();
    this.renderOsDistribution();
    this.renderDeviceTrends();
  }

  private renderDeviceBreakdown(): void {
    const width = 600;
    const height = 350;

    const svg = d3.select(this.mainChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Device Performance Breakdown');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2 + 20})`);

    const aggregated = d3.rollups(
      this.allData.deviceData,
      v => ({
        spend: d3.sum(v, (d: any) => d.spend),
        conversions: d3.sum(v, d => d.conversions)
      }),
      (d: any) => d.device
    );

    const pie = d3.pie<any>().value(d => d[1].spend).sort(null);
    const arc = d3.arc<any>().innerRadius(50).outerRadius(120);
    const labelArc = d3.arc<any>().innerRadius(130).outerRadius(130);

    const colors = d3.scaleOrdinal<string>()
      .domain(['mobile', 'desktop', 'tablet', 'ctv'])
      .range(['#1976D2', '#43A047', '#E53935', '#00ACC1']);

    const arcs = g.selectAll('.arc')
      .data(pie(aggregated))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => colors(d.data[0]))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', (event: MouseEvent, d: any) => {
        this.showTooltip(event, `
          <strong>${d.data[0].toUpperCase()}</strong><br/>
          Spend: $${(d.data[1].spend / 1000).toFixed(0)}K<br/>
          Conversions: ${d.data[1].conversions.toLocaleString()}
        `);
      })
      .on('mouseout', () => this.hideTooltip());

    arcs.append('text')
      .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text((d: any) => d.data[0]);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text('$2.85M');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 20)
      .attr('font-size', '11px')
      .attr('fill', '#666')
      .text('Total Spend');
  }

  private renderOsDistribution(): void {
    const width = 550;
    const height = 350;
    const margin = { top: 40, right: 30, bottom: 60, left: 80 };

    const svg = d3.select(this.secondaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('OS Distribution');

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const osData = this.allData.deviceData;

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(osData, (d: any) => d.spend) || 1] as any)
      .range([0, plotWidth]);

    const yScale = d3.scaleBand()
      .domain(osData.map((d: { device: any; os: any; }) => `${d.device} - ${d.os}`))
      .range([0, plotHeight])
      .padding(0.2);

    const colors: { [key: string]: string } = {
      'iOS': '#1abc9c',
      'Android': '#3ddc84',
      'Windows': '#0078d4',
      'macOS': '#555',
      'iPadOS': '#a4b0be',
      'Various': '#607D8B'
    };

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '10px');

    g.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `$${(d as number) / 1000}K`));

    g.selectAll('.bar')
      .data(osData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d: any) => yScale(`${d.device} - ${d.os}`) || 0)
      .attr('width', (d: any) => xScale(d.spend))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d: any) => colors[d.os] || '#999')
      .attr('rx', 4);
  }

  private renderDeviceTrends(): void {
    const width = 400;
    const height = 350;

    const svg = d3.select(this.tertiaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Device Type Trends');

    const g = svg.append('g')
      .attr('transform', 'translate(40, 60)');

    // Simulated trend data
    const trends = [
      { device: 'Mobile', current: 60, previous: 55, icon: '📱' },
      { device: 'Desktop', current: 30, previous: 35, icon: '🖥️' },
      { device: 'Tablet', current: 5, previous: 6, icon: '📱' },
      { device: 'CTV', current: 5, previous: 4, icon: '📺' }
    ];

    const barHeight = 50;
    const barWidth = 280;

    trends.forEach((trend, i) => {
      const y = i * (barHeight + 20);

      g.append('text')
        .attr('x', 0)
        .attr('y', y + 15)
        .attr('font-size', '14px')
        .text(`${trend.icon} ${trend.device}`);

      g.append('rect')
        .attr('x', 0)
        .attr('y', y + 25)
        .attr('width', barWidth)
        .attr('height', 15)
        .attr('fill', '#ecf0f1')
        .attr('rx', 4);

      g.append('rect')
        .attr('x', 0)
        .attr('y', y + 25)
        .attr('width', (trend.current / 100) * barWidth)
        .attr('height', 15)
        .attr('fill', '#3498db')
        .attr('rx', 4);

      g.append('text')
        .attr('x', barWidth + 10)
        .attr('y', y + 37)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(`${trend.current}%`);

      const change = trend.current - trend.previous;
      g.append('text')
        .attr('x', barWidth + 50)
        .attr('y', y + 37)
        .attr('font-size', '10px')
        .attr('fill', change >= 0 ? '#2ecc71' : '#e74c3c')
        .text(`${change >= 0 ? '+' : ''}${change}%`);
    });
  }

  private renderDefaultCharts(): void {
    // Default visualization when type is not matched
    this.renderOverviewSummary();
    this.renderTimeSeriesDefault();
    this.renderTopMetrics();
  }

  private renderOverviewSummary(): void {
    const width = 600;
    const height = 350;

    const svg = d3.select(this.mainChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text('Performance Summary');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2 + 20})`);

    const overview = this.allData.overview;
    const data = [
      { label: 'Spend', value: overview.totalSpend, max: 5000000 },
      { label: 'Revenue', value: overview.totalRevenue, max: 20000000 }
    ];

    const pie = d3.pie<any>().value(d => d.value).sort(null);
    const arc = d3.arc<any>().innerRadius(60).outerRadius(100);

    const colors = ['#e74c3c', '#2ecc71'];

    g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => colors[i])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2ecc71')
      .text(`${overview.avgRoas.toFixed(1)}x`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 15)
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text('ROAS');
  }

  private renderTimeSeriesDefault(): void {
    const width = 550;
    const height = 350;
    const margin = { top: 40, right: 30, bottom: 40, left: 60 };

    const svg = d3.select(this.secondaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Recent Performance');

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const data = this.allData.timeSeries.slice(-30);
    const parseDate = d3.timeParse('%Y-%m-%d');
    const parsedData = data.map((d: { date: string; }) => ({ ...d, date: parseDate(d.date)! }));

    const xScale = d3.scaleTime()
      .domain(d3.extent(parsedData, (d: any) => d.date) as [Date, Date])
      .range([0, plotWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.revenue)!] as any)
      .range([plotHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat('%b %d') as any));

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `$${(d as number) / 1000}K`));

    const area = d3.area<any>()
      .x(d => xScale(d.date))
      .y0(plotHeight)
      .y1(d => yScale(d.revenue))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(parsedData)
      .attr('d', area)
      .attr('fill', 'rgba(46, 204, 113, 0.3)')
      .attr('stroke', '#2ecc71')
      .attr('stroke-width', 2);
  }

  private renderTopMetrics(): void {
    const width = 400;
    const height = 350;

    const svg = d3.select(this.tertiaryChartRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Key Metrics');

    const g = svg.append('g')
      .attr('transform', 'translate(30, 50)');

    const metrics = [
      { label: 'Avg CTR', value: '1.5%', trend: '+5.2%', color: '#3498db' },
      { label: 'Avg CPA', value: '$10.00', trend: '-8.1%', color: '#e74c3c' },
      { label: 'ROAS', value: '5.0x', trend: '+12.3%', color: '#2ecc71' },
      { label: 'Viewability', value: '72%', trend: '+3.5%', color: '#00ACC1' }
    ];

    metrics.forEach((metric, i) => {
      const y = i * 70;

      g.append('rect')
        .attr('y', y)
        .attr('width', 340)
        .attr('height', 60)
        .attr('fill', '#f8f9fa')
        .attr('rx', 8)
        .attr('stroke', metric.color)
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', 15)
        .attr('y', y + 25)
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(metric.label);

      g.append('text')
        .attr('x', 15)
        .attr('y', y + 48)
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('fill', metric.color)
        .text(metric.value);

      const trendColor = metric.trend.startsWith('+') ? '#2ecc71' : '#e74c3c';
      g.append('text')
        .attr('x', 310)
        .attr('y', y + 38)
        .attr('text-anchor', 'end')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', trendColor)
        .text(metric.trend);
    });
  }

  private showTooltip(event: MouseEvent, html: string): void {
    const tooltip = d3.select(this.tooltip.nativeElement);
    tooltip
      .style('opacity', 1)
      .style('left', (event.pageX) + 'px')
      .style('top', (event.pageY) + 'px')
      .html(html);
  }

  private hideTooltip(): void {
    d3.select(this.tooltip.nativeElement).style('opacity', 0);
  }

  private generateDetailData(): any {
    return {
      overview: {
        totalSpend: 2847500,
        totalImpressions: 458750000,
        totalClicks: 6875420,
        totalConversions: 284750,
        totalRevenue: 14237500,
        avgCtr: 1.5,
        avgCpa: 10.0,
        avgRoas: 5.0
      },
      channels: [
        {
          id: 'ch-google',
          name: 'Google Ads',
          platform: 'google',
          spend: 985000,
          impressions: 175000000,
          clicks: 2625000,
          conversions: 105000,
          revenue: 5250000,
          ctr: 1.5,
          cpa: 9.38,
          roas: 5.33,
          qualityScore: 8.5,
          campaigns: [
            {
              id: 'camp-g1',
              name: 'Brand Awareness Q4',
              objective: 'awareness',
              status: 'active',
              startDate: '2025-10-01',
              endDate: '2025-12-31',
              totalBudget: 350000,
              spend: 325000,
              impressions: 85000000,
              reach: 42500000,
              frequency: 2.0,
              clicks: 850000,
              conversions: 25500,
              revenue: 1275000,
              ctr: 1.0,
              cpa: 12.75,
              roas: 3.92,
              adGroups: [
                {
                  id: 'ag-g1-1',
                  name: 'Tech Enthusiasts',
                  targetAudience: 'In-market: Technology',
                  bidStrategy: 'cpm',
                  budget: 150000,
                  spend: 142000,
                  impressions: 38000000,
                  clicks: 380000,
                  conversions: 11400,
                  ctr: 1.0,
                  cpa: 12.46,
                  roas: 4.0,
                  creatives: [
                    { id: 'cr-1', name: 'Hero Video 30s', type: 'video', format: '16:9', impressions: 15000000, clicks: 165000, conversions: 4950, spend: 58000, revenue: 247500, ctr: 1.1, cvr: 3.0, roas: 4.27, viewability: 72, completionRate: 68 },
                    { id: 'cr-2', name: 'Product Showcase', type: 'display', format: '300x250', impressions: 12000000, clicks: 120000, conversions: 3600, spend: 44000, revenue: 180000, ctr: 1.0, cvr: 3.0, roas: 4.09, viewability: 65 },
                    { id: 'cr-3', name: 'Native Carousel', type: 'native', format: 'carousel', impressions: 11000000, clicks: 95000, conversions: 2850, spend: 40000, revenue: 142500, ctr: 0.86, cvr: 3.0, roas: 3.56, viewability: 78 }
                  ]
                },
                {
                  id: 'ag-g1-2',
                  name: 'Business Decision Makers',
                  targetAudience: 'B2B: C-Suite & Directors',
                  bidStrategy: 'cpm',
                  budget: 200000,
                  spend: 183000,
                  impressions: 47000000,
                  clicks: 470000,
                  conversions: 14100,
                  ctr: 1.0,
                  cpa: 12.98,
                  roas: 3.85,
                  creatives: [
                    { id: 'cr-4', name: 'Thought Leadership', type: 'video', format: '16:9', impressions: 20000000, clicks: 220000, conversions: 6600, spend: 82000, revenue: 330000, ctr: 1.1, cvr: 3.0, roas: 4.02, viewability: 70, completionRate: 62 },
                    { id: 'cr-5', name: 'Case Study Banner', type: 'display', format: '728x90', impressions: 15000000, clicks: 135000, conversions: 4050, spend: 55000, revenue: 202500, ctr: 0.9, cvr: 3.0, roas: 3.68, viewability: 58 }
                  ]
                }
              ]
            },
            {
              id: 'camp-g2',
              name: 'Performance Max Conversions',
              objective: 'conversion',
              status: 'active',
              startDate: '2025-10-01',
              endDate: '2025-12-31',
              totalBudget: 400000,
              spend: 385000,
              impressions: 55000000,
              reach: 35000000,
              frequency: 1.57,
              clicks: 1100000,
              conversions: 55000,
              revenue: 2750000,
              ctr: 2.0,
              cpa: 7.0,
              roas: 7.14,
              adGroups: [
                {
                  id: 'ag-g2-1',
                  name: 'High Intent Shoppers',
                  targetAudience: 'Purchase Intent Signals',
                  bidStrategy: 'cpa',
                  budget: 200000,
                  spend: 192500,
                  impressions: 27500000,
                  clicks: 550000,
                  conversions: 27500,
                  ctr: 2.0,
                  cpa: 7.0,
                  roas: 7.14,
                  creatives: [
                    { id: 'cr-7', name: 'Dynamic Product Feed', type: 'display', format: 'responsive', impressions: 15000000, clicks: 330000, conversions: 16500, spend: 115500, revenue: 825000, ctr: 2.2, cvr: 5.0, roas: 7.14, viewability: 68 }
                  ]
                }
              ]
            },
            {
              id: 'camp-g3',
              name: 'YouTube Video Campaign',
              objective: 'consideration',
              status: 'active',
              startDate: '2025-10-15',
              endDate: '2025-12-31',
              totalBudget: 275000,
              spend: 275000,
              impressions: 35000000,
              reach: 28000000,
              frequency: 1.25,
              clicks: 675000,
              conversions: 24000,
              revenue: 1225000,
              ctr: 1.93,
              cpa: 11.46,
              roas: 4.45,
              adGroups: [
                {
                  id: 'ag-g3-1',
                  name: 'Video Engagement',
                  targetAudience: 'YouTube Engaged Audiences',
                  bidStrategy: 'cpm',
                  budget: 275000,
                  spend: 275000,
                  impressions: 35000000,
                  clicks: 675000,
                  conversions: 24000,
                  ctr: 1.93,
                  cpa: 11.46,
                  roas: 4.45,
                  creatives: [
                    { id: 'cr-11', name: 'Brand Story 60s', type: 'video', format: '16:9', impressions: 18000000, clicks: 378000, conversions: 13440, spend: 154000, revenue: 686000, ctr: 2.1, cvr: 3.56, roas: 4.45, viewability: 88, completionRate: 45 }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'ch-meta',
          name: 'Meta Ads',
          platform: 'meta',
          spend: 875000,
          impressions: 145000000,
          clicks: 2175000,
          conversions: 87500,
          revenue: 4375000,
          ctr: 1.5,
          cpa: 10.0,
          roas: 5.0,
          qualityScore: 7.8,
          campaigns: [
            {
              id: 'camp-m1',
              name: 'Facebook Reach Campaign',
              objective: 'awareness',
              status: 'active',
              startDate: '2025-10-01',
              endDate: '2025-12-31',
              totalBudget: 300000,
              spend: 287500,
              impressions: 75000000,
              reach: 50000000,
              frequency: 1.5,
              clicks: 750000,
              conversions: 22500,
              revenue: 1125000,
              ctr: 1.0,
              cpa: 12.78,
              roas: 3.91,
              adGroups: [
                {
                  id: 'ag-m1-1',
                  name: 'Lookalike Audiences',
                  targetAudience: '1% Lookalike - Purchasers',
                  bidStrategy: 'cpm',
                  budget: 150000,
                  spend: 143750,
                  impressions: 37500000,
                  clicks: 375000,
                  conversions: 11250,
                  ctr: 1.0,
                  cpa: 12.78,
                  roas: 3.91,
                  creatives: [
                    { id: 'cr-m1', name: 'Story Format Video', type: 'video', format: '9:16', impressions: 20000000, clicks: 220000, conversions: 6600, spend: 84333, revenue: 330000, ctr: 1.1, cvr: 3.0, roas: 3.91, viewability: 85, completionRate: 55 }
                  ]
                }
              ]
            },
            {
              id: 'camp-m2',
              name: 'Instagram Shopping',
              objective: 'conversion',
              status: 'active',
              startDate: '2025-10-01',
              endDate: '2025-12-31',
              totalBudget: 350000,
              spend: 337500,
              impressions: 45000000,
              reach: 30000000,
              frequency: 1.5,
              clicks: 900000,
              conversions: 45000,
              revenue: 2250000,
              ctr: 2.0,
              cpa: 7.5,
              roas: 6.67,
              adGroups: [
                {
                  id: 'ag-m2-1',
                  name: 'Shop Tab Placement',
                  targetAudience: 'Shopping Behaviors',
                  bidStrategy: 'cpa',
                  budget: 350000,
                  spend: 337500,
                  impressions: 45000000,
                  clicks: 900000,
                  conversions: 45000,
                  ctr: 2.0,
                  cpa: 7.5,
                  roas: 6.67,
                  creatives: [
                    { id: 'cr-m5', name: 'Product Collection', type: 'native', format: 'collection', impressions: 25000000, clicks: 550000, conversions: 27500, spend: 206250, revenue: 1375000, ctr: 2.2, cvr: 5.0, roas: 6.67, viewability: 75 }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'ch-tiktok',
          name: 'TikTok Ads',
          platform: 'tiktok',
          spend: 425000,
          impressions: 68000000,
          clicks: 1020000,
          conversions: 34000,
          revenue: 1700000,
          ctr: 1.5,
          cpa: 12.5,
          roas: 4.0,
          qualityScore: 7.2,
          campaigns: [
            {
              id: 'camp-t1',
              name: 'TikTok Spark Ads',
              objective: 'awareness',
              status: 'active',
              startDate: '2025-10-01',
              endDate: '2025-12-31',
              totalBudget: 225000,
              spend: 212500,
              impressions: 40000000,
              reach: 32000000,
              frequency: 1.25,
              clicks: 520000,
              conversions: 15600,
              revenue: 780000,
              ctr: 1.3,
              cpa: 13.62,
              roas: 3.67,
              adGroups: [
                {
                  id: 'ag-t1-1',
                  name: 'Creator Content',
                  targetAudience: 'Gen Z & Millennials',
                  bidStrategy: 'cpm',
                  budget: 225000,
                  spend: 212500,
                  impressions: 40000000,
                  clicks: 520000,
                  conversions: 15600,
                  ctr: 1.3,
                  cpa: 13.62,
                  roas: 3.67,
                  creatives: [
                    { id: 'cr-t1', name: 'UGC Style 15s', type: 'video', format: '9:16', impressions: 22000000, clicks: 308000, conversions: 9240, spend: 125937, revenue: 462000, ctr: 1.4, cvr: 3.0, roas: 3.67, viewability: 90, completionRate: 42 }
                  ]
                }
              ]
            },
            {
              id: 'camp-t2',
              name: 'TikTok Shop Campaign',
              objective: 'conversion',
              status: 'active',
              startDate: '2025-10-15',
              endDate: '2025-12-31',
              totalBudget: 212500,
              spend: 212500,
              impressions: 28000000,
              reach: 20000000,
              frequency: 1.4,
              clicks: 500000,
              conversions: 18400,
              revenue: 920000,
              ctr: 1.79,
              cpa: 11.55,
              roas: 4.33,
              adGroups: [
                {
                  id: 'ag-t2-1',
                  name: 'Shop Now Ads',
                  targetAudience: 'Shopping Intent',
                  bidStrategy: 'cpa',
                  budget: 212500,
                  spend: 212500,
                  impressions: 28000000,
                  clicks: 500000,
                  conversions: 18400,
                  ctr: 1.79,
                  cpa: 11.55,
                  roas: 4.33,
                  creatives: [
                    { id: 'cr-t3', name: 'Live Shopping Clip', type: 'video', format: '9:16', impressions: 15000000, clicks: 285000, conversions: 10488, spend: 121181, revenue: 524400, ctr: 1.9, cvr: 3.68, roas: 4.33, viewability: 85, completionRate: 52 }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'ch-programmatic',
          name: 'Programmatic Display',
          platform: 'programmatic',
          spend: 375000,
          impressions: 52500000,
          clicks: 787500,
          conversions: 37500,
          revenue: 1875000,
          ctr: 1.5,
          cpa: 10.0,
          roas: 5.0,
          qualityScore: 7.5,
          campaigns: [
            {
              id: 'camp-p1',
              name: 'Premium Publisher Network',
              objective: 'awareness',
              status: 'active',
              startDate: '2025-10-01',
              endDate: '2025-12-31',
              totalBudget: 200000,
              spend: 187500,
              impressions: 30000000,
              reach: 24000000,
              frequency: 1.25,
              clicks: 390000,
              conversions: 15600,
              revenue: 780000,
              ctr: 1.3,
              cpa: 12.02,
              roas: 4.16,
              adGroups: [
                {
                  id: 'ag-p1-1',
                  name: 'Contextual Targeting',
                  targetAudience: 'Business & Finance Sites',
                  bidStrategy: 'cpm',
                  budget: 200000,
                  spend: 187500,
                  impressions: 30000000,
                  clicks: 390000,
                  conversions: 15600,
                  ctr: 1.3,
                  cpa: 12.02,
                  roas: 4.16,
                  creatives: [
                    { id: 'cr-p1', name: 'Rich Media Expandable', type: 'rich_media', format: 'expandable', impressions: 15000000, clicks: 210000, conversions: 8400, spend: 101250, revenue: 420000, ctr: 1.4, cvr: 4.0, roas: 4.15, viewability: 72 }
                  ]
                }
              ]
            },
            {
              id: 'camp-p2',
              name: 'CTV & Connected Devices',
              objective: 'awareness',
              status: 'active',
              startDate: '2025-10-01',
              endDate: '2025-12-31',
              totalBudget: 187500,
              spend: 187500,
              impressions: 22500000,
              reach: 18000000,
              frequency: 1.25,
              clicks: 397500,
              conversions: 21900,
              revenue: 1095000,
              ctr: 1.77,
              cpa: 8.56,
              roas: 5.84,
              adGroups: [
                {
                  id: 'ag-p2-1',
                  name: 'Streaming TV',
                  targetAudience: 'Cord Cutters',
                  bidStrategy: 'cpm',
                  budget: 187500,
                  spend: 187500,
                  impressions: 22500000,
                  clicks: 397500,
                  conversions: 21900,
                  ctr: 1.77,
                  cpa: 8.56,
                  roas: 5.84,
                  creatives: [
                    { id: 'cr-p3', name: 'CTV 30s Spot', type: 'video', format: '16:9', impressions: 12500000, clicks: 225000, conversions: 12375, spend: 106250, revenue: 618750, ctr: 1.8, cvr: 5.5, roas: 5.82, viewability: 95, completionRate: 92 }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'ch-linkedin',
          name: 'LinkedIn Ads',
          platform: 'linkedin',
          spend: 187500,
          impressions: 18250000,
          clicks: 267920,
          conversions: 20750,
          revenue: 1037500,
          ctr: 1.47,
          cpa: 9.04,
          roas: 5.53,
          qualityScore: 8.2,
          campaigns: [
            {
              id: 'camp-l1',
              name: 'B2B Lead Generation',
              objective: 'conversion',
              status: 'active',
              startDate: '2025-10-01',
              endDate: '2025-12-31',
              totalBudget: 187500,
              spend: 187500,
              impressions: 18250000,
              reach: 9125000,
              frequency: 2.0,
              clicks: 267920,
              conversions: 20750,
              revenue: 1037500,
              ctr: 1.47,
              cpa: 9.04,
              roas: 5.53,
              adGroups: [
                {
                  id: 'ag-l1-1',
                  name: 'Decision Makers',
                  targetAudience: 'VP+ Level Executives',
                  bidStrategy: 'cpa',
                  budget: 100000,
                  spend: 100000,
                  impressions: 9500000,
                  clicks: 142500,
                  conversions: 11400,
                  ctr: 1.5,
                  cpa: 8.77,
                  roas: 5.7,
                  creatives: [
                    { id: 'cr-l1', name: 'Sponsored Content', type: 'native', format: 'single_image', impressions: 5000000, clicks: 80000, conversions: 6400, spend: 56140, revenue: 320000, ctr: 1.6, cvr: 8.0, roas: 5.7, viewability: 75 }
                  ]
                }
              ]
            }
          ]
        }
      ],
      audienceSegments: [
        { id: 'seg-1', name: 'High-Value Customers', size: 2500000, spend: 425000, conversions: 51000, cpa: 8.33, ltv: 850, demographics: { ageGroup: '25-44', gender: 'Mixed', income: '$100k+' } },
        { id: 'seg-2', name: 'New Prospects', size: 15000000, spend: 712500, conversions: 71250, cpa: 10.0, ltv: 320, demographics: { ageGroup: '18-34', gender: 'Mixed', income: '$50-100k' } },
        { id: 'seg-3', name: 'Retargeting Pool', size: 5000000, spend: 356250, conversions: 50875, cpa: 7.0, ltv: 450, demographics: { ageGroup: '25-54', gender: 'Mixed', income: '$75k+' } },
        { id: 'seg-4', name: 'Lookalike Audiences', size: 8000000, spend: 498750, conversions: 49875, cpa: 10.0, ltv: 380, demographics: { ageGroup: '25-44', gender: 'Mixed', income: '$60-100k' } },
        { id: 'seg-5', name: 'B2B Decision Makers', size: 1200000, spend: 285000, conversions: 28500, cpa: 10.0, ltv: 1250, demographics: { ageGroup: '35-54', gender: 'Mixed', income: '$150k+' } },
        { id: 'seg-6', name: 'Gen Z Mobile Native', size: 12000000, spend: 570000, conversions: 33250, cpa: 17.14, ltv: 180, demographics: { ageGroup: '18-24', gender: 'Mixed', income: '$25-50k' } }
      ],
      deviceData: [
        { device: 'mobile', os: 'iOS', spend: 997625, impressions: 165000000, clicks: 2475000, conversions: 99763, ctr: 1.5, cpa: 10.0 },
        { device: 'mobile', os: 'Android', spend: 712500, impressions: 117875000, clicks: 1768125, conversions: 71250, ctr: 1.5, cpa: 10.0 },
        { device: 'desktop', os: 'Windows', spend: 498750, impressions: 82500000, clicks: 1237500, conversions: 49875, ctr: 1.5, cpa: 10.0 },
        { device: 'desktop', os: 'macOS', spend: 356250, impressions: 58875000, clicks: 883125, conversions: 35625, ctr: 1.5, cpa: 10.0 },
        { device: 'tablet', os: 'iPadOS', spend: 142500, impressions: 23562500, clicks: 353437, conversions: 14250, ctr: 1.5, cpa: 10.0 },
        { device: 'ctv', os: 'Various', spend: 139875, impressions: 10937500, clicks: 157983, conversions: 13987, ctr: 1.44, cpa: 10.0 }
      ],
      timeSeries: this.generateTimeSeriesData()
    };
  }

  private generateTimeSeriesData(): any[] {
    const data: any[] = [];
    const startDate = new Date('2025-10-01');
    for (let i = 0; i < 92; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayOfWeek = date.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
      const trendFactor = 1 + (i * 0.005);
      const randomFactor = 0.9 + Math.random() * 0.2;

      const baseSpend = 30950 * weekendFactor * trendFactor * randomFactor;
      const baseImpressions = 4987500 * weekendFactor * trendFactor * randomFactor;

      data.push({
        date: date.toISOString().split('T')[0],
        spend: Math.round(baseSpend),
        impressions: Math.round(baseImpressions),
        clicks: Math.round(baseImpressions * 0.015),
        conversions: Math.round(baseSpend / 10),
        revenue: Math.round(baseSpend * 5),
        ctr: +(baseImpressions * 0.015 / baseImpressions * 100).toFixed(2),
        cpa: 10.0,
        roas: 5.0
      });
    }
    return data;
  }
}
