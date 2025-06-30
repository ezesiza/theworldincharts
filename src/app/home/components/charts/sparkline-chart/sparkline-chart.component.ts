import { Component, OnInit, OnChanges, OnDestroy, Input, ElementRef, SimpleChange } from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import { DateTimeService } from 'app/services/datetime.service';
import { PresentationService } from 'app/home/services/presentation.service';
import { DateRange } from 'app/models/datetime.model';


class Sparkline {
  key: string;
  Period: Date;
  Count: number;
}

@Component({
  selector: 'sparkline-chart',
  templateUrl: './sparkline-chart.component.html',
  styleUrls: ['./sparkline-chart.component.less']
})
export class SparklineChartComponent implements OnInit, OnChanges, OnDestroy {

  // Demo data for out-of-the-box rendering
  private static demoData = [
    { Period: "2024-06-01T00:00:00Z", Count: 10 },
    { Period: "2024-06-02T00:00:00Z", Count: 15 },
    { Period: "2024-06-03T00:00:00Z", Count: 7 },
    { Period: "2024-06-04T00:00:00Z", Count: 12 },
    { Period: "2024-06-05T00:00:00Z", Count: 20 }
  ];

  private static demoDateRange = {
    startDateUtc: "2024-06-01T00:00:00Z",
    endDateUtc: "2024-06-05T23:59:59Z",
    timePeriod: "day",
    label: "June 1 - June 5, 2024",
    isCustom: false,
    customLabel: "",
    fullLabel: () => "June 1 - June 5, 2024",
    focusedDateRange: false
  };

  @Input() dateRange: DateRange = SparklineChartComponent.demoDateRange;
  @Input() data: any[] = SparklineChartComponent.demoData;
  @Input() id: string;
  @Input() color: string = "#ff0000";
  @Input() unit: string;
  @Input() disableBorders: boolean = false;
  @Input() enableAxisTicks: boolean = false;
  @Input() enableCursorPointer: boolean = true;
  @Input() height: number = 75;

  private margins = { top: 0, right: 0, bottom: 0, left: 15 };
  private axisMargin = 20;
  private renderedWidth: number;
  private svg: any;
  private parentElement: any;
  private presentationSubscription: Subscription;

  constructor(private element: ElementRef, private dateTimeService: DateTimeService, private presentationService: PresentationService) {
    this.parentElement = element.nativeElement;
  }

  ngOnInit() {
    this.presentationSubscription = this.presentationService.windowSize.subscribe(
      (value: { width: number; }) => {
        if (!this.renderedWidth) {
          this.renderedWidth = value.width;
        } else if (this.renderedWidth !== value.width) {
          this.renderedWidth = value.width;
          this.onResize(value);
        }
      });
    // Render chart on first load
    this.renderChart(this.data);
  }

  ngOnDestroy() {
    this.presentationSubscription?.unsubscribe();
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {

    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'data': {
            this.renderChart(this.data);
          }
        }
      }
    }
  }

  private onResize(windowSize: any) {
    if (this.data && this.data.length) {
      this.renderChart(this.data);
    }
  }

  private destroyChart() {
    if (this.svg && !this.svg.empty()) {
      this.svg.attr("width", "0");
      this.svg.selectAll("*").remove();
    }
  }

  private getChartWidth(): number {
    let panelWidth = this.parentElement.getBoundingClientRect().width;

    return panelWidth;
  }

  private renderChart(data?: any[]) {

    this.destroyChart();

    let margin = this.margins;
    let parentElement = d3.select(this.parentElement);

    let svg = this.svg = parentElement.select("svg");

    svg.attr("height", this.height + (this.enableAxisTicks ? 10 : 0));
    svg.attr("width", this.getChartWidth());
    svg.attr("viewBox", "-90 -15 250 100");
    if (this.enableAxisTicks) {
      svg.attr("viewBox", `${-3 * this.axisMargin} 0 ${this.getChartWidth()} ${this.height}`);
    }

    svg.attr("preserveAspectRatio", "xMinYMin meet");

    if (this.parentElement == null || data == null || !this.data.length) {
      svg.append("text")
        .attr("x", 50)
        .attr("y", this.height / 2)
        .text("No data found.");

      if (this.id) {
        svg.append("text")
          .attr("x", -1 * (this.height / 2))
          .attr("y", 10)
          .attr("transform", "rotate(0)")
          .style("text-anchor", "middle")
          .attr("cursor", this.enableCursorPointer ? "pointer" : "auto")
          .text(this.id.split('|')[1])
          .append("title")
          .text(this.id.split('|')[0]);
      }

      return;
    }

    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom - (this.enableAxisTicks ? 10 : 0);
    let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let dataTimeFormatter = '%_I %p';
    switch (this.dateRange.timePeriod) {
      case 'second':
        dataTimeFormatter = '%S';
        break;
      case 'minute':
        dataTimeFormatter = '%_I:%M %p';
        break;
      case 'day':
        dataTimeFormatter = '%b %_d';
    }

    let series: Sparkline[][] = [];
    let timeFormat = d3.utcFormat(dataTimeFormatter);
    series.push(this.formatDataPeriods(data));

    let x = d3.scaleUtc()
      .domain([series[0][0].Period, series[0][series[0].length - 1].Period])
      .range([margin.left, width - margin.right - (this.enableAxisTicks ? (this.axisMargin * 5) : 0)]);

    let y = d3.scaleLinear()
      .domain([0, d3.max(series, s => d3.max(s, d => Number(d.Count)) * (1.10))])
      .nice()
      .rangeRound([height - (this.enableAxisTicks ? (this.axisMargin * 2) : 0), 0]).clamp(true)

    if (this.enableAxisTicks) {
      let xMin = d3.min(series, function (c) { return d3.min(c, function (v) { return v.Period; }); });
      let xMax = d3.max(series, function (c) { return d3.max(c, function (v) { return v.Period; }); });

      let xAxis = (g: { attr: (arg0: string, arg1: string) => { (): any; new(): any; call: { (arg0: d3.Axis<Date | d3.NumberValue>): any; new(): any; }; }; }) => g
        .attr("transform", `translate(0, ${height - (this.axisMargin * 1.35)})`)
        .call(d3
          .axisBottom(x)
          .tickValues([xMin, xMax])
          .tickSizeOuter(0)
          .tickFormat(timeFormat as any)
        );

      svg.append("g")
        .call(xAxis as any);

      const yMax = d3.max(series, s => d3.max(s, d => Number(d.Count)));
      let yAxis = (g: { call: (arg0: d3.Axis<d3.NumberValue>) => any; }) => g
        .call(d3
          .axisLeft(y)
          .tickValues([0, yMax / 2, yMax])
          .tickSizeOuter(0)
        );

      svg.append("g")
        .call(yAxis);

      svg.append("text")
        .attr("x", "42%")
        .attr("y", height + (margin.bottom))
        .style("text-anchor", "middle")
        .style("fill", "#4D4D4D")
        .text(this.dateRange.isCustom
          ? this.dateRange.customLabel
          : (this.dateRange.fullLabel ? this.dateRange.fullLabel() : ''));
    }

    let line = svg.append("g")
      .selectAll("g")
      .data(series)
      .join("g");

    line.append("path")
      .attr("fill", "none")
      .attr("stroke", this.color)
      .attr('opacity', 0.4)
      .attr("stroke-width", 3)
      .attr("d", d3.line()
        .x((d: any) => x(d.Period))
        .y((d: any) => y(Number(d.Count))) as any);

    line.append("g")
      .selectAll("circle")
      .data(d => d)
      .join("circle")
      .attr("class", "dot")
      .attr("fill", this.color)
      .attr("cx", d => x(d.Period))
      .attr("cy", d => y(Number(d.Count)))
      .attr("r", 4);

    line.append("g")
      .selectAll("circle")
      .data(d => d)
      .join("circle")
      .attr("class", "hover")
      .attr("fill", "transparent")
      .attr("cx", d => x(d.Period))
      .attr("cy", d => y(Number(d.Count)))
      .attr("r", 10)
      .attr("cursor", this.enableCursorPointer ? "pointer" : "auto")
      .append("title")
      .text(d => `${timeFormat(d.Period)}\n${d3.format(" ,")(d.Count)} ${this.unit}`);

    if (this.id) {
      svg.append("text")
        .attr("x", -1 * (height / 2))
        .attr("y", 10)
        .attr("transform", "rotate(0)")
        .style("text-anchor", "middle")
        .attr("cursor", this.enableCursorPointer ? "pointer" : "auto")
        .text(this.id.split('|')[1])
        .append("title")
        .text(this.id.split('|')[0]);
    }
  }

  private formatDataPeriods(data: any[]): any[] {
    let formattedData: any[] = JSON.parse(JSON.stringify(data));

    if (this.dateRange.timePeriod == 'day') {
      let groupedData: any[] = [];
      formattedData.forEach(d => {
        let date = this.dateTimeService.getOffsetDate(d.Period);
        date.setUTCHours(0);
        date.setUTCMinutes(0);

        let index = groupedData.length - 1;
        if (groupedData.length && groupedData[index].Period.getTime() == date.getTime()) {
          for (let property in groupedData[index]) {
            if (property == 'Period')
              continue;

            groupedData[index][property] = +groupedData[index][property] + +d[property];
          }
        } else {
          d.Period = date;
          groupedData.push(d);
        }
      });

      return groupedData;
    } else {
      formattedData.forEach(d => d.Period = this.dateTimeService.getOffsetDate(d.Period));
      return formattedData;
    }
  }
}
