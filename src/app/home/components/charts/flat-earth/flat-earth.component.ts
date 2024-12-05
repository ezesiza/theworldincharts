import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadDataService } from 'app/home/services/load.data.service';
import { PresentationService } from 'app/home/services/presentation.service';

import * as d3 from 'd3';

@Component({
  selector: 'app-flat-earth',
  templateUrl: './flat-earth.component.html',
  styleUrl: './flat-earth.component.less',
  encapsulation: ViewEncapsulation.None,
})
export class FlatEarthComponent implements OnInit {

  width = 952;
  height = 1100;
  aiData: any = [];
  aiCountries: any = [];
  currentYear = 0;
  svg: any = null;
  download: Function = null;
  imageSource: string = ' ForeignAid.png';
  showDownload: boolean = false;

  constructor(
    private service: LoadDataService,
    private presentation: PresentationService
  ) { }

  ngOnInit(): void {
    this.service.getAiData().subscribe(res => {
      this.aiData = res.aiDataArray;
      this.aiCountries = res.countries;
      this.renderChart();
    });
  }

  setDownload() {
    this.showDownload = !this.showDownload;
  }


  async renderChart() {
    const cScale = d3.scaleSqrt()
      .domain([d3.min(this.aiData, (d: any) => Number(d.net_donations)) as any, 0, d3.max(this.aiData, (d: any) => Number(d.net_donations))])
      .range([-1, 0, 1])
      .interpolate((a, b) => {
        return a < 0
          ? t => {
            return d3.interpolateReds(1 - t)
          }
          : t => {
            return d3.interpolateBlues(t)
          }
      });

    const projection = d3.geoNaturalEarth1();
    const zoomed = ({ transform }: any, svg: any) => {
      svg.attr("transform", transform);
    }

    const path = d3.geoPath(projection);
    const years = Array.from(new Set(this.aiData.map((d: any) => d.year).sort())).filter(Boolean);

    this.svg = d3.select("#chart")
      .append("svg").attr("viewBox", `0, -40, ${this.width * 1.1}, ${this.height / 1.9}`)
      .style("background", "white");


    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")


    const showToolTip = (text: string, coords: any) => {
      d3.select(".tooltip")
        .text(text)
        .style("top", coords[1] + "px")
        .style("left", coords[0] + "px")
        .style("visibility", "visible");
    }

    for (let year of years) {
      this.currentYear = Number(year);
      this.svg.selectAll("*").remove();
      let duration: number = 1250;

      const transition = this.svg.transition()
        .duration(duration)
        .ease(d3.easePoly.exponent(1));

      this.svg.selectAll("path")
        .data(this.aiCountries.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("stroke", "#111")
        .attr("stroke-width", 0.5)
        .attr("cursor", "pointer")
        // .call(d3.zoom()
        //   .extent([[-10, -10], [this.width * 1.5, this.height * 1.5]])
        //   .scaleExtent([-10, 10])
        //   .on("zoom", (d: any) => zoomed(d, this.svg)) as any)
        .attr("fill", (d: any) => {
          return d.properties.data?.get(year)
            ? cScale(d.properties.data.get(year)[0].net_donations)
            : "lightgrey"
        })
        .on("mouseover", (event: any, d: any) => {
          let text = d.properties.name;

          const donations = (d.properties.data !== undefined) ? d.properties?.data?.get(year)[0]?.donations : 0;
          const receipts = d.properties.data !== undefined ? d.properties?.data?.get(year)[0]?.receipts : 0;

          if (donations > 0) {
            text = text + "\nDonations: " + d3.format("$0.2s")(donations).replace(/G/, "B")
          }

          if (receipts > 0) {
            text = text + "\nReceipts: " + d3.format("$0.2s")(receipts).replace(/G/, "B")
          }

          showToolTip(text, [event.pageX, event.pageY])
        })
        .on("mousemove", function (event: any, d: any) {
          let text = d.properties.name;
          d3.select(".tooltip")
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px")
          showToolTip(text, [event.pageX, event.pageY])
        })
        .on("mouseout", function () {
          d3.select(".tooltip").style("visibility", "hidden")
        })
      this.presentation.saveSvgToImage();
      await transition.end();
    }
  }


}

