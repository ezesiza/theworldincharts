import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataService } from 'app/home/services/load.data.service';
import { sankeyJustify } from "d3-sankey";
import * as d3 from "d3";

@Component({
  selector: 'sankey-movable',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sankey-movable.component.html',
  styleUrl: './sankey-movable.component.less'
})
export class SankeyMovableComponent implements OnInit {

  units = "Widgets";
  private width = 928;
  private height = 600;
  private margin = { top: 20, right: 20, bottom: 50, left: 50 };
  sankey = {};
  nodeWidth = 24;
  nodePadding = 8;
  size = [1, 1];
  nodes: any = [];
  links: any = [];
  formatNumber = d3.format(",.0f");   // zero decimal places
  format = (d: any) => this.formatNumber(d) + " " + this.units;
  color = d3.scaleOrdinal(d3.schemeCategory10);
  svg: any;
  path: any;
  private domIdString = "0-link-";
  private currentSelected: string = 'target';
  private DOMID = 50;


  constructor(private service: LoadDataService) { }

  ngOnInit(): void {
    this.service.getIndustryData().subscribe(res => {
      this.renderChart(res);
    });
  }
  getNextID() {
    return {
      href: "https://ezejike.static.observableusercontent.com/next/worker-lLzrCfCS.html#" + this.domIdString + this.DOMID++,
      id: this.domIdString + this.DOMID + 1,
    };
  }
  renderChart(industryData: any) {

    // Create a SVG container.
    const svg = d3.select("svg")
      .attr("width", this.width * 1.5)
      .attr("height", this.height * 1.5)
      // .attr("viewBox", [-300, 0, this.width + 100, this.height])
      .attr("viewBox", "-30, -80, 980, 850")
      .append("g")
      .attr("transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")");

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const nodeMap = {} as any;
    industryData.nodes.forEach(function (x: any) { nodeMap[x.name] = x; });

    industryData.links = industryData.links.map((x: any) => {
      return {
        source: nodeMap[x.source],
        target: nodeMap[x.target],
        value: x.value
      };
    });

    const path = this.createSankey().link;

    this.createSankey().links = industryData.links;
    this.createSankey().nodes = industryData.nodes;
    this.createSankey().layout = 12;
    this.createSankey().nodeWidth = 12;
    this.createSankey().nodePadding = 30;
    this.createSankey().size = [this.width, this.height];

    const link = svg.append("g")
      .selectAll(".link")
      .data(industryData.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", (d: any) => {
        return Math.max(1, d.dy);
      })
      .sort((a: any, b: any) => { return b.dy - a.dy; });

    // add the link titles
    link.append("title")
      .text((d: any) => {
        return d.source.name + " → " +
          d.target.name + "\n" + this.format(d.value);
      });
    const node = svg.append("g").selectAll(".node")
      .data(industryData.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .on("dragstart", () => {

        })
        .on("drag", null) as any
      );

    // add the rectangles for the nodes
    node.append("rect")
      .attr("height", (d: any) => d.dy)
      .attr("width", this.createSankey().nodeWidth)
      .style("fill", function (d: any) {
        return d.color = color(d.name.replace(/ .*/, ""));
      })
      .style("stroke", function (d: any) {
        return d3.rgb(d.color).darker(2) as any;
      })
      .append("title")
      .text((d: any) => {
        return d.name + "\n" + this.format(d.value);
      });

  }

  createSankey() {
    let sankey = {} as any;
    let nodeWidth = 24;
    let nodePadding = 8;
    let size = [1, 1];
    let nodes: any[] = [];
    let links: any[] = [];

    sankey.nodeWidth = (_: any) => {
      if (!arguments.length) return nodeWidth;
      nodeWidth = +_;
      return sankey;
    };


    sankey.nodePadding = (_: any) => {
      if (!arguments.length) return nodePadding;
      nodePadding = +_;
      return sankey;
    };

    sankey.nodes = (_: any) => {
      if (!arguments.length) return nodes;
      nodes = _;
      return sankey;
    };

    sankey.links = (_: any) => {
      if (!arguments.length) return links;
      links = _;
      return sankey;
    };

    sankey.size = (_: any) => {
      if (!arguments.length) return size;
      size = _;
      return sankey;
    };

    sankey.layout = (iterations: any) => {
      computeNodeLinks();
      computeNodeValues();
      computeNodeBreadths();
      computeNodeDepths(iterations);
      computeLinkDepths();
      return sankey;
    };

    sankey.relayout = () => {
      computeLinkDepths();
      return sankey;
    };

    sankey.link = () => {
      let curvature = .5;

      const link = (d: any) => {
        const xScale0 = d.source.x + d.source.dx;
        const xScale1 = d.target.x;
        const xScalei = d3.interpolateNumber(xScale0, xScale1);
        const xScale2 = xScalei(curvature);
        const xScale3 = xScalei(1 - curvature);
        const yScale0 = d.source.y + d.sy + d.dy / 2;
        const yScale1 = d.target.y + d.ty + d.dy / 2;
        return "M" + xScale0 + "," + yScale0
          + "C" + xScale2 + "," + yScale0
          + " " + xScale3 + "," + yScale1
          + " " + xScale1 + "," + yScale1;
      }

      link.curvature = (_: any) => {
        console.log(_);
        if (!arguments.length) return curvature;
        curvature = +_;
        return link;
      };

      return link;
    };

    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    const computeNodeLinks = () => {
      nodes.forEach((node) => {
        node.sourceLinks = [];
        node.targetLinks = [];
      });
      links.forEach((link) => {
        let source = link.source;
        let target = link.target;
        if (typeof source === "number") source = link.source = nodes[link.source];
        if (typeof target === "number") target = link.target = nodes[link.target];
        source.sourceLinks.push(link);
        target.targetLinks.push(link);
      });
    }

    // Compute the value (size) of each node by summing the associated links.
    const computeNodeValues = () => {
      nodes.forEach((node) => {
        node.value = Math.max(
          d3.sum(node.sourceLinks, value),
          d3.sum(node.targetLinks, value)
        );
      });
    }

    // Iteratively assign the breadth (x-position) for each node.
    // Nodes are assigned the maximum breadth of incoming neighbors plus one;
    // nodes with no incoming links are assigned breadth zero, while
    // nodes with no outgoing links are assigned the maximum breadth.
    const computeNodeBreadths = () => {
      let remainingNodes = nodes;
      let nextNodes: any[] = [];
      let x = 0;

      while (remainingNodes.length) {
        nextNodes = [];
        remainingNodes.forEach((node) => {
          node.x = x;
          node.dx = nodeWidth;
          node.sourceLinks.forEach((link: { target: any; }) => {
            nextNodes.push(link.target);
          });
        });
        remainingNodes = nextNodes;
        ++x;
      }

      //
      moveSinksRight(x);
      scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
    }

    const moveSourcesRight = () => {
      nodes.forEach((node: any) => {
        if (!node.targetLinks.length) {
          node.x = d3.min(node.sourceLinks, (d: any) => { return d.target.x; }) as any - 1;
        }
      });
    }

    const moveSinksRight = (x: any) => {
      nodes.forEach((node) => {
        if (!node.sourceLinks.length) {
          node.x = x - 1;
        }
      });
    }

    const scaleNodeBreadths = (kx: any) => {
      nodes.forEach((node) => {
        node.x *= kx;
      });
    }

    const computeNodeDepths = (iterations: any) => {
      let nodesByBreadth = d3.groups(nodes, (d: any) => d.x)
        .map((d: any) => { return d.values; });


      // d3.group()
      //     .key(function(d:any) { return d.x; })
      //     .sortKeys(d3.ascending)
      //     .entries(nodes)
      //     .map(function(d:any) { return d.values; });

      //
      initializeNodeDepth();
      resolveCollisions();
      for (let alpha = 1; iterations > 0; --iterations) {
        relaxRightToLeft(alpha *= .99);
        resolveCollisions();
        relaxLeftToRight(alpha);
        resolveCollisions();
      }

      function initializeNodeDepth() {
        const ky = d3.min(nodesByBreadth, function (nodes) {
          return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
        });

        nodesByBreadth.forEach(function (nodes) {
          nodes.forEach(function (node: any, i: any) {
            node.y = i;
            node.dy = node.value * ky;
          });
        });

        links.forEach(function (link) {
          link.dy = link.value * ky;
        });
      }

      function relaxLeftToRight(alpha: any) {
        nodesByBreadth.forEach(function (nodes, breadth) {
          nodes.forEach(function (node: any) {
            if (node.targetLinks.length) {
              const y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });

        function weightedSource(link: any) {
          return center(link.source) * link.value;
        }
      }

      function relaxRightToLeft(alpha: any) {
        nodesByBreadth.slice().reverse().forEach(function (nodes) {
          nodes.forEach(function (node: any) {
            if (node.sourceLinks.length) {
              const y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });

        function weightedTarget(link: any) {
          return center(link.target) * link.value;
        }
      }

      function resolveCollisions() {
        nodesByBreadth.forEach(function (nodes) {
          let node;
          let dy;
          let y0 = 0;
          let n = nodes.length;
          let i;

          // Push any overlapping nodes down.
          nodes.sort(ascendingDepth);
          for (let i = 0; i < n; ++i) {
            node = nodes[i];
            dy = y0 - node.y;
            if (dy > 0) node.y += dy;
            y0 = node.y + node.dy + nodePadding;
          }

          // If the bottommost node goes outside the bounds, push it back up.
          dy = y0 - nodePadding - size[1];
          if (dy > 0) {
            y0 = node.y -= dy;

            // Push any overlapping nodes back up.
            for (i = n - 2; i >= 0; --i) {
              node = nodes[i];
              dy = node.y + node.dy + nodePadding - y0;
              if (dy > 0) node.y -= dy;
              y0 = node.y;
            }
          }
        });
      }

      function ascendingDepth(a: any, b: any) {
        return a.y - b.y;
      }
    }

    const computeLinkDepths = () => {
      nodes.forEach(function (node) {
        node.sourceLinks.sort(ascendingTargetDepth);
        node.targetLinks.sort(ascendingSourceDepth);
      });
      nodes.forEach(function (node) {
        let sy = 0, ty = 0;
        node.sourceLinks.forEach(function (link: any) {
          link.sy = sy;
          sy += link.dy;
        });
        node.targetLinks.forEach(function (link: any) {
          link.ty = ty;
          ty += link.dy;
        });
      });

      const ascendingSourceDepth = (a: any, b: any) => {
        return a.source.y - b.source.y;
      }

      const ascendingTargetDepth = (a: any, b: any) => {
        return a.target.y - b.target.y;
      }
    }

    const center = (node: any) => {
      return node.y + node.dy / 2;
    }

    const value = (link: any) => {
      return link.value;
    }

    return sankey;
  };
}
