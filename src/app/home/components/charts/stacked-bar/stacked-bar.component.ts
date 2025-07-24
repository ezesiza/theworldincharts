import { Component, OnInit, OnDestroy, ElementRef, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { PresentationService } from 'app/services/presentation.service';

@Component({
  selector: 'stacked-bar',
  templateUrl: './stacked-bar.component.html',
  styleUrls: ['./stacked-bar.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class StackedBarComponent implements OnInit, OnDestroy {
  advertisers: any[] = [];
  selectedAdvertiser: any = null;
  legend: any = {};
  keys: string[] = [];
  selectedField: string = '';
  showStacked: boolean = true;
  isLoading: boolean = true;
  stackMode: 'count' | 'percent' = 'percent';
  private svg: any;
  private parentElement: any;
  private subscription: Subscription;
  private colorScale: d3.ScaleSequential<string>;
  private margins = { top: 10, right: 15, bottom: 80, left: 75 };
  private height: number = 360;

  constructor(
    private element: ElementRef,
    private http: HttpClient,
    private presentationService: PresentationService
  ) {
    this.parentElement = element.nativeElement;
  }

  ngOnInit() {
    this.http.get<any>('assets/datasets/advertiser_data_table.json').subscribe(data => {
      this.advertisers = data.advertisers;
      this.isLoading = false;
      if (this.advertisers.length > 0) {
        this.selectedAdvertiser = this.advertisers[0];
        this.initializeOptions();
        this.selectedField = this.keys[0];
        this.renderChart();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onAdvertiserChange(event: any) {
    this.selectedAdvertiser = this.advertisers.find(a => a.name === event.target.value);
    this.initializeOptions();
    this.renderChart();
  }

  onFieldChange(event: any) {
    this.selectedField = event.target.value;
    this.renderChart();
  }

  onStackedChange(event: any) {
    // If switching to stacked, re-enable all fields
    if (this.showStacked) {
      for (let key of this.keys) {
        this.legend[key].visible = true;
        this.stackMode = 'percent';
      }
    } else {
      this.stackMode = 'count';
    }
    this.renderChart();
  }

  onStackModeChange(event: any) {
    this.showStacked = event.target.value === 'count' ? false : true;
    this.stackMode = event.target.value;
    this.initializeOptions();
    this.renderChart();
  }

  private initializeOptions() {

    this.legend = {};
    if (!this.selectedAdvertiser || !this.selectedAdvertiser.data.length) return;
    // Determine keys based on stackMode
    if (this.stackMode === 'count') {
      this.keys = Object.keys(this.selectedAdvertiser.data[0]).filter(k => k === 'valid-clicked:1');
    } else {
      this.keys = Object.keys(this.selectedAdvertiser.data[0]).filter(k => k !== 'UTM_SOURCE' && k !== 'valid-clicked:1');
    }
    for (let key of this.keys) {
      this.legend[key] = {
        visible: true,
        className: this.getKeyClassName(key)
      };
    }
    let colorScales = d3.interpolateViridis;
    this.colorScale = d3.scaleSequential(colorScales).domain([0, this.keys.length]);
    for (let key of this.keys.reverse()) {
      // Use a named color class if it exists, otherwise fallback to colorScale
      const className = this.getKeyClassName(key);
      // List of known color class names from .less (add more as needed)
      const knownClasses = this.keys;

      for (let key of this.keys) {
        this.legend[key].color = this.colorScale(this.keys.indexOf(key));
      }

      // if (knownClasses.includes(className)) {
      //   this.legend[key].color = this.colorScale(this.keys.indexOf(key));
      // }
      // else {
      //   this.legend[key].color = '';
      //   this.legend[key].className = className;
      // }
    }
    if (!this.selectedField && this.keys.length > 0) {
      this.selectedField = this.keys[0];
    }
    // If selectedField is not in keys, reset it
    if (this.selectedField && !this.keys.includes(this.selectedField) && this.keys.length > 0) {
      this.selectedField = this.keys[0];
    }
  }

  // private initializeOptions() {
  // this.legend = {};

  // if (!this.advertisers || !this.advertisers.length) {
  //   return;
  // }

  // let legendKeys = this.getLegendKeys();
  // this.keys = [];
  // for (let key of legendKeys) {
  //   if (key != 'Period') {
  //     this.keys.push(key);
  //     this.legend[key] = {
  //       visible: true,
  //       className: this.getKeyClassName(key)
  //     };
  //   }
  // }

  // let colorScale = d3.interpolateViridis;


  // this.colorScale = d3.scaleSequential(colorScale)
  //   .domain([0, this.keys.length]);

  // if (this.chartOptions && this.chartOptions.showLegend && this.chartOptions.dynamicColors) {
  // for (let key of this.keys) {
  //   this.legend[key].color = this.colorScale(this.keys.indexOf(key));
  // }
  // }
  // }

  private getLegendKeys(): any {
    // console.log(this.advertisers);
    // if (this.legendData && Object.keys(this.legendData).length > 0) {

    //TODO: TEMP- remove when all categories are converted to the new ones.
    //   let temp: any = {};
    //   Object.keys(this.legendData)
    //     .slice(0, 6)
    //     .forEach((key) => {
    //       if (this.legendData[key].length > 0)
    //         temp[key] = this.legendData[key];
    //     });

    //   for (let d of this.data) {
    //     for (let k of Object.keys(d)) {
    //       if (d[k] != "0") {
    //         temp[k] = this.legendData[k];
    //       }
    //     }
    //   }

    //   return Object.keys(temp);
    // }
    // else {
    //   return Object.keys(this.data[0]);
    // }
  }

  private legendVisibleCount(): number {
    let count = 0;
    for (let key of this.keys) {
      if (this.legend[key] && this.legend[key].visible) {
        count++;
      }
    }
    return count;
  }

  private setAllLegendItems(status: boolean) {
    for (let key of this.keys) {
      this.legend[key].visible = status;
    }
  }

  toggleLegendItem(key: string) {

    if (this.keys.length === this.legendVisibleCount()) {
      this.setAllLegendItems(false);
    }
    this.legend[key].visible = !this.legend[key].visible;
    if (this.legendVisibleCount() === 0) {
      this.setAllLegendItems(true);
    }
    this.renderFilteredChart();
  }

  toggleAllLegendItems() {
    // const allVisible = this.keys.every(key => this.legend[key].visible);
    // this.setAllLegendItems(!allVisible);
    // this.renderFilteredChart();

    // create a copy of the data and remove disabled items
    // let data = JSON.parse(JSON.stringify(this.data));
    let disabledItems = [];
    let enabledItems = [];
    for (let key of this.keys) {
      if (key !== 'Period' && this.legend[key]) {
        if (this.legend[key].visible) {
          enabledItems.push(key);
        } else {
          this.legend[key].visible = !this.legend[key].visible;
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

  private renderFilteredChart() {
    // create a copy of the data and remove disabled items
    let data = JSON.parse(JSON.stringify(this.advertisers));
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
    this.renderChart(data)
  }

  private destroyChart() {
    if (this.svg && !this.svg.empty()) {
      this.svg.attr('width', '0');
      this.svg.selectAll('*').remove();
    }
  }

  private parseValue(val: any): number {
    if (typeof val !== 'string' && typeof val !== 'number') return 0;
    let str = String(val).replace(/%/g, '').replace(/,/g, '');
    let num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }

  public renderChart(modifiedData?: any) {
    this.destroyChart();
    if (!this.selectedAdvertiser || !this.selectedAdvertiser.data.length) return;
    let margin = this.margins;
    let parentElement = d3.select(this.parentElement);
    let svg = this.svg = parentElement.select('svg');
    svg.attr('width', this.getChartWidth());
    svg.attr('height', this.height);
    let width = +svg.attr('width') - margin.left - margin.right;
    let height = +svg.attr('height') - margin.top - margin.bottom;
    let g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let data = JSON.parse(JSON.stringify(this.selectedAdvertiser.data));
    // let data = modifiedData;

    const tooltipEl = document.getElementById('bar-tooltip');

    const that = this;
    if (this.showStacked) {
      let keys = this.keys.filter(key => this.legend[key].visible);

      if (!keys.length) keys = this.keys;
      let x = d3.scaleBand()
        .domain(data.map((d: any) => d.UTM_SOURCE))
        .rangeRound([0, width])
        .padding(0.2);
      let y: d3.ScaleLinear<number, number>;
      if (this.stackMode === 'percent') {
        data.forEach((row: any) => {
          for (let key of keys) {
            row[key] = this.parseValue(row[key]);
          }
        });
        y = d3.scaleLinear().domain([0, 100]).nice().rangeRound([height, 0]);
      } else {
        y = d3.scaleLinear()
          .domain([0, d3.max(data, (d: any) => keys.reduce((sum, k) => sum + this.parseValue(d[k]), 0))])
          .nice().rangeRound([height, 0]);
      }
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))

      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(8));

      let stackData = d3.stack().keys(keys)(data);

      let bars = g.append('g')
        .selectAll('g')
        .data(stackData)
        .enter().append('g')
        .attr('data-key', (d: any) => d.key)
        .attr('class', (d: any) => 'stack ' + this.getKeyClassName(d.key))
        .attr('fill', (d: any) => this.legend[d.key].color
          // return this.colorScale(this.keys.indexOf(d.key))
        );

      bars.selectAll('rect')
        .data((d: any) => d)
        .enter().append('rect')
        .attr('x', (d: any) => x(d.data.UTM_SOURCE))
        .attr('y', (d: any) => y(d[1]))
        .attr('height', (d: any) => {
          let h = y(d[0]) - y(d[1]);
          return isNaN(h) ? 0 : h;
        })
        .attr('width', x.bandwidth())
        .attr('class', function (d: any) {
          const parentDatum = d3.select((this as SVGRectElement).parentNode as Element).datum() as { key: string };
          return 'bar ' + that.getKeyClassName(parentDatum.key);
        })
        .attr('fill', function (d: any) {
          const parentDatum = d3.select((this as SVGRectElement).parentNode as Element).datum() as { key: string };

          const className = that.getKeyClassName(parentDatum.key);
          // Only set fill if not using a named class
          const knownClasses = that.keys;
          if (knownClasses.includes(className)) {
            return null;
          } else {
            return that.legend[parentDatum.key].color;
          }
        })
        .on('mousemove', function (event: MouseEvent, d: any) {
          // d3.selectAll('.bar-highlight').classed('bar-highlight', false);
          // d3.select(this).classed('bar-highlight', true);
          const parentDatum = d3.select(this.parentNode as Element).datum() as { key: string };
          const key = parentDatum.key;
          const value = d[1] - d[0];
          const utm = d.data.UTM_SOURCE;
          if (tooltipEl) {
            tooltipEl.style.display = 'block';
            tooltipEl.style.left = (event.pageX + 16) + 'px';
            tooltipEl.style.top = (event.pageY - 24) + 'px';
            tooltipEl.innerHTML = `<b>${key}</b><br>UTM_SOURCE: <b>${utm}</b><br>Value: <b>${value}</b>`;
          }
        })
        .on('mouseout', function () {
          // d3.select(this).classed('bar-highlight', false);
          if (tooltipEl) tooltipEl.style.display = 'none';
        })
      // .append('title')
      // .text((d: any) => `${d.data.UTM_SOURCE}: ${d[1] - d[0]}`);
    } else {
      if (!this.selectedField) return;
      let x = d3.scaleBand()
        .domain(data.map((d: any) => d.UTM_SOURCE))
        .rangeRound([0, width])
        .padding(0.2);
      let y = d3.scaleLinear()
        .domain([0, d3.max(data, (d: any) => this.parseValue(d[this.selectedField]))])
        .nice().rangeRound([height, 0]);
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));
      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(8));
      const selectedField = this.selectedField;

      g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', (d: any) => x(d.UTM_SOURCE))
        .attr('y', (d: any) => y(this.parseValue(d[selectedField])))
        .attr('height', (d: any) => {
          let h = height - y(this.parseValue(d[selectedField]));
          return isNaN(h) ? 0 : h;
        })
        .attr('width', x.bandwidth())
        .attr('fill', () => this.legend[selectedField]?.color || '#0072B2')
        .on('mousemove', function (event: MouseEvent, d: any) {
          // d3.selectAll('.bar-highlight').classed('bar-highlight', false);
          // d3.select(this).classed('bar-highlight', true);

          if (tooltipEl) {
            tooltipEl.style.display = 'block';
            tooltipEl.style.left = (event.pageX + 16) + 'px';
            tooltipEl.style.top = (event.pageY - 24) + 'px';
            tooltipEl.innerHTML = `<b>${d.UTM_SOURCE}</b><br>Field: <b>${selectedField}</b><br>Value: <b>${d[selectedField]}</b>`;
          }
        })
        .on('mouseout', function () {
          // d3.select(this).classed('bar-highlight', false);
          if (tooltipEl) tooltipEl.style.display = 'none';
        })
      // .append('title')
      // .text((d: any) => `${d.UTM_SOURCE}: ${d[selectedField]}`);
    }
  }

  // determine svg width based on parent container size
  private getChartWidth(): number {
    let panelWidth = this.parentElement.getBoundingClientRect().width;

    if (this.keys.length > 0 && this.presentationService.isLargePresentation()) {
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
