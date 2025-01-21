import { RouterModule, Routes } from '@angular/router';
import { AnalyticsDashboardComponent } from './home/components/dashboards/alaaap-dashboard/alaaap-dashboard.component';
import { NgModule } from '@angular/core';
import { LandingComponent } from './home/components/landing-component/landing.component';
import { VoronoiComponent } from './home/components/charts/voronoi/voronoi.component';
import { RaceBarComponent } from './home/components/charts/race-bar/race-bar.component';
import { RadialDonutChartComponent } from './home/components/charts/radial-donut-chart/radial-donut-chart.component';
import { SankeyComponent } from './home/components/charts/sankey/sankey.component';
import { FlatEarthComponent } from './home/components/charts/flat-earth/flat-earth.component';
import { VoronoiOriginalComponent } from './home/components/charts/voronoi/voronoi.original';
import { DonutRaceComponent } from './home/components/charts/dount-race/donut-race.component';
import { SankeyDragComponent } from './home/components/charts/sankey-drag/sankey-drag.component';
import { SampleComponent } from './home/components/charts/sample/sample.component';
import { MetricsDashboardComponent } from './home/components/dashboards/metrics-dashboard/metrics-dashboard.component';
import { TabsComponent } from './home/components/tabs/tabs.component';
import { DelaunayComponent } from './home/components/delaunay/delaunay.component';
import { DelaunayDiagramComponent } from './home/components/delaunay/delaunay.diagram';
import { FunnelChartComponent } from './home/components/charts/funnel/funnel.component';

export const routes: Routes = [
    { path: '', component: LandingComponent, pathMatch: 'full' },
    { path: 'voronoi', data: { animate: false }, component: VoronoiComponent },
    { path: 'voronoi-gdp', data: { animate: false }, component: VoronoiOriginalComponent },
    { path: 'earth', component: FlatEarthComponent },
    { path: 'metrics', component: MetricsDashboardComponent },
    { path: 'industry', component: SankeyDragComponent },
    { path: 'compvaluation', component: RaceBarComponent },
    { path: 'browser', component: DonutRaceComponent },
    { path: 'sankey', component: SankeyComponent },
    { path: 'delaunay', component: DelaunayComponent },
    { path: 'analytics', component: AnalyticsDashboardComponent },
    { path: 'tabs', component: TabsComponent },
    { path: 'diagram', component: DelaunayDiagramComponent },
    { path: 'radial', component: RadialDonutChartComponent },
    { path: 'funnel', component: FunnelChartComponent },
    { path: 'sample', component: SampleComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
