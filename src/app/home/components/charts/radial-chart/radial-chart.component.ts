import { Component, ChangeDetectionStrategy, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChange, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { PresentationService } from '../../../services/presentation.service';

@Component({
  selector: "radial-chart2",

  templateUrl: "./radial-chart.component.html",
  styleUrls: ["radial-chart.component.less"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadialChartComponent2 implements OnInit, OnDestroy {



  @Input() dateRange: any;
  @Input()
  logData!: any[];
  @Input() colorScale: any;

  @Input() unit: any;

  @Output() onSetChartFilters: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRandomizeClick = new EventEmitter<string>();
  @Input() id!: string;

  applyLegendFilters: boolean = false;
  private subscription: Subscription | undefined;
  private renderedWidth: number = 0;
  private dataSource: any[] = [];
  sortOrder = ["Critical", "Major", "Medium", "Minor", "Informational"];


  // Arcs & pie
  private arc: any;
  private pie: any;
  private color: any;

  // Drawing containers
  private svg: any;
  private tooltip: any;
  private parentElement: any;
  private islegendClicked: boolean = false;

  // Data
  keys: any[] = [];
  private totalCount: any;
  legendItem: any;
  private width = 200;
  private height = 250;
  private margins = { top: 10, right: 15, bottom: 40, left: 5 };
  private backData: any = [{ category: "", count: 100, percent: 100 }];
  radius = this.height / 2;
  private data = [
    { category: "January", count: 1208, percent: 71 },
    { category: "February", count: 305, percent: 18 },
    { category: "March", count: 110, percent: 6 },
    { category: "April", count: 89, percent: 5 },
    { category: "May", count: 1, percent: 0.06 }
  ]


  constructor(
    element: ElementRef,
    private presentationService: PresentationService) {
    this.parentElement = element.nativeElement;
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case "data": {
            // this.totalCount = this.d3Format(this.data["totalCount"]);
            this.dataSource = this.data;
            this.dataSource = this.sortArray(this.dataSource).map((item: { [x: string]: any; }, i: any) => {
              item["index"] = i;
              return item;
            });

            this.initializeOptions();
            this.renderChart(this.dataSource);
          }
        }
      }
    }
  }


  ngOnInit() {
    this.initializeOptions()
  }

  private onResize(windowSize: any) {
    if (this.logData && this.logData.length) {
      this.renderFilteredChart();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Sort the arc data to ensure a particular ordering.
  sortArray(array: any) {
    if (array === undefined || typeof array[0] === undefined) {
      return Array(0);
    }
    if (typeof array[0] === "object") {
      return array.sort((a: any, b: any) => {
        return (
          this.sortOrder.indexOf(b.category) - this.sortOrder.indexOf(a.category)
        );
      });
    } else {
      return array.sort((a: string, b: string) => {
        return this.sortOrder.indexOf(b) - this.sortOrder.indexOf(a);
      });
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
    let disabledItems = [];
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

  private getLegendKeys(): any {

    if (this.logData && this.logData.length > 0) {
      return this.logData.map((d) => d.category);
    } else {
      return this.logData[0];
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

    let legendKeys = this.getLegendKeys();



    this.keys = [];
    for (let key of legendKeys) {
      this.keys.push(key);
      this.legendItem[key] = {
        visible: true,
        className: this.getKeyClassName(key),
      };
    }

    this.color = d3.scaleSequential((t) =>
      d3.interpolateViridis(t * 1 + 0.1)).domain([0, this.keys.length]);

    for (let key of this.keys) {
      // this.legendItem[key].color = this.isDynamicColors ? this.color[this.keys.indexOf(key)] : this.color(this.keys.indexOf(key));
    }
  }

  private renderFilteredChart() {
    let data: any[] = JSON.parse(JSON.stringify(this.logData));

    let disabledItems: any[] = [];

    for (let key of this.keys) {
      if (this.legendItem[key] && !this.legendItem[key].visible)
        disabledItems.push(key);
    }

    if (disabledItems.length) {
      data = data.map((d) => {
        disabledItems.forEach((disabled) => {
          if (d.category === disabled) {
            delete d["category"];
          }
        });
        if (d.hasOwnProperty("category")) {
          return d;
        }
      });
    }

    data = data.filter((em) => em !== undefined);
    this.drawSlices(data);
  }

  private getChartWidth(): number {
    let panelWidth = this.parentElement.getBoundingClientRect().width;
    if (this.keys.length > 0) {
      panelWidth = 50 | 20;
      panelWidth -= 5;
    }

    return panelWidth > 0 ? panelWidth : 0;
  }

  get radialWidth(): number {
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
    return this.arc;
  }

  private renderChart(data?: any[]) {
    this.destroyChart();
    let parentElement = d3.select(this.parentElement);

    let svg = (this.svg = parentElement
      .select("svg")
      .attr("viewBox", "0, 2, 380, 250")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("transform", `translate(${this.margins.left}, ${this.margins.top})`));

    svg.attr("width", this.getChartWidth() / 1.2);
    svg.attr("height", this.height);
    if (this.parentElement == null || !this.logData.length) {

      svg
        .attr("height", 290)
        .append("text")
        .attr("x", 120)
        .attr("y", 140)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "500")
        .text("No relevant data found.");
    }
  }

  private showBackground() {
    let backPie = d3.pie().sort(null).value((d: any) => d.percent);

    if (this.totalCount < 1) {
      this.renderChart();
      this.setArcs();
      return (
        this.svg
          .selectAll(".backpath")
          .remove()
          .exit()
          .data(backPie(this.backData))
          .enter()
          // .append("g")
          .append("svg:path")
          .attr("transform", `translate(${this.radius}, ${this.radius})`)
          .attr("cursor", "pointer")
          .attr("stroke-width", "1.3px")
          .attr("d", this.arc)
          .style("fill", "#F3F3F3")
      );
    }
  }

  randomize() {
    this.onRandomizeClick.emit(this.id);
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



  private drawSlices(data: any[]) {
    this.renderChart();
    this.setArcs();

    if (!data) {
      data = this.backData;
    }

    let total = 0;
    data.map((item: { count: number; }) => {
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

    // --- Animation for radial slices ---
    const arcGen = d3.arc().outerRadius(this.radius).innerRadius(this.radius * 0.7);
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
        this.barFilter(d.data.category);
        tooltip.style("display", "none");
      })
      .on("mousemove", (event: any, { data }: any) => {
        tooltip.transition().duration(900).style("opacity", 0.9);
        tooltip.html(
          ` <div>
                      <p>${data.category}
                          <strong>${this.d3Format(data.count)}</strong> ${this.unit}
                          (${data.percent}%)
                      </p>
               </div>`
        )
          .style("left", event.pageX - 35 + "px")
          .style("top", event.pageY - 30 + "px")
          .style("border-radius", "10px")
          .style("pointer-events", "none")
          .style("display", "")
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

    this.showBackground();
  }
}
