import { Component, OnInit, OnChanges, OnDestroy, Input, EventEmitter, Output, ElementRef, SimpleChange, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';


import { takeUntil } from 'rxjs/operators';
import { DateTimeService } from 'app/services/datetime.service';
import { UnsubscribeOnDestroy } from '../../unsubscribe-on-destroy.component';

import { BarChartOptions, DateRange } from 'app/models/datetime.model';
import { PresentationService } from 'app/home/services/presentation.service';


@Component({
  selector: 'time-series-bar-chart',
  templateUrl: './time-series-bar-chart.component.html',
  styleUrls: ['./time-series-bar-chart.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class TimeSeriesBarChartComponent extends UnsubscribeOnDestroy implements OnInit, OnChanges, OnDestroy {
  @Input() chartOptions: BarChartOptions = new BarChartOptions();
  @Input() dateRange: DateRange;
  @Input() data: any[];
  @Input() legendData: any;
  @Output() xAxisLabelChange: EventEmitter<any> = new EventEmitter();

  private margins = { top: 10, right: 15, bottom: 80, left: 75 };
  private colorScale: d3.ScaleSequential<string>;
  private subscription: Subscription;
  private renderedWidth: number = 0;
  private height: number = 360;
  legend: any = {};
  keys: any = [];
  private disableItems: boolean = false;
  private applyLegendFilters: boolean = false;
  private parentElement;
  private svg: any;
  imageSource: string = ' TimeSeriesChartData.png';
  showDownload: boolean = false;

  constructor(
    private element: ElementRef,
    private dateTimeService: DateTimeService,
    private presentationService: PresentationService
  ) {
    super();
    this.parentElement = element.nativeElement;
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    this.initializeOptions();
    setTimeout(() => this.renderChart());
  }

  ngOnInit() {
    this.subscription = this.presentationService.windowSize
      .pipe(takeUntil(this.d$))
      .subscribe((value) => {
        if (!this.renderedWidth) {
          this.renderedWidth = value.width;
        } else if (this.renderedWidth !== value.width) {
          this.renderedWidth = value.width;
          this.onResize(value);
        }
      });

    this.initializeOptions();
    this.renderChart();

    // this.applyLegendFilters = (this.chartOptions && this.chartOptions.legendClickFunction);
  }

  override ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private onResize(windowSize: any) {
    if (this.data && this.data.length) {
      this.renderFilteredChart();
    }
  }

  private destroyChart() {
    if (this.svg && !this.svg.empty()) {
      this.svg.attr("width", "0");
      this.svg.selectAll("*").remove();
    }
  }

  private initializeOptions() {
    this.legend = {};

    if (!this.data || !this.data.length) {
      return;
    }

    let legendKeys = this.getLegendKeys();
    this.keys = [];
    for (let key of legendKeys) {
      if (key != 'Period') {
        this.keys.push(key);
        this.legend[key] = {
          visible: true,
          className: this.getKeyClassName(key)
        };
      }
    }

    let colorScale = d3.interpolateViridis;


    this.colorScale = d3.scaleSequential(colorScale)
      .domain([0, this.keys.length]);

    if (this.chartOptions && this.chartOptions.showLegend && this.chartOptions.dynamicColors) {
      for (let key of this.keys) {
        this.legend[key].color = this.colorScale(this.keys.indexOf(key));
      }
    }
  }

  private getLegendKeys(): any {

    if (this.legendData && Object.keys(this.legendData).length > 0) {

      //TODO: TEMP- remove when all categories are converted to the new ones.
      let temp: any = {};
      Object.keys(this.legendData)
        .slice(0, 6)
        .forEach((key) => {
          if (this.legendData[key].length > 0)
            temp[key] = this.legendData[key];
        });

      for (let d of this.data) {
        for (let k of Object.keys(d)) {
          if (d[k] != "0") {
            temp[k] = this.legendData[k];
          }
        }
      }

      return Object.keys(temp);
    }
    else {
      return Object.keys(this.data[0]);
    }
  }

  toggleLegendItem(key: string) {

    if (this.keys.length == this.legendVisibleCount()) {
      this.setAllLegendItems(false);
    }

    this.legend[key].visible = !this.legend[key].visible;

    if (this.legendVisibleCount() == 0) {
      this.setAllLegendItems(true);
    }

    this.renderFilteredChart();
  }

  applyLegendFiltersClick() {
    if (this.chartOptions && this.chartOptions.legendClickFunction) {
      let items = [];
      for (let key of this.keys) {
        if (this.legend[key] && this.legend[key].visible) {
          items.push(key);
        }
      }
      this.chartOptions.legendClickFunction(items);
    }
  }

  private legendVisibleCount(): number {
    let count: number = 0;

    for (let key of this.keys) {
      if (this.legend[key] && this.legend[key].visible) {
        count++;
      }
    }

    return count;
  }

  handleOptionSelected(option: string) {
    console.log('Selected option:', option);
    this.presentationService.saveSvgToImage();
    // Perform further actions based on the selected option
  }

  toggleAllLegendItems() {
    // create a copy of the data and remove disabled items
    // let data = JSON.parse(JSON.stringify(this.data));
    let disabledItems = [];
    let enabledItems = [];

    for (let key of this.keys) {
      if (key !== 'Period' && this.legend[key]) {
        if (this.legend[key].visible) {
          enabledItems.push(key);
        } else {
          this.legend[key].visible = !this.legend[key.visible];
          disabledItems.push(key);
        }
      }
    }

    // If none are disabled, we should disable all
    if (!disabledItems.length) {
      enabledItems.forEach((key: any) => {
        this.legend[key].visible = !this.legend[key].visible;
      });
    }

    this.renderFilteredChart();
  }

  private setAllLegendItems(status: boolean) {
    for (let key of this.keys) {
      this.legend[key].visible = status;
    }
  }

  private renderFilteredChart() {
    // create a copy of the data and remove disabled items
    let data = JSON.parse(JSON.stringify(this.data));
    let disabledItems: any = [];

    for (let key of this.keys) {
      if (this.legend[key] && !this.legend[key].visible)
        disabledItems.push(key);
    }

    // remove disabled items from data and then re-render chart
    if (disabledItems.length) {
      data = data.map((d: any) => {
        disabledItems.forEach((disabled: any) => {
          delete d[disabled];
        });
        return d;
      });
    }

    this.renderChart(data);
  }

  public renderChart(data?: any[]) {
    this.destroyChart();

    let margin = this.margins;
    let parentElement = d3.select(this.parentElement);

    let svg = this.svg = parentElement.select("svg");

    svg.attr("width", this.getChartWidth());

    if (!data) {
      data = this.data;
    }

    if (this.parentElement == null || data == null || !this.data.length) {
      svg.attr("height", 20)
        .append("text")
        .attr("x", 0)
        .attr("y", 15)
        .text("No data returned.");

      return;
    }

    const svgHeight = this.presentationService.isExtendedPresentation() ? 480 : 360;
    svg.attr('height', svgHeight);

    // NOTE: IE does not currently support some CSS properties (height, width, transform...) on SVG elements
    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom;
    let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let dataTimeFormatter = '%_I %p';
    switch (this.dateRange && this.dateRange.timePeriod) {
      case 'second':
        dataTimeFormatter = '%S';
        break;
      case 'minute':
        dataTimeFormatter = '%_I:%M %p';
        break;
      case 'day':
        dataTimeFormatter = '%b %_d';
        break;
      case 'month':
        dataTimeFormatter = '%B';
        break;
    }

    let timeFormat = d3.utcFormat(dataTimeFormatter);
    data = this.formatDataPeriods(data);

    let x = d3.scaleBand()
      .domain(data.map((d, i) => timeFormat(d.Period) + `_${i}`))
      .rangeRound([0, width])
      .padding(0.2);

    let y = d3.scaleLinear()
      .domain([0, d3.max(data.map((d) => {
        let total = 0;
        for (let key of Object.keys(d)) {
          if (key !== 'Period') {
            total += +d[key];
          }
        }
        return total;
      }))])
      .nice().rangeRound([height, 0]);

    let tickStyle = 'rotate(90) translate(10, -13)';
    let barWidth = x.bandwidth();
    let isTranslatedTickLabel = true;
    const translatedTickSpacing = 15; // space between x-axis tick labels and date label

    if (barWidth >= 37) {
      isTranslatedTickLabel = false;
      tickStyle = 'translate(-18, 0)';
    } else if (barWidth >= 22) {
      isTranslatedTickLabel = true;
      tickStyle = 'rotate(45) translate(10, -5)';
    }

    if (isTranslatedTickLabel) {
      svg.attr("height", svgHeight + translatedTickSpacing);
    }

    // draw x-axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickPadding(10)
        .tickFormat(d => {
          if (!d.includes('_'))
            return d;

          const index = d.indexOf('_');
          return d.substring(0, index);
        }))
      .selectAll("text")
      .attr("text-anchor", "start")
      .attr("transform", tickStyle);

    svg.append("text")
      .attr("x", +svg.attr("width") / 2)
      .attr("y", height + (margin.bottom) + (isTranslatedTickLabel ? translatedTickSpacing : 0))
      .attr("dx", "1rem")
      .style("text-anchor", "middle")
      .text(this.dateRange.isCustom
        ? this.dateRange.customLabel
        : (this.dateRange.fullLabel
          ? this.dateRange.fullLabel()
          : ''));

    this.xAxisLabelChange.emit(this.dateRange);

    // draw y-axis
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).tickSize(-width).tickPadding(10).ticks(8).tickFormat(d => this.formatNumber(Number(d))));

    svg.append("text")
      .attr("y", 0)
      .attr("x", -180)
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .text("Count");

    // draw rectangles 
    let keys = Object.keys(data[0]);
    keys.splice(keys.indexOf('Period'), 1);
    let stackData = d3.stack().keys(keys)(data);

    let bars = g.append("g")
      .selectAll("g")
      .data(stackData)
      .enter().append("g")
      .attr("data-key", (d) => d.key)
      .attr("class", (d, i) => "stack " + this.getKeyClassName(d.key))
      .attr("fill", (d) => this.chartOptions && this.chartOptions.dynamicColors ? this.colorScale(this.keys.indexOf(d.key)) : "")
      .attr("cursor", (d) => this.chartOptions && this.chartOptions.barClickFunction ? "pointer" : "default");

    let rects = bars.selectAll("rect")
      .data((d: any) => { return d; })
      .enter().append("rect");

    const maxBarWidth = 160;
    let barOffset = 0;
    if (barWidth > maxBarWidth) {
      barOffset = (barWidth - maxBarWidth) / 2;
      barWidth = maxBarWidth;
    }

    rects.attr("x", (d: any, i) => x(timeFormat(d.data.Period) + `_${i}`) + barOffset)
      .attr("y", (d: any) => { return y(d[1]); })
      .attr("height", (d: any, i) => { return (y(d[0]) - y(d[1])); })
      .attr("visibility", (d: any) => {
        let count = d[1] - d[0];
        if (count <= 0) {
          return "hidden";
        }
        return count
      })
      .attr("width", barWidth)
      .append("title")
      .text(function (d: any, i) {
        let key = (<any>d3.select(this).node()).parentNode.parentNode.getAttribute("data-key");
        let count = d[1] - d[0];
        return key + ": " + count.toLocaleString() || "";
      });

    if (this.chartOptions && this.chartOptions.barClickFunction) {
      rects.on('click', (d: any) => {
        let key = d.event.target.parentNode.getAttribute('data-key');
        let period = new Date(d.data.Period);

        if (this.dateRange.timePeriod == 'month') {
          period.setDate(1);
          period.setHours(0);
          period.setMinutes(0);
        } else if (this.dateRange.timePeriod == 'day') {
          period.setUTCHours(0);
          period.setUTCMinutes(0);
        }

        period.setUTCHours(period.getUTCHours() + (-1 * this.dateTimeService.getOffsetHours()));
        period.setUTCMinutes(period.getUTCMinutes() + (-1 * this.dateTimeService.getOffsetMinutes()));

        // TODO: make sure period is within start and end of dateRange

        this.chartOptions.barClickFunction(key, period);
      });
    }
  }

  private formatNumber(value: number): any {
    if (value < 10) {
      return d3.format("")(value);
    }
    else {
      let result = d3.format(".2s")(value);
      switch (result[result.length - 1]) {
        case "G":
          return result.slice(0, -1) + "B";
        case "P":
          return result.slice(0, -1) + "Q";
      }
      return result;
    }
  }

  private formatDataPeriods(data: any[]): any[] {
    let formattedData: any[] = JSON.parse(JSON.stringify(data));

    if (this.dateRange.timePeriod == 'day') {
      let groupedData: any = [];
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
    } else if (this.dateRange.timePeriod == 'month') {
      formattedData.forEach(d => {
        const date = new Date(d.Period);
        date.setUTCHours(date.getUTCHours() - this.dateTimeService.getOffsetHours());
        date.setUTCMinutes(date.getUTCMinutes() - this.dateTimeService.getOffsetMinutes());
        d.Period = date;
      })
      return formattedData;
    } else {
      formattedData.forEach(d => d.Period = this.dateTimeService.getOffsetDate(d.Period));
      return formattedData;
    }
  }

  // determine svg width based on parent container size
  private getChartWidth(): number {
    let panelWidth = this.parentElement.getBoundingClientRect().width;

    if (this.chartOptions && this.chartOptions.showLegend && this.keys.length > 0 && this.keys[0] != 'Count' && this.presentationService.isLargePresentation()) {
      panelWidth -= this.presentationService.isExtendedPresentation() ? 210 : 180;
    } else {
      panelWidth -= 5;
    }

    return panelWidth > 0 ? panelWidth : 0;
  }

  private getKeyClassName(key: string): string {
    let name = key.toLowerCase();
    return name.split(' ').join('-');
  }

}
