import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { DynamicTabDirective } from './dynamic-tab.directive';
import { FlatEarthComponent } from '../charts/flat-earth/flat-earth.component';
import { VoronoiOriginalComponent } from '../charts/voronoi/voronoi.original';
import { VoronoiComponent } from '../charts/voronoi/voronoi.component';


interface TabItem {
  title: string;
  id: string;
  component: any;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.less']
})
export class TabsComponent implements OnInit {

  selectedIndex = 0;
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }
  ngOnInit(): void {
    this.loadTabContent(this.selectedIndex);
  }
  @ViewChild(DynamicTabDirective, { static: true }) dynamicTabHost!: DynamicTabDirective;
  activeTab: string = 'Company Voronoi';

  tabs: TabItem[] = [
    {
      title: 'Company Voronoi',
      id: '1',
      component: VoronoiComponent
    },
    {
      title: 'Gdp Voronoi',
      id: '2',
      component: VoronoiOriginalComponent
    },
    {
      title: 'Flat Earth',
      id: '3',
      component: FlatEarthComponent
    }
  ];


  private loadTabContent(index: number): void {
    const tab = this.tabs[index];
    const viewContainerRef = this.dynamicTabHost.viewContainerRef;
    viewContainerRef.clear();

    // const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
    //   tab.component
    // );

    viewContainerRef.createComponent(tab.component);
  }

  openCity(cityName: string): void {
    this.activeTab = cityName;
  }

  selectTab(index: number): void {
    this.selectedIndex = index;
    this.loadTabContent(index);
  }

  getTabTemplate(tab: TabItem) {
    this.loadTabContent(Number(tab.id));
  }
}