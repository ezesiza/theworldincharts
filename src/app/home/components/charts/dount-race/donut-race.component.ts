import { Component, ViewEncapsulation, OnInit, ElementRef } from "@angular/core";
import { LoadDataService } from "app/home/services/load.data.service";
import { PresentationService } from "app/home/services/presentation.service";
import * as d3 from "d3";


@Component({
    selector: "donut-race",
    providers: [LoadDataService],
    templateUrl: "donut-race.component.html",
    styleUrls: ["donut-race.component.less"],
    // encapsulation: ViewEncapsulation.None,
})
export class DonutRaceComponent implements OnInit {
    private width = 600;
    private height = Math.min(this.width, 700);
    private radius = this.height / 2 - 150 * this.height / 700;

    private duration = 15;

    private innerRadiusFactor = 0.65;
    private distTextFactor = 1.54;
    private widthImage = 56 * this.height / 700;
    private minAngle = 0.38;
    private hideAngle = 0.07;
    private fontSize = 15;
    private fontSizeYear = 64 * this.height / 700;
    currentYear = '1994';

    private backgroundColor = "#FDFDFD";
    private borderColor = "#C0C0C0";
    private parentElement: any | undefined;
    imageSource: string = 'BrowserShare.jpg';
    showDownload: boolean = false;
    isLoading: boolean = true;

    private fontSizeTitle = 28 * this.height / 700;
    // private titleTop = "Rise and fall of popular web browsers (1994-2003)";
    private titleTop = "Browsers Market Share";

    private title = "Market share (%)";

    constructor(
        private element: ElementRef,
        private presentation: PresentationService,
        private service: LoadDataService) {
        this.parentElement = this.element.nativeElement;
    }

    ngOnInit() {
        setTimeout(() => (this.isLoading = false), 3000);
        this.service.getKeyFrames().subscribe(response => {
            this.renderChart(response)
        })
    }

    setDownload() {
        this.showDownload = !this.showDownload;
    }

    private arc = d3.arc()
        .innerRadius(this.radius * this.innerRadiusFactor)
        .outerRadius(this.radius);

    private formatDate = d3.timeFormat("%Y")


    async renderChart(keyframes: any) {
        let svg = d3.select(this.parentElement)
            .select("#chart").append("svg")
            .attr("width", this.width * 1.5)
            .attr("height", this.height)
            .attr("viewBox", [-450, -this.height / 2, this.width / 1.3, this.height])
            .attr("style", "max-width: 100%; height: auto;")
            .style("background", this.backgroundColor)
            // .attr("style", "outline: thin solid")
            .style("outline-color", this.borderColor);

        for (const keyframe of keyframes) {

            const transition = svg.transition()
                .duration(this.duration)
                .ease(d3.easeLinear);

            const pie = d3.pie()
                .padAngle(1 / this.radius)
                .sort(null)
                .value((d: any) => d.value);

            const color = d3.scaleOrdinal()
                .domain(keyframe[1].map((d: { name: any; }) => d.name))
                .range(d3.quantize(t => d3.interpolateSpectral(t * 0.85 + 0.1), keyframe[1].length).reverse());

            svg.selectAll("g").remove();

            svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", this.fontSizeTitle)
                .attr("font-weight", "bold")
                .attr("fill-opacity", 0.2)
                .selectAll()
                .data(pie(keyframe[1]))
                .join("text")
                .call(text => text.append("tspan")
                    .attr("class", "title_top")
                    .attr("x", -this.width / 2 + 30 * this.height / 700)
                    .attr("y", -this.height / 2 + 50 * this.height / 700)
                    .attr("dy", "-0.5em")
                    .text(this.titleTop));

            svg.selectAll(".title_top")
            // .call(this.wrap, this.wrap_title_top);


            svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", this.fontSizeYear)
                .attr("text-anchor", "middle")
                .attr("fill-opacity", 0.2)
                .selectAll()
                .data(pie(keyframe[1]))
                .join("text")
                .call(text => text.append("tspan")
                    .attr("font-weight", "bold")
                    .attr("x", 0)
                    .attr("y", "10px")
                    .text(d => {
                        this.currentYear = this.formatDate(keyframe[0]);
                        return this.formatDate(keyframe[0])
                    }))
                .call(text => text.append("tspan")
                    .attr("font-weight", "lighter")
                    .attr("x", 0)
                    .attr("y", 50 * this.height / 700)
                    .attr("font-size", this.fontSizeYear / 2.8)
                    .text(this.title));

            svg.append("g")
                .selectAll()
                .data(pie(keyframe[1]))
                .enter()
                .filter((d) => (d.endAngle - d.startAngle) > 2 * this.hideAngle)
                .append('line')
                .style("stroke", "black")
                .style("stroke-width", 1)
                .attr("x1", (d: any) => this.arc.centroid(d)[0] * 1.2)
                .attr("y1", (d: any) => this.arc.centroid(d)[1] * 1.2)
                .attr("x2", (d: any) => this.arc.centroid(d)[0] * this.distTextFactor * 0.88)
                .attr("y2", (d: any) => this.arc.centroid(d)[1] * this.distTextFactor * 0.88);

            svg.append("g")
                .selectAll()
                .data(pie(keyframe[1]))
                .join("path")
                .attr("fill", (d: any) => color(d.data.name) as any)
                .attr("d", this.arc as any)
                .append("title")
                .text((d: any) => {
                    // console.log(d.data.name, d.data.value);
                    // this.currentYear = 
                    return `${d.data.name}: ${d.data.value.toLocaleString()}`
                });


            svg
                .call(d3.zoom()
                    .extent([[-350, -10], [this.width * 1.5, this.height * 1.5]])
                    .scaleExtent([1, 8])
                    .on("zoom", (d: any) => this.zoomed(d, svg)) as any);

            svg.append("g")
                .selectAll()
                .data(pie(keyframe[1]))
                .join("svg:image")
                .filter((d: any) => (d.endAngle - d.startAngle) < this.minAngle && (d.endAngle - d.startAngle) > this.hideAngle)
                .attr("xlink:href", (d: any) => d.data.image)
                .attr("transform", (d: any) => `translate(${[this.arc.centroid(d)[0] - this.widthImage * 0.5 * (d.endAngle - d.startAngle) / this.minAngle,
                this.arc.centroid(d)[1] - this.widthImage * 0.5 * (d.endAngle - d.startAngle) / this.minAngle]})`)
                .attr('width', (d: any) => this.widthImage * (d.endAngle - d.startAngle) / this.minAngle);

            svg.append("g")
                .selectAll()
                .data(pie(keyframe[1]))
                .join("svg:image")
                .filter((d: any) => (d.endAngle - d.startAngle) > this.minAngle)
                .attr("xlink:href", (d: any) => d.data.image)
                .attr("transform", (d: any) => `translate(${[this.arc.centroid(d)[0] - this.widthImage / 2, this.arc.centroid(d)[1] - this.widthImage / 2]})`)
                .attr('width', (d: any) => this.widthImage);

            svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", this.fontSize)
                .attr("text-anchor", "middle")
                .selectAll()
                .data(pie(keyframe[1]))
                .join("text")
                .attr("transform", (d: any) => `translate(${[this.arc.centroid(d)[0] * this.distTextFactor, this.arc.centroid(d)[1] * this.distTextFactor]})`)
                .call(text => text.filter((d: any) => (d.endAngle - d.startAngle) > 2 * this.hideAngle).append("tspan")
                    .attr("y", "-0.6em")
                    .attr("dy", "-1em")
                    .attr("font-weight", "bold")
                    .attr("class", "tick")
                    .text((d: any) => d.data.name))
                .call(text => text.filter((d: any) => (d.endAngle - d.startAngle) > 2 * this.hideAngle).append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.2em")
                    .attr("fill-opacity", 0.7)
                    .text((d: any) => d.data.value.toLocaleString("en-US", { maximumFractionDigits: 1 }) + "%"));

            svg.selectAll(".tick")
            // .call(this.wrap, 8);

            // setTimeout(() => svg.interrupt());
            this.presentation.saveSvgToImage();
            await transition.end();
        }
    }

    wrap(text: { each: (arg0: () => void) => void; }, wrapWidth: number) {
        text.each(() => {
            var text = d3.select("g"),
                words = text.text().split(/\s+/).reverse(),
                word,
                line: string[] = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("dx", 0).attr("dy", `${dy}em`);

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node()!.getComputedTextLength() > wrapWidth) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("dx", -tspan.node()!.getComputedTextLength()).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });

        return 0;
    }

    zoomed({ transform }: any, svg: any) {
        svg.attr("transform", transform);
    }
}