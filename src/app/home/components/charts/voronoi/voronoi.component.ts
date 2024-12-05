import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from "d3";
import seedrandom from 'seedrandom';
import { voronoiTreemap } from './voronoiTreemap';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { VoronoiService } from 'app/home/services/voronoi.service';
import { PresentationService } from 'app/home/services/presentation.service';
import { companyDataSelector, getCurrentQuery, State } from 'app/ngrx/reducers';
import { GetAllData, SetCurrentQuery } from 'app/ngrx/actions/filter.actions';

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

  arcGenerator = d3.arc().innerRadius((d: any) => d.radii - 3).outerRadius((d: any) => d.radii).startAngle(d => d.startAngle).endAngle(d => 1)

  renderVoronoi() {

    let svg = d3.select("#chart").append("svg")
      .attr("width", this.width * 1.5)
      .attr("height", this.height * 1.5)
      .attr("viewBox", "-250, 30, 980, 850")
      .style("background", "white")


    const transition = svg.transition()
      .duration(this.duration)
      .ease(d3.easePoly.exponent(1));

    const voronoi = svg.append("g").attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")")
    const labels = svg.append("g").attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
    const popLabels = svg.append("g").attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");

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
      .style('fill', (d: any) => d.color)
      .transition()
      .duration(1000);

    d3.select('g')
      .call(d3.zoom()
        .extent([[-10, -10], [this.width * 1.5, this.height * 1.5]])
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
      .text((d: any) => d.data.Company)
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

    const r = 200;
    const txr = r * 0.9
    const x = this.width / 2;
    const y = 250;
    const arc = d3.arc()
    const arcPath = arc({
      innerRadius: txr,
      outerRadius: txr,
      startAngle: -Math.PI,
      endAngle: Math.PI
    });

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

    svg.selectAll()
      .data(allNodes)
      .enter().append("path")
      .attr("d", arcPath)
      .attr("id", "textArc")
      .attr('transform', `translate(${x - 80}, ${y - 80})`)
      .attr("fill", "none")
      .attr('stroke', "none");

    svg
      .selectAll('.arcLabel')
      .data(allNodes)
      .enter()
      .append("text")
      .attr("x", Math.PI * txr)
      // .attr("dy", (d: any) => {
      //   // console.log(d);
      //   return d
      // })
      .attr("class", "arcLabel")
      .attr("fill", "blue")
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .append("textPath")
      .attr('href', '#textArc')
      .text((d: any) => {
        // console.log(d);
        return d.data.Country
      });

    labels.selectAll("text")
      .each(function (d: any, i) {
        return d.data.Company
      });
    this.presentation.saveSvgToImage()
  }

  bigFormat = d3.format(",.0f");
  formatDate = d3.utcFormat("%Y");

  zoomed({ transform }: any, svg: any) {
    svg.attr("transform", transform);
  }
}
