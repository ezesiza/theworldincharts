import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from "d3";
import { voronoiTreemap } from './voronoiTreemap';


@Component({
  selector: 'voronoi',
  templateUrl: 'voronoi.component.html',
  styleUrls: ['./voronoi.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoronoiComponent implements OnInit {

  //begin: constants
  _2PI = 2 * Math.PI;
  freedom: any;
  parentElement: any;
  svg: any
  drawingArea: any
  treemapContainer: any;

 
  svgWidth = 960;
  svgHeight = 500;
  margin = { top: 10, right: 10, bottom: 10, left: 10 };
  height = this.svgHeight - this.margin.top - this.margin.bottom;
  width = this.svgWidth - this.margin.left - this.margin.right;
  halfWidth = this.width / 2;
  halfHeight = this.height / 2;
  quarterWidth = this.width / 4;
  quarterHeight = this.height / 4;
  titleY = 20;
  legendsMinY = this.height - 20;
  treemapRadius = 220;
  treemapCenter = [this.halfWidth, this.halfHeight + 5];
  voronoiTreemap = voronoiTreemap() as any;
  hierarchy: any
  circlingPolygon: any;
  //end: layout conf.

  constructor(private element: ElementRef) {
    this.parentElement = this.element.nativeElement;
  }

  ngOnInit() {
    d3.csv('assets/freedom_clean.csv').then((data: any) => {
      this.renderVoronoi(data)
    })
  }

  regionColor = (region: any) => {
    const colors: any = {
      "Middle East and Africa": "#596F7E",
      "Americas": "#168B98",
      "Asia": "#ED5B67",
      "Oceania": "#fd8f24",
      "Europe": "#919c4c"
    };
    return colors[region];
  }

  colorHierarchy (hierarchy: any) {
    if (hierarchy.depth === 0) {
      hierarchy.color = 'black';
    } else if (hierarchy.depth === 1) {
      hierarchy.color = this.regionColor(hierarchy.data[0]);
    } else {
      hierarchy.color = hierarchy.parent.color;
    }
    if (hierarchy.children) {
      hierarchy.children.forEach((child: any) => this.colorHierarchy(child))
    }
  }

  fontScale: any = d3.scaleLinear();

  renderVoronoi(rootData: any) {
    this.initData();
    this.initLayout();


    const freedomYear = rootData.filter((obj: any) => Number(obj.year) === 2008)
    const freedomNest = d3.group(freedomYear, (d: any) => d.region_simple)

    const ellipse = d3.range(50).map((i:any) => [(680 * (1 + 0.99 * Math.cos((i / 50) * Math.PI))) / 2, (680 * (1 + 0.99 * Math.sin((i / 50) * Math.PI))) / 2]);
    const dataNested = { key: "freedom_nest", values: freedomNest };
    this.hierarchy = d3.hierarchy(dataNested, (d: any) => {
      return (typeof d.values === ('function' || undefined)) ? d : d.values
    }).sum((d: any) => typeof d.population === 'string' && d.population);

    this.voronoiTreemap.clip(ellipse)(this.hierarchy);
    this.colorHierarchy(this.hierarchy)
    this.drawTreemap(this.hierarchy);
  }

  drawTreemap(hierarchy: any) {
    let leaves = hierarchy.leaves();
  
    this.treemapContainer
      .append("g")
      .classed("cells", true)
      .selectAll(".cell")
      .data(leaves)
      .enter()
      .append("path")
      .classed("cell", true)
      .attr("d", (d: any) => {
        return "M" + d.polygon.join(",") + "z";
      })
      .style("fill", (d: any) => {
        console.log(d);
        return d.parent ? d.parent.color : d.color;
      });

    let labels = this.treemapContainer
      .append("g")
      .classed("labels", true)
      .attr("transform", "translate(" + [-this.treemapRadius, -this.treemapRadius] + ")")
      .selectAll(".label")
      .data(leaves)
      .enter()
      .append("g")
      .classed("label", true)
      .attr("transform", function (d: any) {
        return "translate(" + [d.polygon.site.x, d.polygon.site.y] + ")";
      })
      .style("font-size", (d: any) => {
        return this.fontScale(d.data.population);
      });

    labels
      .append("text")
      .classed("name", true)
      .html(function (d: any) {
        return d.data.population < 1 ? d.data.code : d.data.name;
      });
    labels
      .append("text")
      .classed("value", true)
      .text(function (d: any) {
        return d.data.population;
      });

    const hoverers = this.treemapContainer
      .append("g")
      .classed("hoverers", true)
      .attr("transform", "translate(" + [-this.treemapRadius, -this.treemapRadius] + ")")
      .selectAll(".hoverer")
      .data(leaves)
      .enter()
      .append("path")
      .classed("hoverer", true)
      .attr("d", function (d: { polygon: any[]; }) {
        return "M" + d.polygon.join(",") + "z";
      });

    hoverers.append("title").text(function (d: { data: { name: string; }; value: string; }) {
      return d.data.name + "\n" + d.value;
    });
  }

  computeCirclingPolygon(radius: number) {
    let points = 60,
      increment = 2 * Math.PI / points,
      circlingPolygon = [];

    for (let a = 0, i = 0; i < points; i++, a += increment) {
      circlingPolygon.push([
        radius + radius * Math.cos(a),
        radius + radius * Math.sin(a)
      ]);
    }
    
    return circlingPolygon;
  }

  initData() {
    this.circlingPolygon = this.computeCirclingPolygon(this.treemapRadius);
    this.fontScale.domain([3, 20]).range([8, 20]).clamp(true);
  }

  initLayout() {
    this.svg = d3.select("svg").attr("width", this.svgWidth).attr("height", this.svgHeight);

    this.drawingArea = this.svg
      .append("g")
      .classed("drawingArea", true)
      .attr("transform", "translate(" + [this.margin.left, this.margin.top] + ")");

    this.treemapContainer = this.drawingArea
      .append("g")
      .classed("treemap-container", true)
      .attr("transform", "translate(" + this.treemapCenter + ")");

    this.treemapContainer
      .append("path")
      .classed("world", true)
      .attr("transform", "translate(" + [-this.treemapRadius, -this.treemapRadius] + ")")
      .attr("d", "M" + this.circlingPolygon.join(",") + "Z");
  }
}
