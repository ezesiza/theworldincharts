import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

interface RegionData {
  region: string;
  value: number;
}

interface Point {
  x: number;
  y: number;
  data: RegionData;
}

@Component({
  selector: 'app-delaunay',
  templateUrl: './delaunay.component.html',
  styleUrl: './delaunay.component.less',
  encapsulation: ViewEncapsulation.None
})
export class DelaunayComponent implements OnInit {
  private width = 600;
  private height = 600;
  private radius = Math.min(this.width, this.height) / 2 - 80;
  private svg: any;
  private data: RegionData[] = [
    { region: "Sub-Saharan Africa", value: 40 },
    { region: "Middle East", value: 30 },
    { region: "Asia Pacific", value: 25 },
    { region: "Europe", value: 35 },
    { region: "Antarctica", value: 75 },
    { region: "South America", value: 75 },
    { region: "North America", value: 68 }
  ];

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.createChart();
  }

  private randomizePoint(angle: number, radius: number): { x: number; y: number } {
    const r = Math.random() * radius;
    return {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle)
    };
  }

  private createChart(): void {
    // Generate points
    const points: Point[] = this.data.map((d, i) => {
      const angle = (i / this.data.length) * 2 * Math.PI;
      const randomized = this.randomizePoint(angle, this.radius);
      return {
        x: randomized.x,
        y: randomized.y,
        data: d
      };
    });

    // Create SVG
    // this.svg = d3.select(this.elementRef.nativeElement.querySelector('svg')).append('g')
    this.svg = d3.select("#chart").append("svg")
      .attr("width", this.width * 1.4)
      .attr("height", this.height * 1.4)
      .style("fill", "#F5F5F2")
      .attr("viewBox", "-350, -290, 900, 900");
    // .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

    // Create Voronoi diagram
    const delaunay = d3.Delaunay.from(
      points,
      d => d.x,
      d => d.y
    );
    // const voronoi = delaunay.voronoi([-this.radius, -this.radius, this.radius, this.radius]);
    const voronoi = delaunay.voronoi([-this.radius, -this.radius, this.radius, this.radius]);
    // const voronoi = delaunay.voronoi([0, 0, 600, 500]);

    // Draw boundary circle
    this.svg.append('circle')
      .attr('class', 'boundary')
      .attr("stroke", "#ccc")
      .attr("stroke-width", "1")
      .attr('r', this.radius * 1.1);

    // Create clip path
    this.svg.append('clipPath')
      .attr('id', 'circle-clip')
      .append('circle')
      .attr('r', this.radius);

    // Draw Voronoi cells
    this.svg.append('g')
      .attr('clip-path', 'url(#circle-clip)')
      .selectAll('path')
      .data(points)
      .join('path')
      .attr('class', 'cell')
      .attr('d', (d: any, i: number) => voronoi.renderCell(i))
      .attr('fill', (d: any, i: number) => d3.schemeCategory10[i % 10])
      .attr('opacity', 0.6)
      .attr("stroke", "#fff")
      .attr("stroke-width", "1");

    // Draw points
    this.svg.append('g')
      .selectAll('circle')
      .data(points)
      .join('circle')
      .attr('class', 'site')
      .attr('cx', (d: Point) => d.x)
      .attr('cy', (d: Point) => d.y)
      .attr('stroke', "black")
      .attr('stroke-width', 1)
      .attr('fill', 'white');

    // Add labels
    const labelRadius = this.radius + 30;

    this.svg.selectAll('text')
      .data(points)
      .enter()
      // .filter((text: any, v: any, e: any) => {
      //   return d3.select(e[v]).each((item: any) => {
      //     // console.log(text);
      //     return item.data.region === text.data.region
      //   })
      // })
      .append('text')
      .attr('transform', (d: Point, i: number, j: any) => {

        const angle = (i / this.data.length) * 2 * Math.PI - Math.PI / 2;
        const x = labelRadius * Math.cos(angle);
        const y = labelRadius * Math.sin(angle);
        return `translate(${x}, ${y}) rotate(${(angle * 180) / Math.PI + 90})`;
      })
      .attr('text-anchor', 'middle')
      .attr('class', 'font-medium text-sm')
      .text((d: Point) => d.data.region)
      .attr('cursor', 'default')
      .attr('pointer-events', 'none')
      .attr('fill', 'black')
      .style('font-family', 'Montserrat');
  }

}