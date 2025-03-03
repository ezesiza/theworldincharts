
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'route-overlay',
  templateUrl: './route-overlay.component.html',
  styleUrl: './route-overlay.component.less'
})
export class RouteOverlayComponent {


  @Input() action: string = '';
  @Input() loading: boolean = false;
  isMinimized: boolean = false;



  @Input() isActive = true;
  @Output() close = new EventEmitter<void>();

  constructor(private location: Location) { }

  onClose(): void {
    this.close.emit();
    this.location.back();
  }
}
