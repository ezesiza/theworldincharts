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
    private margins = { top: 20, right: 40, bottom: 50, left: 50 };
    private fontSizeYear = 64 * this.height / 900;

    animate: boolean = true;
    private animationPaused: boolean = false;
    private animationTimeout: any = null;
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
    isLoading: boolean = true;


    constructor(private route: ActivatedRoute, private presentation: PresentationService, private service: VoronoiService) { }

    ngOnInit() {

        // this.route.data.subscribe(data => {
        //   console.log(data);
        // });
        d3.csv('assets/datasets/freedom_clean.csv', d3.autoType)
            .then((freedom: any) => {
                this.renderVoronoi(freedom);
                setTimeout(() => this.isLoading = false, 2000);
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

    toggleAnimation() {
        this.animate = !this.animate;
        this.animationPaused = !this.animationPaused;
        if (!this.animationPaused) {
            this.resumeAnimation();
        }
    }

    private async resumeAnimation() {
        if (this.freedom) {
            await this.renderVoronoi(this.freedom, true);
        }
    }

    async renderVoronoi(freedom: any, resume: boolean = false) {

        const years = freedom.map((item: any, i: number) => item.year);

        const newYears = [... new Set(years)].sort();

        let svg = d3.select("#chart").append("svg")
            .attr("width", this.width * 1.4)
            .attr("height", this.height * 1.4)
            .style("fill", "#F5F5F2")
            .attr("viewBox", "-120, -80, 1000, 1000");
        // .attr("width", this.width * 1.5)
        // .attr("height", this.height * 1.5)
        // .attr("viewBox", "-200, 30, 980, 850");

        let yearIndex = resume ? newYears.indexOf(this.selectedYear) : 0;
        for (; yearIndex < newYears.length; yearIndex++) {
            if (this.animationPaused) {
                this.selectedYear = Number(newYears[yearIndex]);
                break;
            }
            const selectedYear = newYears[yearIndex];
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

            // Remove old arc labels if any
            svg.selectAll('.arc-label-path').remove();
            svg.selectAll('.arc-label-text').remove();
            // Place region labels using centroid-based angle
            const centerX = 390;
            const centerY = 360;
            const arcRadius = 339 + 30;
            // Use populationHierarchy for region nodes
            const regionNodes = (populationHierarchy.children || []);
            // Create a hidden SVG text element for measuring text width
            let tempText = d3.select('body').append('svg').attr('id', 'temp-svg-label-measure').style('position', 'absolute').style('visibility', 'hidden');
            regionNodes.forEach((region: any, i: number) => {
                const children = region.children || [];
                if (children.length === 0) return;
                // For each child (depth 2), compute the angle from the center using the centroid of its polygon
                const angles = children.map((child: any) => {
                    if (!child.polygon) return null;
                    const centroid = d3.polygonCentroid(child.polygon);
                    const dx = centroid[0] - centerX;
                    const dy = centroid[1] - centerY;
                    let angle = Math.atan2(dy, dx);
                    if (angle < 0) angle += 2 * Math.PI;
                    return angle;
                }).filter((a: number | null) => a !== null);
                if (angles.length === 0) return;
                // Find min and max angle for the region's angular span
                let minAngle = Math.min(...angles);
                let maxAngle = Math.max(...angles);
                // Handle wrap-around (if sector crosses 0)
                if (maxAngle - minAngle > Math.PI) {
                    [minAngle, maxAngle] = [maxAngle, minAngle + 2 * Math.PI];
                }
                let arcWidth = Math.abs(maxAngle - minAngle);
                let meanAngle = (minAngle + maxAngle) / 2;
                let minArcWidth = Math.PI / 12; // 15 degrees
                let startAngle = minAngle;
                let endAngle = maxAngle;
                // If arc is too small, fallback to minArcWidth centered at meanAngle
                if (arcWidth < minArcWidth) {
                    startAngle = meanAngle - minArcWidth / 2;
                    endAngle = meanAngle + minArcWidth / 2;
                    arcWidth = minArcWidth;
                }
                const arcLength = arcRadius * arcWidth;
                // Measure text width and adjust font size if needed
                const labelText = region.data[0];
                let fontSize = 16;
                let textElem = tempText.append('text').text(labelText).style('font-family', 'Montserrat').style('font-size', fontSize + 'px');
                let textWidth = (textElem.node() as SVGTextElement).getBBox().width;
                textElem.remove();
                if (arcLength < textWidth + 20) {
                    // Reduce font size so label fits
                    fontSize = Math.max(10, Math.floor(fontSize * (arcLength / (textWidth + 20))));
                }
                // Re-measure with new font size
                textElem = tempText.append('text').text(labelText).style('font-family', 'Montserrat').style('font-size', fontSize + 'px');
                textWidth = (textElem.node() as SVGTextElement).getBBox().width;
                textElem.remove();
                // Always show the label
                const arcPath = d3.arc()({
                    innerRadius: arcRadius,
                    outerRadius: arcRadius,
                    startAngle: startAngle,
                    endAngle: endAngle
                });
                const arcId = `arc-label-path-${i}`;
                svg.append('path')
                    .attr('id', arcId)
                    .attr('class', 'arc-label-path')
                    .attr('d', arcPath)
                    .attr('transform', `translate(${centerX},${centerY})`)
                    .attr('fill', 'none')
                    .attr('stroke', 'none');
                // Place label at the midpoint of the arc
                svg.append('text')
                    .attr('class', 'arc-label-text')
                    .append('textPath')
                    .attr('href', `#${arcId}`)
                    .attr('startOffset', '50%')
                    .text(labelText)
                    .attr('font-weight', 'bold')
                    .attr('class', 'tick font-medium text-sm')
                    .attr('cursor', 'default')
                    .attr('pointer-events', 'none')
                    .attr('fill', 'black')
                    .style('font-family', 'Montserrat')
                    .style('font-size', fontSize + 'px');
            });
            tempText.remove();

            this.presentation.saveSvgToImage();
            await transition.end();
            if (this.animationPaused) break;
        }
    }

    bigFormat = d3.format(",.0f");
    formatDate = d3.utcFormat("%Y");

    zoomed({ transform }: any, svg: any) {
        svg.attr("transform", transform);
    }
}
