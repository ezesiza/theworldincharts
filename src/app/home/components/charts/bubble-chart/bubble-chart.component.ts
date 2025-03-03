import { Component, Input, OnInit, SimpleChange, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as data from 'assets/datasets/bubble-chart-data.json';
import { TimeSeriesBarChartComponent } from '../time-series-bar-chart/time-series-bar-chart.component';
import { DonutChartComponent } from '../donut-chart/donut-chart.component';
import { Router } from '@angular/router';

@Component({
  selector: 'bubble-chart',
  templateUrl: './bubble-chart.component.html',
  styleUrl: './bubble-chart.component.less',
  encapsulation: ViewEncapsulation.None
})
export class BubbleChartComponent implements OnInit {


  constructor(private router: Router) { }

  @Input() inputData: any = [];
  height = 500;
  width = 500;
  newRoot: any[] = [];
  TabItem: any[] = [
    {
      title: 'Time Series Bar',
      id: '3',
      component: DonutChartComponent
    }
  ];

  ngOnInit(): void {

  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if (changes['inputData'].currentValue.parent?.children.length > 0) {
      this.newRoot = changes['inputData'].currentValue.parent.children.map((item: any) => item.data);

      this.createBubbleChart((d3.hierarchy(this.transformToGenericObjectList(this.newRoot))
        .sum(function (d) { return d.value; })
        .sort(function (a, b) { return b.value - a.value })));
    }
  }

  toOverlay() {
    this.router.navigate(['/overlay/content1'])
  }

  createBubbleChart(root: any) {
    this.destroyChart(d3.select("#bubble-chart"));
    const svg = d3.select("#bubble-chart")
      .append("svg").attr("width", this.width * 1.2)
      .attr("height", this.height * 1.2)
      .attr("viewBox", "-30, 10, 780, 750")
      .style("background", "white")

    d3.select("#bubble-chart")
      .call(d3.zoom()
        .extent([[-4, -1], [this.width / 12, this.height / 12]])
        .scaleExtent([1, 1.2])
        .on("zoom", (d: any) => this.zoomed(d, svg)) as any);

    const format = d3.format(",d"),
      color = d3.scaleOrdinal(d3.schemePaired)

    const tooltip = d3.select("body").append("div")
      .attr("height", this.height)
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("color", "white")
      .style("padding", "8px")
      .style("background-color", "rgba(0, 0, 0, 0.75)")
      .style("border-radius", "6px")
      .style("font", "12px sans-serif")
      .text("tooltip");

    const bubble: any = d3.pack().size([this.width, this.height]).padding(1.5) as any;
    bubble(root);

    const node = svg.selectAll(".node")
      .data(root.children)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function (d: any) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    node
      .append("circle")
      .attr("r", (d: any) => d.r)
      .attr("stroke", '2px')
      .style("fill", (d: any) => color(d.data.value) as any)
      .on("mouseover", function (event: any, d: any) {
        tooltip.text(d.data.name + ": " + format(d.value));
        tooltip.style("visibility", "visible");
        d3.select(this).style("stroke", "red");
      })
      .on("click", (event, d) => {
        tooltip.style("visibility", "hidden");
        this.toOverlay();
      })
      .on("mousemove", (event: any) => {
        return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).style("stroke", "none");
        return tooltip.style("visibility", "hidden");
      });

    node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("font", "10px sans-serif")
      .style("pointer-events", "none")
      .text((d: any) => d.data.name.substring(0, d.r / 3));

  }

  transformToGenericObjectList(flatData: any[]) {
    const container: any = {};
    container.children = [];
    flatData.forEach(entry => {
      // if (entry["2016"] !== "") {
      if (entry["Company"] !== "") {
        // container.children.push({ group: entry["Region"], value: parseFloat(entry["2016"]), name: entry["Country Name"] });
        container.children.push({ group: entry["Country"], value: parseFloat(entry["SharePrice"]), name: entry["Company"] });
      }
    });

    return container;
  }

  zoomed({ transform }: any, svg: any) {
    svg.attr("transform", transform);
  }

  destroyChart(svg: any) {
    if (svg && !svg.empty()) {
      svg.attr("width", "0");
      svg.selectAll("*").remove();
    }
  }

}
