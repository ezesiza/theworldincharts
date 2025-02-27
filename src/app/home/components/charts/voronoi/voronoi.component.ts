import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import seedrandom from 'seedrandom';
import { voronoiTreemap } from './voronoiTreemap';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { VoronoiService } from 'app/home/services/voronoi.service';
import { PresentationService } from 'app/home/services/presentation.service';
import { getCurrentQuery, State } from 'app/ngrx/reducers';
import { GetAllData, SetCurrentQuery } from 'app/ngrx/actions/filter.actions';

interface Point {
  x: number;
  y: number;
}



@Component({
  selector: 'voronoi',
  templateUrl: 'voronoi.component.html',
  styleUrls: ['./voronoi.component.less']
})

export class VoronoiComponent implements OnInit {
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
  symbolList: any = [];
  imageSource: string = ' CompanyValuation.jpg';
  showDownload: boolean = false;
  currentQuery: string = 'Country'


  constructor(private store: Store<State>, private service: VoronoiService, private presentation: PresentationService) { }

  ngOnInit() {
    this.store.select(getCurrentQuery).subscribe(res => {
      this.currentQuery = res;
      this.service.getNestedCompanyData(res).subscribe((res: any) => {
        this.companyHierarchy = res.companyHierarchy
        this.countryList = [...this.companyHierarchy.data[1].keys()];
        this.symbolList = [...this.companyHierarchy.data[1].values()];
        this.renderVoronoi();
      })
    })
    // this.store.select(companyDataSelector).subscribe((res: any) => {
    //   if (res.data && res.data.length > 0) {
    //     this.companyHierarchy = res.companyHierarchy;
    //     console.log(this.companyHierarchy);
    //     this.countryList = [...this.companyHierarchy.data[1].keys()];
    //     this.symbolList = [...this.companyHierarchy.data[1].values()];
    //     this.renderVoronoi();
    //   }
    // })
    // this.route.data.subscribe(data => {
    //   console.log(data);
    // });
  }


  setDownload() {
    this.showDownload = !this.showDownload;
  }

  getSelectionChange(event: any) {
    if (this.currentQuery !== event.value) {
      this.store.dispatch(new SetCurrentQuery(event.value));
      this.store.dispatch(new GetAllData());
      d3.select("#chart").attr("width", "0");
      d3.select("#chart").selectAll("*").remove();
    }
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

  setCountryColor = (country: any, symbol?: any) => {
    const colorInterpol = d3.interpolateSpectral;
    const colorOrdinal = d3.interpolateViridis;
    let countryObject: any = {};
    let symbolObject: any = {};

    this.countryList.forEach((item: any, i: number) => {
      const t: number = i / this.countryList.length;
      countryObject[item] = colorOrdinal(t)
    });


    if (symbol) {
      return symbolObject[symbol];
    } else {
      return countryObject[country];
    }
  }

  countryColorHierarchy = (hierarchy: any) => {
    if (hierarchy.depth === 0) {
      hierarchy.color = 'black';
    } else if (hierarchy.depth === 1) {
      hierarchy.color = this.setCountryColor(hierarchy.data[0]);
    } else {
      // hierarchy.color = this.setCountryColor(hierarchy.data[0], hierarchy.data.Symbol);
      hierarchy.color = hierarchy.parent.color;
    }
    if (hierarchy.children) {
      hierarchy.children.forEach((child: any) => {
        return this.countryColorHierarchy(child)
      })
    }
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

  renderVoronoi() {

    let svg = d3.select("#chart").append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", "-30, 10, 780, 750")
      .style("background", "white");

    const drawingArea = svg.append("g").attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")")

    const voronoi = drawingArea
    const labels = drawingArea;
    const popLabels = drawingArea;
    let arcTextLabel = svg;

    let seed = seedrandom('00');
    const ellipse = d3.range(100).map((i: any) => [(this.width * (1 + 0.99 * Math.cos((i / 50) * Math.PI))) / 2, (this.height * (1 + 0.99 * Math.sin((i / 50) * Math.PI))) / 2]);

    let voronoiTreeMap = voronoiTreemap().prng(seed) as any;
    let voronoiTreeMaps = voronoiTreeMap.clip(ellipse);

    this.countryColorHierarchy(this.companyHierarchy);
    voronoiTreeMaps(this.companyHierarchy);

    let allNodes = this.companyHierarchy.descendants()
      .sort((a: { depth: number; }, b: { depth: number; }) => b.depth - a.depth).map((d: any, i: any) => {
        return Object.assign({}, d, { id: i })
      });

    let hoveredShape: any = null;

    // Add labels
    let radius = 200;
    const labelRadius = radius + 15;
    const cradius = Math.min(this.width, this.height) / 2;
    const pathId = "textPath" + Math.floor(Math.random() * 10000);
    const lineGenerator = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveBasis);


    // const 
    // arcTextLabel.append('g').
    //   append("circle")
    //   .attr("r", 339)
    //   .attr("fill", "none")
    //   .attr("stroke", "grey")
    //   .attr("transform", "translate(" + 390 + "," + 360 + ")")
    //   .attr("stroke-width", 1.5) as any;
    // // Create clip path
    arcTextLabel.append('clipPath')
      .attr('id', 'circle-clip')
      .append('circle')
      .attr('r', cradius);


    arcTextLabel
      .selectAll('text')
      .data(allNodes.filter((d: any) => d.data.length === 2 && d.data[0] !== undefined))
      .enter()
      .append('text')
      .attr('class', (d: any) => `label-${d.id}`)
      .attr('transform', (d: any, i: number) => {
        console.log(d);
        // const angle = (i / d.data[1].length) * 2 * Math.PI - Math.PI / 2;
        const angle = (i * 360 / d.data[1].length - 90) * (Math.PI / 180) * 1.8 - Math.PI / 12;
        const x = labelRadius * Math.cos(angle);
        const y = labelRadius * Math.sin(angle);

        return `translate(${1.6 * x + 390}, ${1.6 * y + 360}) rotate(${(angle * 180) / Math.PI + 90})`;

        // return `translate(${d.polygon.site.x + 40}, ${d.polygon.site.y + 20})`;
      })
      // .attr("transform", (d: any) => "translate(" + [d.polygon.site.x + 50, d.polygon.site.y + 20] + ")")
      .attr("font-weight", "bold")
      .attr("class", "tick")
      .text((d: any) => {
        return d.data[0]
      })
      .attr('text-anchor', 'middle')
      .attr('class', 'font-medium text-sm')
      .attr('cursor', 'default')
      .attr('pointer-events', 'none')
      .attr('fill', 'black')
      .style('font-family', 'Montserrat');

    voronoi.selectAll('path')
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
        let { id } = d.target.__data__;
        let label = labels.select(`.label-${id}`);
        label.attr('opacity', 0)
        let popLabel = popLabels.select(`.label-${id}`);
        popLabel.attr('opacity', 0)
      })
      .attr("stroke-width", (d: any) => 7 - d.depth * 2.8)
      .style('fill', (d: any) => d.color);


    d3.select('voronoi')
      .call(d3.zoom()
        .extent([[-50, -10], [this.width * 1.5, this.height * 1.5]])
        .scaleExtent([1, 8])
        .on("zoom", (d: any) => this.zoomed(d, svg)) as any);

    labels.selectAll('text')
      .data(allNodes.filter((d: any) => d.depth === 2))
      .enter()
      .append('text')
      .attr('class', (d: any) => {
        return `label-${d.id}`
      })
      .attr('text-anchor', 'middle')
      .attr("transform", (d: any) => "translate(" + [d.polygon.site.x, d.polygon.site.y + 6] + ")")
      .text((d: any) => {

        return d.data.Company
      })
      .attr('opacity', (d: any) => {
        if (d.data.key === hoveredShape) {
          return (1);
        } else if (d.data.Capital > 6) {
          return (1);
        } else { return (0); }
      })
      .attr('cursor', 'default')
      .attr('pointer-events', 'none')
      .attr('fill', 'black')
      .style('font-family', 'Montserrat');

    popLabels.selectAll('text')
      .data(allNodes.filter((d: any) => d.depth === 2))
      .enter()
      .append('text')
      .attr('class', (d: any) => {

        return `label-${d.id}`
      })
      .attr('text-anchor', 'middle')
      .attr("transform", (d: any) => "translate(" + [d.polygon.site.x, d.polygon.site.y + 25] + ")")
      .text((d: any) => {

        return d.data.Symbol
      })
      .attr('opacity', (d: any) => {
        if (d.data.key === hoveredShape) {
          return (1);
        } else
          if (d.data.length < 12) {
            return (1);
          } else { return (0); }
      })
      .attr('cursor', 'default')
      .attr('pointer-events', 'none')
      .attr('fill', 'black')
      .style('font-size', '12px')
      .style('font-family', 'Montserrat');


    this.presentation.saveSvgToImage()
    // })
  }

  bigFormat = d3.format(",.0f");
  formatDate = d3.utcFormat("%Y");

  zoomed({ transform }: any, svg: any) {
    svg.attr("transform", transform);
  }

  findCurvedSection(rawPoints: [number, number][]): {
    start: number;
    end: number;
    points: Point[];
  } {
    const points: Point[] = rawPoints.map(([x, y]) => ({ x, y }));
    let curveStart = -1;
    let curveEnd = -1;
    let currentSequenceStart = -1;
    let maxSequenceLength = 0;

    // Look for the longest sequence where x decreases consistently
    for (let i = 0; i < points.length - 1; i++) {
      if (points[i].x > points[i + 1].x) {
        // Start of a new sequence or continuation
        if (currentSequenceStart === -1) {
          currentSequenceStart = i;
        }

        // If this sequence is longer than our previous longest
        const currentLength = i - currentSequenceStart + 2;
        if (currentLength > maxSequenceLength) {
          maxSequenceLength = currentLength;
          curveStart = currentSequenceStart + 1;
          curveEnd = i - 1;
        }
      } else if (currentSequenceStart !== -1) {
        // Sequence broken
        currentSequenceStart = -1;
      }
    }

    // Extract the curved section points
    const curvedPoints = points.slice(curveStart, curveEnd + 1);

    // console.log("Curve analysis:");
    // console.log(`Start index: ${curveStart}`);
    // console.log(`End index: ${curveEnd}`);
    // console.log("Start point:", points[curveStart]);
    // console.log("End point:", points[curveEnd]);

    return {
      start: curveStart,
      end: curveEnd,
      points: curvedPoints
    };
  }
}
