import { RouterModule, Routes } from '@angular/router';
import { AlaaapDashboardComponent } from './home/components/dashboards/alaaap-dashboard/alaaap-dashboard.component';
import { NgModule } from '@angular/core';
import { LandingComponent } from './home/components/landing-component/landing.component';
import { VoronoiComponent } from './home/components/charts/voronoi/voronoi.component';
import { RaceBarComponent } from './home/components/charts/race-bar/race-bar.component';
import { RadialDonutChartComponent } from './home/components/charts/radial-donut-chart/radial-donut-chart.component';
import { SankeyComponent } from './home/components/charts/sankey/sankey.component';
import { FlatEarthComponent } from './home/components/charts/flat-earth/flat-earth.component';
import { VoronoiOriginalComponent } from './home/components/charts/voronoi/voronoi.original';
import { SankeyMovableComponent } from './home/components/charts/sankey-movable/sankey-movable.component';
import { DonutRaceComponent } from './home/components/charts/dount-race/donut-race.component';
import { DonutChartComponent } from './home/components/charts/donut-chart/donut-chart.component';
import { SankeyDragComponent } from './home/components/charts/sankey-drag/sankey-drag.component';
import { SampleComponent } from './home/components/charts/sample/sample.component';

export const routes: Routes = [
    { path: '', component: LandingComponent, pathMatch: 'full' },
    { path: 'voronoi', data: { animate: false }, component: VoronoiComponent },
    { path: 'voronoi-two', data: { animate: false }, component: VoronoiOriginalComponent },
    { path: 'earth', component: FlatEarthComponent },
    { path: 'industry', component: SankeyDragComponent },
    { path: 'race', component: RaceBarComponent },
    { path: 'donut', component: DonutRaceComponent },
    { path: 'sankey', component: SankeyComponent },
    { path: 'intent', component: RadialDonutChartComponent },
    { path: 'analytics', component: AlaaapDashboardComponent },
    { path: 'sample', component: SampleComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
