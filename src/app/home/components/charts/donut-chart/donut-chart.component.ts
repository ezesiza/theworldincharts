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
      this.initializeOptions()
      this.drawSlices(this.logData)
    }
  }

  ngOnInit() {
    this.subscription = this.presentationService.windowSize.subscribe(
      (value) => {
        if (!this.renderedWidth) {
          this.renderedWidth = value.width;
        } else if (this.renderedWidth !== value.width) {
          this.renderedWidth = value.width;
          // this.onResize(value);
          this.renderFilteredChart();
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

  private getLegendKeys(): any {
    if (this.logData && this.logData.length >= 0) {

      return this.logData.map((d: any) => d.category);
    } else {
      return this.logData[0]
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

    let data: any = JSON.parse(JSON.stringify(this.logData));

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
    let panelWidth = this.parentElement.getBoundingClientRect().width;
    if (this.keys.length > 0 && this.presentationService.isLargePresentation()) {
      panelWidth -= this.presentationService.isExtendedPresentation() ? 50 : 20;
    } else {
      panelWidth -= 5;
    }

    return panelWidth > 0 ? panelWidth : 0;
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

    this.destroyChart();
    let parentElement = d3.select(this.parentElement);

    let svg = (this.svg = parentElement
      .select("svg")
      .attr("viewBox", "0, 0, 380, 250")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("transform", `translate(${this.margins.left}, ${this.margins.top})`));

    svg.attr("width", this.getChartWidth() / 1.2);
    svg.attr("height", this.height);

    let transition = this.svg.transition()
      .duration(150)
      .ease(d3.easeLinear);
    if (this.parentElement == null || !this.logData) {

      svg
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
    transition.end()
  }

  private showBackground() {
    let backPie = d3.pie().sort(null).value((d: any) => d.value);

    if (this.totalCount < 1) {
      this.initArc();
      this.setArcs();

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
        .style("fill", "#F3F3F3");
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

  transition = d3.select('path').transition().duration(750).ease(() => 200);


  private drawSlices(data: any) {

    if (!data) {
      data = this.backData;
    }

    this.initArc()
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

    this.svg
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
      .attr("d", this.arc)
      .on("click", (d: any) => {
        this.barFilter(d.data.category);
        tooltip.style("display", "none");
      })
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
    this.showBackground();
    // return this.transition
  }
}
