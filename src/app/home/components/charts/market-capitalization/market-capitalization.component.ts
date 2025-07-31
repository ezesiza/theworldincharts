import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { map } from 'rxjs';

interface CompanyData {
  name: string;
  value: number;
  color: string;
  logo: string;
}

interface CompanyDataset {
  name: string;
  data: CompanyData[];
}

@Component({
  selector: 'app-market-cap-treemap',
  templateUrl: './market-capitalization.component.html',
  styleUrls: ['./market-capitalization.component.less']
})
export class MarketCapitalizationComponent implements OnInit, AfterViewInit {
  datasets: CompanyDataset[] = [];
  currentDataset: CompanyDataset = { name: '', data: [] };
  isLoading = true;
  private viewInitialized = false;

  // Initialize treemapData with empty data
  treemapData = {
    name: "Market Cap",
    children: [] as CompanyData[]
  };

  private width = 800;
  private height = 400;
  format = d3.format(".2s");
  private uidCounter = 0;
  private currentTileType = 'squarify';

  // Stats properties
  totalCompanies = 0;
  totalValue = '$0';
  largestCompany = '-';
  private readonly LEGEND_LAYOUT_KEY = 'legendLayoutPreference';
  showVerticalLegend = false;

  toggleLegendLayout(): void {
    this.showVerticalLegend = !this.showVerticalLegend;
    localStorage.setItem(
      this.LEGEND_LAYOUT_KEY,
      this.showVerticalLegend ? 'vertical' : 'grid'
    );
  }

  sortLegend(method: any): void {
    if (!this.currentDataset) return;

    const [key, direction] = method.target.value.split('-');

    this.currentDataset.data.sort((a, b) => {
      const valA = key === 'name' ? a.name : a.value;
      const valB = key === 'name' ? b.name : b.value;

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.createChart(); // Re-render with new sort
  }

  highlightedCompany: string | null = null;

  highlightCompany(companyName: string): void {
    this.highlightedCompany = companyName;
    d3.selectAll('.treemap-rect')
      .attr('fill-opacity', (d: any) =>
        d.data.name === companyName ? 1 : 0.6);
  }

  resetHighlight(): void {
    this.highlightedCompany = null;
    d3.selectAll('.treemap-rect')
      .attr('fill-opacity', 0.85);
  }

  constructor(private http: HttpClient) { }

  loadCsv(path: string) {
    return this.http.get(path, { responseType: 'text' }).pipe(
      map(csvData => this.parseCsv(csvData)))
  }

  private parseCsv(csvData: string): string[][] {
    return csvData.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.split(',').map(item => item.trim()));
  }

  async loadAllDatasets() {
    try {
      const datasets = await Promise.all([
        this.loadDataset('Zoom', '/assets/datasets/zoom.csv'),
        this.loadDataset('Amazon', '/assets/datasets/amazon.csv'),
        this.loadDataset('Apple', '/assets/datasets/apple.csv'),
        this.loadDataset('Tesla', '/assets/datasets/tesla.csv'),
        this.loadDataset('Financials', '/assets/datasets/financials.csv'),
        this.loadDataset('Airlines', '/assets/datasets/airlines.csv'),
        this.loadDataset('Healthcare', '/assets/datasets/healthcare.csv'),
        this.loadDataset('Energies', '/assets/datasets/energies.csv'),
        this.loadDataset('Retail', '/assets/datasets/retail.csv'),
        this.loadDataset('Tech Companies', '/assets/datasets/tech_companies.csv'),
        this.loadDataset('Semi-Conductors', '/assets/datasets/semiconductor.csv'),
        this.loadDataset('E-Commerce', '/assets/datasets/ecommerce.csv'),
        this.loadDataset('Telecoms & Network', '/assets/datasets/telecoms.csv'),
        this.loadDataset('Biotechnology', '/assets/datasets/biotech.csv'),
        this.loadDataset('Renewable Energy', '/assets/datasets/renewable.csv'),
        this.loadDataset('Entertainment & Streaming', '/assets/datasets/entertainment.csv'),
        this.loadDataset('Cybersecurity', '/assets/datasets/cybersecurity.csv'),
        this.loadDataset('Space', '/assets/datasets/space.csv'),
        this.loadDataset('Fintech', '/assets/datasets/fintech.csv'),
        this.loadDataset('Food', '/assets/datasets/food.csv'),
        this.loadDataset('Automotive', '/assets/datasets/automotive.csv')
      ]);

      this.datasets = datasets.filter(d => d !== null) as CompanyDataset[];

      if (this.datasets.length > 0) {
        this.currentDataset = this.datasets[0];
        this.treemapData.children = this.currentDataset.data;
      }
    } catch (error) {
      console.error('Error loading datasets:', error);
    }
  }

  private async loadDataset(name: string, path: string): Promise<CompanyDataset | null> {
    try {
      const data = await this.csvToCompanyDataWithLogos(path);
      return { name, data };
    } catch (error) {
      console.error(`Error loading ${name} dataset:`, error);
      return null;
    }
  }

  async ngOnInit() {
    await this.loadAllDatasets();
    this.isLoading = false;
    this.updateStats();

    this.initializeChart();
    const savedLayout = localStorage.getItem(this.LEGEND_LAYOUT_KEY);
    this.showVerticalLegend = savedLayout === 'vertical';
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    // Try to initialize chart again in case data was already loaded
    this.initializeChart();

    // Also add a backup initialization after a short delay
    setTimeout(() => {
      if (!d3.select("#chart svg").node()) {
        console.log('Backup chart initialization triggered');
        this.initializeChart();
      }
    }, 200);
  }

  private initializeChart() {
    // Ensure both data and view are ready before creating chart
    if (this.viewInitialized && !this.isLoading && this.currentDataset?.data?.length > 0) {
      // Use setTimeout to ensure DOM is fully rendered and change detection has completed
      setTimeout(() => {
        console.log('Initializing chart with timing delay');
        this.createChart();
      }, 100); // Small delay to ensure everything is ready
    }
  }

  private createUID(name: string) {
    const id = `${name}-${++this.uidCounter}`;
    return { id, href: `#${id}` };
  }

  private getTileFunction(type: string) {
    switch (type) {
      case 'binary': return d3.treemapBinary;
      case 'dice': return d3.treemapDice;
      case 'slice': return d3.treemapSlice;
      case 'sliceDice': return d3.treemapSliceDice;
      case 'squarify':
      default: return d3.treemapSquarify;
    }
  }

  private createTreemap(data: any, tileType = 'squarify') {
    return d3.treemap()
      .tile(this.getTileFunction(tileType))
      .size([this.width, this.height])
      .padding(4)
      .round(false)
      (d3.hierarchy(data)
        .sum((d: any) => d.value || 0)
        .sort((a: any, b: any) => b.value - a.value)
      );
  }

  createChart(tileType = 'squarify') {
    // Guard clause to prevent chart creation with invalid data
    if (!this.currentDataset?.data?.length || !this.viewInitialized) {
      return;
    }

    this.currentTileType = tileType;

    // Clear previous chart
    d3.select("#chart").selectAll("*").remove();

    const root = this.createTreemap(this.treemapData, tileType);

    const svg = d3.select("#chart")
      .append("svg")
      .attr("viewBox", [0, 0, this.width, this.height])
      .style("font", "14px sans-serif");

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    // Add tooltips
    leaf.append("title")
      .text((d: any) => `${d.data.name}\nMarket Cap: ${this.format(d.value)}`);

    // Add rectangles
    leaf.append("rect")
      .attr("class", "treemap-rect")
      .attr("id", (d: any) => {
        d.leafUid = this.createUID("leaf");
        return d.leafUid.id;
      })
      .attr("fill", (d: any) => d.data.color)
      .attr("fill-opacity", 0.85)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
      .attr("rx", 4)
      .attr("ry", 4);

    // Add clip paths for text
    leaf.append("clipPath")
      .attr("id", (d: any) => {
        d.clipUid = this.createUID("clip");
        return d.clipUid.id;
      })
      .append("use")
      .attr("href", (d: any) => d.leafUid.href);

    // Add company logos
    leaf.append("image")
      .attr("x", (d: any) => Math.max(0, (d.x1 - d.x0) - 35))
      .attr("y", 8)
      .attr("width", 24)
      .attr("height", 24)
      .attr("href", (d: any) => d.data.logo)
      .attr("opacity", 0.8)
      .style("pointer-events", "none");

    // Add text labels
    leaf.append("text")
      .attr("class", "treemap-text")
      .attr("clip-path", (d: any) => `url(${d.clipUid.href})`)
      .style("fill", "#2c3e50")
      .style("font-weight", "600")
      .selectAll("tspan")
      .data((d: any) => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;

        if (width < 120 || height < 60) {
          const shortName = d.data.name.split(' ')[0];
          const valuePart = "$" + this.format(d.value);
          return [shortName, valuePart];
        } else {
          const nameParts = d.data.name.split(/\s+/);
          const valuePart = "$" + this.format(d.value);
          return [...nameParts, valuePart];
        }
      })
      .join("tspan")
      .attr("x", 6)
      .attr("y", (d: any, i: number, nodes: any) => `${1.1 + i * 1.2}em`)
      .attr("fill-opacity", (d: any, i: number, nodes: any) => i === nodes.length - 1 ? 0.7 : 1)
      .style("font-size", (d: any, i: number, nodes: any) => {
        if (i === nodes.length - 1) return "10px";
        return "12px";
      })
      .style("font-weight", (d: any, i: number, nodes: any) => i === nodes.length - 1 ? "normal" : "600")
      .text((d: any) => d);

    this.updateStats();
  }

  private updateStats(): void {
    // Guard clause to prevent errors when currentDataset is undefined
    if (!this.currentDataset?.data?.length) {
      this.totalValue = '$0';
      this.largestCompany = '-';
      this.totalCompanies = 0;
      return;
    }

    const totalValue = this.currentDataset.data.reduce((sum, d) => sum + d.value, 0);
    const largestCompany = this.currentDataset.data.reduce((max, d) =>
      d.value > max.value ? d : max, this.currentDataset.data[0]);

    this.totalValue = '$' + this.format(totalValue);
    this.largestCompany = largestCompany.name;
    this.totalCompanies = this.currentDataset.data.length;
  }

  onTileTypeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.createChart(selectElement.value);
  }

  onDatasetChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedDataset = this.datasets.find(d => d.name === selectElement.value);
    if (selectedDataset) {
      this.currentDataset = selectedDataset;
      this.treemapData.children = selectedDataset.data;
      this.totalCompanies = selectedDataset.data.length;
      this.createChart();
    }
  }

  async csvToCompanyDataWithLogos(path: string): Promise<CompanyData[]> {
    const csvRows = await this.loadCsv(path).toPromise();
    if (!csvRows || csvRows.length === 0) return [];

    const headers = csvRows[0];
    const dataRows = csvRows.slice(1);

    const companies: CompanyData[] = [];

    for (const row of dataRows) {
      const company: Partial<CompanyData> = {};

      headers.forEach((header, index) => {
        const value = row[index]?.trim();
        const lowerHeader = header.toLowerCase();

        if (lowerHeader === 'name') company.name = value;
        if (lowerHeader === 'value') company.value = parseFloat(value);
        if (lowerHeader === 'color') {
          company.color = value.startsWith('#') ? value : `#${value}`;
        }
      });

      if (!company.name || isNaN(company.value!)) continue;

      company.color = company.color || '#bbbbbb';
      company.logo = await this.getCompanyLogo(company.name);
      companies.push(company as CompanyData);
    }

    return companies;
  }


  private getDefaultLogo(companyName: string): string {
    const initials = companyName.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#bbbbbb" rx="10"/>
      <text x="50" y="60" font-family="Arial" font-size="40" 
            fill="white" text-anchor="middle">${initials}</text>
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }


  private async getCompanyLogo(companyName: string): Promise<string> {
    // First clean the company name
    const cleanedName = companyName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .replace(/\s+/g, '');

    // Custom domain mappings
    const domainMap: { [key: string]: string } = {
      'agriculturalbankofchina': 'abchina.com',
      'elililly': 'lilly.com',
      'chinasouthernairlines': 'csair.com',
      'internationalconsolidatedairlines': 'iairgroup.com',
      'chinaeasternairlines': 'ceair.com',
      'royalbankofcanada': 'rbcroyalbank.com',
      'johnsonjohnson': 'jnj.com',
      'unitedairlinesholdings': 'united.com',
      'chinaconstructionbankgroup': 'ccb.com',
      'thechinaconstructionbank': 'ccb.com',
      // Additional common mappings
      'jpmorganchase': 'jpmorganchase.com',
      'thebankofamerica': 'bankofamerica.com',
      'wellsfargo': 'wellsfargo.com',
      'rsted.com': 'orsted.com',
      'novonordisk': 'novonordisk.com',
      'bristolmyerssquibb': 'bms.com',
      'astrazeneca': 'astrazeneca.com'
    };

    // Check if we have a custom mapping
    const customDomain = domainMap[cleanedName];

    if (customDomain) {
      const logoUrl = `https://logo.clearbit.com/${customDomain}`;
      if (await this.checkLogoExists(logoUrl, customDomain)) {
        return logoUrl;
      }
    }

    // Fallback to standard domain guessing
    const standardDomains = [
      `${cleanedName}.com`,
      `${cleanedName}group.com`,
      `${cleanedName}holdings.com`,
      `the${cleanedName}.com`
    ];

    for (const domain of standardDomains) {
      let logoUrl = `https://logo.clearbit.com/${domain}`;
      if (await this.checkLogoExists(logoUrl, domain)) {
        return logoUrl;
      } else {
        logoUrl = `https://img.logo.dev/${domain}`;
        return logoUrl;
      }
    }

    // Final fallback to default logo
    return this.getDefaultLogo(companyName);
  }

  private async checkLogoExists(url: string, domain: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      // console.log(response);
      return response.ok;
    } catch (err) {
      console.log(domain, url);
      return false;
    }
  }
}