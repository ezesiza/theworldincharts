import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

interface SupplyData {
  supplier: string;
  percent: number;
  chart: number;
}

@Component({
  selector: 'ad-supply-market',
  templateUrl: './ad-supply-market.component.html',
  styleUrl: './ad-supply-market.component.less'
})
export class AdSupplyMarketComponent implements OnInit, AfterViewInit {
  @ViewChild('sunburst', { static: false }) sunburstRef!: ElementRef;
  @ViewChild('force', { static: false }) forceRef!: ElementRef;
  @ViewChild('radial', { static: false }) radialRef!: ElementRef;
  @ViewChild('chord', { static: false }) chordRef!: ElementRef;
  @ViewChild('treemap', { static: false }) treemapRef!: ElementRef;
  @ViewChild('sankey', { static: false }) sankeyRef!: ElementRef;
  @ViewChild('spiral', { static: false }) spiralRef!: ElementRef;
  @ViewChild('voronoi', { static: false }) voronoiRef!: ElementRef;

  activeView = 'sunburst';

  chartButtons = [
    { id: 'sunburst', label: 'Sunburst', icon: '◉', desc: 'Hierarchical rings' },
    { id: 'force', label: 'Network', icon: '⬢', desc: 'Force-directed' },
    { id: 'radial', label: 'Radial Bar', icon: '◐', desc: 'Circular bars' },
    { id: 'chord', label: 'Chord', icon: '◎', desc: 'Relationships' },
    { id: 'treemap', label: 'Treemap', icon: '▦', desc: 'Nested boxes' },
    { id: 'sankey', label: 'Sankey', icon: '≋', desc: 'Flow diagram' },
    { id: 'spiral', label: 'Spiral', icon: '◎', desc: 'Spiral path' },
    { id: 'voronoi', label: 'Voronoi', icon: '◈', desc: 'Cell diagram' }
  ];

  supplyData: SupplyData[] = [
    // Chart 1
    { supplier: 'casale', percent: 16.4, chart: 1 },
    { supplier: 'fyber', percent: 16.1, chart: 1 },
    { supplier: 'aerserv', percent: 14.1, chart: 1 },
    { supplier: 'google', percent: 13.0, chart: 1 },
    { supplier: 'gumgum', percent: 8.9, chart: 1 },
    { supplier: 'smaato', percent: 5.0, chart: 1 },
    { supplier: 'kargo', percent: 4.7, chart: 1 },
    { supplier: 'pubmatic', percent: 4.5, chart: 1 },
    { supplier: 'triplelift', percent: 4.1, chart: 1 },
    { supplier: 'omax', percent: 2.7, chart: 1 },
    { supplier: 'openx', percent: 1.5, chart: 1 },
    { supplier: 'rubicon', percent: 1.2, chart: 1 },
    { supplier: 'rightmedia', percent: 1.1, chart: 1 },
    { supplier: 'lkqd', percent: 1.1, chart: 1 },
    { supplier: 'federatedmedia', percent: 0.8, chart: 1 },

    // Chart 2
    { supplier: 'fyber', percent: 17.1, chart: 2 },
    { supplier: 'aerserv', percent: 15.4, chart: 2 },
    { supplier: 'casale', percent: 15.3, chart: 2 },
    { supplier: 'google', percent: 12.5, chart: 2 },
    { supplier: 'gumgum', percent: 7.4, chart: 2 },
    { supplier: 'kargo', percent: 7.0, chart: 2 },
    { supplier: 'smaato', percent: 4.4, chart: 2 },
    { supplier: 'pubmatic', percent: 4.2, chart: 2 },
    { supplier: 'triplelift', percent: 3.5, chart: 2 },
    { supplier: 'omax', percent: 2.3, chart: 2 },
    { supplier: 'openx', percent: 1.7, chart: 2 },
    { supplier: 'rightmedia', percent: 1.5, chart: 2 },
    { supplier: 'rubicon', percent: 1.2, chart: 2 },
    { supplier: 'lkqd', percent: 0.9, chart: 2 },
    { supplier: 'mediavine', percent: 0.7, chart: 2 },

    // Chart 3
    { supplier: 'pubmatic', percent: 30.1, chart: 3 },
    { supplier: 'google', percent: 19.2, chart: 3 },
    { supplier: 'rubicon', percent: 17.8, chart: 3 },
    { supplier: 'triplelift', percent: 4.7, chart: 3 },
    { supplier: 'openx', percent: 4.7, chart: 3 },
    { supplier: 'casale', percent: 4.5, chart: 3 },
    { supplier: 'sharethrough', percent: 4.1, chart: 3 },
    { supplier: 'rightmedia', percent: 4.0, chart: 3 },
    { supplier: 'unruly', percent: 3.6, chart: 3 },
    { supplier: 'appnexus', percent: 2.6, chart: 3 },
    { supplier: 'medianet', percent: 2.3, chart: 3 },
    { supplier: 'beachfront', percent: 2.2, chart: 3 },
    { supplier: 'cafemedia', percent: 0.2, chart: 3 },
    { supplier: 'gumgum', percent: 0.1, chart: 3 },
  ];

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderChart(), 100);
  }

  setActiveView(view: string): void {
    this.activeView = view;
    setTimeout(() => this.renderChart(), 100);
  }

  renderChart(): void {
    const charts: { [key: string]: () => void } = {
      sunburst: () => this.createSunburstChart(),
      force: () => this.createForceDirectedGraph(),
      radial: () => this.createRadialChart(),
      chord: () => this.createChordDiagram(),
      treemap: () => this.createTreemap(),
      sankey: () => this.createSankeyDiagram(),
      spiral: () => this.createSpiralChart(),
      voronoi: () => this.createVoronoiDiagram()
    };

    if (charts[this.activeView]) {
      charts[this.activeView]();
    }
  }

  getTopSuppliers(chartNum: number): SupplyData[] {
    return this.supplyData
      .filter(d => d.chart === chartNum)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5);
  }

  getSupplierColor(index: number): string {
    const colors = ['#E91E63', '#FF6B6B', '#2196F3', '#00BCD4', '#4CAF50'];
    return colors[index];
  }

  private createSunburstChart(): void {
    const container = this.sunburstRef.nativeElement;
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const hierarchyData = {
      name: 'Ad Supply',
      children: [1, 2, 3].map(chartNum => ({
        name: `Dataset ${chartNum}`,
        children: this.supplyData
          .filter(d => d.chart === chartNum && d.percent > 0)
          .map(d => ({ name: d.supplier, value: d.percent }))
      }))
    };

    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0)) as any;

    const partition = d3.partition()
      .size([2 * Math.PI, radius]);

    partition(root);

    const arc = d3.arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .innerRadius((d: any) => d.y0)
      .outerRadius((d: any) => d.y1);

    const color = d3.scaleOrdinal()
      .domain(['0', '1', '2'])
      .range(['#E91E63', '#FF6B6B', '#2196F3']) as any;

    svg.selectAll('path')
      .data(root.descendants().filter((d: any) => d.depth > 0))
      .enter()
      .append('path')
      .attr('d', arc as any)
      .style('fill', (d: any): any => {
        if (d.depth === 1) return color(d.data.name.split(' ')[1] - 1);
        return d3.interpolateRgb(color(d.parent.data.name.split(' ')[1] - 1), '#fff')(0.3);
      })
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('opacity', 0.8)
      .on('mouseover', function (event: any, d: any) {
        d3.select(this).style('opacity', 1);
        if (d.depth === 2) {
          svg.append('text')
            .attr('class', 'tooltip')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .style('font-size', '14px')
            .style('fill', '#fff')
            .style('font-weight', 'bold')
            .text(`${d.data.name}: ${d.value.toFixed(1)}%`);
        }
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 0.8);
        svg.selectAll('.tooltip').remove();
      });
  }

  private createForceDirectedGraph(): void {
    const container = this.forceRef.nativeElement;
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 700;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const topSuppliers = ['google', 'pubmatic', 'rubicon', 'casale', 'fyber', 'aerserv'];
    const nodes: any[] = [
      { id: 'center', group: 0, radius: 40 },
      ...topSuppliers.map((s, i) => ({
        id: s,
        group: 1,
        radius: 25,
        value: d3.sum(this.supplyData.filter(d => d.supplier === s), d => d.percent)
      })),
      ...[1, 2, 3].map(c => ({ id: `dataset-${c}`, group: 2, radius: 15 }))
    ];

    const links: any[] = [
      ...topSuppliers.map(s => ({ source: 'center', target: s, value: 5 })),
      ...this.supplyData
        .filter(d => topSuppliers.includes(d.supplier))
        .map(d => ({ source: d.supplier, target: `dataset-${d.chart}`, value: d.percent }))
    ];

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 10));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .style('stroke', '#64B5F6')
      .style('stroke-opacity', 0.6)
      .style('stroke-width', (d: any) => Math.sqrt(d.value));

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(d3.drag<any, any>()
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append('circle')
      .attr('r', (d: any) => d.radius)
      .style('fill', (d: any) => {
        if (d.group === 0) return '#E91E63';
        if (d.group === 1) return '#FF6B6B';
        return '#2196F3';
      })
      .style('stroke', '#fff')
      .style('stroke-width', 3);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('fill', '#fff')
      .style('font-size', (d: any) => d.group === 0 ? '12px' : '10px')
      .style('font-weight', 'bold')
      .text((d: any) => d.id === 'center' ? 'Supply' : d.id.replace('dataset-', 'D'));

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  private createRadialChart(): void {
    const container = this.radialRef.nativeElement;
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 700;
    const innerRadius = 80;
    const outerRadius = Math.min(width, height) / 2 - 60;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const aggregated = d3.rollup(
      this.supplyData.filter(d => d.percent > 2),
      v => d3.sum(v, d => d.percent),
      d => d.supplier
    );

    const data = Array.from(aggregated, ([supplier, total]) => ({ supplier, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    const x = d3.scaleBand()
      .domain(data.map(d => d.supplier))
      .range([0, 2 * Math.PI])
      .padding(0.1);

    const y = d3.scaleRadial()
      .domain([0, d3.max(data, d => d.total) || 0])
      .range([innerRadius, outerRadius]);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius((d: any) => y(d.total))
      .startAngle((d: any) => x(d.supplier) || 0)
      .endAngle((d: any) => (x(d.supplier) || 0) + x.bandwidth())
      .padAngle(0.01)
      .padRadius(innerRadius);

    const colorScale = d3.scaleSequential()
      .domain([0, data.length])
      .interpolator(d3.interpolateRgbBasis(['#E91E63', '#FF6B6B', '#2196F3', '#00BCD4']));

    svg.append('g')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', arc as any)
      .style('fill', (d: any, i: number) => colorScale(i))
      .style('opacity', 0.8)
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    svg.append('g')
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('text-anchor', (d: any) => {
        const angle = (x(d.supplier) || 0) + x.bandwidth() / 2;
        return angle < Math.PI ? 'start' : 'end';
      })
      .attr('transform', (d: any) => {
        const angle = (x(d.supplier) || 0) + x.bandwidth() / 2;
        return `rotate(${angle * 180 / Math.PI - 90})translate(${y(d.total) + 10},0)${angle < Math.PI ? '' : 'rotate(180)'}`;
      })
      .style('font-size', '11px')
      .style('fill', '#fff')
      .text((d: any) => d.supplier);
  }

  private createChordDiagram(): void {
    const container = this.chordRef.nativeElement;
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 600;
    const outerRadius = Math.min(width, height) / 2 - 100;
    const innerRadius = outerRadius - 30;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const topSuppliers = ['google', 'pubmatic', 'rubicon', 'casale', 'fyber', 'aerserv', 'triplelift'];

    const matrix = topSuppliers.map((s1, i) =>
      topSuppliers.map((s2, j) => {
        if (i === j) return 0;
        const d1 = this.supplyData.find(d => d.supplier === s1 && d.chart === 1);
        const d2 = this.supplyData.find(d => d.supplier === s2 && d.chart === 1);
        return d1 && d2 ? Math.sqrt(d1.percent * d2.percent) : 0;
      })
    );

    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
      .radius(innerRadius);

    const color = d3.scaleOrdinal()
      .domain(topSuppliers)
      .range(d3.schemeSet3);

    const chords = chord(matrix);

    svg.append('g')
      .selectAll('path')
      .data(chords.groups)
      .enter()
      .append('path')
      .style('fill', (d: any): any => color(topSuppliers[d.index]))
      .style('stroke', '#fff')
      .attr('d', arc as any);

    svg.append('g')
      .selectAll('path')
      .data(chords)
      .enter()
      .append('path')
      .attr('d', ribbon as any)
      .style('fill', (d: any): any => color(topSuppliers[d.source.index]))
      .style('opacity', 0.5)
      .style('stroke', 'none');

    svg.append('g')
      .selectAll('text')
      .data(chords.groups)
      .enter()
      .append('text')
      .each((d: any) => { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr('dy', '.35em')
      .attr('transform', (d: any) => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 20})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `)
      .style('text-anchor', (d: any) => d.angle > Math.PI ? 'end' : null)
      .style('fill', '#fff')
      .style('font-size', '12px')
      .text((d: any, i: number) => topSuppliers[i]);
  }

  private createTreemap(): void {
    const container = this.treemapRef.nativeElement;
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 600;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const hierarchyData = {
      name: 'root',
      children: [1, 2, 3].map(chartNum => ({
        name: `Dataset ${chartNum}`,
        children: this.supplyData
          .filter(d => d.chart === chartNum && d.percent > 1)
          .map(d => ({ name: d.supplier, value: d.percent }))
      }))
    };

    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0)) as any;

    d3.treemap()
      .size([width, height])
      .padding(2)
      .round(true)(root);

    const color = d3.scaleOrdinal()
      .domain(['Dataset 1', 'Dataset 2', 'Dataset 3'])
      .range(['#E91E63', '#FF6B6B', '#2196F3']);

    const cell = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    cell.append('rect')
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .style('fill', (d: any) => d3.interpolateRgb(color(d.parent.data.name) as any, '#fff')(0.3))
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('opacity', 0.8);

    cell.append('text')
      .attr('x', 4)
      .attr('y', 15)
      .style('font-size', '11px')
      .style('fill', '#fff')
      .style('font-weight', 'bold')
      .text((d: any) => d.data.name);

    cell.append('text')
      .attr('x', 4)
      .attr('y', 30)
      .style('font-size', '10px')
      .style('fill', '#fff')
      .text((d: any) => `${d.value.toFixed(1)}%`);
  }

  private createSankeyDiagram(): void {
    const container = this.sankeyRef.nativeElement;
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const topSuppliers = this.supplyData
      .filter(d => d.chart === 1)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 8)
      .map(d => d.supplier);

    const nodes: any[] = [
      ...topSuppliers.map(s => ({ name: s })),
      { name: 'Dataset 1' },
      { name: 'Dataset 2' },
      { name: 'Dataset 3' }
    ];

    const links: any[] = [];
    topSuppliers.forEach(supplier => {
      [1, 2, 3].forEach(chart => {
        const data = this.supplyData.find(d => d.supplier === supplier && d.chart === chart);
        if (data && data.percent > 0) {
          links.push({
            source: nodes.findIndex(n => n.name === supplier),
            target: nodes.findIndex(n => n.name === `Dataset ${chart}`),
            value: data.percent
          });
        }
      });
    });

    const nodeWidth = 20;
    const nodePadding = 30;
    const x0 = margin.left + 100;
    const x1 = width - margin.right - nodeWidth - 100;

    nodes.forEach((node, i) => {
      if (i < topSuppliers.length) {
        node.x0 = x0;
        node.x1 = x0 + nodeWidth;
        node.y0 = i * (height / topSuppliers.length);
        node.y1 = node.y0 + (height / topSuppliers.length) - nodePadding;
      } else {
        node.x0 = x1;
        node.x1 = x1 + nodeWidth;
        node.y0 = (i - topSuppliers.length) * (height / 3);
        node.y1 = node.y0 + (height / 3) - nodePadding;
      }
    });

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const getLinkPath = (d: any) => {
      const source = nodes[d.source];
      const target = nodes[d.target];
      const sy = (source.y0 + source.y1) / 2;
      const ty = (target.y0 + target.y1) / 2;
      return `M${source.x1},${sy}C${(source.x1 + target.x0) / 2},${sy} ${(source.x1 + target.x0) / 2},${ty} ${target.x0},${ty}`;
    };

    const linkGroup = svg.append('g').attr('class', 'links');

    const linkPaths = linkGroup
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', getLinkPath)
      .style('fill', 'none')
      .style('stroke', (d: any) => color(d.source))
      .style('stroke-width', (d: any) => Math.max(2, d.value))
      .style('opacity', 0.5);

    const nodeGroup = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'move')
      .call(d3.drag<any, any>()
        .on('start', function (event: any, d: any) {
          d3.select(this).raise();
          d3.select(this).select('rect')
            .style('stroke-width', 3)
            .style('filter', 'drop-shadow(0 0 12px rgba(233,30,99,0.8))');
        })
        .on('drag', function (event: any, d: any) {
          const dy = event.y - (d.y0 + d.y1) / 2;
          const newY0 = Math.max(0, Math.min(height - (d.y1 - d.y0), d.y0 + dy));
          const newY1 = newY0 + (d.y1 - d.y0);

          d.y0 = newY0;
          d.y1 = newY1;

          d3.select(this).select('rect').attr('y', d.y0);
          d3.select(this).select('text').attr('y', (d.y0 + d.y1) / 2);

          linkPaths.attr('d', getLinkPath);
        })
        .on('end', function (event: any, d: any) {
          d3.select(this).select('rect')
            .style('stroke-width', 2)
            .style('filter', 'none');
        }));

    nodeGroup.append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .style('fill', (d: any, i: any) => color(i))
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('rx', 4);

    nodeGroup.append('text')
      .attr('x', (d: any) => d.x0 < width / 2 ? d.x1 + 8 : d.x0 - 8)
      .attr('y', (d: any) => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: any) => d.x0 < width / 2 ? 'start' : 'end')
      .style('fill', '#fff')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text((d: any) => d.name);
  }

  private createSpiralChart(): void {
    const container = this.spiralRef.nativeElement;
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 600;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const data = this.supplyData
      .filter(d => d.chart === 1)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 15);

    const theta = d3.scaleLinear()
      .domain([0, data.length])
      .range([0, 10 * Math.PI]);

    const radius = d3.scaleLinear()
      .domain([0, data.length])
      .range([0, Math.min(width, height) / 2 - 50]);

    const line = d3.lineRadial()
      .angle((d: any, i: number) => theta(i))
      .radius((d: any, i: number) => radius(i))
      .curve(d3.curveCardinal);

    svg.append('path')
      .datum(data)
      .attr('d', line as any)
      .style('fill', 'none')
      .style('stroke', '#E91E63')
      .style('stroke-width', 3);

    const points = svg.append('g')
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d: any, i: number) => {
        const angle = theta(i);
        const r = radius(i);
        return `translate(${r * Math.cos(angle - Math.PI / 2)},${r * Math.sin(angle - Math.PI / 2)})`;
      });

    points.append('circle')
      .attr('r', (d: any) => 3 + d.percent / 2)
      .style('fill', '#FF6B6B')
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    points.append('text')
      .attr('x', 10)
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', '#fff')
      .text((d: any) => `${d.supplier} (${d.percent}%)`);
  }

  private createVoronoiDiagram(): void {
    const container = this.voronoiRef.nativeElement;
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    svg.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius)
      .style('fill', 'none')
      .style('stroke', 'rgba(255,255,255,0.3)')
      .style('stroke-width', 3)
      .style('stroke-dasharray', '5,5');

    const data = this.supplyData
      .filter(d => d.percent > 2)
      .map(d => {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.sqrt(Math.random()) * (radius - 30);

        return {
          x: centerX + distance * Math.cos(angle),
          y: centerY + distance * Math.sin(angle),
          supplier: d.supplier,
          percent: d.percent,
          chart: d.chart
        };
      });

    const delaunay = d3.Delaunay.from(data, d => d.x, d => d.y);
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    const color = d3.scaleOrdinal()
      .domain(['1', '2', '3'])
      .range(['#E91E63', '#FF6B6B', '#2196F3']);

    svg.append('defs')
      .append('clipPath')
      .attr('id', 'circle-clip')
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius);

    const voronoiGroup = svg.append('g')
      .attr('clip-path', 'url(#circle-clip)');

    voronoiGroup.append('g')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', (d: any, i: number) => voronoi.renderCell(i))
      .style('fill', (d: any) => color(d.chart.toString()) as any)
      .style('opacity', (d: any) => 0.4 + (d.percent / 80))
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    voronoiGroup.append('g')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => 3 + d.percent / 4)
      .style('fill', '#fff')
      .style('stroke', (d: any) => color(d.chart.toString()) as any)
      .style('stroke-width', 2)
      .style('pointer-events', 'none');

    voronoiGroup.append('g')
      .selectAll('text')
      .data(data.filter(d => d.percent > 8))
      .enter()
      .append('text')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y - 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#fff')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 0 4px rgba(0,0,0,0.8)')
      .text((d: any) => d.supplier);

    svg.append('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '20px')
      .style('fill', 'rgba(255,255,255,0.4)')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text('Voronoi');

    const legend = svg.append('g')
      .attr('transform', `translate(20, ${height - 80})`);

    [1, 2, 3].forEach((chart, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendItem.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('rx', 3)
        .style('fill', color(chart.toString()) as any)
        .style('opacity', 0.7);

      legendItem.append('text')
        .attr('x', 25)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .style('fill', '#fff')
        .style('font-size', '12px')
        .text(`Dataset ${chart}`);
    });
  }
}