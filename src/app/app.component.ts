import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent implements OnInit {
  pathname = '/';

  constructor(private route: ActivatedRoute) {
    this.pathname = location.pathname;
  }

  ngOnInit() {
    // this.on()
  }

  on() {
    document.getElementById("overlay").style.display = "block";
  }

  off() {
    document.getElementById("overlay").style.display = "none";
  }

  notHomeRoute() {
    return this.pathname === '\/'
  }

}
