import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent implements OnInit {
  pathname = '/';
  isDarkMode = false;

  constructor(private route: ActivatedRoute, private themeService: ThemeService) {
    this.pathname = location.pathname;
  }

  ngOnInit() {
    this.themeService.isDarkModeEnabled$.subscribe((enabled) => {
      this.isDarkMode = enabled;
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
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
