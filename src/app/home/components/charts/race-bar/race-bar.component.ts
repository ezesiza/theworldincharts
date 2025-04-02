
import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { PresentationService } from 'app/home/services/presentation.service';
import { RaceBarService } from 'app/home/services/racebar.service';
import * as d3 from 'd3';


@Component({
  selector: "race-bar",
  providers: [RaceBarService],
  templateUrl: "race-bar.component.html",
  styleUrls: ["race-bar.component.less"],
  encapsulation: ViewEncapsulation.None,
})
export class RaceBarComponent implements OnInit {

  //Dimensions
  marginLeft = 0;
  marginBottom = 6;
  marginRight = 6;
  marginTop = 16;
  barSize = 48;
  nSize = 12;
  width = 928;
  height = this.marginTop + this.barSize * this.nSize + this.marginBottom;
  keyframes: any | undefined;
  prev: any;
  next: any;
  products: any[] = [];
  imageSource: string = ' CompanyValuationBar.png';
  currentYear = '2000';
  showDownload: boolean = false;
  isLoading: boolean = true;


  // SVG
  svg: any | undefined;
  private parentElement: any;
  textContent: string | undefined;


  constructor(
    private service: RaceBarService,
    private element: ElementRef,
    private presentation: PresentationService
  ) {
    this.parentElement = this.element.nativeElement;
  }

  async ngOnInit() {
    this.service.getKeyFrames().subscribe(data => {
      this.keyframes = data.keyframes;
      this.next = data.next;
      this.prev = data.prev;
      this.products = data.products;
      this.initializeBars();
      setTimeout(() => (this.isLoading = false), 2000)
    })
  }

  setDownload() {
    this.showDownload = !this.showDownload;
  }


  async initializeBars() {


    let svg = this.svg = d3.select(this.parentElement).select("#chart").append("svg")
      .attr("viewBox", [0, 0, this.width, this.height])
      .attr("width", this.width)
      .attr("height", this.height)
      .style("background", "#FDFDFD")
    // .attr("style", "max-width: 100%; height: auto;");


    const updateBars = this.bars(svg);
    const updateAxis = this.setAxis(svg);
    const updateLabels = this.labels(svg);
    const updateTicker = this.ticker(svg);

    for (const keyframe of this.keyframes) {
      const transition = svg.transition()
        .duration(150)
        .ease(d3.easeLinear);

      // Extract the top bar’s value.

      this.xScale.domain([0, (keyframe)[1][0].value]);

      updateAxis(keyframe, transition);
      updateBars(keyframe, transition);
      updateLabels(keyframe, transition);
      updateTicker(keyframe, transition);
      this.presentation.saveSvgToImage();
      await transition.end();
    }
  }


  yScale = d3.scaleBand()
    .domain(d3.range(this.nSize + 1) as any)
    .rangeRound([this.marginTop, this.marginTop + this.barSize * (this.nSize + 1 + 0.1)])
    .padding(0.1);

  xScale = d3.scaleLinear([0, 1], [this.marginLeft, this.width - this.marginRight])


  setColor(products: any) {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);

    if (products.some((d: any) => d.category !== undefined)) {

      const categoryByName = new Map(products.map((d: any) => [d.name, d.category]));

      scale.domain(categoryByName.values() as any);
      return (d: any) => scale(categoryByName.get(d.name) as any);
    }
    return (d: any) => scale(d.name)
  }

  formatNumber = d3.format(",d");
  formatDate = d3.utcFormat("%Y");

  textTween(a: any, b: any) {
    const i = d3.interpolateNumber(a, b);
    return (t: any) => this.textContent = d3.format(",d")(i(t));
  }

  setAxis(svg: any) {
    const g = svg.append("g")
      .attr("transform", `translate(0,${this.marginTop})`);

    const axis = d3.axisTop(this.xScale)
      .ticks(this.width / 160, d3.format(",d"))
      .tickSizeOuter(0)
      .tickSizeInner(-this.barSize * (this.nSize + this.yScale.padding()));

    return (_: any, transition: any) => {
      g.transition(transition).call(axis);
      g.select(".tick:first-of-type text").remove();
      g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
      g.select(".domain").remove();
    };
  }


  labels(svg: any) {
    let label = svg.append("g")
      .style("font", "bold 12px sans-serif")
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
      .selectAll("text");

    return ([date, data]: any, transition: any) => label = label
      .data(data.slice(0, this.nSize), (d: any) => d.name)
      .join(
        (enter: any) => enter.append("text")
          .attr("transform", (d: any) => `translate(${this.xScale((this.prev.get(d) || d).value)},${this.yScale((this.prev.get(d) || d).rank)})`)
          .attr("y", this.yScale.bandwidth() / 2)
          .attr("x", -6)
          .attr("dy", "-0.25em")
          .text((d: any) => d.name)
          .call((text: any) => text.append("tspan")
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .attr("x", -6)
            .attr("dy", "1.15em")),
        (update: any) => update,
        (exit: any) => exit.transition(transition).remove()
          .attr("transform", (d: any) => `translate(${this.xScale((this.next.get(d) || d).value)},${this.yScale((this.next.get(d) || d).rank)})`)
          .call((g: any) => g.select("tspan")
            //   .tween("text", (d: any) => this.textTween(d.value, (this.next.get(d) || d).value))
            .duration(0)
            .ease(d3.easeLinear)
            .textTween((d: any) => (t: any) => this.formatNumber(d.value || (this.next.get(d)).value))
          ))
      .call((bar: any) => bar.transition(transition)
        .attr("transform", (d: any) => `translate(${this.xScale(d.value)},${this.yScale(d.rank)})`)
        .call((g: any) => g.select("tspan")
          .duration(0)
          .ease(d3.easeLinear)
          //   .textTween((d:any) => (t:any) => `${this.formatNumber(d.value)}`)
          .textTween((d: any) => (t: any) => this.formatNumber(d.value || (this.prev.get(d)).value))
          // .end().tween("text", (d: any) => this.textTween((this.prev.get(d) || d).value, d.value))
        ));

  }


  bars(svg: any) {
    let bar = svg.append("g")
      .attr("fill-opacity", 0.6)
      .selectAll("rect");

    return ([date, data]: any, transition: any) => bar = bar
      .data(data.slice(0, this.nSize), (d: any) => d.name)
      .join(
        (enter: any) => enter.append("rect")
          .attr("fill", this.setColor(this.products))
          .attr("height", this.yScale.bandwidth())
          .attr("x", this.xScale(0))
          .attr("y", (d: any) => this.yScale((this.prev.get(d) || d).rank))
          .attr("width", (d: any) => this.xScale((this.prev.get(d) || d).value) - this.xScale(0)),
        (update: any) => update,
        (exit: any) => exit.transition(transition).remove()
          .attr("y", (d: any) => this.yScale((this.next.get(d) || d).rank))
          .attr("width", (d: any) => this.xScale((this.next.get(d) || d).value) - this.xScale(0))
      )
      .call((bar: any) => bar.transition(transition)
        .attr("y", (d: any) => this.yScale(d.rank))
        .attr("width", (d: any) => this.xScale(d.value) - this.xScale(0)));

  }

  ticker(svg: any) {
    const now = svg.append("text")
      .style("font", `bold ${this.barSize}px sans-serif`)
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
      .attr("x", this.width - 6)
      .attr("y", this.marginTop + this.barSize * (this.nSize - 0.45))
      .attr("dy", "0.32em")
      .text(this.formatDate(this.keyframes[0][0] as any));

    return ([date]: any, transition: any) => {
      this.currentYear = this.formatDate(date)
      transition.end().then(() => now.text(this.formatDate(date)));
    };
  }
}