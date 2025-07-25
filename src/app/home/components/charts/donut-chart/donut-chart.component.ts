import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChange, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { PresentationService } from '../../../services/presentation.service';
import { LoadDataService } from '../../../services/load.data.service';


@Component({
  selector: "donut",
  providers: [LoadDataService],
  templateUrl: "donut-chart.component.html",
  styleUrls: ["donut-chart.component.less"],
  encapsulation: ViewEncapsulation.None,
})
export class DonutChartComponent implements OnInit, OnDestroy {

  @Input() logData: any | undefined;
  @Input() colorScale: any;
  @Input() isDynamicColors: boolean = false;
  @Input() unit: any;
  @Output() onSetChartFilters: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRandomizeClick: EventEmitter<any> = new EventEmitter<any>();
  @Input() id: string = '';

  applyLegendFilters: boolean = false;
  private subscription: Subscription | undefined;
  private renderedWidth: number = 0;

  // Arcs & pie
  private arc: any;
  private pie: any;
  private color: any;

  // Drawing containers
  private svg: any;
  private parentElement: any;
  private islegendClicked: boolean = false;

  // Data
  keys: any = [];
  private totalCount: any;
  legendItem: any;
  private width = 200;
  private height = 250;
  private margins = { top: 15, right: 15, bottom: 10, left: 5 };
  private backData: any = [{ category: "", count: 0, value: 1 }];
  // private backData: any = [{ image: "", name: " ", rank: 0, value: 1 }];
  radius = this.height / 2;
  initialCount = 100;
  liked = true;
  preventSingleClick = false;
  timer: any;
  delay: Number | undefined;

  private sortOrder = ["Compromise", "Control and Maintain", "Exploit", "Attack", "Attack Preparation", "Reconnaissance"];


  constructor(private element: ElementRef,
    private service: LoadDataService,
    private presentationService: PresentationService) {

    this.parentElement = this.element.nativeElement;

  }


  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    for (const propName in changes) {
      this.logData = changes['logData'].currentValue;
      if (this.logData && Array.isArray(this.logData) && this.logData.length > 0) {
        const transformedData = this.transformData(this.logData);
        this.initializeOptions()
        this.drawSlices(transformedData)
      }
    }
  }

  ngOnInit() {
    if (this.logData && Array.isArray(this.logData) && this.logData.length > 0) {
      const transformedData = this.transformData(this.logData);
      this.initializeOptions();
      this.drawSlices(transformedData);
    }
    this.subscription = this.presentationService.windowSize.subscribe(
      (value) => {
        if (!this.renderedWidth) {
          this.renderedWidth = value.width;
        } else if (this.renderedWidth !== value.width) {
          this.renderedWidth = value.width;
          // this.onResize(value);
          // this.renderFilteredChart();
        }
      }
    );
  }

  private onResize() {
    if (this.logData && this.logData.length) {
      this.renderFilteredChart();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  applyLegendFiltersClick() {
    let items: any[] = [];
    for (let key of this.keys) {
      if (this.legendItem[key] && this.legendItem[key].visible) {
        items.push(key);
      }
    }
  }


  getEnabledItems() {
    let enabledItems: any[] = [];

    for (let key of this.keys) {
      if (this.legendItem[key]) {
        if (this.legendItem[key].visible) {
          enabledItems.push(key);
        }
      }
    }
    return enabledItems;
  }

  legendFilter() {
    let items = this.getEnabledItems();
    this.onSetChartFilters.emit({ items, islegendClicked: this.islegendClicked });
  }

  barFilter(items: any) {
    this.onSetChartFilters.emit({ items: [items], islegendClicked: true });
  }

  public toggleAllLegendItems() {
    this.onRandomizeClick.emit(this.id);
    let disabledItems: any = [];
    let enabledItems: any[] = [];
    this.islegendClicked = true;
    for (let key of this.keys) {
      if (this.legendItem[key]) {
        if (this.legendItem[key].visible) {
          enabledItems.push(key);
        } else {
          this.legendItem[key].visible = !this.legendItem[key].visible;
          disabledItems.push(key);
        }
      }
    }
    // If none are disabled, we should disable all
    if (!disabledItems.length) {
      enabledItems.forEach((key) => {
        this.legendItem[key].visible = this.legendItem[key].visible;
      });
    }
    this.islegendClicked = false;
    this.renderFilteredChart();
  }

  private setAllLegendItems(status: boolean) {
    for (let key of this.keys) {
      this.legendItem[key].visible = status;
    }
  }

  toggleLegendItem(key: string) {
    this.islegendClicked = true;
    if (this.keys.length === this.legendVisibleCount()) {
      this.setAllLegendItems(false);
    }

    this.legendItem[key].visible = !this.legendItem[key].visible;

    if (this.legendVisibleCount() == 0) {
      this.setAllLegendItems(true);
      this.islegendClicked = false;
    }

    this.renderFilteredChart();
  }

  private legendVisibleCount(): number {
    let count: number = 0;

    for (let key of this.keys) {
      if (this.legendItem[key] && this.legendItem[key].visible) {
        count++;
      }
    }
    return count;
  }

  private transformData(data: any[]): any[] {
    if (!data || !Array.isArray(data)) return [];
    
    // Detect data format and transform accordingly
    const dataFormat = this.detectDataFormat(data);
    
    switch (dataFormat) {
      case 'category-count-percent':
        return this.transformCategoryCountPercentData(data);
      case 'advertiser':
        return this.transformAdvertiserData(data);
      case 'utm-source':
        return this.transformUtmSourceData(data);
      default:
        return this.transformGenericData(data);
    }
  }

  private detectDataFormat(data: any[]): string {
    if (!data.length) return 'unknown';
    
    const firstItem = data[0];
    
    // Check if it's already in the expected format (category, count, percent)
    if (firstItem.hasOwnProperty('category') && firstItem.hasOwnProperty('count')) {
      return 'category-count-percent';
    }
    
    // Check if it's advertiser format (has name and data properties)
    if (firstItem.hasOwnProperty('name') && firstItem.hasOwnProperty('data')) {
      return 'advertiser';
    }
    
    // Check if it's UTM_SOURCE format (has UTM_SOURCE property)
    if (firstItem.hasOwnProperty('UTM_SOURCE')) {
      return 'utm-source';
    }
    
    return 'generic';
  }

  private transformCategoryCountPercentData(data: any[]): any[] {
    // Data is already in the correct format, just ensure it has all required properties
    return data.map(item => ({
      category: item.category || item.name || 'Unknown',
      count: item.count || 0,
      percent: item.percent || 0
    }));
  }

  private transformAdvertiserData(data: any[]): any[] {
    // Transform advertiser data to donut chart format
    const totalDataPoints = data.reduce((sum, adv) => sum + (adv.data ? adv.data.length : 0), 0);
    
    return data.map((advertiser, index) => {
      const count = advertiser.data ? advertiser.data.length : 0;
      return {
        category: advertiser.name || `Advertiser ${index + 1}`,
        count: count,
        percent: totalDataPoints > 0 ? Math.round((count / totalDataPoints) * 100) : 0
      };
    }).filter(item => item.count > 0);
  }

  private transformUtmSourceData(data: any[]): any[] {
    // Transform UTM_SOURCE data - use the 'total' field for visualization
    return data.map(item => {
      const totalStr = item.total || '0%';
      const percent = parseFloat(totalStr.replace('%', '')) || 0;
      const count = Math.round(percent * 100); // Convert percentage to a count-like value
      
      return {
        category: item.UTM_SOURCE || 'Unknown Source',
        count: isNaN(count) ? 0 : count,
        percent: isNaN(percent) ? 0 : percent
      };
    }).filter(item => item.percent > 0 && !isNaN(item.percent));
  }

  private transformGenericData(data: any[]): any[] {
    // Try to extract meaningful data from generic objects
    return data.map((item, index) => {
      // Look for common property names that might represent categories
      const category = item.category || item.name || item.label || item.key || `Item ${index + 1}`;
      
      // Look for numeric values that might represent counts or values
      const rawCount = item.count || item.value || item.total || item.amount || 1;
      const count = isNaN(Number(rawCount)) ? 1 : Number(rawCount);
      
      // Calculate percentage if not provided
      const totalCount = data.reduce((sum, d) => {
        const val = d.count || d.value || d.total || d.amount || 1;
        return sum + (isNaN(Number(val)) ? 1 : Number(val));
      }, 0);
      const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      
      return {
        category: String(category),
        count: isNaN(count) ? 1 : count,
        percent: isNaN(percent) ? 0 : percent
      };
    });
  }

  private getLegendKeys(): any {
    if (this.logData && this.logData.length >= 0) {
      const transformedData = this.transformData(this.logData);
      return transformedData.map((d: any) => d.category);
    } else {
      return []
    }
  }

  private getKeyClassName(key: string): string {
    let name = key.toLowerCase();
    return name.split(" ").join("-");
  }

  private initializeOptions() {
    this.legendItem = {};

    if (!this.logData || !this.logData.length) {
      return;
    }

    let legendKeys: any[] = this.getLegendKeys();

    this.keys = [];
    for (let key of legendKeys) {
      this.keys.push(key);
      this.legendItem[key] = {
        visible: true,
        className: this.getKeyClassName(key),
      };
    }

    this.color = this.isDynamicColors ? this.colorScale : d3.scaleSequential((t) =>
      d3.interpolateViridis(t * 1 + 0.1)).domain([0, this.keys.length]);

    for (let key of this.keys) {
      this.legendItem[key].color = this.isDynamicColors ? this.color[this.keys.indexOf(key)] : this.color(this.keys.indexOf(key));
    }
  }

  private renderFilteredChart() {
    if (!this.logData || !Array.isArray(this.logData) || this.logData.length === 0) {
      // Handle case when no valid data is available
      this.drawSlices(this.backData);
      return;
    }

    let transformedData = this.transformData(this.logData);
    let data: any = JSON.parse(JSON.stringify(transformedData));

    let disabledItems: any = [];

    for (let key of this.keys) {
      if (this.legendItem[key] && !this.legendItem[key].visible)
        disabledItems.push(key);
    }

    if (disabledItems.length) {
      data = data.map((d: any) => {
        disabledItems.forEach((disabled: any) => {
          if (d.category === disabled) {
            delete d["category"];
          }
        });
        if (d.hasOwnProperty("category")) {
          return d;
        }
      });
    }

    data = data.filter((em: any) => em !== undefined);
    this.drawSlices(data);
  }

  private getChartWidth(): number {
    try {
      // Check if parent element exists
      if (!this.parentElement) {
        console.warn('Parent element not available for width calculation');
        return 200; // fallback width
      }

      // Use the width of the chart-wrapper for responsive sizing
      const wrapper = this.parentElement.querySelector('.chart-wrapper');
      let panelWidth = wrapper ? wrapper.getBoundingClientRect().width : this.parentElement.getBoundingClientRect().width;

      // Check if we got a valid width
      if (!panelWidth || isNaN(panelWidth)) {
        console.warn('Invalid panel width:', panelWidth);
        return 200; // fallback width
      }

      if (this.keys && this.keys.length > 0 && this.presentationService.isLargePresentation()) {
        panelWidth -= this.presentationService.isExtendedPresentation() ? 50 : 20;
      } else {
        panelWidth -= 5;
      }
      return panelWidth > 0 ? panelWidth : 200; // minimum fallback width
    } catch (error) {
      console.error('Error in getChartWidth:', error);
      return 200; // fallback width
    }
  }

  get donutWidth(): number {
    return parseInt(d3.select('body').style('width'), 10);
  }

  private destroyChart() {
    if (this.svg && !this.svg.empty()) {
      this.svg.attr("width", "0");
      this.svg.selectAll("*").remove();
    }
  }

  private setArcs() {
    this.arc = d3
      .arc()
      .outerRadius(this.radius)
      .innerRadius(this.radius * 0.7);
  }


  private initArc() {
    try {
      this.destroyChart();

      // Check if parent element exists
      if (!this.parentElement) {
        console.warn('Parent element not found for donut chart');
        return;
      }

      let parentElement = d3.select(this.parentElement);

      // Check if d3 selection was successful
      if (!parentElement || parentElement.empty()) {
        console.warn('Failed to select parent element with d3');
        return;
      }

      let chartWidth = this.getChartWidth();
      let chartHeight = this.height;

      // Check if we have valid dimensions
      if (chartWidth <= 0 || chartHeight <= 0) {
        console.warn('Invalid chart dimensions:', { chartWidth, chartHeight });
        return;
      }

      // Try to select or create the SVG element
      let svgSelection = parentElement.select("svg") as any;
      if (svgSelection.empty()) {
        // Create SVG if it doesn't exist
        svgSelection = parentElement.append("svg") as any;
      }

      this.svg = (svgSelection
        .attr("viewBox", "0, 0, 380, 250")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("transform", `translate(${this.margins.left}, ${this.margins.top})`)
        .attr("width", chartWidth)
        .attr("height", chartHeight)) as any;

      // Check if SVG was created successfully
      if (!this.svg || this.svg.empty()) {
        console.warn('Failed to create or select SVG element');
        return;
      }

      if (this.parentElement == null || !this.logData) {
        try {
          if (this.svg && !this.svg.empty()) {
            this.svg
              .append("text")
              .transition()
              .duration(15)
              .ease(d3.easeLinear)
              .attr("height", 290)
              .attr("x", 120)
              .attr("y", 140)
              .attr("text-anchor", "middle")
              .attr("font-size", "14px")
              .attr("font-weight", "500")
              .text("No relevant data found.");
          }
        } catch (textError) {
          console.warn('Failed to append text:', textError);
        }
      }
    } catch (error) {
      console.error('Error in initArc:', error);
    }
  }

  private showBackground() {
    try {
      // Check if SVG is available
      if (!this.svg || this.svg.empty()) {
        console.warn('SVG not available for background');
        return;
      }

      let backPie = d3.pie().sort(null).value((d: any) => d.value);

      if (this.totalCount < 1) {
        this.initArc();
        this.setArcs();

        try {
          this.svg
            .selectAll(".backpath")
            .remove()
            .exit()
            .data(backPie(this.backData))
            .enter()
            .append("svg:path")
            .attr("transform", `translate(${this.radius}, ${this.radius})`)
            .attr("cursor", "pointer")
            .attr("stroke-width", "1.3px")
            .attr("d", this.arc)
            .style("fill", "#F3F3F3");
        } catch (backgroundError) {
          console.warn('Failed to create background:', backgroundError);
        }
      }
    } catch (error) {
      console.error('Error in showBackground:', error);
    }
  }

  private numberFormat(num: number) {
    if (num >= 1000000000) {
      return Math.trunc(num / 1000000000).toFixed(1).replace(/\.0$/, "") + "G";
    }
    if (num >= 1000000) {
      return Math.trunc(num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }

    if (num >= 1000) {
      return (Math.trunc(num / 1000).toFixed(1).replace(/\.0$/, "") + "K");
    }
    return num;
  }

  private d3Format(d: number | { valueOf(): number; }) {
    return d3.format(" ,")(d);
  }

  // transition = d3.select('path').transition().duration(750).ease(() => 200);


  private drawSlices(data: any) {
    try {
      if (!data) {
        data = this.backData;
      }

      // Ensure legendItem is initialized before proceeding
      if (!this.legendItem || Object.keys(this.legendItem).length === 0) {
        this.initializeOptions();
      }

      this.initArc();

      // Check if SVG was created successfully
      if (!this.svg || this.svg.empty()) {
        console.warn('SVG not available for drawing slices');
        return;
      }

      this.setArcs();

      let total = 0;
      data.map((item: any) => {
        total = total + item.count;
      });
      this.totalCount = this.numberFormat(total);

      this.pie = d3.pie().sort(null).value((d: any) => d.count);

      let tooltip = d3
        .select("body")
        .append("div")
        .style("position", "absolute")
        .style("padding", "0 10px")
        .style("background", "white")
        .style("opacity", 0);

      this.svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "27px")
        .attr("font-weight", "600")
        .attr("fill", "#4D4D4D")
        .text(this.totalCount)
        .attr("transform", "translate(" + this.width / 1.6 + "," + this.height / 1.9 + ")");

      // --- Animation for donut slices ---
      const arcGen = d3.arc().outerRadius(this.radius).innerRadius(this.radius * 0.7);

      try {
        const arcs = this.svg
          .selectAll("path")
          .remove()
          .exit()
          .data(this.pie(data))
          .enter()
          .append("g")
          .append("path")
          .attr("transform", `translate(${this.radius}, ${this.radius})`)
          .attr("stroke", "white")
          .attr("stroke-width", "1.3px")
          .attr("cursor", "pointer")
          .attr("fill", (d: any, i: any) => {
            // Add safety check for legendItem
            if (!this.legendItem || !this.legendItem[d.data.category]) {
              return "#ccc"; // fallback color
            }
            let colorKeys = Object.values(this.legendItem);
            let colour = "";
            let colorClass = this.getKeyClassName(d.data.category);
            colorKeys.map((item: any) => {
              let itemClass = item["className"];
              colour = (colorClass === itemClass) ? item["color"] : colour;
            });
            return colour;
          })
          .on("click", (d: any) => {
            this.barFilter(d.data?.category);
            tooltip.style("display", "none");
          })
          .on("mousemove", (event: any, { data }: any) => {
            tooltip.transition().duration(900).style("opacity", 0.9);
            tooltip.html(
              ` <div>
                        <p>${data.category}
                          <strong>${this.d3Format(data.count)}</strong>
                          (${data.percent}%)
                        </p>
                    </div>`
            )
              .style("left", event.pageX - 35 + "px")
              .style("top", event.pageY - 30 + "px")
              .style("border-radius", "10px")
              .style("pointer-events", "none")
              .attr("transform", `translate(${event.pageX - 35}, ${event.pageY - 30})`);
          })
          .on("mouseout", function () {
            tooltip.html("");
          });

        // Animate the arcs
        arcs.transition()
          .duration(900)
          .ease(d3.easeCubic)
          .attrTween("d", function (d: any) {
            const i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
            return function (t: number) {
              return arcGen(i(t));
            };
          });
      } catch (arcError) {
        console.error('Error creating arcs:', arcError);
      }

      this.showBackground();
    } catch (error) {
      console.error('Error in drawSlices:', error);
    }
  }
}
