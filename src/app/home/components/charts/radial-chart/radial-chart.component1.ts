import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChange,
  ViewEncapsulation,
} from "@angular/core";
import * as d3 from "d3";
import { Subscription } from "rxjs/internal/Subscription";
import { PresentationService } from "../../../services/presentation.service";
import { CommonModule } from "@angular/common";



@Component({
  selector: "radial-chart",
  templateUrl: "./radial-chart.component.html",
  styleUrls: ["./radial-chart.component.less"],
  encapsulation: ViewEncapsulation.None,
})
export class RadialChartComponent implements OnInit {

  @Input()
  data!: any[];
  @Input()
  severityData!: any[];
  @Input()
  id!: string;
  @Input() colorScale: string[] = ['red', 'yellow', 'green', 'blue', 'brown'];
  @Input()
  unit!: string;

  private backData: any = [
    { category: "Critical", count: 0, percent: 0 },
    { category: "Major", count: 0, percent: 0 },
    { category: "Medium", count: 0, percent: 0 },
    { category: "Minor", count: 0, percent: 0 },
    { category: "Informational", count: 0, percent: 0 },
  ];

  sortOrder = ["Critical", "Major", "Medium", "Minor", "Informational"];
  subscription!: Subscription;

  @Output()
  onSetChartFilters: EventEmitter<object> = new EventEmitter<object>();

  // set constants
  private width = 160;
  private height = 195;
  private margin = { top: 10, right: 15, bottom: 40, left: 5 };
  private radius = Math.min(this.height, this.width) / 2.2;
  private renderedWidth: number = 0;
  private PI = Math.PI;
  private arcMin = 48; // inner radius of the first arc
  private arcWidth = 18; // width
  private arcPad = 4; // padding between arcs
  private noArcs = 5;


  legendItem: any = {};
  keys!: any[];
  private dataSource: any[] = [];
  arcSize: number = this.noArcs;
  parentElement: any;
  totalCount: any;
  svg: any;
  arcs: any;
  scale: any;
  islegendClicked: boolean = false;
  itemsArray: any[] = [];

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
            this.dataSource = this.sortArray(this.dataSource).map((item: any, i: any) => {
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
    this.subscription = this.presentationService.windowSize.subscribe(
      (value) => {
        if (!this.renderedWidth) {
          this.renderedWidth = value.width;
        } else if (this.renderedWidth !== value.width) {
          this.renderedWidth = value.width;
          this.onResize(value);
        }
      }
    );
  }

  private onResize(windowSize: any) {
    if (this.dataSource && this.dataSource.length) {
      this.renderFilteredChart();
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
      return array.sort((a: any, b: any) => {
        return this.sortOrder.indexOf(b) - this.sortOrder.indexOf(a);
      });
    }
  }

  private initializeOptions() {
    this.legendItem = {};
    if (!this.dataSource || !this.dataSource.length) {
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

    for (let key of this.keys) {
      this.legendItem[key].color = this.colorScale[this.keys.indexOf(key)];
    }
  }

  private getLegendKeys() {
    if (this.dataSource && this.dataSource.length > 0) {
      return this.sortArray(this.dataSource.map((d) => d.category)).reverse();
    } else {
      return this.dataSource[0];
    }
  }

  private setAllLegendItems(status: boolean) {
    for (let key of this.keys) {
      this.legendItem[key].visible = status;
    }
  }

  private getKeyClassName(key: string): string {
    let name = key.toLowerCase();
    return name.split(" ").join("-");
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

  toggleAllLegendItems() {
    let disabledItems = [];
    let enabledItems = [];
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

  toggleLegendItem(key: string) {
    this.islegendClicked = true;

    if (this.keys.length == this.legendVisibleCount()) {
      this.setAllLegendItems(false);
    }

    this.legendItem[key].visible = !this.legendItem[key].visible;

    if (this.legendVisibleCount() == 0) {
      this.setAllLegendItems(true);
      this.islegendClicked = false;
    }

    this.renderFilteredChart();
  }

  private renderFilteredChart() {
    let data = JSON.parse(JSON.stringify(this.dataSource));
    let disabledItems: any = [];

    for (let key of this.keys) {
      if (this.legendItem[key] && !this.legendItem[key].visible)
        disabledItems.push(key);
    }

    if (disabledItems.length) {
      data = data.map((d: any, i: any) => {
        disabledItems.forEach((disabled: any) => {
          if (d.category === disabled) {
            d = {
              category: d.category,
              count: 0,
              percent: 0,
              index: i,
            };
          }
        });
        if (d.hasOwnProperty("category")) {
          return d;
        }
      });
    }

    data = data.filter((item: any) => item !== undefined && item.count > 0);

    this.renderChart(data);
  }

  getEnabledItems() {
    let enabledItems = [];
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

  barFilter(item: any) {
    this.onSetChartFilters.emit({ items: [item], islegendClicked: true });
  }

  ngOnDestroy() { }

  private destroyChart() {
    if (this.svg && !this.svg.empty()) {
      this.svg.attr("width", "0");
      this.svg.selectAll("*").remove();
    }
  }

  private getChartWidth(): number {
    let panelWidth = this.parentElement.getBoundingClientRect().width;

    if (this.keys.length > 0 && this.presentationService.isLargePresentation()) {
      panelWidth -= this.presentationService.isExtendedPresentation() ? 50 : 25;
    } else {
      panelWidth -= 5;
    }

    return panelWidth > 0 ? panelWidth : 0;
  }

  d3Format = d3.format(" ,");

  private numberFormat(num: any) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(0).replace(/\.0$/, "") + "G";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0).replace(/\.0$/, "") + "M";
    }

    if (num >= 1000) {
      return (Math.trunc(num / 1000).toFixed(1).replace(/\.0$/, "") + "K");
    }
    return num;
  }

  renderChart(data: any[]) {
    this.destroyChart();

    const drawArcBack = d3
      .arc()
      .innerRadius((d, i) => this.arcMin + i * this.arcWidth + this.arcPad)
      .outerRadius((d, i) => this.arcMin + (i + 1) * this.arcWidth)
      .startAngle(0 * (this.PI / 180))
      .endAngle((d, i) => 2 * this.PI);

    if (!data) {
      data = this.dataSource;
    }

    let total = 0;
    data.map((item) => (total = total + item.count));

    this.totalCount = this.numberFormat(total);

    let parentElement = d3
      .select(this.parentElement)
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    let svg = (this.svg = parentElement.select("svg"))
      .attr("viewBox", "-59, -60, 390, 280")
      .attr("preserveAspectRatio", "xMidYMin meet");

    svg.attr("width", this.getChartWidth() / 1.2);

    svg.attr("height", this.height * 1.35);

    if (this.parentElement == null || this.totalCount < 1) {
      svg
        .selectAll(".arc-backgrounds")
        .data(this.backData)
        .enter()
        .append("svg:path")
        .style("fill", "#f3f3f3")
        .text("No data found.")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(80,80)")
        .attr("viewBox", "-59, -60, 390, 280")
        .attr("preserveAspectRatio", "xMidYMin meet")
        .attr("d", drawArcBack as any);
    }

    this.scale = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) * 1.2])
      .range([0, 2 * Math.PI]);

    //------------------------- Draw Arc & Bars----------------//

    const drawArc = d3
      .arc()
      .innerRadius((d: any, i) => this.arcMin + d["index"] * this.arcWidth + this.arcPad)
      .outerRadius((d: any, i) => this.arcMin + (d["index"] + 1) * this.arcWidth)
      .startAngle(0 * (this.PI / 180))
      .endAngle((d: any, i) => this.scale(d["count"]));

    let tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("padding", "0 10px")
      .style("background", "white")
      .style("opacity", 0);

    const arcs = svg.selectAll("path.arc-path").remove().exit().data(data);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "27px")
      .attr("font-weight", "600")
      .attr("fill", "#4d4d4d")
      .text(this.totalCount)
      .attr("transform", "translate(" + this.width / 2.0 + "," + this.height / 2.2 + ")");

    svg
      .selectAll(".arc-backgrounds")
      .data(this.backData)
      .enter()
      .append("svg:path")
      .style("fill", "#f3f3f3")
      .attr("transform", "translate(80,80)")
      .attr("cursor", "pointer")
      .attr("d", drawArcBack as any);

    arcs
      .enter()
      .append("svg:path")
      .attr("class", "arc-path") // assigns a class for easier selecting
      .attr("transform", "translate(80,80)")
      .attr("d", drawArc)
      .attr("cursor", "pointer")
      .on("click", (d) => {
        this.barFilter(d.category);
        tooltip.style("display", "none");
      })
      .attr("fill", (d, i) => {
        let colorKeys = Object.values(this.legendItem);
        let colour = "";

        let colorClass = this.getKeyClassName(d.category);
        colorKeys.map((item: any) => {
          let itemClass = item["className"];
          colour = (colorClass === itemClass) ? item["color"] : colour;
        });
        return colour;
      })
      .on("mousemove", (event, data) => {
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
          // .style("display", "")
          .attr("transform", `translate(${event.pageX - 35}, ${event.pageY - 30})`);
      })
      .on("mouseout", function () {
        tooltip.html("");
        d3.select(this);
        d3.select(this).transition().duration(500);
      });
  }
}

