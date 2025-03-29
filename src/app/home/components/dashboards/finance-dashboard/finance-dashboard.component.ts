import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrl: './finance-dashboard.component.less'
})
export class FinanceDashboardComponent {
  activatedRoute: string = '';

  constructor(private route: ActivatedRoute) {
    this.route.url.subscribe(url => {
      this.activatedRoute = url[0].path;
    })
  }
}
