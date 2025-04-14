import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, SimpleChange, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

interface Trade {
  trade_id: string;
  product_id: string;
  last_size: number;
  volume_24h: number;
  side: string;
  time: string;
  dateObj: Date;
}

@Component({
  selector: 'animated-bubble',
  templateUrl: './animated-bubble.component.html',
  styleUrl: './animated-bubble.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class AnimatedBubbleComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() trades: Trade[] = [];
  @Input() productIds: string[] = [
    "BTC-USD", "ETH-USD", "XRP-USD", "XLM-USD", "LTC-USD",
    "BCH-USD", "ZRX-USD", "ALGO-USD", "EOS-USD"
  ];

  private offset = 0;
  private margin = { top: 40, right: 1, bottom: 50, left: 65 };
  private width = 960;
  private height = this.productIds.length * 40;
  private svg: any;
  private container: any;
  private x: any;
  private y: any;
  private r: any;
  private xAxisBottom: any
  private xAxisTop: any
  private yAxisLeft: any
  private yAxisRight: any
  // private tooltip: any = null;
  private updateInterval: any;
  private parentElement: any;
  isLoading: boolean = true;

  constructor(private element: ElementRef) {
    this.parentElement = this.element.nativeElement;
  }

  private getChartWidth(): number {
    return this.parentElement.getBoundingClientRect().width;
  }

  ngOnInit() {

  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    setTimeout(() => (this.isLoading = false), 2000);
    if (changes['trades'].currentValue) {

      if (this.trades.length > 0 && this.offset === 0) {
        const now = new Date();
        this.offset = this.trades[0].dateObj.getTime() - now.getTime();
        this.trades = changes['trades'].currentValue;

        this.updateInterval = d3.interval(() => this.updateChart(), 20);
      }
    }

  }

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      this.updateInterval.stop();
    }
  }

  private initializeChart() {

    if (this.svg && !this.svg.empty()) {
      this.svg.attr("width", "0");
      this.svg.selectAll("*").remove();
    }

    let parentElement = d3.select(this.parentElement);

    // Define canvas
    this.svg = this.svg = parentElement.select('svg')
      .attr("viewBox", "-55, -20, 680, 600")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("width", this.getChartWidth() / 1.2)
      .attr("height", this.height);

    // Create tooltip
    this.tooltip = d3.select("body").append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    // Set scaling functions
    this.x = d3.scaleTime()
      .range([0, this.width])
      .domain(this.getTimeExtent());

    this.y = d3.scaleBand()
      .range([0, this.height])
      .domain(this.productIds)
      .paddingOuter(0.1);

    this.r = d3.scaleSqrt()
      .domain([0.0, 1.0])
      .range([0, this.height])
      .exponent(0.4);

    // Set axes
    this.xAxisBottom = d3.axisBottom(this.x).tickSizeOuter(0);
    this.xAxisTop = d3.axisTop(this.x).tickSizeOuter(0);
    this.yAxisLeft = d3.axisLeft(this.y).tickSizeOuter(0);
    this.yAxisRight = d3.axisRight(this.y).tickValues([]);

    // Add grid lines
    this.svg.append("g")
      .attr('id', 'grid-lines')
      .selectAll(".grid-line")
      .data(this.productIds)
      .enter().append("line")
      // .attr("class", "grid-line")
      .attr('x1', 0)
      .attr('x2', this.width)
      .attr('y1', (d: any) => this.y(d) + this.y.bandwidth() / 2)
      .attr('y2', (d: any) => this.y(d) + this.y.bandwidth() / 2)
      .attr("stroke", "#f1efef")
      .attr("stroke-width", "1px")

    // Container for node elements
    this.parentElement = this.svg.append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    // Add axes
    this.svg.append("g")
      .attr("transform", `translate(0,${this.height})`)
      .attr('id', 'xAxisBottom')
      .attr("class", "axis")
      .call(this.xAxisBottom);

    this.svg.append("g")
      .attr('id', 'xAxisTop')
      .attr("class", "x axis")
      .call(this.xAxisTop);

    this.svg.append("g")
      .attr("class", "axis")
      .call(this.yAxisLeft);

    this.svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${this.width}, 0)`)
      .call(this.yAxisRight);
  }

  private getTimeExtent(): [Date, Date] {
    const now = new Date();
    const nowOffset = new Date(now.getTime() + this.offset);
    const dateStart = new Date(nowOffset.getTime() - 60 * 1000);
    return [dateStart, nowOffset];
  }

  private tooltip = d3.select("body").append("div")
    .attr("id", "tooltip").style("opacity", 0);

  private updateChart() {
    const timeExtent = this.getTimeExtent();
    this.x.domain(timeExtent);

    this.trades = this.trades.filter(trade =>
      trade.dateObj > new Date(timeExtent[0].getTime() - 5000)
    );

    const displayTooltip = (d: any) => {
      return (
        `<div>
                    <p>Product Id: ${d.product_id} |
                    <p>Time: ${d.dateObj.toLocaleTimeString().replace(' ', '.' + 'ms ')} |
                    <p>Last Size: ${d.last_size} |
                    <p>Best Bid Size: ${(d.best_bid_size)}</p> |
                    <p>Volume: <strong>(${d3.format(" ,")(d.volume_24h)})</strong>
                    </p>
                </div>`
      )
    }

    const circles = this.parentElement.selectAll('circle').data(this.trades, (d: Trade) => d.trade_id);

    circles.exit().remove();

    circles.enter()
      .append('circle')
      .on("mousemove", (event: any, d: any) => {
        this.tooltip.html(displayTooltip(d))
          .style("left", event.pageX - 35 + "px")
          .style("top", event.pageY - 30 + "px")
          .style("border-radius", "10px")
          .style("pointer-events", "none")
          .attr("transform", `translate(${event.pageX - 35}, ${event.pageY - 30})`);
        this.tooltip.transition().duration(100).style("opacity", 1);
      })
      .on("mouseout", (d: any) => {
        this.tooltip.transition().duration(100).style("opacity", 0).style("display", "").style("text-decoration", "none");
      })
      .attr('class', (d: Trade) => d.side)
      .attr("stroke", '1px')
      .style('fill', (d: Trade) => d.side === "buy" ? "green" : "#ff5959")
      .attr('r', (d: Trade) => this.r(d.last_size / d.volume_24h))
      .attr('cy', (d: Trade) => this.y(d.product_id) + this.y.bandwidth() / 2)
      .merge(circles)
      .attr('cx', (d: Trade) => this.x(d.dateObj));
    // .call((circles: any) => circles.append("title")
    //   .text((d: any) => [d.product_id, d.volume_24h].join("\n")))


    d3.selectAll('#xAxisBottom').call(this.xAxisBottom);
    d3.selectAll('#xAxisTop').call(this.xAxisTop);
  }
} 