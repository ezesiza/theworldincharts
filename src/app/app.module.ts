import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CommonModule, NgClass } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';

import { RadialChartComponent } from './home/components/charts/radial-chart/radial-chart.component1';
import { SingleCardComponent } from './home/components/shared/single-card/single-card.component';
import { DonutChartComponent } from './home/components/charts/donut-chart/donut-chart.component';
import { RaceBarComponent } from './home/components/charts/race-bar/race-bar.component';
import { DonutRaceComponent } from './home/components/charts/dount-race/donut-race.component';
import { GlobeComponent } from './home/components/charts/globe/globe.component';
import { VoronoiComponent } from './home/components/charts/voronoi/voronoi.component';
import { AlaaapDashboardComponent } from './home/components/dashboards/alaaap-dashboard/alaaap-dashboard.component';
import { TimeSeriesBarChartComponent } from './home/components/charts/time-series-bar-chart/time-series-bar-chart.component';
import { LandingComponent } from './home/components/landing-component/landing.component';


@NgModule({
  declarations: [AppComponent, RadialChartComponent, 
    GlobeComponent,
    DonutRaceComponent, 
    TimeSeriesBarChartComponent,
    VoronoiComponent, 
    LandingComponent,
    AlaaapDashboardComponent,
    RaceBarComponent, 
    SingleCardComponent, 
    DonutChartComponent],
  imports: [
    NgClass,
    CommonModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
