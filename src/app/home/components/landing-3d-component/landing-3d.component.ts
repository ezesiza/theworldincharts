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
  selector: 'app-landing-3d',
  templateUrl: 'landing-3d.component.html',
  styleUrl: './landing-3d.component.less',
})
export class Landing3dComponent implements OnInit {
  constructor(private router: Router) { }

  private allOptions: SearchOption[] = [
    { name: 'Flat Earth (3D)', route: '/earth', category: '3D Views' },
    { name: 'World Vizualizer', route: '/social', category: '3D Views' },
    { name: 'Matrix', route: '/matrix', category: '3D Views' },
    { name: 'Data Breach Impact', route: '/breach', category: '3D Views' },
    { name: 'Back to Home', route: '/', category: 'Navigation' },
    { name: 'World Globe', route: '/globe', category: 'Navigation' },
  ];

  searchControl = new FormControl('');
  filteredOptions: SearchOption[] = [];
  selectedIndex = -1;
  landingItems: { [key: string]: SearchOption[] } = {};

  ngOnInit() {
    this.filteredOptions = [...this.allOptions];
    this.landingItems = this.getOptionsByCategory();

    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.onSearch();
      });
  }

  onSearch() {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    this.filteredOptions = this.allOptions.filter(option =>
      option.name.toLowerCase().includes(searchTerm) ||
      option.category?.toLowerCase().includes(searchTerm)
    );
    this.landingItems = this.getOptionsByCategory();
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
