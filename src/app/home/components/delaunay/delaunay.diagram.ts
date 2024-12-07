/* import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';

@Component({
    selector: 'delaunay-diagram',
    templateUrl: './delaunay.diagram.html',
    styleUrls: ['./delaunay.component.less']
})
export class DelaunayDiagramComponent implements OnInit {
    @ViewChild('svgCanvas') svgCanvas!: ElementRef<SVGElement>;

    width = 500;
    height = 500;
    private radius = Math.min(this.width, this.height) / 2 - 80;
    points: [number, number][] = [];
    delaunay!: Delaunay<[number, number]>;
    voronoi!: d3.Voronoi<[number, number]>;

    constructor(private renderer: Renderer2) { }

    ngOnInit(): void {
        this.points = this.generatePoints();
        this.delaunay = Delaunay.from(this.points);
        this.voronoi = this.delaunay.voronoi([0, 0, this.width, this.height]);

        this.render();
    }

    generatePoints(): [number, number][] {
        const rng = (() => {
            const frac = (x: number) => x - Math.floor(x);
            let i = 0.1,
                a = 0;
            return () => (a = frac((1 + Math.sin(++i) + a) * 100000));
        })();
        return Array.from({ length: 200 }, () => [rng() * this.width, rng() * this.height]);
    }

    trueNeighbors(voronoi: d3.Voronoi<[number, number]>, i: number): number[] {
        const neighbors: number[] = [];
        const ai = new Set((voronoi.cellPolygon(i) || []).map(String));
        for (const j of voronoi.delaunay.neighbors(i)) {
            for (const c of voronoi.cellPolygon(j) || []) {
                if (ai.has(String(c))) neighbors.push(j);
            }
        }
        return neighbors;
    }

    render(activeIndex: number | null = null): void {
        const svg = d3.select(this.svgCanvas?.nativeElement)
        // .attr("viewBox", "-350, -290, 500, 500");
        svg.selectAll('*').remove();

        // Render the Voronoi diagram
        const voronoiPath = svg.append('g').attr('class', 'voronoi');
        voronoiPath
            .selectAll('path')
            .data(this.points.map((_, i) => this.voronoi.cellPolygon(i)))
            .join('path')
            .attr('d', (d) => (d ? d3.line()(d as [number, number][]) || '' : ''))
            .attr('fill', 'none')
            .attr('stroke', '#000');

        if (activeIndex !== null && activeIndex >= 0) {
            const contextPolygon = svg.append('g').attr('class', 'context-polygon');

            const trueNeighbors = this.trueNeighbors(this.voronoi, activeIndex);
            const uniqueNeighbors = Array.from(this.delaunay.neighbors(activeIndex)).filter(
                (j) => !trueNeighbors.includes(j)
            );

            // Highlight true neighbors in light green
            contextPolygon
                .selectAll('.true-neighbors')
                .data(trueNeighbors.map((i) => this.voronoi.cellPolygon(i)))
                .join('path')
                .attr('d', (d) => (d ? d3.line()(d as [number, number][]) || '' : ''))
                .attr('fill', '#ccffcc')
                .attr('stroke', 'none');

            // Highlight unique neighbors in yellow
            contextPolygon
                .selectAll('.unique-neighbors')
                .data(uniqueNeighbors.map((i) => this.voronoi.cellPolygon(i)))
                .join('path')
                .attr('d', (d) => (d ? d3.line()(d as [number, number][]) || '' : ''))
                .attr('fill', 'yellow')
                .attr('stroke', 'none');

            // Highlight active cell in lime
            const activePolygon = this.voronoi.cellPolygon(activeIndex);
            if (activePolygon) {
                svg
                    .append('path')
                    .attr('d', d3.line()(activePolygon as [number, number][]) || '')
                    .attr('fill', 'lime')
                    .attr('stroke', 'none');
            }

            // Draw edges for active point
            svg
                .append('g')
                .selectAll('.edges')
                .data(Array.from(this.delaunay.neighbors(activeIndex)).map((j) => [this.points[activeIndex], this.points[j]]))
                .join('line')
                .attr('x1', (d) => d[0][0])
                .attr('y1', (d) => d[0][1])
                .attr('x2', (d) => d[1][0])
                .attr('y2', (d) => d[1][1])
                .attr('stroke', 'green');
        }

        // Render points
        svg
            .append('g')
            .attr('class', 'points')
            .selectAll('circle')
            .data(this.points)
            .join('circle')
            .attr('cx', (d) => d[0])
            .attr('cy', (d) => d[1])
            .attr('r', 3)
            .attr('fill', 'black');
    }

    onMouseMove(event: MouseEvent): void {
        const rect = this.svgCanvas.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const i = this.delaunay.find(x, y);
        this.render(i);
    }
} */

import { Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';

@Component({
    selector: 'app-delaunay-diagram',
    templateUrl: './delaunay.diagram.html',
    styles: [
        `
      svg {
        border: 1px solid black;
      }
    `,
    ],
})
export class DelaunayDiagramComponent implements OnInit {
    @ViewChild('svgCanvas') svgCanvas!: ElementRef<SVGElement>;
    @ViewChild('voronoiLayer') voronoiLayer!: ElementRef<SVGGElement>;
    @ViewChild('pointLayer') pointLayer!: ElementRef<SVGGElement>;

    width = 500;
    height = 500;
    radius = 250; // Radius for the circular clipping
    points: [number, number][] = [];
    delaunay!: Delaunay<[number, number]>;
    voronoi!: d3.Voronoi<[number, number]>;

    constructor(private renderer: Renderer2) { }

    ngOnInit(): void {
        this.points = this.generatePoints();
        this.delaunay = Delaunay.from(this.points);
        this.voronoi = this.delaunay.voronoi([0, 0, this.width, this.height]);

        this.render();
    }

    generatePoints(): [number, number][] {
        const rng = (() => {
            const frac = (x: number) => x - Math.floor(x);
            let i = 0.1,
                a = 0;
            return () => (a = frac((1 + Math.sin(++i) + a) * 100000));
        })();
        return Array.from({ length: 200 }, () => [rng() * this.width, rng() * this.height]);
    }

    render(activeIndex: number | null = null): void {
        const svg = d3.select(this.svgCanvas.nativeElement);
        const voronoiGroup = d3.select(this.voronoiLayer.nativeElement);
        const pointGroup = d3.select(this.pointLayer.nativeElement);

        voronoiGroup.selectAll('*').remove();
        pointGroup.selectAll('*').remove();

        const cx = this.width / 2;
        const cy = this.height / 2;

        // Only render cells that fall within the circular mask
        voronoiGroup
            .selectAll('path')
            .data(this.points.map((_, i) => this.voronoi.cellPolygon(i)))
            .join('path')
            .attr('d', (d) => {
                if (!d) return '';
                const clippedPath = this.clipPolygonToCircle(d as [number, number][], cx, cy, this.radius);
                return d3.line()(clippedPath) || '';
            })
            .attr('fill', (_, i) => (i === activeIndex ? 'lime' : 'none'))
            .attr('stroke', '#000');

        // Render the points
        pointGroup
            .selectAll('circle')
            .data(this.points.filter(([x, y]) => this.isInsideCircle(x, y, cx, cy, this.radius)))
            .join('circle')
            .attr('cx', (d) => d[0])
            .attr('cy', (d) => d[1])
            .attr('r', 3)
            .attr('fill', 'black');
    }

    onMouseMove(event: MouseEvent): void {
        const rect = this.svgCanvas.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const cx = this.width / 2;
        const cy = this.height / 2;

        if (!this.isInsideCircle(x, y, cx, cy, this.radius)) {
            this.render(null);
            return;
        }

        const i = this.delaunay.find(x, y);
        this.render(i);
    }

    isInsideCircle(x: number, y: number, cx: number, cy: number, r: number): boolean {
        return Math.pow(x - cx, 2) + Math.pow(y - cy, 2) <= Math.pow(r, 2);
    }

    clipPolygonToCircle(polygon: [number, number][], cx: number, cy: number, r: number): [number, number][] {
        return polygon.filter(([x, y]) => this.isInsideCircle(x, y, cx, cy, r));
    }
}
