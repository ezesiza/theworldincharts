import { Component, ElementRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { FunnelChart } from './funnel.chart';
import { ActivatedRoute } from '@angular/router';

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
  { stage: "Org. Account", value: 500000 },
  { stage: "Account Active", value: 350138 },
  { stage: "Gold Profile", value: 213067 },
  { stage: "Trial Ended", value: 177635 },
  { stage: "Trial Active", value: 140071 },
  { stage: "Sub. Onhold", value: 93081 }
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
  styleUrls: ['funnel.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class FunnelChartComponent implements OnInit {
  @Input() data: FunnelDataPoint[] = data;
  @Input() width = 600;
  @Input() height = 400;
  private margins = { top: 15, right: 15, bottom: 10, left: 5 };
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
  private parentElement: any;
  activatedRoute: string = '';


  constructor(private element: ElementRef, private route: ActivatedRoute) {
    this.parentElement = this.element.nativeElement;
  }


  ngOnInit(): void {
    this.route.url.subscribe(data => {
      this.activatedRoute = data[0].path;
    });
    this.initializeChart();
  }

  private getChartWidth(): number {
    let panelWidth = this.parentElement.getBoundingClientRect().width;
    return panelWidth > 0 ? panelWidth : 0;
  }


  private initializeChart() {
    let parentElement = d3.select(this.parentElement);
    // this.container = parentElement.select('svg');


    if (this.svg && !this.svg.empty()) {
      this.svg.attr("width", "0");
      this.svg.selectAll("*").remove();
    }

    this.svg = parentElement.select('svg')
      // .attr("viewBox", `-80, -50, ${this.width * 1.8}, ${this.height * 1.8}`)
      .attr("viewBox", "-60, 0, 680, 600")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("transform", `translate(${this.margins.left}, ${this.margins.top})`);

    this.svg.attr("width", this.getChartWidth() / 1.2);
    this.svg.attr("height", this.height);

    this.renderChart(this.svg);
  }


  renderChart(svg: any) {

    const chart = new FunnelChart(svg, data)
      .setSize([this.width, this.height])
      .setOptions({ palette: this.updateColorScheme(this.currentScheme), style: this.currentStyle, streamlined: false })
      .setField({ stage: "stage" })
      .setData(data)
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
