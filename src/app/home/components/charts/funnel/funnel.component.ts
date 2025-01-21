import { Component, ElementRef, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { FunnelChart } from './funnel.chart';

interface FunnelDataPoint {
  stage: string;
  value: number;
}

interface FunnelOptions {
  palette?: string[];
  style?: '2d' | '3d';
  streamlined?: boolean;
  percentage?: 'first' | 'previous';
  showPercentage?: boolean;
}

const data = [
  { stage: "Invitation", value: 500000 },
  { stage: "Create account", value: 350138 },
  { stage: "Complete profile", value: 213067 },
  { stage: "Start trial", value: 177635 },
  { stage: "Finish trial", value: 140071 },
  { stage: "Subscribe", value: 93081 }
]

const data2 = [
  { stage: "New Jersey", value: 1764545 },
  { stage: "Washington", value: 4722699 },
  { stage: "Neveda", value: 3276813 },
  { stage: "California", value: 6925318 },
  { stage: "Florida", value: 2380152 }

];

@Component({
  selector: 'funnel-chart',
  templateUrl: 'funnel.component.html',
  styleUrls: ['funnel.component.less']
})
export class FunnelChartComponent implements OnInit {
  @Input() data: FunnelDataPoint[] = data2;
  @Input() width = 600;
  @Input() height = 400;
  @Input() options: FunnelOptions = {
    palette: d3.schemeTableau10 as any,
    style: '3d',
    streamlined: true,
    percentage: 'first',
    showPercentage: true
  };

  private container: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  private svg: d3.Selection<SVGGElement, unknown, null, undefined> | any;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  currentScheme: any = 'schemeSet2';
  currentStyle: any = '2d';


  constructor(private el: ElementRef) { }


  ngOnInit(): void {
    this.initializeChart();
  }


  private initializeChart() {
    this.container = d3.select(this.el.nativeElement).select('div');


    if (this.svg && !this.svg.empty()) {
      this.svg.attr("width", "0");
      this.svg.selectAll("*").remove();
    }

    // d3.select("#chart").remove();
    this.svg = d3
      .select("#chart").append("svg")
      // .attr("viewBox", [0, 0, this.width, this.height]);
      .attr("viewBox", `-80, -50, ${this.width * 1.8}, ${this.height * 1.8}`)
    // .attr('width', this.width)
    // .attr('height', this.height);
    this.renderChart();
  }


  renderChart() {

    const chart = new FunnelChart(this.svg, data2)
      .setSize([this.width, this.height])
      .setOptions({ palette: this.updateColorScheme(this.currentScheme), style: this.currentStyle, streamlined: false })
      .setField({ stage: "stage" })
      .setData(data2)
      .render();
    // return chart.render();
  }

  onSchemeChange(scheme: any) {
    this.currentScheme = scheme;
    this.updateColorScheme(scheme);
    this.initializeChart();
  }

  updateColorScheme(schemeName: string) {
    switch (schemeName) {
      case 'schemeSet1':
        this.currentScheme = d3.schemeSet1
        break;
      case 'schemeSet2':
        this.currentScheme = [...d3.schemeSet2]
        break;
      case 'schemePaired':
        this.currentScheme = d3.schemePaired
        break;
      case 'schemeTableau10':
        this.currentScheme = d3.schemeTableau10
        break;
      case 'schemeDark2':
        this.currentScheme = d3.schemeDark2
        break;
      default:
        [...d3.schemeSet2]
        break;
    }
    return this.currentScheme
  }

  onStyleChange(style: string) {
    this.currentStyle = style;
    this.initializeChart();
    return this.currentStyle;
  }

  onPercentageToggle(showPercentage: boolean) {
    console.log('Show percentage:', showPercentage);
  }

  onPctOptionChange(option: string) {
    console.log('Selected percentage option:', option);
  }
}
