import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';
import {
  LucideAngularModule,
  Settings,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  ShoppingCart,
  Mail,
  Calendar,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-angular';

interface Touchpoint {
  channel: string;
  timestamp: Date;
  cost: number;
  device: string;
  attribution?: number;
}

interface UserJourney {
  id: string;
  device: string;
  touchpoints: Touchpoint[];
  conversion: {
    value: number;
    timestamp: Date;
  };
}

interface ChannelData {
  channel: string;
  attribution: number;
  cost: number;
  conversions: number;
  roas: number;
}

interface DeviceData {
  name: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-attribution-platform',
  templateUrl: './attribution-platform-dashboard.component.html',
  styleUrl: './attribution-platform-dashboard.component.less',
  // encapsulation: ViewEncapsulation.None
})
export class AttributionPlatformDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChart', { static: false }) barChartRef!: ElementRef;
  @ViewChild('pieChart', { static: false }) pieChartRef!: ElementRef;
  @ViewChild('journeyChart', { static: false }) journeyChartRef!: ElementRef;

  selectedModel = 'linear';
  timeWindow = 30;
  selectedJourney: string | null = null;
  showSettings = false;
  attributionData: ChannelData[] = [];

  readonly Settings = Settings;
  readonly TrendingUp = TrendingUp;
  readonly Users = Users;
  readonly Eye = Eye;
  readonly MousePointer = MousePointer;
  readonly ShoppingCart = ShoppingCart;
  readonly Mail = Mail;
  readonly Calendar = Calendar;
  readonly Smartphone = Smartphone;
  readonly Monitor = Monitor;
  readonly Tablet = Tablet;

  userJourneys: UserJourney[] = [
    {
      id: 'user_001',
      device: 'mobile',
      touchpoints: [
        { channel: 'Facebook Ad', timestamp: new Date('2025-01-15'), cost: 2.5, device: 'mobile' },
        { channel: 'Google Search', timestamp: new Date('2025-01-17'), cost: 3.2, device: 'desktop' },
        { channel: 'Email', timestamp: new Date('2025-01-20'), cost: 0.1, device: 'mobile' },
        { channel: 'Direct', timestamp: new Date('2025-01-22'), cost: 0, device: 'desktop' }
      ],
      conversion: { value: 89.99, timestamp: new Date('2025-01-22') }
    },
    {
      id: 'user_002',
      device: 'desktop',
      touchpoints: [
        { channel: 'Display Ad', timestamp: new Date('2025-01-14'), cost: 1.8, device: 'desktop' },
        { channel: 'YouTube Ad', timestamp: new Date('2025-01-16'), cost: 4.1, device: 'mobile' },
        { channel: 'Google Search', timestamp: new Date('2025-01-18'), cost: 2.9, device: 'desktop' },
        { channel: 'Retargeting', timestamp: new Date('2025-01-19'), cost: 3.5, device: 'tablet' }
      ],
      conversion: { value: 149.99, timestamp: new Date('2025-01-19') }
    },
    {
      id: 'user_003',
      device: 'tablet',
      touchpoints: [
        { channel: 'Instagram Ad', timestamp: new Date('2025-01-10'), cost: 2.1, device: 'mobile' },
        { channel: 'Email', timestamp: new Date('2025-01-12'), cost: 0.1, device: 'desktop' },
        { channel: 'Google Search', timestamp: new Date('2025-01-14'), cost: 2.7, device: 'tablet' }
      ],
      conversion: { value: 67.50, timestamp: new Date('2025-01-14') }
    }
  ];

  deviceData: DeviceData[] = [
    { name: 'Mobile', value: 45, color: '#8884d8' },
    { name: 'Desktop', value: 35, color: '#82ca9d' },
    { name: 'Tablet', value: 20, color: '#ffc658' }
  ];

  ngOnInit() {
    this.updateAttribution();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createBarChart();
      this.createPieChart();
    }, 100);
  }

  ngOnDestroy() {
    // Cleanup D3 event listeners if any
  }

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }

  updateCharts() {
    this.updateAttribution();
    this.createBarChart();
    if (this.selectedJourney) {
      this.updateJourneyVisualization();
    }
  }

  updateJourneyVisualization() {
    if (this.selectedJourney) {
      setTimeout(() => this.createJourneyVisualization(), 100);
    }
  }

  calculateAttribution(journey: UserJourney, model: string): Touchpoint[] {
    const touchpoints = journey.touchpoints;
    const totalValue = journey.conversion.value;

    switch (model) {
      case 'first-click':
        return touchpoints.map((tp, idx) => ({
          ...tp,
          attribution: idx === 0 ? totalValue : 0
        }));

      case 'last-click':
        return touchpoints.map((tp, idx) => ({
          ...tp,
          attribution: idx === touchpoints.length - 1 ? totalValue : 0
        }));

      case 'linear':
        const linearValue = totalValue / touchpoints.length;
        return touchpoints.map(tp => ({
          ...tp,
          attribution: linearValue
        }));

      case 'time-decay':
        const decayFactor = 0.7;
        const weights = touchpoints.map((_, idx) =>
          Math.pow(decayFactor, touchpoints.length - 1 - idx)
        );
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        return touchpoints.map((tp, idx) => ({
          ...tp,
          attribution: (weights[idx] / totalWeight) * totalValue
        }));

      case 'position-based':
        const firstLastWeight = 0.4;
        const middleWeight = 0.2 / Math.max(1, touchpoints.length - 2);
        return touchpoints.map((tp, idx) => {
          let weight;
          if (idx === 0 || idx === touchpoints.length - 1) {
            weight = firstLastWeight;
          } else {
            weight = middleWeight;
          }
          return {
            ...tp,
            attribution: weight * totalValue
          };
        });

      default:
        return touchpoints.map(tp => ({ ...tp, attribution: 0 }));
    }
  }

  updateAttribution() {
    const channelData: { [key: string]: ChannelData } = {};

    this.userJourneys.forEach(journey => {
      const attributedTouchpoints = this.calculateAttribution(journey, this.selectedModel);
      attributedTouchpoints.forEach(tp => {
        if (!channelData[tp.channel]) {
          channelData[tp.channel] = {
            channel: tp.channel,
            attribution: 0,
            cost: 0,
            conversions: 0,
            roas: 0
          };
        }
        channelData[tp.channel].attribution += tp.attribution || 0;
        channelData[tp.channel].cost += tp.cost;
        if ((tp.attribution || 0) > 0) {
          channelData[tp.channel].conversions += 1;
        }
      });
    });

    Object.values(channelData).forEach(channel => {
      channel.roas = channel.cost > 0 ? channel.attribution / channel.cost : 0;
    });

    this.attributionData = Object.values(channelData);
  }

  createBarChart() {
    if (!this.barChartRef) return;

    const element = this.barChartRef.nativeElement;
    d3.select(element).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(this.attributionData.map(d => d.channel))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.attributionData, d => d.attribution) || 0])
      .range([height, 0]);

    // Add bars
    g.selectAll('.bar')
      .data(this.attributionData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.channel) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.attribution))
      .attr('height', d => height - y(d.attribution))
      .attr('fill', '#4f46e5');

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `$${d}`));

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px');

    g.selectAll('.bar')
      .on('mouseover', (event, d: any) => {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Attribution: $${d.attribution.toFixed(2)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });
  }

  createPieChart() {
    if (!this.pieChartRef) return;

    const element = this.pieChartRef.nativeElement;
    d3.select(element).selectAll('*').remove();

    const width = element.offsetWidth;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 10;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'bar')

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<DeviceData>()
      .value(d => d.value);

    const arc = d3.arc<d3.PieArcDatum<DeviceData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc')
      .data(pie(this.deviceData))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color);

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .text(d => `${d.data.value}%`);

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px');

    g.selectAll('.arc')
      .on('mouseover', (event, d: any) => {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`${d.data.name + " - " + d.data.value + '%'}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });
  }

  createJourneyVisualization() {
    if (!this.journeyChartRef || !this.selectedJourney) return;

    const element = this.journeyChartRef.nativeElement;
    d3.select(element).selectAll('*').remove();

    const journey = this.userJourneys.find(j => j.id === this.selectedJourney);
    if (!journey) return;

    const attributedTouchpoints = this.calculateAttribution(journey, this.selectedModel);

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
      .domain(d3.extent(attributedTouchpoints, d => d.timestamp) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(attributedTouchpoints, d => d.attribution || 0) || 0])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(['mobile', 'desktop', 'tablet'])
      .range(['#8884d8', '#82ca9d', '#ffc658']);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d') as any));

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d}`));

    // Add line
    const line = d3.line<Touchpoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.attribution || 0))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(attributedTouchpoints)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add circles for touchpoints
    g.selectAll('.touchpoint')
      .data(attributedTouchpoints)
      .enter()
      .append('circle')
      .attr('class', 'touchpoint')
      .attr('cx', d => xScale(d.timestamp))
      .attr('cy', d => yScale(d.attribution || 0))
      .attr('r', 6)
      .attr('fill', d => colorScale(d.device))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels
    g.selectAll('.label')
      .data(attributedTouchpoints)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.timestamp))
      .attr('y', d => yScale(d.attribution || 0) - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text(d => d.channel);
  }

  getTotalRevenue(): number {
    return this.userJourneys.reduce((sum, j) => sum + j.conversion.value, 0);
  }

  getAverageJourneyLength(): number {
    return this.userJourneys.reduce((sum, j) => sum + j.touchpoints.length, 0) / this.userJourneys.length;
  }

  getModelDisplayName(): string {
    return this.selectedModel.replace('-', ' ');
  }

  getDeviceIconName(device: string): string {
    switch (device.toLowerCase()) {
      case 'mobile': return 'smartphone';
      case 'desktop': return 'monitor';
      case 'tablet': return 'tablet';
      default: return 'monitor';
    }
  }

  getSelectedJourneyTouchpoints(): Touchpoint[] {
    if (!this.selectedJourney) return [];
    const journey = this.userJourneys.find(j => j.id === this.selectedJourney);
    if (!journey) return [];
    return this.calculateAttribution(journey, this.selectedModel);
  }
}