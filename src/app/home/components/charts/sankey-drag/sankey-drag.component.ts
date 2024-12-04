// sankey-diagram.component.ts
import { Component, Input, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { LoadDataService } from 'app/home/services/load.data.service';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

interface SankeyNode {
  name: string;
  category?: string;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  value?: number;
  dragX?: number;
  dragY?: number;
  initialX0?: number;
  initialY0?: number;
  initialX1?: number;
  initialY1?: number;
}

interface SankeyLink {
  source: string | SankeyNode;
  target: string | SankeyNode;
  value: number;
  uid?: string;
  width?: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

@Component({
  selector: 'app-sankey-diagram',
  template: '<svg #svgElement></svg>',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    svg {
      // width: 100%;
      // height: 100%;
    }
  `]
})
export class SankeyDragComponent implements OnInit, OnChanges {
  @Input() data!: SankeyData;
  @Input() width = 800;
  @Input() height = 600;
  @Input() align: 'justify' | 'left' | 'right' | 'center' = 'justify';
  @Input() showTotal = false;
  @Input() edgeColor: 'path' | 'input' | 'output' | 'none' = 'path';

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private format = d3.format(",.0f");
  private color = d3.scaleOrdinal(d3.schemeCategory10);
  private sankeyGenerator: any;

  constructor(private service: LoadDataService, private elementRef: ElementRef) { }


  ngOnInit() {
    this.service.getEnergyNodes().pipe().subscribe(res => {
      this.data = res;
      this.initializeSvg();
      this.createSankey();
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.svg) return;

    if (changes['data'] || changes['width'] || changes['height'] ||
      changes['align'] || changes['showTotal'] || changes['edgeColor']) {
      this.updateChart();
    }
  }

  private initializeSvg() {
    this.svg = d3.select(this.elementRef.nativeElement.querySelector('svg'))
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);
  }

  private createSankey() {
    this.sankeyGenerator = sankey<SankeyData, SankeyNode, SankeyLink>()
      .nodeId(d => d.name)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 5], [this.width - 1, this.height - 5]]);

    this.updateChart();
  }

  private updateChart() {
    if (!this.data || !this.data.nodes || !this.data.links) return;

    // Clear previous content
    this.svg.selectAll('*').remove();

    // Set node alignment
    let newD3 = d3 as any;
    console.log(`sankey${this.align[0].toUpperCase} ${this.align.slice(1)}`);
    // this.sankeyGenerator.nodeAlign([`sankey${this.align[0].toUpperCase} ${this.align.slice(1)}`] as any);
    this.sankeyGenerator.nodeAlign();

    // Create copies of data
    let dataNodes = this.data.nodes.map(d => ({ ...d }));
    let dataLinks = this.data.links.map(d => ({ ...d }));

    // Generate initial layout
    let group = this.sankeyGenerator({
      nodes: dataNodes,
      links: dataLinks
    });

    // Add total node if requested
    if (this.showTotal) {
      const totalLinks = group.nodes
        .filter(({ targetLinks }: any) => targetLinks.length === 0)
        .map(({ name, value }: SankeyNode) => ({
          source: "Total",
          target: name,
          value
        }));

      dataNodes = [{ name: "Total", category: "Total" }, ...dataNodes];
      dataLinks = [...totalLinks, ...dataLinks];

      group = this.sankeyGenerator({
        nodes: dataNodes,
        links: dataLinks
      });
    }

    const nodes = group.nodes;
    const links = group.links;
    const nodeWidth = nodes[0].x1 - nodes[0].x0;

    // Create node groups
    const node = this.svg
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .attr('cursor', 'move')
      .call(d3.drag<SVGGElement, SankeyNode>()
        .on('start', (event, d) => this.dragStart(event, d))
        .on('drag', (event, d) => this.dragMove(event, d)) as any);

    // Add node rectangles
    node.append('rect')
      .attr('height', (d: any) => d.y1! - d.y0!)
      .attr('width', (d: any) => d.x1! - d.x0!)
      .attr('fill', (d: any) => this.color(d.category || d.name))
      .attr('stroke', '#000')
      .append('title')
      .text((d: any) => `${d.name}\n${this.format(d.value!)}`);

    // Add node labels
    node.append('text')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('x', (d: any) => d.x0! < this.width / 2 ? nodeWidth + 6 : -6)
      .attr('y', (d: any) => (d.y1! - d.y0!) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: any) => d.x0! < this.width / 2 ? 'start' : 'end')
      .text((d: any) => d.name);

    // Create link groups
    const link = this.svg.append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.5)
      .selectAll('g')
      .data(links)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    // Handle gradient links if needed
    if (this.edgeColor === 'path') {
      const gradient = link
        .append('linearGradient')
        .attr('id', (d: any, i) => {
          d.uid = `link-${i}`;
          return d.uid;
        })
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (d: any) => (d.source as SankeyNode).x1!)
        .attr('x2', (d: any) => (d.target as SankeyNode).x0!);

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', (d: any) =>
          this.color((d.source as SankeyNode).category || (d.source as SankeyNode).name));

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', (d: any) =>
          this.color((d.target as SankeyNode).category || (d.target as SankeyNode).name));
    }

    // Add link paths
    link.append('path')
      .attr('class', 'link')
      .attr('d', sankeyLinkHorizontal() as any)
      .attr('stroke', (d: any) => {
        if (this.edgeColor === 'none') return '#aaa';
        if (this.edgeColor === 'path') return `url(#${d.uid})`;
        if (this.edgeColor === 'input')
          return this.color((d.source as SankeyNode).category || (d.source as SankeyNode).name);
        return this.color((d.target as SankeyNode).category || (d.target as SankeyNode).name);
      })
      .attr('stroke-width', (d: any) => Math.max(1, d.width!))
      .append('title')
      .text((d: any) =>
        `${(d.source as SankeyNode).name} → ${(d.target as SankeyNode).name}\n${this.format(d.value)}`);
  }

  private dragStart(event: any, d: SankeyNode) {
    d.dragX = event.x;
    d.dragY = event.y;
    d.initialX0 = d.x0;
    d.initialY0 = d.y0;
    d.initialX1 = d.x1;
    d.initialY1 = d.y1;
  }

  private dragMove(event: any, d: SankeyNode) {
    const dx = event.x - d.dragX!;
    const dy = event.y - d.dragY!;

    // Update node position with boundaries
    d.x0 = Math.max(0, Math.min(this.width - (d.initialX1! - d.initialX0!), d.initialX0! + dx));
    d.x1 = d.x0 + (d.initialX1! - d.initialX0!);
    d.y0 = Math.max(0, Math.min(this.height - (d.initialY1! - d.initialY0!), d.initialY0! + dy));
    d.y1 = d.y0 + (d.initialY1! - d.initialY0!);

    // Update node position
    d3.select(event.sourceEvent.target.parentNode)
      .attr('transform', `translate(${d.x0},${d.y0})`);

    // Update sankey layout
    this.sankeyGenerator.update(this.data);

    // Update link paths
    this.svg.selectAll('.link')
      .attr('d', sankeyLinkHorizontal() as any);
  }
}