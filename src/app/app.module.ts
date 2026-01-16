import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';


import { CommonModule, NgClass } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { LucideAngularModule, icons } from 'lucide-angular';

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
import { BubbleChartComponent, } from "./home/components/charts/bubble-chart/bubble-chart.component";
import { SampleComponent } from './home/components/charts/sample/sample.component';
import { CustomSelectComponent } from './home/components/custom-select/custom-select.component';
import { reducers } from './ngrx/reducers';
import { CompanyFilterEffects } from './ngrx/effects/company.filter.effects';
import { MetricsDashboardComponent } from './home/components/dashboards/metrics-dashboard/metrics-dashboard.component';
import { TabsComponent } from './home/components/tabs/tabs.component';
import { DynamicTabDirective } from './home/components/tabs/dynamic-tab.directive';
import { FunnelChartComponent } from './home/components/charts/funnel/funnel.component';
import { FormSelectComponent } from './home/components/form-select/form-select.component';
import { ContextMenuDirective } from './home/directives/context-menu.directive';
import { VoronoiOriginalComponent } from './home/components/charts/voronoi/voronoi-original/voronoi.original';
import { RouteOverlayComponent } from './home/components/charts/route-overlay/route-overlay.component';
import { DivergingBarsComponent } from './home/components/charts/divergin-bars/diverging-bars.component';
import { BouncingArrowDirective } from './bouncy-arrow.directive';
import { LineChartComponent } from './home/components/charts/line-chart/line-chart.component';
import { FinanceDashboardComponent } from './home/components/dashboards/finance-dashboard/finance-dashboard.component';
import { VoronoiEffects } from './ngrx/effects/voronoi.effects';
import { voronoiReducer } from './ngrx/reducers/voronoi.reducer';
import { VoronoiStateService } from './home/services/state.service';
import { RadialStackedBarChartComponent } from './home/components/charts/radial-stacked-bar-chart/radial-stacked-bar-chart.component';
import { AnimatedBubbleComponent } from './home/components/dashboards/animated-bubble/animated-bubble.component';
import { ModalComponent } from './home/components/charts/modal/modal.component';
import { BubbleRealtimeDashboardComponent } from './home/components/dashboards/bubble-realtime-dashboard/bubble-realtime-dashboard.component';
import { DonutRealtimeDashboardComponent } from './home/components/charts/donut-realtime-dashboard/donut-realtime-dashboard.component';
import { AttackTreeComponent } from './home/components/charts/attack-tree/attack-tree.component';
import { AttackTreeComponent2 } from './home/components/charts/attack-tree/attack-tree.component2';
import { SparklineChartComponent } from './home/components/charts/sparkline-chart/sparkline-chart.component';
import { MatrixComponent } from './home/components/charts/matrix/matrix.component';
import { AnimatedAreaComponent } from './home/components/charts/animated-area/animated-area.component';
import { DivergingRadialBarComponent } from './home/components/charts/diverging-radial-bar/diverging-radial-bar.component';
import { AdFraudComponent } from './home/components/charts/stacked-bar/ad-fraud.component';
import { HorizontalDivergingBarComponent } from './home/components/charts/horizontal-diverging-bar/horizontal-diverging-bar.component';
import { AdvertiserDashboardComponent } from './home/components/charts/horizontal-diverging-bar/advertiser-dashboard.component';
import { RegionStackedBarComponent } from './home/components/charts/region-stacked-bar/region-stacked-bar.component';
import { RadialChartComponent } from './home/components/charts/radial-chart/radial-chart.component';
import { RadialDonutChartComponent } from './home/components/charts/radial-donut-chart/radial-donut-chart.component';
import { FacetedLineChartComponent } from './home/components/charts/faceted-line-chart/faceted-line-chart.component';
import { PriceHeatmapComponent } from './home/components/charts/price-heatmap/price-heatmap.component';
import { ParallelCoordinatesComponent } from './home/components/charts/parallel-coordinates/parallel-coordinates.component';
import { InteractiveScatterComponent } from './home/components/charts/interactive-scatter/interactive-scatter.component';
import { TariffVisualizationComponent } from './home/components/charts/tarrif-visualization/tarrif-visualization.component';
import { TariffVisualizationComponent2 } from './home/components/charts/tarrif-visualization/tarrif-visualization.component2';
import { MarketCapitalizationComponent } from './home/components/charts/market-capitalization/market-capitalization.component';
import { PerformanceMetricsComponent } from './home/components/charts/performance-metrics/performance-metrics.component';
import { NetworkDataVizComponent } from './home/components/charts/network-data-viz/network-data-viz.component';
import { AdvertisingAnalyticsComponent } from './home/components/charts/advertising-analytics/advertising-analytics.component';
import { CveTimeLineComponent } from './home/components/dashboards/cve-timeline/cve-timeline.component';
import { CveTimeLineDashboardComponent } from './home/components/dashboards/cve-dashboard/cve-timeline-dashboard.component';
import { DataBreachImpactComponent } from './home/components/charts/data-breach-impact/data-breach-impact.component';
import { WorldVizualizerComponent } from './home/components/charts/world-vizualizer/world-vizualizer.component';
import { CpmDashboardComponent } from './home/components/dashboards/cost-pricing-dashboard/cpm.component';
import { ComplianceDashboardComponent } from './home/components/dashboards/compliance-dashboard/compliance-dashboard.component';
import { AutomatedRevenueManagement } from './home/components/dashboards/automated-revenue-management/automated-revenue-management.component';
import { CostPricingDashboardComponent } from './home/components/dashboards/cost-pricing-dashboard/cost-pricing-dashboard.component';
import { ClickAnalysisDashboardComponent } from './home/components/dashboards/click-analysis-dashboard/click-analysis-dashboard.component';
import { AdTechMarketShareComponent } from './home/components/dashboards/ad-market-share-dashboard/ad-market-share-dashboard.component';
import { AdDistributionComponent } from './home/components/dashboards/ad-market-share-dashboard/ad-distribution.component';
import { RedditDataDashboardComponent } from './home/components/dashboards/reddit-data-dashboard/reddit-data-dashboard.component';
import { AttributionPlatformDashboardComponent } from './home/components/dashboards/attribution-platform-dashboard/attribution-platform-dashboard.component';
import { AttributionModelDashboardComponent } from './home/components/dashboards/attribution-model-dashboard/attribution-model-dashboard.component';
import { DataVizServicesComponent } from './home/components/data-viz-services/data-viz-services.component';
import { FootballPitchComponent } from './home/components/charts/football-pitch/football-pitch.component';
import { MaterialModule } from './modules/material.modules';
import { AdSupplyMarketComponent } from './home/components/charts/ad-supply-market/ad-supply-market.component';


@NgModule({
  declarations: [
    AppComponent,
    FormSelectComponent,
    PriceHeatmapComponent,
    ParallelCoordinatesComponent,
    InteractiveScatterComponent,
    TariffVisualizationComponent,
    TariffVisualizationComponent2,
    CpmDashboardComponent,
    AutomatedRevenueManagement,
    ComplianceDashboardComponent,
    MarketCapitalizationComponent,
    PerformanceMetricsComponent,
    NetworkDataVizComponent,
    AdvertisingAnalyticsComponent,
    CveTimeLineComponent,
    CveTimeLineDashboardComponent,
    DataBreachImpactComponent,
    WorldVizualizerComponent,
    RadialChartComponent,
    RadialDonutChartComponent,
    FacetedLineChartComponent,
    MatrixComponent,
    RegionStackedBarComponent,
    AnimatedAreaComponent,
    DivergingRadialBarComponent,
    AdFraudComponent,
    CostPricingDashboardComponent,
    ClickAnalysisDashboardComponent,
    AdTechMarketShareComponent,
    AdDistributionComponent,
    RedditDataDashboardComponent,
    AttributionPlatformDashboardComponent,
    AttributionModelDashboardComponent,
    DataVizServicesComponent,
    FootballPitchComponent,
    HorizontalDivergingBarComponent,
    AdvertiserDashboardComponent,
    SankeyComponent,
    RadialStackedBarChartComponent,
    GlobeComponent,
    FlatEarthComponent,
    OverlayComponent,
    ModalComponent,
    AttackTreeComponent,
    AttackTreeComponent2,
    SparklineChartComponent,
    BubbleRealtimeDashboardComponent,
    AnimatedBubbleComponent,
    RouteOverlayComponent,
    VoronoiOriginalComponent,
    FunnelChartComponent,
    CustomSelectComponent,
    SampleComponent,
    AlaaapHeaderComponent,
    DonutRealtimeDashboardComponent,
    DonutRaceComponent,
    TimeSeriesBarChartComponent,
    VoronoiComponent,
    LandingComponent,
    AnalyticsDashboardComponent,
    RaceBarComponent,
    TabsComponent,
    ContextMenuDirective,
    DivergingBarsComponent,
    DynamicTabDirective,
    BouncingArrowDirective,
    MetricsDashboardComponent,
    LineChartComponent,
    FinanceDashboardComponent,
    BubbleChartComponent,
    SingleCardComponent,
    DonutChartComponent,
    AdSupplyMarketComponent
  ],
  imports: [
    NgClass,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    EffectsModule.forRoot([CompanyFilterEffects]),
    StoreModule.forRoot(reducers),
    StoreModule.forFeature('voronoi', voronoiReducer),
    EffectsModule.forFeature([VoronoiEffects]),
    LucideAngularModule.pick(icons),
  ],
  providers: [VoronoiStateService],
  bootstrap: [AppComponent],
})
export class AppModule { }
