import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SearchOption {
  name: string;
  route: string;
  category?: string;
}


@Component({
  selector: 'app-landing',
  templateUrl: 'landing.component.html',
  styleUrl: './landing.component.less',
})
export class LandingComponent implements OnInit {

  constructor(private router: Router) { }
  // Categorized list of searchable options
  private allOptions: SearchOption[] = [
    // { name: 'Sample', route: '/sample', category: 'Components' }
    { name: 'GDP Population', route: '/voronoi-gdp', category: 'Visualizations' },
    { name: 'Companies Valuation', route: '/compvaluation', category: 'Visualizations' },
    { name: 'Energy Data', route: '/sankey', category: 'Visualizations' },
    { name: 'Crypto Trade', route: '/crypto', category: 'Visualizations' },
    { name: 'Browser Realtime Monitor', route: '/donut-monitor', category: 'Visualizations' },

    { name: 'Aid Data', route: '/earth', category: 'Dashboards' },
    { name: 'RealTime Monitor', route: '/bubble-monitor', category: 'Dashboards' },
    { name: 'Global Companies by Market Cap', route: '/voronoi', category: 'Dashboards' },
    { name: 'Finance Dashboard', route: '/finance', category: 'Dashboards' },
    { name: 'Compliance Dashboard', route: '/compliance', category: 'Dashboards' },
    { name: 'World Vizualizer', route: '/social', category: 'Dashboards' },

    { name: 'Analytics Dashboard', route: '/analytics', category: 'CyberSec' },
    { name: 'Metrics Dashboard', route: '/metrics', category: 'CyberSec' },
    { name: 'Mitre Dashboard', route: '/attack-tree', category: 'CyberSec' },
    { name: 'Matrix', route: '/matrix', category: 'CyberSec' },
    { name: 'Vulnerability Dashboard', route: '/cved', category: 'CyberSec' },
    { name: 'Security & Data Breach', route: '/breach', category: 'CyberSec' },

    // { name: 'Browser Market Share', route: '/browser', category: 'Charts' },
    // { name: 'Line Chart', route: '/linechart', category: 'Charts' },
    // { name: 'Tabs', route: '/tabs', category: 'Components' },
    // { name: 'Funnel Chart', route: '/funnel', category: 'Charts' },
    // { name: 'Diverging Bars', route: '/diverging', category: 'Charts' },
    // { name: 'Radial Bars', route: '/stacked', category: 'Charts' },
    { name: 'Cyber Incidents', route: '/incidents', category: 'Charts' },
    { name: 'US States Population', route: '/states', category: 'Charts' },
    { name: 'Area', route: '/area', category: 'Charts' },

    { name: 'Click Analysis', route: '/click', category: 'Finance, Ads & Market' },
    { name: 'Revenue Management', route: '/revenue', category: 'Finance, Ads & Market' },
    { name: 'Market Cap', route: '/market', category: 'Finance, Ads & Market' },
    { name: 'Advertiser Data', route: '/adfraud', category: 'Finance, Ads & Market' },
    { name: 'Ad-Nalytics', route: '/founalytics', category: 'Finance, Ads & Market' },
    { name: 'Cost Pricing', route: '/cpm', category: 'Finance, Ads & Market' },
  ];

  searchControl = new FormControl('');
  filteredOptions: SearchOption[] = [];
  selectedIndex = -1;
  landingItems: { [key: string]: SearchOption[] } = {};

  ngOnInit() {
    // Initialize with all options
    this.filteredOptions = [...this.allOptions];
    this.landingItems = this.getOptionsByCategory();
    // Setup search input with debounce and distinct checking
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.onSearch();
      });

  }

  onSearch() {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    this.landingItems = this.getOptionsByCategory();

    // Filter options based on search term
    this.filteredOptions = this.allOptions.filter(option =>
      option.name.toLowerCase().includes(searchTerm) ||
      option.category?.toLowerCase().includes(searchTerm)
    );
    // Reset selected index when filtering
    this.selectedIndex = -1;
  }

  onArrowDown() {
    if (this.selectedIndex < this.filteredOptions.length - 1) {
      this.selectedIndex++;
    }
  }

  onArrowUp() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  onEnter() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredOptions.length) {
      this.selectOption(this.filteredOptions[this.selectedIndex]);
    }
  }

  selectOption(option: SearchOption) {
    this.searchControl.setValue(option.name);
    this.filteredOptions = [];

    this.router.navigate([option.route]);
  }

  // Group options by category
  getOptionsByCategory(): { [key: string]: SearchOption[] } {

    return this.filteredOptions.reduce((acc, option) => {
      const category = option.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option);
      return acc;
    }, {} as { [key: string]: SearchOption[] });
  }
}
