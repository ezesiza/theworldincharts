import { RouterModule, Routes } from '@angular/router';
import { AnalyticsDashboardComponent } from './home/components/dashboards/alaaap-dashboard/alaaap-dashboard.component';
import { NgModule } from '@angular/core';
import { LandingComponent } from './home/components/landing-component/landing.component';
import { VoronoiComponent } from './home/components/charts/voronoi/voronoi.component';
import { RaceBarComponent } from './home/components/charts/race-bar/race-bar.component';
import { RadialDonutChartComponent } from './home/components/charts/radial-donut-chart/radial-donut-chart.component';
import { SankeyComponent } from './home/components/charts/sankey/sankey.component';
import { FlatEarthComponent } from './home/components/charts/flat-earth/flat-earth.component';
import { VoronoiOriginalComponent } from './home/components/charts/voronoi/voronoi-original/voronoi.original';
import { DonutRaceComponent } from './home/components/charts/dount-race/donut-race.component';
import { SankeyDragComponent } from './home/components/charts/sankey-drag/sankey-drag.component';
import { SampleComponent } from './home/components/charts/sample/sample.component';
import { MetricsDashboardComponent } from './home/components/dashboards/metrics-dashboard/metrics-dashboard.component';
import { TabsComponent } from './home/components/tabs/tabs.component';
import { FunnelChartComponent } from './home/components/charts/funnel/funnel.component';
import { DivergingBarsComponent } from './home/components/charts/divergin-bars/diverging-bars.component';
import { LineChartComponent } from './home/components/charts/line-chart/line-chart.component';
import { FinanceDashboardComponent } from './home/components/dashboards/finance-dashboard/finance-dashboard.component';
import { RadialStackedBarChartComponent } from './home/components/charts/radial-stacked-bar-chart/radial-stacked-bar-chart.component';
import { AnimatedBubbleComponent } from './home/components/dashboards/animated-bubble/animated-bubble.component';
import { BubbleRealtimeDashboardComponent } from './home/components/dashboards/bubble-realtime-dashboard/bubble-realtime-dashboard.component';
import { DonutRealtimeDashboardComponent } from './home/components/charts/donut-realtime-dashboard/donut-realtime-dashboard.component';
import { AttackTreeComponent2 } from './home/components/charts/attack-tree/attack-tree.component2';

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
    { path: 'analytics', component: AnalyticsDashboardComponent },
    { path: 'tabs', component: TabsComponent },
    { path: 'radial', component: RadialDonutChartComponent },
    { path: 'funnel', component: FunnelChartComponent },
    { path: 'attack-tree', component: AttackTreeComponent2 },
    { path: 'stacked', component: RadialStackedBarChartComponent },
    { path: 'diverging', component: DivergingBarsComponent },
    { path: 'linechart', component: LineChartComponent },
    { path: 'finance', component: FinanceDashboardComponent },
    { path: 'sample', component: SampleComponent },
    { path: 'crypto', component: AnimatedBubbleComponent },
    { path: 'bubble-monitor', component: BubbleRealtimeDashboardComponent },
    { path: 'donut-monitor', component: DonutRealtimeDashboardComponent },
    { path: '**', redirectTo: '/' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
