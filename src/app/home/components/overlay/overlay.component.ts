import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'overlay',
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.less',
  encapsulation: ViewEncapsulation.None
})
export class OverlayComponent {
  @Input() action: string = '';
  @Input() loading: boolean = false;
  isMinimized: boolean = false;

  constructor(public location: Location) { }

}
