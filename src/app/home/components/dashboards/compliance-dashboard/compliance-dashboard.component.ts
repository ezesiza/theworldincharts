import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import * as d3 from 'd3';

interface AdvertiserLocation {
  location: string;
  advertiser_count: number;
}

interface AdvertiserDiversity {
  advertiser_disclosed_name: string;
  advertiser_legal_name: string;
  advertiser_id: string;
  unique_creatives: number;
  total_ads: number;
}

interface AdvertiserData {
  advertiser_id: string;
  advertiser_disclosed_name: string;
  advertiser_legal_name: string;
  display_name: string;
  country: string;
  total_ads: number;
  unique_creatives: number;
  total_creatives: number;
  total_creatives_with_disclosure: number;
  total_creatives_without_disclosure: number;
}

interface AdvertiserScatterData {
  name: string;
  unique_creatives: number;
  total_ads: number;
}

// Country code to full name mapping
const COUNTRY_NAMES: { [key: string]: string } = {
  'US': 'United States',
  'DE': 'Germany',
  'FR': 'France',
  'TR': 'Turkey',
  'IT': 'Italy',
  'ES': 'Spain',
  'PL': 'Poland',
  'GB': 'United Kingdom',
  'NL': 'Netherlands',
  'BR': 'Brazil',
  'CZ': 'Czech Republic',
  'SE': 'Sweden',
  'RO': 'Romania',
  'HU': 'Hungary',
  'CA': 'Canada',
  'CH': 'Switzerland',
  'GR': 'Greece',
  'DK': 'Denmark',
  'BE': 'Belgium',
  'UA': 'Ukraine',
  'CN': 'China',
  'PT': 'Portugal',
  'AT': 'Austria',
  'AU': 'Australia',
  'FI': 'Finland',
  'SK': 'Slovakia',
  'NO': 'Norway',
  'HK': 'Hong Kong',
  'IN': 'India',
  'JP': 'Japan',
  'BG': 'Bulgaria',
  'IE': 'Ireland',
  'AE': 'United Arab Emirates',
  'MX': 'Mexico',
  'VN': 'Vietnam',
  'IL': 'Israel',
  'LT': 'Lithuania',
  'AR': 'Argentina',
  'LU': 'Luxembourg',
  'LV': 'Latvia',
  'CO': 'Colombia',
  'HR': 'Croatia',
  'TH': 'Thailand',
  'KR': 'South Korea',
  'EE': 'Estonia',
  'PK': 'Pakistan',
  'SI': 'Slovenia',
  'ZA': 'South Africa',
  'SG': 'Singapore',
  'CL': 'Chile',
  'MA': 'Morocco',
  'TW': 'Taiwan',
  'CY': 'Cyprus',
  'ID': 'Indonesia',
  'NZ': 'New Zealand',
  'RS': 'Serbia',
  'MU': 'Mauritius',
  'MY': 'Malaysia',
  'KZ': 'Kazakhstan',
  'PH': 'Philippines',
  'SA': 'Saudi Arabia',
  'IS': 'Iceland',
  'BY': 'Belarus',
  'EG': 'Egypt',
  'MD': 'Moldova',
  'PE': 'Peru',
  'PA': 'Panama',
  'RE': 'Réunion',
  'BA': 'Bosnia and Herzegovina',
  'EC': 'Ecuador',
  'DO': 'Dominican Republic',
  'LK': 'Sri Lanka',
  'MT': 'Malta',
  'NG': 'Nigeria',
  'JO': 'Jordan',
  'BD': 'Bangladesh',
  'TN': 'Tunisia',
  'UY': 'Uruguay',
  'LB': 'Lebanon',
  'AM': 'Armenia',
  'PY': 'Paraguay',
  'UZ': 'Uzbekistan',
  'CR': 'Costa Rica',
  'GP': 'Guadeloupe',
  'MQ': 'Martinique',
  'GE': 'Georgia',
  'NP': 'Nepal',
  'GT': 'Guatemala',
  'NI': 'Nicaragua',
  'CM': 'Cameroon',
  'KE': 'Kenya',
  'AN': 'Netherlands Antilles',
  'GH': 'Ghana',
  'BH': 'Bahrain',
  'GI': 'Gibraltar',
  'AZ': 'Azerbaijan',
  'ME': 'Montenegro',
  'SM': 'San Marino',
  'QA': 'Qatar',
  'BZ': 'Belize',
  'AL': 'Albania',
  'TZ': 'Tanzania',
  'YE': 'Yemen',
  'CD': 'Democratic Republic of the Congo',
  'OM': 'Oman',
  'KW': 'Kuwait',
  'BJ': 'Benin',
  'VE': 'Venezuela',
  'TO': 'Tonga',
  'BO': 'Bolivia',
  'MG': 'Madagascar',
  'TJ': 'Tajikistan',
  'VI': 'U.S. Virgin Islands',
  'JM': 'Jamaica',
  'YT': 'Mayotte',
  'BW': 'Botswana',
  'AD': 'Andorra',
  'AW': 'Aruba',
  'KY': 'Cayman Islands',
  'PR': 'Puerto Rico',
  'KH': 'Cambodia',
  'MC': 'Monaco',
  'PF': 'French Polynesia'
};

@Component({
  selector: 'compliance-dashboard',
  templateUrl: './compliance-dashboard.component.html',
  styleUrl: './compliance-dashboard.component.less'
})
export class ComplianceDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('diversityChartContainer') diversityChartContainer!: ElementRef;
  @ViewChild('scatterChartContainer', { static: true }) scatterChartContainer!: ElementRef;
  // @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('scatterTooltipContainer', { static: true }) scatterTooltipRef!: ElementRef;

  title: string = 'Unique Creatives vs. Total Ads per Advertiser';
  subtitle: string = 'Top 100 Advertisers - Interactive Analysis with Brushing';

  private scattersvg: any;
  private scattersg: any;
  private xScale: any;
  private yScale: any;
  private originalXScale: any;
  private originalYScale: any;
  private dots: any;
  private brush: any;
  private brushG: any;
  private brushMode = false;
  private keydownListener?: (event: KeyboardEvent) => void;
  private keyupListener?: (event: KeyboardEvent) => void;
  private tooltip: any;
  private xAxis: any;
  private yAxis: any;
  private xGrid: any;
  private yGrid: any;

  selectedCount = 0;

  selectedData: AdvertiserData[] = [];

  private data: AdvertiserLocation[] = [];
  private filteredData: AdvertiserLocation[] = [];
  private diversityData: AdvertiserDiversity[] = [];
  private filteredDiversityData: AdvertiserDiversity[] = [];
  private svg: any;
  private diversitySvg: any;
  private margin = { top: 40, right: 30, bottom: 120, left: 80 };
  private width = 1200 - this.margin.left - this.margin.right;
  private height = 600 - this.margin.top - this.margin.bottom;

  // Chart type options
  public chartTypes = [
    { value: 'location', label: 'Advertiser Counts by Location' },
    { value: 'diversity', label: 'Top Advertisers by Creative Diversity' }
  ];

  public selectedChartType = 'diversity'; // Default to location chart

  scatterData: AdvertiserScatterData[] = [
    { name: "Booking.com", unique_creatives: 10555546, total_ads: 10555546 },
    { name: "Amazon Europe Core S.à r.l.", unique_creatives: 8231360, total_ads: 8231360 },
    { name: "Vinden.nl B.V.", unique_creatives: 3988273, total_ads: 3988273 },
    { name: "ELEMENTARY INNOVATION PTE. LTD.", unique_creatives: 3161202, total_ads: 3161202 },
    { name: "Idealo Internet GmbH", unique_creatives: 2245692, total_ads: 2245692 },
    { name: "GetYourGuide Deutschland GmbH", unique_creatives: 1482232, total_ads: 1482232 },
    { name: "IAC Search & Media, Inc.", unique_creatives: 1388337, total_ads: 1388337 },
    { name: "Bookiply Spain, S.L.", unique_creatives: 1308855, total_ads: 1308855 },
    { name: "VGL Publishing AG", unique_creatives: 1053684, total_ads: 1053684 }
  ];

  // Filter options for number of countries to display
  public filterOptions = [
    { value: 10, label: 'Top 10 Countries' },
    { value: 20, label: 'Top 20 Countries' },
    { value: 30, label: 'Top 30 Countries' },
    { value: 50, label: 'Top 50 Countries' },
    { value: 100, label: 'Top 100 Countries' },
    { value: 0, label: 'All Countries' }
  ];

  public selectedFilter = 20; // Default to top 20

  // Filter options for number of advertisers to display
  public diversityFilterOptions = [
    { value: 10, label: 'Top 10 Advertisers' },
    { value: 20, label: 'Top 20 Advertisers' },
    { value: 30, label: 'Top 30 Advertisers' },
    { value: 50, label: 'Top 50 Advertisers' },
    { value: 100, label: 'Top 100 Advertisers' },
    { value: 0, label: 'All Advertisers' }
  ];

  public selectedDiversityFilter = 20; // Default to top 20

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void {
    this.loadData();
    this.loadDiversityData();
  }

  private initializeScatterChart(): void {
    d3.select(this.scatterChartContainer.nativeElement).selectAll('*').remove();
    this.createScatterChart();
    this.createScales();
    this.createGridLines();
    this.createAxes();
    this.createTooltip();
    this.createDots();
    this.createBrush();
    this.animateDotsOnLoad();
  }

  ngAfterViewInit(): void {
    // Only create chart if data is already loaded
    if (this.data.length > 0 && this.selectedChartType === 'location') {
      setTimeout(() => {
        this.createChart();
      }, 100);
    } else if (this.diversityData.length > 0 && this.selectedChartType === 'diversity') {
      setTimeout(() => {
        this.createDiversityChart();
      }, 100);
    }

    // Add window resize listener for responsive design
    window.addEventListener('resize', () => {
      if (this.selectedChartType === 'location') {
        this.createChart();
      } else {
        this.createDiversityChart();
      }
    });
    setTimeout(() => {
      this.initializeScatterChart();
      this.setupKeyboardListeners();
    }, 0);
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('resize', () => {
      this.createChart();
    });
    this.removeKeyboardListeners()
  }

  private async loadData(): Promise<void> {
    try {
      // Load the CSV data
      const csvData = await d3.csv('/assets/datasets/advertiser_location_summary.csv');
      // const scatterData = await d3.csv('/assets/datasets/scatter_unique_vs_total.csv');
      // Transform the data
      this.data = csvData.map((d: any) => ({
        location: COUNTRY_NAMES[d.location] || d.location,
        advertiser_count: +d.advertiser_count
      })).sort((a, b) => b.advertiser_count - a.advertiser_count);

      // Apply initial filter
      this.applyFilter();

      // Create chart after data is loaded
      setTimeout(() => {
        if (this.selectedChartType === 'location') {
          this.createChart();
        }
      }, 100);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to hardcoded data if CSV loading fails
      this.loadFallbackData();
    }
  }

  private async loadDiversityData(): Promise<void> {
    try {
      // Load the CSV data
      const csvData = await d3.csv('/assets/datasets/advertiser_creative_diversity.csv');
      // Transform the data
      this.diversityData = csvData.map((d: any) => ({
        advertiser_disclosed_name: d.advertiser_disclosed_name,
        advertiser_legal_name: d.advertiser_legal_name,
        advertiser_id: d.advertiser_id,
        unique_creatives: +d.unique_creatives,
        total_ads: +d.total_ads
      })).sort((a, b) => b.unique_creatives - a.unique_creatives);

      // Apply initial filter
      this.applyDiversityFilter();

      // Create chart after data is loaded
      setTimeout(() => {
        if (this.selectedChartType === 'diversity') {
          this.createDiversityChart();
        }
      }, 100);
    } catch (error) {
      console.error('Error loading diversity data:', error);
      // Fallback to hardcoded data if CSV loading fails
      this.loadFallbackDiversityData();
    }
  }

  private loadFallbackData(): void {
    this.data = [
      { location: 'United States', advertiser_count: 1115 },
      { location: 'Germany', advertiser_count: 860 },
      { location: 'France', advertiser_count: 758 },
      { location: 'Turkey', advertiser_count: 684 },
      { location: 'Italy', advertiser_count: 558 },
      { location: 'Spain', advertiser_count: 506 },
      { location: 'Poland', advertiser_count: 481 },
      { location: 'United Kingdom', advertiser_count: 434 },
      { location: 'Netherlands', advertiser_count: 413 },
      { location: 'Brazil', advertiser_count: 248 },
      { location: 'Czech Republic', advertiser_count: 231 },
      { location: 'Sweden', advertiser_count: 181 },
      { location: 'Romania', advertiser_count: 175 },
      { location: 'Hungary', advertiser_count: 158 },
      { location: 'Canada', advertiser_count: 149 }
    ];

    // Apply initial filter
    this.applyFilter();

    // Create chart after fallback data is loaded
    setTimeout(() => {
      if (this.selectedChartType === 'location') {
        this.createChart();
      }
    }, 100);
  }

  private handleMouseOver(event: any, d: AdvertiserLocation, x: any, y: any): void {
    d3.select(event.target)
      .attr('fill', '#4a8b7a');

    // Add tooltip
    this.svg.append('text')
      .attr('class', 'tooltip')
      .attr('x', (x(d.location) || 0) + x.bandwidth() / 2)
      .attr('y', y(d.advertiser_count) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(`${d.advertiser_count} advertisers`);
  }

  private applyFilter(): void {
    if (this.selectedFilter === 0) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.slice(0, this.selectedFilter);
    }
  }

  public onFilterChange(): void {
    this.applyFilter();
    setTimeout(() => {
      if (this.chartContainer) {
        this.createChart();
      }
    }, 50);
  }

  private applyDiversityFilter(): void {

    if (this.selectedDiversityFilter === 0) {
      this.filteredDiversityData = [...this.diversityData];
    } else {
      this.filteredDiversityData = this.diversityData.slice(0, this.selectedDiversityFilter);
    }
  }

  public onDiversityFilterChange(): void {
    this.applyDiversityFilter();
    setTimeout(() => {
      if (this.diversityChartContainer) {
        this.createDiversityChart();
      }
    }, 50);
  }

  public onChartTypeChange(): void {
    // Use a more reliable approach to ensure DOM has updated
    this.waitForContainerAndCreateChart();
  }

  private waitForContainerAndCreateChart(): void {
    const maxAttempts = 10;
    let attempts = 0;

    const tryCreateChart = () => {
      attempts++;

      if (this.selectedChartType === 'location') {
        // if (this.chartContainer) {
        //   console.log('Location container found, creating chart');
        this.createChart();
        // } else if (attempts < maxAttempts) {
        //   console.log('Location container not found, retrying...');
        //   setTimeout(tryCreateChart, 50);
        // }
      } else {
        // if (this.diversityChartContainer) {
        //   console.log('Diversity container found, creating chart');
        this.createDiversityChart();
        // } else if (attempts < maxAttempts) {
        //   console.log('Diversity container not found, retrying...');
        //   setTimeout(tryCreateChart, 50);
        // }
      }
    };

    setTimeout(tryCreateChart, 50);
  }

  private loadFallbackDiversityData(): void {
    this.diversityData = [
      { advertiser_disclosed_name: 'Booking.com', advertiser_legal_name: 'Booking.com B.V.', advertiser_id: 'AR02934798844673654785', unique_creatives: 10555546, total_ads: 10555546 },
      { advertiser_disclosed_name: 'Amazon Europe Core S.à r.l.', advertiser_legal_name: 'Amazon Europe Core S.à r.l.', advertiser_id: 'AR09188314108603138049', unique_creatives: 8231360, total_ads: 8231360 },
      { advertiser_disclosed_name: 'Vinden.nl B.V.', advertiser_legal_name: 'Vinden.nl B.V.', advertiser_id: 'AR00908777146682441729', unique_creatives: 3988273, total_ads: 3988273 },
      { advertiser_disclosed_name: 'ELEMENTARY INNOVATION PTE. LTD.', advertiser_legal_name: 'ELEMENTARY INNOVATION PTE. LTD.', advertiser_id: 'AR07816964328396947457', unique_creatives: 3161202, total_ads: 3161202 },
      { advertiser_disclosed_name: 'Idealo Internet GmbH', advertiser_legal_name: 'Idealo Internet GmbH', advertiser_id: 'AR03683844439630938113', unique_creatives: 2245692, total_ads: 2245692 }
    ];

    // Apply initial filter
    this.applyDiversityFilter();
  }

  private createChart(): void {
    if (!this.filteredData.length || !this.chartContainer) return;

    // Clear any existing chart
    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

    // Create SVG
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Create scales
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(this.filteredData.map(d => d.location))
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.filteredData, d => d.advertiser_count) || 0])
      .range([this.height, 0]);

    // Add X axis
    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    // Add Y axis
    this.svg.append('g')
      .call(d3.axisLeft(y).ticks(10))
      .style('font-size', '12px');

    // Add Y axis label
    this.svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - this.margin.left)
      .attr('x', 0 - (this.height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Number of Advertisers');

    // Add X axis label
    this.svg.append('text')
      .attr('transform', `translate(${this.width / 2}, ${this.height + this.margin.bottom - 20})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Location/Region');

    // Add title
    this.svg.append('text')
      .attr('x', this.width / 2)
      .attr('y', 0 - this.margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Advertiser Counts by Location/Region');

    // Add bars
    this.svg.selectAll('rect')
      .data(this.filteredData)
      .enter()
      .append('rect')
      .attr('x', (d: AdvertiserLocation) => x(d.location) || 0)
      .attr('y', (d: AdvertiserLocation) => y(d.advertiser_count))
      .attr('width', x.bandwidth())
      .attr('height', (d: AdvertiserLocation) => this.height - y(d.advertiser_count))
      .attr('fill', '#69b3a2')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', (event: any, d: AdvertiserLocation) => this.handleMouseOver(event, d, x, y))
      .on('mousemove', (event: any, d: AdvertiserLocation) => this.handleMouseOver(event, d, x, y))
      .on('mouseout', (event: any) => {
        d3.select(event.target)
          .attr('fill', '#69b3a2');

        // Remove tooltip
        this.svg.selectAll('.tooltip').remove();
      });

    // Add value labels on bars
    this.svg.selectAll('.bar-label')
      .data(this.filteredData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d: AdvertiserLocation) => (x(d.location) || 0) + x.bandwidth() / 2)
      .attr('y', (d: AdvertiserLocation) => y(d.advertiser_count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text((d: AdvertiserLocation) => d.advertiser_count > 100 ? d.advertiser_count : '');
  }

  private createDiversityChart(): void {

    if (!this.filteredDiversityData.length || !this.diversityChartContainer) {
      return;
    }

    // Clear any existing chart
    d3.select(this.diversityChartContainer.nativeElement).selectAll('*').remove();

    // Create SVG
    this.diversitySvg = d3.select(this.diversityChartContainer.nativeElement)
      .append('svg')
      .attr("viewBox", [-100, 10, this.width * 1.1, this.height * 1.1])
      .attr('width', this.width + this.margin.left + this.margin.right + 300)
      .attr('height', this.height + this.margin.top + this.margin.bottom + 200)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Create scales for horizontal bar chart
    const y = d3.scaleBand()
      .range([0, this.height])
      .domain(this.filteredDiversityData.map(d => d.advertiser_disclosed_name))
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(this.filteredDiversityData, d => d.unique_creatives) || 0])
      .range([0, this.width]);

    // Add Y axis (advertiser names)
    this.diversitySvg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '10px')
      .style('text-anchor', 'end');

    // Add X axis (creative diversity values)
    this.diversitySvg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format(',.0f')))
      .style('font-size', '12px');

    // Add X axis label
    this.diversitySvg.append('text')
      .attr('transform', `translate(${this.width / 2}, ${this.height + this.margin.bottom - 20})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Creative Diversity');

    // Add Y axis label
    this.diversitySvg.append('text')
      .attr('transform', 'rotate(-90)')
      // .attr('y', 20 - this.margin.left)
      .attr('y', -180)
      .attr('x', -320)
      // .attr('x', 0 - (this.height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'start')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Advertiser (Disclosed Name)');

    // Add title
    this.diversitySvg.append('text')
      .attr('x', this.width / 2)
      .attr('y', 0 - this.margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Top 20 Advertisers by Creative Diversity');

    // Add bars
    this.diversitySvg.selectAll('rect')
      .data(this.filteredDiversityData)
      .enter()
      .append('rect')
      .attr('y', (d: AdvertiserDiversity) => y(d.advertiser_disclosed_name) || 0)
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', (d: AdvertiserDiversity) => x(d.unique_creatives))
      .attr('fill', '#2E8B57')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', (event: any, d: AdvertiserDiversity) => this.handleDiversityMouseOver(event, d, x, y))
      .on('mousemove', (event: any, d: AdvertiserDiversity) => this.handleDiversityMouseOver(event, d, x, y))
      .on('mouseout', (event: any) => {
        d3.select(event.target)
          .attr('fill', '#2E8B57');

        // Remove tooltip
        this.diversitySvg.selectAll('.tooltip').remove();
      });

    // Add value labels on bars
    this.diversitySvg.selectAll('.bar-label')
      .data(this.filteredDiversityData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d: AdvertiserDiversity) => x(d.unique_creatives) + 5)
      .attr('y', (d: AdvertiserDiversity) => (y(d.advertiser_disclosed_name) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text((d: AdvertiserDiversity) => d3.format(',')(d.unique_creatives));
  }

  private handleDiversityMouseOver(event: any, d: AdvertiserDiversity, x: any, y: any): void {
    d3.select(event.target)
      .attr('fill', '#1a5f3a');

    // Add tooltip
    this.diversitySvg.append('text')
      .attr('class', 'tooltip')
      .attr('x', x(d.unique_creatives) + 10)
      .attr('y', (y(d.advertiser_disclosed_name) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(`${d3.format(',')(d.unique_creatives)} unique creatives`);
  }

  private createScatterChart(): void {
    const element = this.scatterChartContainer.nativeElement;

    this.scattersvg = d3.select(element)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.scattersg = this.scattersvg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  private createScales(): void {
    this.xScale = d3.scaleLinear()
      .domain([0, d3.max(this.scatterData, d => d.total_ads)! * 1.1])
      .range([0, this.width]);

    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(this.scatterData, d => d.unique_creatives)! * 1.1])
      .range([this.height, 0]);

    // Store original scales for reset functionality
    this.originalXScale = this.xScale.copy();
    this.originalYScale = this.yScale.copy();
  }

  private createGridLines(): void {
    this.xGrid = this.scattersg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale)
        .tickSize(-this.height)
        .tickFormat('' as any)
      );
    this.xGrid.selectAll('line').attr('class', 'grid-line');

    this.yGrid = this.scattersg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(this.yScale)
        .tickSize(-this.width)
        .tickFormat('' as any)
      );
    this.yGrid.selectAll('line').attr('class', 'grid-line');
  }

  private createAxes(): void {
    this.xAxis = this.scattersg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale)
        .tickFormat(this.formatTicks as any));

    this.yAxis = this.scattersg.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(this.yScale)
        .tickFormat(this.formatTicks as any));

    // Add axis labels
    this.scattersg.append('text')
      .attr('class', 'axis-label')
      .attr('transform', `translate(${this.width / 2}, ${this.height + 50})`)
      .style('text-anchor', 'middle')
      .text('Total Ads');

    this.scattersg.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - this.margin.left + 20)
      .attr('x', 0 - (this.height / 2))
      .style('text-anchor', 'middle')
      .text('Unique Creatives');
  }

  private createTooltip(): void {
    this.tooltip = d3.select(this.scatterTooltipRef.nativeElement);
  }

  private setupDotEvents(): void {
    this.dots.on('mouseenter', (event: any, d: AdvertiserScatterData) => {
      console.log(event, d);
      d3.select(event.currentTarget)
        .attr('r', 16);

      this.tooltip.style('opacity', 1)
        .html(`<strong>${d.name}</strong><br/>Total Ads: ${d.total_ads.toLocaleString()}<br/>Unique Creatives: ${d.unique_creatives.toLocaleString()}`)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    });

    this.dots.on('mouseleave', (event: any, d: AdvertiserData) => {

      d3.select(event.currentTarget)
        .attr('r', 12);

      this.tooltip.style('opacity', 0);
    });

    this.dots.on('mousemove', (event: MouseEvent) => {
      this.tooltip
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    });
  }

  private createDots(): void {
    const dotsGroup = this.scattersg.append('g')
      .attr('class', 'dots-group')
      .style('pointer-events', 'all');

    this.dots = dotsGroup.selectAll('.dot')
      .data(this.scatterData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: AdvertiserData) => this.xScale(d.total_ads))
      .attr('cy', (d: AdvertiserData) => this.yScale(d.unique_creatives))
      .attr('r', 15)
      .style('pointer-events', 'all')
      .style('cursor', 'pointer')

    // .on('mouseover', (event: any, d: AdvertiserScatterData) => this.onDotMouseOver(event, d as any))
    // .on('mousemove', (event: any, d: AdvertiserData) => this.onDotMouseMove(event, d as any))
    // .on('mouseout', (event: any, d: AdvertiserData) => this.onDotMouseOut(event, d as any));

    this.setupDotEvents();
  }

  private createBrush(): void {
    this.brush = d3.brush()
      .extent([[0, 0], [this.width, this.height]])
      .on('end', (event: any) => this.onBrushed(event));

    this.brushG = this.scattersg.append('g')
      .attr('class', 'brush')
      .call(this.brush);
  }

  private onDotMouseOver(event: any, d: AdvertiserScatterData): void {
    d3.select(event.currentTarget)
      .transition()
      .duration(150)
      .attr('r', 8)
      .style('fill-opacity', 1)
      .style('stroke-width', 3);

    this.tooltip.transition()
      .duration(200)
      .style('opacity', 0.95);

    const ratio = d.unique_creatives / d.total_ads;
    const creativesPercentage = ((d.unique_creatives / d.total_ads) * 100).toFixed(1);

    this.tooltip.html(`
      <div style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 8px; margin-bottom: 8px;">
        <strong style="font-size: 14px; color: #ff4081;">${d.name}</strong>
      </div>
      <div style="line-height: 1.4;">
        <div><strong>Total Ads:</strong> ${d.total_ads.toLocaleString()}</div>
        <div><strong>Unique Creatives:</strong> ${d.unique_creatives.toLocaleString()}</div>
        <div><strong>Creative Ratio:</strong> ${ratio.toFixed(3)} (${creativesPercentage}%)</div>
        <div style="margin-top: 6px; font-size: 11px; color: #ccc;">
          ${ratio === 1 ? 'Each ad has a unique creative' :
        ratio > 0.5 ? 'High creative diversity' :
          ratio > 0.1 ? 'Moderate creative reuse' : 'High creative reuse'}
        </div>
      </div>
    `)
      .style('left', (event.pageX + 15) + 'px')
      .style('top', (event.pageY - 10) + 'px');
  }

  private onDotMouseMove(event: any, d: AdvertiserData): void {
    this.tooltip
      .style('left', (event.pageX + 15) + 'px')
      .style('top', (event.pageY - 10) + 'px');
  }

  private onDotMouseOut(event: any, d: AdvertiserData): void {
    d3.select(event.currentTarget)
      .transition()
      .duration(200)
      .attr('r', 5)
      .style('fill-opacity', () => {
        const [xMin, xMax] = this.xScale.domain();
        const [yMin, yMax] = this.yScale.domain();
        return (d.total_ads >= xMin && d.total_ads <= xMax &&
          d.unique_creatives >= yMin && d.unique_creatives <= yMax) ? 0.7 : 0.1;
      })
      .style('stroke-width', 1);

    this.tooltip.transition()
      .duration(300)
      .style('opacity', 0);
  }

  private onBrushed(event: any): void {
    console.log(event);
    const selection = event.selection;

    if (!selection) return;

    const [[x0, y0], [x1, y1]] = selection;

    const xDomain = [this.xScale.invert(x0), this.xScale.invert(x1)];
    const yDomain = [this.yScale.invert(y1), this.yScale.invert(y0)];

    this.xScale.domain(xDomain);
    this.yScale.domain(yDomain);

    const selectedData = this.scatterData.filter(d =>
      d.total_ads >= xDomain[0] && d.total_ads <= xDomain[1] &&
      d.unique_creatives >= yDomain[0] && d.unique_creatives <= yDomain[1]
    );

    this.selectedCount = selectedData.length;
    this.zoomToSelection();
    // this.brushG.call(this.brush.move, null);
    // Clear the brush and remove overlay after zooming
    if (this.brushG) {
      this.brushG.call(this.brush.move, null);
      this.brushG.remove();
      this.brushG = null;
    }
    this.brushMode = false;
  }

  private zoomToSelection(): void {
    const t = d3.transition().duration(750);

    this.xAxis.transition(t)
      .call(d3.axisBottom(this.xScale).tickFormat(this.formatTicks as any));

    this.yAxis.transition(t)
      .call(d3.axisLeft(this.yScale).tickFormat(this.formatTicks as any));

    this.xGrid.transition(t)
      .call(d3.axisBottom(this.xScale)
        .tickSize(-this.height)
        .tickFormat('' as any));
    this.xGrid.selectAll('line').attr('class', 'grid-line');

    this.yGrid.transition(t)
      .call(d3.axisLeft(this.yScale)
        .tickSize(-this.width)
        .tickFormat('' as any));
    this.yGrid.selectAll('line').attr('class', 'grid-line');

    this.dots.transition(t)
      .attr('cx', (d: AdvertiserData) => this.xScale(d.total_ads))
      .attr('cy', (d: AdvertiserData) => this.yScale(d.unique_creatives))
      .style('opacity', (d: AdvertiserData) => {
        const [xMin, xMax] = this.xScale.domain();
        const [yMin, yMax] = this.yScale.domain();
        return (d.total_ads >= xMin && d.total_ads <= xMax &&
          d.unique_creatives >= yMin && d.unique_creatives <= yMax) ? 1 : 0.1;
      });
  }

  private formatTicks = (d: number): string => {
    if (d >= 1000000) return (d / 1000000) + 'M';
    if (d >= 1000) return (d / 1000) + 'K';
    return d.toString();
  }

  private animateDotsOnLoad(): void {
    this.dots!.style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d: any, i: number) => i * 100)
      .style('opacity', 1);
  }



  public resetZoom(): void {
    this.xScale.domain(this.originalXScale.domain());
    this.yScale.domain(this.originalYScale.domain());
    this.zoomToSelection();
    this.selectedCount = this.scatterData.length;
    this.initializeScatterChart()
    // this.ngZone.runOutsideAngular(() => {
    //   this.xScale.domain(this.originalXScale.domain());
    //   this.yScale.domain(this.originalYScale.domain());
    //   this.zoomToSelection();
    // });
    // this.ngZone.run(() => {
    //   this.selectedCount = this.scatterData.length;
    // });
  }

  private setupKeyboardListeners(): void {
    this.keydownListener = (event: KeyboardEvent) => {
      if (event.key === 'Shift' && !this.brushMode) {
        this.brushMode = true;

        // Remove any existing brush first
        if (this.brushG) {
          this.brushG.remove();
        }

        this.brushG = this.scattersg.append('g')
          .attr('class', 'brush')
          .call(this.brush);

        // Ensure brush is on top
        this.brushG.node()?.parentNode?.appendChild(this.brushG.node());
      }
    };

    this.keyupListener = (event: KeyboardEvent) => {
      if (event.key === 'Shift' && this.brushMode) {
        this.brushMode = false;

        if (this.brushG) {
          this.brushG.remove();
          this.brushG = null;
        }
      }
    };

    // Use window instead of document to ensure we catch events
    window.addEventListener('keydown', this.keydownListener);
    window.addEventListener('keyup', this.keyupListener);
  }

  private removeKeyboardListeners(): void {
    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
    }
    if (this.keyupListener) {
      window.removeEventListener('keyup', this.keyupListener);
    }
  }

  // public resetZoom(): void {
  //   this.xScale.domain(this.originalXScale.domain());
  //   this.yScale.domain(this.originalYScale.domain());
  //   this.zoomToSelection();
  //   this.selectedCount = this.scatterData.length;
  // }
}
