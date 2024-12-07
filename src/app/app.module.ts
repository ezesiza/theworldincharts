import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';


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

import { AnalyticsDashboardComponent } from './home/components/dashboards/alaaap-dashboard/alaaap-dashboard.component';
import { TimeSeriesBarChartComponent } from './home/components/charts/time-series-bar-chart/time-series-bar-chart.component';
import { LandingComponent } from './home/components/landing-component/landing.component';
import { VoronoiComponent } from './home/components/charts/voronoi/voronoi.component';
import { SankeyComponent } from './home/components/charts/sankey/sankey.component';
import { FlatEarthComponent } from './home/components/charts/flat-earth/flat-earth.component';
import { OverlayComponent } from './home/components/overlay/overlay.component';
import { AlaaapHeaderComponent } from './home/components/dashboards/alaaap-dashboard/alaaap-header/alaaap-header.component';
import { SampleComponent } from './home/components/charts/sample/sample.component';
import { VoronoiOriginalComponent } from './home/components/charts/voronoi/voronoi.original';
import { CustomSelectComponent } from './home/components/custom-select/custom-select.component';
import { reducers } from './ngrx/reducers';
import { CompanyFilterEffects } from './ngrx/effects/company.filter.effects';
import { MetricsDashboardComponent } from './home/components/dashboards/metrics-dashboard/metrics-dashboard.component';
import { TabsComponent } from './home/components/tabs/tabs.component';
import { DynamicTabDirective } from './home/components/tabs/dynamic-tab.directive';
import { DelaunayComponent } from './home/components/delaunay/delaunay.component';
import { DelaunayDiagramComponent } from './home/components/delaunay/delaunay.diagram';


@NgModule({
  declarations: [
    AppComponent,
    RadialChartComponent,
    SankeyComponent,
    GlobeComponent,
    FlatEarthComponent,
    OverlayComponent,
    VoronoiOriginalComponent,
    DelaunayComponent,
    DelaunayDiagramComponent,
    CustomSelectComponent,
    SampleComponent,
    AlaaapHeaderComponent,
    DonutRaceComponent,
    TimeSeriesBarChartComponent,
    VoronoiComponent,
    LandingComponent,
    AnalyticsDashboardComponent,
    RaceBarComponent,
    TabsComponent,
    DynamicTabDirective,
    MetricsDashboardComponent,
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
    EffectsModule.forRoot([CompanyFilterEffects]),
    StoreModule.forRoot(reducers)

  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }