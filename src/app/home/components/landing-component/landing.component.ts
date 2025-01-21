import { Component, OnInit } from '@angular/core';
import { LoadDataService } from 'app/home/services/load.data.service';
import { RaceBarService } from 'app/home/services/racebar.service';

@Component({
  selector: 'app-landing',
  templateUrl: 'landing.component.html',
  styleUrl: './landing.component.less',
})
export class LandingComponent implements OnInit {
  title = 'theworldincharts';
  browsers: any;
  products: any;

  constructor(private service: LoadDataService, private racebarService: RaceBarService) {

  }

  async ngOnInit() {

    this.service.getKeyFrames().subscribe(browseers => {
      this.browsers = browseers;
    })
    this.racebarService.getKeyFrames().subscribe((products: any) => {
      this.products = products;
    })
  }


}
