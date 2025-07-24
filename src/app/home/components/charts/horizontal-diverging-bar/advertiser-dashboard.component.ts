import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as d3 from 'd3';

interface AdvertiserData {
  UTM_SOURCE: string;
  total: string;
  'valid-clicked:1': string;
  'mousemove-exists:1': string;
  'valid-scrolling:1': string;
  'touch-exists:1': string;
  'mobile:1': string;
  bots: string;
  humans: string;
  unknown: string;
}

interface Advertiser {
  name: string;
  data: AdvertiserData[];
}

interface ChartData {
  source: string;
  advertiser: string;
  value: number;
  rawValue: string;
}

@Component({
  selector: 'advertiser-dashboard',
  template: `
    <div class="dashboard-container">
      <div class="header-section">
        <button *ngIf="currentRoute===routeUrl" class="home-button" (click)="goHome()" title="Go to Home">
          <span class="home-icon">🏠</span>
          Home
        </button>
        <h2>Advertiser Traffic Source Analysis</h2>
      </div>
      
      <div class="controls">
        <div class="metric-selector">
          <label>Metric:</label>
          <select [(ngModel)]="selectedMetric" (change)="updateChart()">
            <option value="total">Total Traffic %</option>
            <option value="mousemove-exists:1">Mouse Movement %</option>
            <option value="valid-scrolling:1">Valid Scrolling %</option>
            <option value="touch-exists:1">Touch Interaction %</option>
            <option value="mobile:1">Mobile Traffic %</option>
            <option value="bots">Bot Traffic %</option>
            <option value="humans">Human Traffic %</option>
            <option value="unknown">Unknown Traffic %</option>
          </select>
        </div>
        
        <div class="advertiser-selector">
          <label>Advertiser:</label>
          <select [(ngModel)]="selectedAdvertiser" (change)="updateChart()">
            <option value="all">All Advertisers</option>
            <option *ngFor="let advertiser of advertisers" [value]="advertiser.name">
              {{advertiser.name}}
            </option>
          </select>
        </div>
        
        <div class="sort-selector">
          <label>Sort by:</label>
          <select [(ngModel)]="sortOrder" (change)="updateChart()">
            <option value="desc">Highest to Lowest</option>
            <option value="asc">Lowest to Highest</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div class="chart-type-selector">
          <label>View as:</label>
          <select [(ngModel)]="chartType" (change)="updateChart()">
            <option value="diverging">Diverging Bar</option>
            <option value="horizontal">Horizontal Bar</option>
          </select>
        </div>
      </div>
      
      <div #chartContainer class="chart"></div>
      
      <div class="summary-stats" *ngIf="summaryStats">
        <h3>Summary Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Average:</span>
            <span class="stat-value">{{summaryStats.average}}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Highest:</span>
            <span class="stat-value">{{summaryStats.max}}% ({{summaryStats.maxSource}})</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Lowest:</span>
            <span class="stat-value">{{summaryStats.min}}% ({{summaryStats.minSource}})</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Sources:</span>
            <span class="stat-value">{{summaryStats.count}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .header-section {
      position: relative;
      margin-bottom: 30px;
    }
    
    .home-button {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }
    
    .home-button:hover {
      background: #0056b3;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
    .home-button:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }
    
    .home-icon {
      font-size: 16px;
    }
    
    h2 {
      text-align: center;
      color: #333;
      margin: 0;
    }
    
    .controls {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
      align-items: center;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    
    .metric-selector, .advertiser-selector, .sort-selector, .chart-type-selector {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .controls label {
      font-weight: 600;
      color: #555;
      font-size: 14px;
    }
    
    .controls select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      background: white;
      min-width: 150px;
    }
    
    .chart {
      width: 100%;
      overflow-x: auto;
      border: 1px solid #eee;
      border-radius: 8px;
      background: white;
    }
    
    .summary-stats {
      margin-top: 30px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    
    .summary-stats h3 {
      margin: 0 0 15px 0;
      color: #333;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: white;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }
    
    .stat-label {
      font-weight: 600;
      color: #666;
    }
    
    .stat-value {
      font-weight: 700;
      color: #333;
    }
    
    :host {
      display: block;
    }
  `]
})
export class AdvertiserDashboardComponent implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() width: number = 1000;
  currentRoute = 'advertiser-dashboard';
  routeUrl: string = ''


  constructor(private router: Router, private route: ActivatedRoute) {
    route.url.pipe().subscribe((url: any) => {
      console.log(url);
      this.routeUrl = url;
    })
  }

  selectedMetric: string = 'total';
  selectedAdvertiser: string = 'all';
  sortOrder: string = 'desc';
  chartType: string = 'diverging';
  summaryStats: any = null;

  advertisers: Advertiser[] = [
    {
      "name": "ADVERTISER 1",
      "data": [
        {
          "UTM_SOURCE": "direct traffic",
          "total": "87%",
          "valid-clicked:1": "809,944",
          "mousemove-exists:1": "65%",
          "valid-scrolling:1": "59%",
          "touch-exists:1": "23%",
          "mobile:1": "73%",
          "bots": "32%",
          "humans": "19%",
          "unknown": "67%"
        },
        {
          "UTM_SOURCE": "google search",
          "total": "7%",
          "valid-clicked:1": "64,082",
          "mousemove-exists:1": "50%",
          "valid-scrolling:1": "51%",
          "touch-exists:1": "56%",
          "mobile:1": "73%",
          "bots": "79%",
          "humans": "8%",
          "unknown": "85%"
        },
        {
          "UTM_SOURCE": "google display",
          "total": "3%",
          "valid-clicked:1": "25,006",
          "mousemove-exists:1": "29%",
          "valid-scrolling:1": "36%",
          "touch-exists:1": "43%",
          "mobile:1": "65%",
          "bots": "70%",
          "humans": "16%",
          "unknown": "63%"
        },
        {
          "UTM_SOURCE": "bing search",
          "total": "2%",
          "valid-clicked:1": "15,313",
          "mousemove-exists:1": "45%",
          "valid-scrolling:1": "61%",
          "touch-exists:1": "36%",
          "mobile:1": "63%",
          "bots": "8%",
          "humans": "16%",
          "unknown": "64%"
        },
        {
          "UTM_SOURCE": "facebook",
          "total": "2%",
          "valid-clicked:1": "15,146",
          "mousemove-exists:1": "10%",
          "valid-scrolling:1": "14%",
          "touch-exists:1": "83%",
          "mobile:1": "87%",
          "bots": "90%",
          "humans": "2%",
          "unknown": "96%"
        }
      ]
    },
    {
      "name": "ADVERTISER 2",
      "data": [
        {
          "UTM_SOURCE": "direct traffic",
          "total": "51%",
          "valid-clicked:1": "482,878",
          "mousemove-exists:1": "54%",
          "valid-scrolling:1": "52%",
          "touch-exists:1": "50%",
          "mobile:1": "76%",
          "bots": "48%",
          "humans": "21%",
          "unknown": "76%"
        },
        {
          "UTM_SOURCE": "google search",
          "total": "23%",
          "valid-clicked:1": "216,594",
          "mousemove-exists:1": "41%",
          "valid-scrolling:1": "43%",
          "touch-exists:1": "72%",
          "mobile:1": "82%",
          "bots": "80%",
          "humans": "6%",
          "unknown": "86%"
        },
        {
          "UTM_SOURCE": "instagram",
          "total": "17%",
          "valid-clicked:1": "161,523",
          "mousemove-exists:1": "34%",
          "valid-scrolling:1": "36%",
          "touch-exists:1": "68%",
          "mobile:1": "78%",
          "bots": "84%",
          "humans": "2%",
          "unknown": "91%"
        },
        {
          "UTM_SOURCE": "bing search",
          "total": "2%",
          "valid-clicked:1": "15,363",
          "mousemove-exists:1": "37%",
          "valid-scrolling:1": "55%",
          "touch-exists:1": "63%",
          "mobile:1": "67%",
          "bots": "45%",
          "humans": "17%",
          "unknown": "73%"
        },
        {
          "UTM_SOURCE": "facebook",
          "total": "0%",
          "valid-clicked:1": "4,161",
          "mousemove-exists:1": "80%",
          "valid-scrolling:1": "81%",
          "touch-exists:1": "88%",
          "mobile:1": "95%",
          "bots": "89%",
          "humans": "3%",
          "unknown": "94%"
        },
        {
          "UTM_SOURCE": "tiktok",
          "total": "0%",
          "valid-clicked:1": "2,296",
          "mousemove-exists:1": "40%",
          "valid-scrolling:1": "41%",
          "touch-exists:1": "64%",
          "mobile:1": "70%",
          "bots": "91%",
          "humans": "4%",
          "unknown": "85%"
        }
      ]
    },
    {
      "name": "ADVERTISER 3",
      "data": [
        {
          "UTM_SOURCE": "direct traffic",
          "total": "98%",
          "valid-clicked:1": "599,734",
          "mousemove-exists:1": "59%",
          "valid-scrolling:1": "66%",
          "touch-exists:1": "34%",
          "mobile:1": "75%",
          "bots": "4%",
          "humans": "14%",
          "unknown": "63%"
        },
        {
          "UTM_SOURCE": "google search",
          "total": "1%",
          "valid-clicked:1": "7,776",
          "mousemove-exists:1": "63%",
          "valid-scrolling:1": "70%",
          "touch-exists:1": "51%",
          "mobile:1": "84%",
          "bots": "36%",
          "humans": "14%",
          "unknown": "81%"
        },
        {
          "UTM_SOURCE": "bing search",
          "total": "0%",
          "valid-clicked:1": "2,535",
          "mousemove-exists:1": "49%",
          "valid-scrolling:1": "61%",
          "touch-exists:1": "40%",
          "mobile:1": "60%",
          "bots": "6%",
          "humans": "22%",
          "unknown": "63%"
        },
        {
          "UTM_SOURCE": "google display",
          "total": "0%",
          "valid-clicked:1": "254",
          "mousemove-exists:1": "54%",
          "valid-scrolling:1": "53%",
          "touch-exists:1": "14%",
          "mobile:1": "43%",
          "bots": "3%",
          "humans": "34%",
          "unknown": "53%"
        }
      ]
    },
    {
      "name": "ADVERTISER 4",
      "data": [
        {
          "UTM_SOURCE": "direct traffic",
          "total": "71%",
          "valid-clicked:1": "293,903",
          "mousemove-exists:1": "56%",
          "valid-scrolling:1": "51%",
          "touch-exists:1": "56%",
          "mobile:1": "78%",
          "bots": "47%",
          "humans": "20%",
          "unknown": "68%"
        },
        {
          "UTM_SOURCE": "google search",
          "total": "8%",
          "valid-clicked:1": "34,440",
          "mousemove-exists:1": "51%",
          "valid-scrolling:1": "50%",
          "touch-exists:1": "74%",
          "mobile:1": "87%",
          "bots": "78%",
          "humans": "7%",
          "unknown": "91%"
        },
        {
          "UTM_SOURCE": "facebook",
          "total": "7%",
          "valid-clicked:1": "29,623",
          "mousemove-exists:1": "31%",
          "valid-scrolling:1": "32%",
          "touch-exists:1": "46%",
          "mobile:1": "77%",
          "bots": "74%",
          "humans": "1%",
          "unknown": "95%"
        },
        {
          "UTM_SOURCE": "(v)360 display",
          "total": "4%",
          "valid-clicked:1": "18,500",
          "mousemove-exists:1": "17%",
          "valid-scrolling:1": "17%",
          "touch-exists:1": "14%",
          "mobile:1": "36%",
          "bots": "83%",
          "humans": "14%",
          "unknown": "51%"
        },
        {
          "UTM_SOURCE": "bing search",
          "total": "2%",
          "valid-clicked:1": "6,649",
          "mousemove-exists:1": "61%",
          "valid-scrolling:1": "76%",
          "touch-exists:1": "66%",
          "mobile:1": "79%",
          "bots": "7%",
          "humans": "14%",
          "unknown": "81%"
        },
        {
          "UTM_SOURCE": "email",
          "total": "1%",
          "valid-clicked:1": "4,650",
          "mousemove-exists:1": "59%",
          "valid-scrolling:1": "55%",
          "touch-exists:1": "68%",
          "mobile:1": "86%",
          "bots": "64%",
          "humans": "16%",
          "unknown": "80%"
        },
        {
          "UTM_SOURCE": "pardot",
          "total": "0%",
          "valid-clicked:1": "1,086",
          "mousemove-exists:1": "62%",
          "valid-scrolling:1": "60%",
          "touch-exists:1": "57%",
          "mobile:1": "87%",
          "bots": "63%",
          "humans": "14%",
          "unknown": "80%"
        }
      ]
    },
    {
      "name": "ADVERTISER 5",
      "data": [
        {
          "UTM_SOURCE": "direct traffic",
          "total": "89%",
          "valid-clicked:1": "425,039",
          "mousemove-exists:1": "45%",
          "valid-scrolling:1": "45%",
          "touch-exists:1": "27%",
          "mobile:1": "68%",
          "bots": "24%",
          "humans": "30%",
          "unknown": "54%"
        },
        {
          "UTM_SOURCE": "google search",
          "total": "7%",
          "valid-clicked:1": "32,472",
          "mousemove-exists:1": "22%",
          "valid-scrolling:1": "28%",
          "touch-exists:1": "38%",
          "mobile:1": "54%",
          "bots": "71%",
          "humans": "19%",
          "unknown": "65%"
        },
        {
          "UTM_SOURCE": "bing search",
          "total": "2%",
          "valid-clicked:1": "7,596",
          "mousemove-exists:1": "27%",
          "valid-scrolling:1": "60%",
          "touch-exists:1": "36%",
          "mobile:1": "43%",
          "bots": "3%",
          "humans": "22%",
          "unknown": "62%"
        },
        {
          "UTM_SOURCE": "facebook",
          "total": "1%",
          "valid-clicked:1": "3,723",
          "mousemove-exists:1": "27%",
          "valid-scrolling:1": "28%",
          "touch-exists:1": "50%",
          "mobile:1": "67%",
          "bots": "75%",
          "humans": "4%",
          "unknown": "88%"
        },
        {
          "UTM_SOURCE": "PMAX",
          "total": "1%",
          "valid-clicked:1": "2,905",
          "mousemove-exists:1": "13%",
          "valid-scrolling:1": "21%",
          "touch-exists:1": "28%",
          "mobile:1": "39%",
          "bots": "61%",
          "humans": "17%",
          "unknown": "62%"
        },
        {
          "UTM_SOURCE": "linkedin",
          "total": "0%",
          "valid-clicked:1": "1,821",
          "mousemove-exists:1": "16%",
          "valid-scrolling:1": "24%",
          "touch-exists:1": "26%",
          "mobile:1": "35%",
          "bots": "60%",
          "humans": "14%",
          "unknown": "68%"
        },
        {
          "UTM_SOURCE": "demandbase",
          "total": "0%",
          "valid-clicked:1": "393",
          "mousemove-exists:1": "3%",
          "valid-scrolling:1": "3%",
          "touch-exists:1": "5%",
          "mobile:1": "9%",
          "bots": "37%",
          "humans": "82%",
          "unknown": "10%"
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.createChart();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  updateChart(): void {
    d3.select(this.chartContainer.nativeElement).selectAll("*").remove();
    this.createChart();
  }

  private parseValue(value: string): number {
    return parseFloat(value.replace('%', '').replace(',', ''));
  }

  private prepareData(): ChartData[] {
    let data: ChartData[] = [];

    if (this.selectedAdvertiser === 'all') {
      // Combine all advertisers
      this.advertisers.forEach(advertiser => {
        advertiser.data.forEach(item => {
          if (this.selectedMetric !== 'valid-clicked:1') { // Skip click counts for percentage metrics
            data.push({
              source: `${item.UTM_SOURCE} (${advertiser.name})`,
              advertiser: advertiser.name,
              value: this.parseValue(item[this.selectedMetric as keyof AdvertiserData]),
              rawValue: item[this.selectedMetric as keyof AdvertiserData]
            });
          }
        });
      });
    } else {
      // Single advertiser
      const advertiser = this.advertisers.find(a => a.name === this.selectedAdvertiser);
      if (advertiser) {
        advertiser.data.forEach(item => {
          data.push({
            source: item.UTM_SOURCE,
            advertiser: advertiser.name,
            value: this.parseValue(item[this.selectedMetric as keyof AdvertiserData]),
            rawValue: item[this.selectedMetric as keyof AdvertiserData]
          });
        });
      }
    }

    // Sort data
    if (this.sortOrder === 'desc') {
      data.sort((a, b) => b.value - a.value);
    } else if (this.sortOrder === 'asc') {
      data.sort((a, b) => a.value - b.value);
    } else {
      data.sort((a, b) => a.source.localeCompare(b.source));
    }

    return data;
  }

  private calculateSummaryStats(data: ChartData[]): void {
    if (data.length === 0) return;

    const values = data.map(d => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    const maxItem = data.find(d => d.value === max);
    const minItem = data.find(d => d.value === min);

    this.summaryStats = {
      average: average.toFixed(1),
      max: max.toFixed(1),
      min: min.toFixed(1),
      maxSource: maxItem?.source || '',
      minSource: minItem?.source || '',
      count: data.length
    };
  }

  private createChart(): void {
    const data = this.prepareData();
    this.calculateSummaryStats(data);

    if (data.length === 0) return;

    // Chart dimensions
    const barHeight = 25;
    const marginTop = 30;
    const marginRight = 80;
    const marginBottom = 10;
    const marginLeft = 200; // Increased for longer source names
    const height = Math.ceil((data.length + 0.1) * barHeight) + marginTop + marginBottom;

    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 100])
      .rangeRound([marginLeft, this.width - marginRight]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.source))
      .rangeRound([marginTop, height - marginBottom])
      .padding(0.1);

    // Color scale based on advertiser
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(this.advertisers.map(a => a.name));

    // Create SVG
    const svg = d3.select(this.chartContainer.nativeElement)
      .append("svg")
      .attr("viewBox", [0, 0, this.width, height])
      .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");

    // Add bars
    svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("fill", d => colorScale(d.advertiser))
      .attr("x", marginLeft)
      .attr("y", d => y(d.source)!)
      .attr("width", d => x(d.value) - marginLeft)
      .attr("height", y.bandwidth())
      .attr("opacity", 0.8);

    // Add value labels
    svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 11)
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("text-anchor", "start")
      .attr("x", d => x(d.value) + 5)
      .attr("y", d => y(d.source)! + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .text(d => `${d.value}%`)
      .attr("fill", "#333");

    // Add top axis
    svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(d3.axisTop(x).ticks(this.width / 100).tickFormat(d => `${d}%`))
      .call(g => g.selectAll(".tick line").clone()
        .attr("y2", height - marginTop - marginBottom)
        .attr("stroke-opacity", 0.1))
      .call(g => g.select(".domain").remove());

    // Add left axis (source names)
    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickSize(0).tickPadding(6))
      .call(g => g.select(".domain").remove());

    // Add chart title
    svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .attr("transform", "translate(" + 0 + "," + -5 + ")")
      .text(`${this.getMetricDisplayName()} - ${this.selectedAdvertiser === 'all' ? 'All Advertisers' : this.selectedAdvertiser}`);
  }

  private getMetricDisplayName(): string {
    const metricNames: { [key: string]: string } = {
      'total': 'Total Traffic',
      'mousemove-exists:1': 'Mouse Movement',
      'valid-scrolling:1': 'Valid Scrolling',
      'touch-exists:1': 'Touch Interaction',
      'mobile:1': 'Mobile Traffic',
      'bots': 'Bot Traffic',
      'humans': 'Human Traffic',
      'unknown': 'Unknown Traffic'
    };
    return metricNames[this.selectedMetric] || this.selectedMetric;
  }
}