import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import seedrandom from 'seedrandom';
import { voronoiTreemap } from './voronoiTreemap';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'voronoi',
  templateUrl: 'voronoi.component.html',
  styleUrls: ['./voronoi.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoronoiComponent implements OnInit {
  height = 680;
  width = 680;

  private margins = { top: 20, right: 20, bottom: 50, left: 50 };
  animate: boolean = true;
  freedom: any = null;
  selectedYear: number = 2008;
  voronoiTreeMaps = voronoiTreemap();

  todoUrl = 'https://gorest.co.in/public/v2/todos ';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    d3.csv('assets/freedom_clean.csv', d3.autoType)
      .then((data: any) => {
        this.renderVoronoi(data);
      })
      .catch(error => console.log(error))
  }


  regionColor = (region: any) => {
    const colors: any = {
      "Middle East and Africa": "#596F7E",
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

  renderVoronoi(freedom: any) {
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
    }).sum((d: any) => (d.population));
   

    let svg = d3.select("svg")
      .attr("width", this.width + this.margins.left + this.margins.right)
      .attr("height", this.height + this.margins.left + this.margins.right)
      .style("fill", "#F5F5F2");

    const voronoi = svg.append("g").attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
    const labels = svg.append("g").attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
    const popLabels = svg.append("g").attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");

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
        let {id} = d.target.__data__;
        let label = labels.select(`.label-${id}`);
        label.attr('opacity', 1)
        let popLabel = popLabels.select(`.label-${id}`);
        popLabel.attr('opacity', 1)
      })
      .on('mouseleave', (d: any) => {
        let {id, data} = d.target.__data__;
        let label = labels.select(`.label-${id}`);
        label.attr('opacity', (d: any) => Number(data.population) > 130000000 ? 1 : 0)
        let popLabel = popLabels.select(`.label-${id}`);
        popLabel.attr('opacity', (d: any) => Number(data.population) > 130000000 ? 1 : 0)
      })
      .attr("stroke-width", (d: any) => 7 - d.depth * 2.8)
      .style('fill', (d: any) =>  d.color)
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

    popLabels.selectAll('text')
      .data(allNodes.filter((d: any) => d.depth === 2))
      .enter()
      .append('text')
      .attr('class', (d: any) => `label-${d.id}`)
      .attr('text-anchor', 'middle')
      .attr("transform", (d: any) => "translate(" + [d.polygon.site.x, d.polygon.site.y + 25] + ")")
      .text((d: any) => this.bigFormat(d.data.population))
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
      .style('font-size', '12px')
      .style('font-family', 'Montserrat');
  }

  bigFormat = d3.format(",.0f");

  zoomed({transform}: any, svg:any) {
    svg.attr("transform", transform);
  }
}
