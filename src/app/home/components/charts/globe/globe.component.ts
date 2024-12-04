import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from "d3";
import * as topojson from "topojson-client";
import * as world from './../../../../../assets/datasets/countries-110m.json';
const colors = {
  Water: '#bfd7e4',
  Land: '"#EEE"',
  Borders: '#aaaaaa',
  Graticules: '#ffffff',
};

@Component({
  selector: 'app-globe',
  templateUrl: "globe.component.html",
  styleUrls: ['./globe.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobeComponent implements OnInit {
  height = 600;
  width = 600;
  sensitivity = 175;
  private margins = { top: -10, right: 15, bottom: 40, left: -25 };
  private parentElement: any | undefined;
  animate: boolean = true;


  constructor(private element: ElementRef) {
    this.parentElement = this.element.nativeElement;
  }
  ngOnInit(): void {
    let width = d3.select("div")?.node() as any;
    // this.width  = width?.getBoundingClientRect()!.width;
    this.renderGlobe()
  }

  renderGlobe() {
    let projection = d3.geoOrthographic();
    projection.scale(250)
      .center([0, 0])
      .rotate([0, -30])
      .translate([this.width / 2, this.height / 2])


    const initialScale = projection.scale();
    let path = d3.geoPath().projection(projection);

    let svg = d3.select(this.parentElement)
      .select("svg")
      .attr('rotation', `0 0 1 ${d3.range(0, 2 * Math.PI, Math.PI / 500)}`)
      .attr("width", this.width * 1.5)
      .attr("height", this.height * 1.5)
      // .attr("viewBox", [-this.width , -this.height , this.width , -  this.height])
      .attr("viewBox", "0, -10, 680, 650")
      // .attr("preserveAspectRatio", "xMinYMid  meet")
      .attr("transform", `translate(${-this.margins.left * 12}, ${this.margins.top})`);

    let globe = svg.append("circle")
      .attr("fill", colors.Water)
      .attr("stroke", "#none")
      .attr("stroke-width", "0")
      .attr("cx", this.width / 2)
      .attr("cy", this.height / 2)
      .attr("r", initialScale)

    // create one path per TopoJSON feature

    let countries = topojson.feature(world as any, world.objects.countries as any) as any;

    let borders = topojson.mesh(world as any, world.objects.countries as any, (a, b) => a !== b);
    let graticule = d3.geoGraticule()

    svg.append("path")
      .datum(graticule())
      .attr("class", 'graticule')
      .attr("d", path)
      .attr('fill', 'none')
      .attr('stroke', colors.Graticules)
      .attr('stroke-width', '0.5px');


    svg.selectAll("country")
      .data(countries.features)
      .enter().append("path")
      .attr("class", "country")
      .attr("d", path as any)
      .style("fill", d => {
        return colors.Land
      })

    svg.append("path")
      .datum(borders)
      .attr("d", path as any)
      .attr("class", 'borders')
      .style("fill", "none")
      .style("stroke", colors.Borders)
      .style("stroke-width", "0.3px")


    svg.call(d3.drag().on('drag', (event) => {
      const rotate = projection.rotate()
      const k = this.sensitivity / projection.scale()
      projection.rotate([
        rotate[0] + event.dx * k,
        rotate[1] - event.dy * k
      ])
      path = d3.geoPath().projection(projection)
      svg.selectAll("path").attr("d", path as any)
    }) as any)
      .call(d3.zoom().on('zoom', (event) => {
        if (event.transform.k > 0.3) {
          projection.scale(initialScale * event.transform.k)
          path = d3.geoPath().projection(projection)
          svg.selectAll("path").attr("d", path as any)
          globe.attr("r", projection.scale())
        }
        else {
          event.transform.k = 0.3
        }
      }) as any)

    let timer = d3.timer(() => {
      const rotate = projection.rotate()
      const k = this.sensitivity / projection.scale()
      projection.rotate([
        rotate[0] - 1 * k,
        rotate[1]
      ])
      path = d3.geoPath().projection(projection)
      svg.selectAll("path").attr("d", path as any)
        .on('dblclick', (e) => {

          if (this.animate) {
            timer.stop();
            this.animate = !this.animate;
          }
        }).on("click", (e) => {
          if (!this.animate) {
            // timer.restart(()=>timer)
          }
        })
    }, 200);
  }
}
