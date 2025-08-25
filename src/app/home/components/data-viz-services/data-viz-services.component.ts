import { Component } from '@angular/core';

@Component({
  selector: 'data-viz-services',
  templateUrl: './data-viz-services.component.html',
  styleUrls: ['./data-viz-services.component.less']
})
export class DataVizServicesComponent {
  public currentYear: number = new Date().getFullYear();
}
