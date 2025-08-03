import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadDataService } from 'app/home/services/load.data.service';
import { PresentationService } from 'app/home/services/presentation.service';
import * as d3 from "d3";
import { sankey, sankeyJustify, sankeyLinkHorizontal } from "d3-sankey";

@Component({
  selector: 'app-sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class SankeyComponent implements OnInit {
  private width = 954;
  private height = 600;
  private margins = { top: 20, right: 20, bottom: 50, left: 50 };
  private format = d3.format(",.0f");
  private energyData: any = null;
  private currentSelected: string = 'target';
  imageSource: string = ' EnergyData.png';
  chartLoading: boolean = true;
  showDownload: boolean = false;
  edgeColor: 'path' | 'input' | 'output' | 'none' = 'path';
  private nodeWidth: number = 15;

  private sankeyChart: any = sankey()
    .nodeId((d: any) => d.name)
    .nodeAlign(sankeyJustify)
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 5], [this.width - 1, this.height - 5]]);

  private groups: any;
  private link: any;
  private svg: any;
  private node: any;

  private domIdString = "0-link-"
  private DOMID = 50;
  colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  constructor(private service: LoadDataService, private presentation: PresentationService) { }

  ngOnInit(): void {
    this.service.getEnergyNodes().pipe().subscribe(res => {
      this.energyData = res;
      this.chartLoading = false;
      this.renderChart();
    })
  }

  setDownload() {
    this.showDownload = !this.showDownload;
  }

  reDrawChart() {
    if (this.svg && !this.svg.empty()) {
      this.svg.attr("width", "0");
      this.svg.selectAll("*").remove();
    }
    this.renderChart();
  }

  getNextID() {
    return {
      href: "https://ezejike.static.observableusercontent.com/next/worker-lLzrCfCS.html#" + this.domIdString + this.DOMID++,
      id: this.domIdString + this.DOMID++,
    };
  }

  renderChart() {
    // Create a SVG container.
    this.svg = d3.select("#chart").append("svg")
      .attr("width", this.width * 1.5)
      .attr("height", this.height * 1.5)
      .attr("viewBox", "-30, -80, 980, 850")
      .style("background", "white");
    // .attr("viewBox", `0, 0, ${this.width}, ${this.height}`);

    let showTotal = false;

    let { nodes, links } = this.sankeyChart({
      nodes: this.energyData.nodes.map((d: any) => Object.assign({}, d)) as any,
      links: this.energyData.links.map((d: any) => Object.assign({}, d)) as any
    });


    this.groups = { nodes, links };
    if (showTotal) {
      const totalLinks = this.groups.nodes.filter(({ targetLinks }: any) => targetLinks.length == 0)
        .map(({ name, value }: any) => ({ source: "Total", target: name, value }));

      nodes = [{ name: "Total", category: "Total" }].concat(nodes as any) as any;

      links = totalLinks.concat(links as any);

      this.groups = this.sankeyChart({ nodes: nodes, links: links });
    } // if

    this.nodeWidth = nodes[0].x1 - nodes[0].x0;

    const color = d3.scaleOrdinal(d3.schemeAccent);

    this.node = this.svg
      .selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x0}, ${d.y0})`);

    // Relative to container
    this.node
      .append("rect")
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => color(d.category || d.name))
      .attr("stroke", "#000")
      .append("title")
      .text((d: any) => `${d.name}\n${this.format(d.value)}`);

    const dragMove = (event: any, d: any) => {

      // this.node._groups[0].forEach((item: any, i: any) => { }); toElement.firstElementChild

      d3.select(event.sourceEvent.target.parentNode).attr("transform", () => {

        const dx = event.x - d.__x;
        const dy = event.y - d.__y;

        d.x0 = d.__x0 + dx;
        d.x1 = d.__x1 + dx;
        d.y0 = d.__y0 + dy;
        d.y1 = d.__y1 + dy;

        if (d.x0 < 0) {
          d.x0 = 0;
          d.x1 = this.nodeWidth;
        } // if

        if (d.x1 > this.width) {
          d.x0 = this.width - this.nodeWidth;
          d.x1 = this.width;
        } // if

        if (d.y0 < 0) {
          d.y0 = 0;
          d.y1 = d.__y1 - d.__y0;
        } // if

        if (d.y1 > this.height) {
          d.y0 = this.height - (d.__y1 - d.__y0);
          d.y1 = this.height;
        } // if

        return `translate(${d.x0}, ${d.y0})`;
      });

      sankey().update({ nodes, links });
      this.link.selectAll(".link").attr("d", sankeyLinkHorizontal());
    } //dragMove

    const dragStart = (event: any, d: any) => {
      d.__x = event.x;
      d.__y = event.y;
      d.__x0 = d.x0;
      d.__y0 = d.y0;
      d.__x1 = d.x1;
      d.__y1 = d.y1;
    } //dragStart

    // Relative to container/ node rect
    this.node
      .append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("x", (d: any) => (d.x0 < this.width / 2 ? 6 + (d.x1 - d.x0) : -6)) // +/- 6 pixels relative to container
      .attr("y", (d: any) => (d.y1 - d.y0) / 2) // middle of node
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => (d.x0 < this.width / 2 ? "start" : "end"))
      .text((d: any) => d.name);

    this.node
      .attr("cursor", "move")
      .call(d3.drag().on("start", dragStart).on("drag", dragMove) as any);

    this.link = this.svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
      .selectAll("g")
      .data(links)
      .join("g")
      .style("mix-blend-mode", "multiply");

    if (this.edgeColor === "path") {
      const gradient = this.link
        .append('linearGradient')
        .attr('id', (d: any, i: any) => {
          d.uid = `link-${i}`;
          return d.uid;
        })
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", (d: any) => d.source.x1!)
        .attr("x2", (d: any) => d.target.x0!);

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", (d: any) => {
          return color(d.source.category) || d.source.name
        });

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", (d: any) => color(d.target.category) || d.target.name);
    } //if

    this.link
      .append("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal() as any)
      .attr('stroke', (d: any) => {
        if (this.edgeColor === 'none') return '#aaa';
        if (this.edgeColor === 'path') return `url(#${d.uid})`;
        if (this.edgeColor === 'input')
          return color((d.source).category || (d.source).name);
        return color((d.target).category || (d.target).name);
      })
      // .attr("stroke", (d: any) => {
      //   // console.log(color(d.source.category));
      //   return this.edgeColor === "none"
      //     ? "#aaa"
      //     : this.edgeColor === "path"
      //       ? color(d.uid)
      //       : this.edgeColor === "input"
      //         ? color(d.source.category) || d.source.name
      //         : color(d.target.category) || d.name.name
      // })
      .attr("stroke-width", (d: any) => Math.max(1, d.width));

    this.link
      .append("title")
      .text((d: any) => `${d.source.name} → ${d.target.name}\n${this.format(d.value)}`);

    this.presentation.saveSvgToImage()

  }
}
