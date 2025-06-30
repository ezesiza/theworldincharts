import { Component, OnDestroy, OnInit } from '@angular/core';
import * as d3 from "d3";
import seedrandom from 'seedrandom';
import { voronoiTreemap } from './voronoiTreemap';
import { Store } from '@ngrx/store';
import { VoronoiService } from 'app/home/services/voronoi.service';
import { PresentationService } from 'app/home/services/presentation.service';
import { getCurrentQuery, State } from 'app/ngrx/reducers';
import { GetAllData, SetCurrentQuery } from 'app/ngrx/actions/filter.actions';
import { VoronoiStateService } from 'app/home/services/state.service';
import { setCountrySelected } from 'app/ngrx/actions/voronoi.actions';


@Component({
  selector: 'voronoi',
  templateUrl: 'voronoi.component.html',
  styleUrls: ['./voronoi.component.less']
})

export class VoronoiComponent implements OnInit, OnDestroy {

  height = 680;
  width = 680;
  private margins = { top: 20, right: 20, bottom: 50, left: 50 };

  animate: boolean = true;
  freedom: any = null;
  duration: number = 1250;
  selectedYear: number = 2008;
  displayYear: any = 2008;
  voronoiTreeMaps = voronoiTreemap();
  companyHierarchy: any = null;
  countryList: any = [];
  symbolList: any = [];
  countrySelected: any = [];
  companyCountry: any = '';
  imageSource: string = ' CompanyValuation.jpg';
  showDownload: boolean = false;
  currentQuery: string = 'Country';
  showCardOne: boolean = false;
  private isChartRendered: boolean = false;
  isLoading: boolean = true;


  constructor(
    private store: Store<State>,
    private service: VoronoiService,
    private presentation: PresentationService,
    private stateService: VoronoiStateService) { }

  // ngOnInit() {
  //   this.service.loadCompanies();
  //   this.service.getNestedCompanyData$('Country').subscribe((response: any) => {
  //     this.companyHierarchy = response.companyHierarchy

  //     this.countryList = [...this.companyHierarchy.data[1].keys()];
  //     this.symbolList = [...this.companyHierarchy.data[1].values()];
  //     this.renderVoronoi();
  //   })
  // }

  ngOnDestroy() {
    this.isChartRendered = false;
    d3.select("#chart").selectAll("*").remove();
  }

  ngOnInit() {
    setTimeout(() => (this.isLoading = false), 3000);
    // Subscribe to store changes
    this.store.select((state: any) => state['voronoi'].countrySelected)
      .subscribe(data => {
        if (data) {
          this.countrySelected = data;
        }
      });

    // Only load companies if not already loaded
    if (!this.companyHierarchy) {
      this.service.loadCompanies();
    }

    // Only subscribe if chart hasn't been rendered
    if (!this.isChartRendered) {
      this.service.getNestedCompanyData$('Country').subscribe((response: any) => {
        this.companyHierarchy = response.companyHierarchy;
        this.countryList = [...this.companyHierarchy?.data[1].keys()];
        this.symbolList = [...this.companyHierarchy.data[1].values()];
        this.renderVoronoi();
        this.isChartRendered = true;
      });
    }

    // Restore state if it exists
    if (this.stateService.companyCountry) {
      this.companyCountry = this.stateService.companyCountry;
      this.showCardOne = this.stateService.showCardOne;
      if (this.stateService.selectedPolygon) {
        this.createNewSvg(this.stateService.selectedPolygon);
      }
    }
  }

  setDownload() {
    this.showDownload = !this.showDownload;
  }

  // Update where 'd' is being set to countrySelected
  updateSelection(d: any) {
    // Dispatch to store
    this.store.dispatch(setCountrySelected({ data: d }));
  }

  getSelectionChange(event: any) {
    this.store.dispatch(setCountrySelected({ data: event }));
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
      countryObject[item] = colorInterpol(t)
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
    d3.select("#chart").selectAll("*").remove();
    let svg = d3.select("#chart").append("svg")
      .attr("width", this.width / 1.1)
      .attr("height", this.height / 1.05)
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
    const labelRadiusOffset = 20; // Offset from the main circle for labels
    const circleRadiusForLabels = 339 + labelRadiusOffset;
    const centerX = 390;
    const centerY = 360;

    // Create a single circular path for all country labels
    const pathData = `M ${centerX + circleRadiusForLabels}, ${centerY}
                      A ${circleRadiusForLabels},${circleRadiusForLabels} 0 1,1 ${centerX - circleRadiusForLabels},${centerY}
                      A ${circleRadiusForLabels},${circleRadiusForLabels} 0 1,1 ${centerX + circleRadiusForLabels},${centerY} Z`;

    arcTextLabel.append("path")
      .attr("id", "countryLabelPath")
      .attr("d", pathData)
      .attr("fill", "none")
      .attr("stroke", "none");


    // const 
    arcTextLabel.append('g').
      append("circle")
      .attr("r", 339)
      .attr("fill", "none")
      .attr("stroke", "grey")
      .attr("transform", "translate(" + 390 + "," + 360 + ")")
      .attr("stroke-width", 1.5) as any;

    // Create clip path
    arcTextLabel.append('clipPath')
      .attr('id', 'circle-clip')
      .append('circle')
      .attr('r', circleRadiusForLabels);

    // Filter and prepare country nodes for angular positioning
    const countryNodes = allNodes.filter((d: any) => d.data.length === 2 && d.data[0] !== undefined)
      .map((d: any) => {
        // Calculate angle relative to the chart's center
        let angle = Math.atan2(d.polygon.site.y - centerY, d.polygon.site.x - centerX);
        // Normalize angle to be between 0 and 2*PI
        if (angle < 0) {
          angle += 2 * Math.PI;
        }
        return { ...d, angle: angle };
      })
      .sort((a: any, b: any) => a.angle - b.angle); // Sort to ensure consistent text path flow


    arcTextLabel
      .selectAll('text')
      .data(countryNodes) // Use sorted countryNodes
      .enter()
      .append('text')
      .attr('class', (d: any) => `label-${d.id}`)
      .append("textPath") // Append textPath here
      .attr("href", "#countryLabelPath")
      .attr("startOffset", (d: any) => {
        // Calculate offset based on the node's angular position
        const offset = (d.angle / (2 * Math.PI)) * 100;
        return offset + "%";
      })
      .text((d: any) => d.data[0])
      .attr("font-weight", "bold")
      .attr("class", "tick font-medium text-sm")
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
      .on("click", (event: any, d: any) => {
        this.companyCountry = d.data.Company + " - " + d.data.Country;

        this.showCardOne = true;
        this.destroyChart(d3.select("#card-one"));
        this.updateSelection(d);
        this.countrySelected = d;

        // Save state
        this.stateService.companyCountry = this.companyCountry;
        this.stateService.selectedPolygon = d.parent.polygon;
        this.stateService.showCardOne = true;

        this.createNewSvg(this.stateService.selectedPolygon);
        // this.createNewSvg(children);
      })
      .on("dblclick", (event: any, d: any) => {
        this.showCardOne = false;
        this.stateService.showCardOne = false;
        this.setZoom(svg);
      })
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

    d3.select('#chart')
      .call(d3.zoom()
        .extent([[-4, -1], [this.width / 24, this.height / 24]])
        .scaleExtent([1, 1.01])
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

  setZoom(svg: any = null) {
    d3.select('#chart')
      .call(d3.zoom()
        .extent([[-1, 10], [this.width / 12, this.height / 12]])
        .scaleExtent([1, 1.1])
        .on("zoom", (d: any) => this.zoomed(d, svg)) as any);
  }

  findCircularBoundaries(d: any) {
    const points: [number, number][] = d.polygon;
    // Find the centroid of the polygon
    let cx = 0, cy = 0;
    points.forEach((point: [number, number]) => {
      cx += point[0];
      cy += point[1];
    });
    cx /= points.length;
    cy /= points.length;

    // Calculate distances from centroid to each point
    const distances = points.map(point => {
      const dx = point[0] - cx;
      const dy = point[1] - cy;
      return Math.sqrt(dx * dx + dy * dy);
    });

    // Find the average distance to use as circle radius
    const radius = d3.mean(distances);

    // Find points that are approximately on the circle
    const threshold = radius * .55; // 15% tolerance
    const circularPoints = points.filter((point, i) => {
      const dist = distances[i];
      return Math.abs(dist - radius) < threshold;
    });
    // console.log(d.data[0], JSON.stringify(circularPoints));
    return {
      center: [cx, cy],
      radius: radius,
      points: circularPoints.sort((a: number[], b: number[]) => a[0] - b[0])
    };
  }

  createNewSvg(polygon: any) {
    // let svg: any = d3.select("#card-one");
    const margin = 2;
    let svg = d3.select("#card-one").append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", "-30, 10, 780, 750")
      .style("background", "white")
      .attr('xmlns', 'http://www.w3.org/2000/svg');


    // Determine scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(polygon, (d: any) => d[0]) as any - margin, d3.max(polygon, (d: any) => d[0]) + margin] as any)
      .range([0, this.width]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(polygon, (d: any) => d[1]) as any - margin, d3.max(polygon, (d: any) => d[1]) + margin] as any)
      .range([this.height, 0]);



    // Modified line generator to create an offset path
    const lineGenerator = d3.line()
      .x(d => xScale(d[0]) + 10)
      .y(d => yScale(d[1]) + 40);  // Increased offset to 70 pixels above path


    // Create polygon path
    const polygonPath = svg.append('path')
      .datum(polygon)
      .attr('d', d3.line().x((d: any) => xScale(d[0])).y((d: any) => yScale(d[1])) as any)
      .attr('id', 'polygonPath')
      .attr('fill', 'lightblue')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill-opacity', 0.5);


    // Create offset path for text
    const textPath = svg.append('path')
      .datum(polygon)
      .attr('d', lineGenerator as any)
      .attr('id', 'textPathOffset')
      .attr('fill', 'none')
      .attr('stroke', 'none');

    // Draw polygon
    svg.selectAll('circle')
      .data(polygon)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => {
        return xScale(d[0])
      })
      .attr('cy', (d: any) => yScale(d[1]))
      .attr('r', 5)
      .attr('fill', 'red');
  }

  private destroyChart(svg: any) {
    if (svg && !svg.empty()) {
      svg.attr("width", "0");
      svg.selectAll("*").remove();
    }
  }

  createTransformInterpolator(source: any, target: any) {
    // Create d3 interpolators for both translation and rotation
    const translateInterpolator = d3.interpolate(
      source.translate,
      target.translate
    );

    // Normalize rotation angles (optional, but helps with smooth transitions)
    let sourceRotation = source.rotate % 360;
    let targetRotation = target.rotate % 360;

    // Choose the shortest path for rotation
    if (Math.abs(targetRotation - sourceRotation) > 180) {
      if (targetRotation > sourceRotation) {
        sourceRotation += 360;
      } else {
        targetRotation += 360;
      }
    }

    const rotateInterpolator = d3.interpolate(sourceRotation, targetRotation);

    // Return the interpolator function that will be called with a time parameter (0 to 1)
    return function (t: any) {
      const currentTranslate = translateInterpolator(t);
      const currentRotate = rotateInterpolator(t);

      return `translate(${currentTranslate[0]}, ${currentTranslate[1]}) rotate(${currentRotate})`;
    };
  }

}
