import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from "d3";
import seedrandom from 'seedrandom';
import { voronoiTreemap } from './../voronoiTreemap';
import { ActivatedRoute } from '@angular/router';
import { VoronoiService } from 'app/home/services/voronoi.service';
import { PresentationService } from 'app/home/services/presentation.service';

@Component({
    selector: 'app-voronoi',
    templateUrl: 'voronoi.original.component.html',
    styleUrls: ['./voronoi.component.original.less'],
    encapsulation: ViewEncapsulation.None
    // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class VoronoiOriginalComponent implements OnInit {
    height = 680;
    width = 680;
    private margins = { top: 20, right: 20, bottom: 50, left: 50 };
    private fontSizeYear = 64 * this.height / 900;

    animate: boolean = true;
    freedom: any = null;
    duration: number = 1250;
    selectedYear: number = 2008;
    displayYear: any = 2008;
    voronoiTreeMaps = voronoiTreemap();
    companyHierarchy: any = null;
    countryList: any = [];

    imageSource: string = ' World_Gdp_Data.png';
    showDownload: boolean = false;
    currentYear: number = 2016;


    constructor(private route: ActivatedRoute, private presentation: PresentationService, private service: VoronoiService) { }

    ngOnInit() {

        // this.route.data.subscribe(data => {
        //   console.log(data);
        // });
        d3.csv('assets/datasets/freedom_clean.csv', d3.autoType)
            .then((freedom: any) => {

                this.renderVoronoi(freedom);
            })
            .catch(error => console.log(error))
    }

    setDownload() {
        this.showDownload = !this.showDownload;
    }


    regionColor = (region: any) => {
        const colors: any = {
            "Middle East and Africa": "#596F7E",
            "United States": "#596F7E",
            "Americas": "#168B98",
            "Asia": "#ED5B67",
            "Oceania": "#FD8F24",
            "Europe": "#919C4C"
        };
        return colors[region];
    }


    colorHierarchy(hierarchy: any) {
        if (hierarchy.depth === 0) {
            hierarchy.color = 'black';
        } else if (hierarchy.depth === 1) {
            hierarchy.color = this.regionColor(hierarchy.data[0]);
        } else {
            hierarchy.color = hierarchy.parent.color;
        }
        if (hierarchy.children) {
            hierarchy.children.forEach((child: any) => {
                return this.colorHierarchy(child)
            })
        }
    }

    async renderVoronoi(freedom: any) {

        const years = freedom.map((item: any, i: number) => item.year);

        const newYears = [... new Set(years)].sort();

        let svg = d3.select("#chart").append("svg")
            .attr("width", this.width * 1.4)
            .attr("height", this.height * 1.4)
            .style("fill", "#F5F5F2")
            .attr("viewBox", "-120, -30, 900, 900");
        // .attr("width", this.width * 1.5)
        // .attr("height", this.height * 1.5)
        // .attr("viewBox", "-200, 30, 980, 850");

        for (const selectedYear of newYears) {

            this.selectedYear = Number(selectedYear);
            this.currentYear = this.displayYear = Number(selectedYear);

            const freedomYear = freedom.filter((obj: any) => (Number(obj.year) === this.selectedYear));
            const freedomNest = d3.group(freedomYear, (d: any) => d.region_simple);

            const populationHierarchy = d3.hierarchy(freedomNest, (d: any) => {
                if (typeof d.values === 'function') {
                    if (d.length === 2) {
                        return d[1]
                    }
                } else {
                    return d.values
                }
            }).sum((d: any) => d.population);

            svg.selectAll("g").remove();


            const transition = svg.transition()
                .duration(this.duration)
            // .ease(d3.easePoly.exponent(1));

            const drawingArea = svg.append("g").attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")")

            const voronoi = drawingArea;
            const labels = drawingArea;
            const popLabels = drawingArea;
            let clipLabel = drawingArea;

            const cradius = Math.min(this.width, this.height) / 2;

            // const 
            clipLabel = svg.append('g').
                append("circle")
                .attr("r", 339)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("transform", "translate(" + 390 + "," + 360 + ")")
                .attr("stroke-width", 1.5) as any;

            // Create clip path
            clipLabel.append('clipPath')
                .attr('id', 'circle-clip')
                .append('circle')
                .attr('r', cradius);

            let seed = seedrandom('00');

            const ellipse = d3.range(100).map((i: any) => [(this.width * (1 + 0.99 * Math.cos((i / 50) * Math.PI))) / 2, (this.height * (1 + 0.99 * Math.sin((i / 50) * Math.PI))) / 2]);
            let voronoiTreeMap = voronoiTreemap().prng(seed) as any;
            let voronoiTreeMaps = voronoiTreeMap.clip(ellipse);

            this.colorHierarchy(populationHierarchy);
            voronoiTreeMaps(populationHierarchy);

            let allNodes = populationHierarchy.descendants()
                .sort((a, b) => b.depth - a.depth).map((d, i) => {
                    return Object.assign({}, d, { id: i })
                });

            let hoveredShape: any = null;

            voronoi
                .selectAll('path')
                .data(allNodes)
                .enter()
                .append('path')
                .attr('d', (d: any) => "M" + d.polygon.join("L") + "Z")
                .style('fill', (d: any) => d.parent ? d.parent.color : d.color)
                .attr("stroke", "white")
                .attr("stroke-width", 2.5)
                .style('fill-opacity', (d: any) => d.depth === 2 ? 1 : 0)
                .attr('pointer-events', (d: any) => d.depth === 2 ? 'all' : 'none')
                .on('mouseenter', (d: any) => {
                    let { id } = d.target.__data__;
                    let label = labels.select(`.label-${id}`);
                    label.attr('opacity', 1)
                    let popLabel = popLabels.select(`.label-${id}`);
                    popLabel.attr('opacity', 1)
                })
                .on('mouseleave', (d: any) => {
                    let { id, data } = d.target.__data__;
                    let label = labels.select(`.label-${id}`);
                    label.attr('opacity', (d: any) => Number(data.population) > 130000000 ? 1 : 0)
                    let popLabel = popLabels.select(`.label-${id}`);
                    popLabel.attr('opacity', (d: any) => Number(data.population) > 130000000 ? 1 : 0)
                })
                .attr("stroke-width", (d: any) => 7 - d.depth * 2.8)
                .style('fill', (d: any) => d.color)
            // .transition()
            // .duration(1000);

            // d3.select('g')
            svg
                .call(d3.zoom()
                    .extent([[-350, -10], [this.width * 1.5, this.height * 1.5]])
                    .scaleExtent([1, 8])
                    .on("zoom", (d: any) => this.zoomed(d, svg)) as any);


            labels.selectAll('text')
                .data(allNodes.filter((d: any) => d.depth === 2))
                .enter()
                .append('text')
                .attr('class', (d: any) => `label-${d.id}`)
                .attr('text-anchor', 'middle')
                .attr("transform", (d: any) => "translate(" + [d.polygon.site.x, d.polygon.site.y + 6] + ")")
                .text((d: any) => d.data.key || d.data.countries)
                .attr('opacity', (d: any) => {
                    if (d.data.key === hoveredShape) {

                        return (1);
                    } else if (d.data.population > 130000000) {
                        return (1);
                    } else { return (0); }
                })
                .attr('cursor', 'default')
                .attr('pointer-events', 'none')
                .attr('fill', 'black')
                .style('font-family', 'Montserrat');

            // popLabels.selectAll('text')
            //     .data(allNodes.filter((d: any) => d.depth === 2))
            //     .enter()
            //     .append('text')
            //     .attr('class', (d: any) => `label-${d.id}`)
            //     .attr('text-anchor', 'middle')
            //     .attr("transform", (d: any) => "translate(" + [d.polygon.site.x, d.polygon.site.y + 25] + ")")
            //     .text((d: any) => this.bigFormat(d.data.population))
            //     .attr('opacity', (d: any) => {
            //         if (d.data.key === hoveredShape) {
            //             return (1);
            //         } else if (d.data.population > 130000000) {
            //             return (1);
            //         } else { return (0); }
            //     })
            //     .attr('cursor', 'default')
            //     .attr('pointer-events', 'none')
            //     .attr('fill', 'black')
            //     .style('font-size', '12px')
            //     .style('font-family', 'Montserrat');

            voronoi.append("g")
                .attr("transform", "translate(" + -70 + "," + this.margins.bottom + ")")
                .attr("font-family", "sans-serif")
                .attr("font-size", this.fontSizeYear)
                .attr("text-anchor", "right")
                .attr("fill-opacity", 0.2)
                .attr("fill", "black")
                .selectAll()
                .data(allNodes.filter((d: any) => !isNaN(d.data.year)))
                .join("text")
                .call(text => text.append("tspan")
                    .attr("font-weight", "bold")
                    .attr("x", -50)
                    .attr("y", "110px")
                    .text((d: any) => selectedYear as any));

            // Add labels
            let radius = 200;
            const labelRadius = radius + 15;
            const regions = [... new Set(allNodes)];

            svg
                // clipLabel
                // .selectAll('text')
                .selectAll('.clipPath')
                .data(regions.filter((d: any) => d.depth === 2))
                .enter()
                .append('text')
                // .attr('class', (d: any) => `label-${d.id}`)
                .attr("id", (d: any) => d.data.region_simple)
                // .attr("d",  d => d.ringPath())
                .attr("class", "clipPath")
                .attr('transform', (d: any, i: number) => {
                    const angle = (i / d.parent.data[1].length) * 2 * Math.PI - Math.PI / 2;
                    // console.log(angle);
                    // const angle = (i / allNodes.length) * 2 * Math.PI - Math.PI / 2;
                    const x = labelRadius * Math.cos(angle);
                    const y = labelRadius * Math.sin(angle);
                    // console.log(x, y);
                    return `translate(${1.6 * x + 390}, ${1.6 * y + 360}) rotate(${(angle * 180) / Math.PI + 90})`;
                    // return `translate(${x + 80}, ${y}) rotate(${(angle * 180) / Math.PI + 90})`;
                })
                .attr('text-anchor', 'middle')
                .attr('class', 'font-medium text-sm')
                .text((d: any) => d.data.region_simple)
                .attr('opacity', (d: any, e: any, f: any) => {

                    if (d.data.key === hoveredShape) {
                        return (1);
                    } else if (d.data.population > 130000000) {
                        return (1);
                    } else { return (0); }
                })
                .attr('cursor', 'default')
                .attr('pointer-events', 'none')
                .attr('fill', 'black')
                .style('font-family', 'Montserrat');

            this.presentation.saveSvgToImage();
            await transition.end();
        }
    }

    bigFormat = d3.format(",.0f");
    formatDate = d3.utcFormat("%Y");

    zoomed({ transform }: any, svg: any) {
        svg.attr("transform", transform);
    }
}
