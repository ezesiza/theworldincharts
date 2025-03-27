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
    { name: 'Browser Market Share', route: '/browser', category: 'Visualizations' },
    { name: 'World GDP by Population', route: '/voronoi-gdp', category: 'Visualizations' },
    { name: 'Companies Valuation', route: '/compvaluation', category: 'Visualizations' },
    { name: 'Energy Data', route: '/sankey', category: 'Visualizations' },

    { name: 'Aid Data', route: '/earth', category: 'Dashboards' },
    { name: 'Global Companies by Market Cap', route: '/voronoi', category: 'Dashboards' },
    { name: 'Analytics Dashboard', route: '/analytics', category: 'Dashboards' },
    { name: 'Metrics Dashboard', route: '/metrics', category: 'Dashboards' },

    { name: 'Line Chart', route: '/linechart', category: 'Charts' },
    { name: 'Funnel Chart', route: '/funnel', category: 'Charts' },
    { name: 'Delaunay', route: '/delaunay', category: 'Charts' },

    { name: 'Tabs', route: '/tabs', category: 'Components' },
    { name: 'Sample', route: '/sample', category: 'Components' },
    { name: 'Delaunay Diagram', route: '/diagram', category: 'Components' }
  ];

  searchControl = new FormControl('');
  filteredOptions: SearchOption[] = [];
  selectedIndex = -1;

  ngOnInit() {
    // Initialize with all options
    this.filteredOptions = [...this.allOptions];

    // Setup search input with debounce and distinct checking
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.onSearch();
    });
  }

  onSearch() {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';

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
    // Navigate to the corresponding route
    // You'll need to inject Router in the constructor
    this.router.navigate([option.route]);

    // For now, just set the input value and clear options
    this.searchControl.setValue(option.name);
    this.filteredOptions = [];
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
