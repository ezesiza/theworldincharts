import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChange,
  ViewEncapsulation,
  OnChanges,
  OnDestroy
} from "@angular/core";
import * as d3 from "d3";
import { Subscription } from "rxjs";
import { PresentationService } from "../../../services/presentation.service";


@Component({
  selector: "radial-chart",
  templateUrl: "./radial-chart.component.html",
  styleUrls: ["./radial-chart.component.less"],
  encapsulation: ViewEncapsulation.None,
})
export class RadialChartComponent implements OnInit, OnChanges, OnDestroy {

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

  @Output() onRandomizeClick = new EventEmitter<string>();

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
    private element: ElementRef,
    private presentationService: PresentationService) {
    this.parentElement = element.nativeElement;
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case "data": {
            this.dataSource = this.data ? [...this.data] : [];
            this.dataSource = this.sortArray(this.dataSource).map((item: any, i: number) => {
              item["index"] = i;
              return item;
            });
            this.initializeOptions();
            this.renderChart(this.dataSource);
            break;
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
          // this.onResize(value);
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
  sortArray(array: any[]) {
    if (!array || typeof array[0] === 'undefined') {
      return [];
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
      return this.sortArray(this.dataSource.map((d: any) => d.category)).reverse();
    } else {
      return [];
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
    let disabledItems: string[] = [];
    let enabledItems: string[] = [];
    this.islegendClicked = true;

    this.keys.forEach((key: string) => {
      if (this.legendItem[key]) {
        if (this.legendItem[key].visible) {
          enabledItems.push(key);
        } else {
          this.legendItem[key].visible = !this.legendItem[key].visible;
          disabledItems.push(key);
        }
      }
    });

    // If none are disabled, we should disable all
    if (!disabledItems.length) {
      enabledItems.forEach((key) => {
        this.legendItem[key].visible = false;
      });
    }

    this.islegendClicked = false;
    this.renderFilteredChart();
  }

  toggleLegendItem(key: string) {
    this.islegendClicked = true;

    if (this.keys.length === this.legendVisibleCount()) {
      this.setAllLegendItems(false);
    }

    this.legendItem[key].visible = !this.legendItem[key].visible;

    if (this.legendVisibleCount() === 0) {
      this.setAllLegendItems(true);
      this.islegendClicked = false;
    }

    this.renderFilteredChart();
  }

  private renderFilteredChart() {
    try {
      let data = JSON.parse(JSON.stringify(this.dataSource));
      let disabledItems: string[] = [];

      this.keys.forEach((key: string) => {
        if (this.legendItem[key] && !this.legendItem[key].visible)
          disabledItems.push(key);
      });

      if (disabledItems.length) {
        data = data.map((d: any, i: number) => {
          if (disabledItems.includes(d.category)) {
            return {
              category: d.category,
              count: 0,
              percent: 0,
              index: i,
            };
          }
          return d;
        });
      }

      data = data.filter((item: any) => item !== undefined && item.count > 0);

      this.renderChart(data);
    } catch (error) {
      console.error('Error in renderFilteredChart:', error);
    }
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroyChart();
  }

  private destroyChart() {
    if (this.svg && !this.svg.empty()) {
      this.svg.attr("width", "0");
      this.svg.selectAll("*").remove();
    }
  }

  private getChartWidth(): number {
    try {
      // Check if parent element exists
      if (!this.parentElement) {
        console.warn('Parent element not available for width calculation');
        return 160; // fallback width
      }

      // Use the width of the chart-wrapper for responsive sizing
      const wrapper = this.parentElement.querySelector('.chart-wrapper');
      let panelWidth = wrapper ? wrapper.getBoundingClientRect().width : this.parentElement.getBoundingClientRect().width;

      // Check if we got a valid width
      if (!panelWidth || isNaN(panelWidth)) {
        console.warn('Invalid panel width:', panelWidth);
        return 160; // fallback width
      }

      if (this.keys && this.keys.length > 0 && this.presentationService.isLargePresentation()) {
        panelWidth -= this.presentationService.isExtendedPresentation() ? 50 : 25;
      } else {
        panelWidth -= 5;
      }
      return panelWidth > 0 ? panelWidth : 160; // minimum fallback width
    } catch (error) {
      console.error('Error in getChartWidth:', error);
      return 160; // fallback width
    }
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
    try {
      this.destroyChart();

      // Check if parent element exists
      if (!this.parentElement) {
        console.warn('Parent element not found for radial chart');
        return;
      }

      const drawArcBack = d3
        .arc()
        .innerRadius((d: any, i: number) => this.arcMin + i * this.arcWidth + this.arcPad)
        .outerRadius((d: any, i: number) => this.arcMin + (i + 1) * this.arcWidth)
        .startAngle(0)
        .endAngle((d: any, i: number) => 2 * this.PI);

      if (!data) {
        data = this.dataSource;
      }

      let total = 0;
      data.forEach((item) => (total += item.count));

      this.totalCount = this.numberFormat(total);

      let chartWidth = this.getChartWidth();
      let chartHeight = this.height * 1.35;

      // Check if we have valid dimensions
      if (chartWidth <= 0 || chartHeight <= 0) {
        console.warn('Invalid chart dimensions:', { chartWidth, chartHeight });
        return;
      }

      let parentElement = d3.select(this.parentElement);

      // Check if d3 selection was successful
      if (!parentElement || parentElement.empty()) {
        console.warn('Failed to select parent element with d3');
        return;
      }

      // Try to select or create the SVG element
      let svgSelection = parentElement.select("svg");
      if (svgSelection.empty()) {
        // Create SVG if it doesn't exist
        svgSelection = parentElement.append("svg") as any;
      }

      let svg = (this.svg = svgSelection
        .attr("viewBox", "-59, -60, 390, 280")
        .attr("preserveAspectRatio", "xMidYMin meet")
        .attr("width", chartWidth)
        .attr("height", chartHeight)) as any;

      // Check if SVG was created successfully
      if (!this.svg || this.svg.empty()) {
        console.warn('Failed to create or select SVG element');
        return;
      }

      svg.attr("width", chartWidth);
      svg.attr("height", chartHeight);

      if (this.parentElement == null || this.totalCount < 1) {
        try {
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
        } catch (backgroundError) {
          console.warn('Failed to create background arcs:', backgroundError);
        }
      }

      this.scale = d3.scaleLinear()
        .domain([0, d3.max(data, (d: any) => d.count) * 1.2])
        .range([0, 2 * Math.PI]);

      //------------------------- Draw Arc & Bars----------------//

      const drawArc = d3
        .arc()
        .innerRadius((d: any) => this.arcMin + d["index"] * this.arcWidth + this.arcPad)
        .outerRadius((d: any) => this.arcMin + (d["index"] + 1) * this.arcWidth)
        .startAngle(0)
        .endAngle((d: any) => this.scale(d["count"]));

      // Tooltip
      let tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "radial-tooltip")
        .style("position", "absolute")
        .style("padding", "0 10px")
        .style("background", "white")
        .style("opacity", 0)
        .style("pointer-events", "none")
        .style("border-radius", "10px");

      try {
        svg
          .append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", "27px")
          .attr("font-weight", "600")
          .attr("fill", "#4d4d4d")
          .text(this.totalCount)
          .attr("transform", "translate(" + this.width / 2.0 + "," + this.height / 2.2 + ")");
      } catch (textError) {
        console.warn('Failed to append text:', textError);
      }

      try {
        svg
          .selectAll(".arc-backgrounds")
          .data(this.backData)
          .enter()
          .append("svg:path")
          .style("fill", "#f3f3f3")
          .attr("transform", "translate(80,80)")
          .attr("cursor", "pointer")
          .attr("d", drawArcBack as any);
      } catch (backgroundError) {
        console.warn('Failed to create background arcs:', backgroundError);
      }

      svg.selectAll("path.arc-path").remove();
      const arcPaths = svg.selectAll("path.arc-path")
        .data(data, (d: any) => d.category);

      try {
        // Enter
        const arcEnter = arcPaths.enter()
          .append("svg:path")
          .attr("class", "arc-path")
          .attr("transform", "translate(80,80)")
          .attr("cursor", "pointer")
          .attr("fill", (d: any) => {
            // Add safety check for legendItem
            if (!this.legendItem || !this.legendItem[d.category]) {
              return "#ccc"; // fallback color
            }
            let colorKeys = Object.values(this.legendItem);
            let colour = "";
            let colorClass = this.getKeyClassName(d.category);
            colorKeys.forEach((item: any) => {
              let itemClass = item["className"];
              if (colorClass === itemClass) {
                colour = item["color"];
              }
            });
            return colour;
          })
          .on("click", (event: MouseEvent, d: any) => {
            this.barFilter(d.category);
            tooltip.style("display", "none");
          })
          .on("mousemove", (event: MouseEvent, data: any) => {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
              `<div><p>${data.category} <strong>${this.d3Format(data.count)}</strong> (${data.percent}%)</p></div>`
            )
              .style("left", event.pageX - 35 + "px")
              .style("top", event.pageY - 30 + "px");
          })
          .on("mouseout", function () {
            tooltip.transition().duration(200).style("opacity", 0);
            tooltip.html("");
          })
          // Set initial arc shape for animation
          .attr("d", (d: any) => {
            // Start from 0 angle for animation
            const zeroArc = { ...d, count: 0 };
            return drawArc(zeroArc);
          });

        // Merge enter and update selections
        const arcMerge = arcEnter.merge(arcPaths as any) as any;

        // Animate the arcs
        arcMerge
          .transition()
          .duration(900)
          .ease(d3.easeCubic)
          .attrTween("d", function (this: SVGPathElement, d: any) {
            try {
              const tween = this as any;
              const prev = tween.current || { ...d, count: 0 };
              const interpolate = d3.interpolate(prev, d);
              tween.current = d;
              return function (t: number) {
                try {
                  return drawArc(interpolate(t));
                } catch (arcError) {
                  console.error('Error in arcTween inner function:', arcError, { d, t, interpolate });
                  return null;
                }
              };
            } catch (tweenError) {
              console.error('Error in attrTween:', tweenError, { d, this: this });
              return (_t: number): string | null => null;
            }
          });
      } catch (arcError) {
        console.error('Error creating or animating arcs:', arcError);
      }
    } catch (error) {
      console.error('Error in renderChart:', error);
    }
  }

  randomize() {
    this.onRandomizeClick.emit(this.id);
  }
}

