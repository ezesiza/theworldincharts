import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'custom-select',
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.less'
})
export class CustomSelectComponent implements OnInit {
  @Input() options: SelectOption[] = [
    { value: 'Country', label: 'Group By' },
    { value: 'Country', label: 'GroupBy Country' },
    { value: 'Company', label: 'Group Company' },
  ];

  @Input() initialValue?: any;
  @Input() type?: any;
  @Output() selectionChange = new EventEmitter<any>();

  selectedOption?: SelectOption;
  isOpen = false;

  ngOnInit() {
    // Set initial selection if provided
    if (this.initialValue !== undefined) {
      this.selectedOption = this.options.find(opt => opt.value === this.initialValue);
    } else if (this.options.length > 0) {
      this.selectedOption = this.options[0];
    }

    // Add click outside listener
    document.addEventListener('click', this.closeAllSelect.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeAllSelect.bind(this));
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  selectOption(option: SelectOption) {
    this.selectedOption = option;
    this.isOpen = false;
    this.selectionChange.emit(option);
  }

  private closeAllSelect(event: Event) {
    if (!(event.target as HTMLElement).closest('.custom-select')) {
      this.isOpen = false;
    }
  }
}