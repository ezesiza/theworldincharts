// attack-tree.component.ts
import { Component, OnInit, Input, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { AttackDataService } from 'app/home/services/attack-data.service';
import * as d3 from 'd3';

interface StixObject {
  id?: string;
  name?: string;
  type?: string;
  external_references?: Array<{
    external_id: string;
    [key: string]: any;
  }>;
  x_mitre_is_subtechnique?: boolean;
  x_mitre_shortname?: string;
  kill_chain_phases?: Array<{
    phase_name: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

interface TreeNode {
  type: string;
  stix: StixObject;
  nodes: TreeNode[];
}

@Component({
  selector: 'app-attack-tree',
  templateUrl: './attack-tree.component.html',
  styleUrls: ['./attack-tree.component.less']
})
export class AttackTreeComponent implements OnInit, OnChanges {
  @Input() attackData: any; // The enterprise attack JSON data

  // private width = 2428;
  private width = 928;
  private marginTop = 10;
  private marginRight = 10;
  private marginBottom = 10;
  private marginLeft = 40;

  private svg: any;
  private gLink: any;
  private gNode: any;
  private root: any;
  private dx = 10;
  private dy: number;
  private tree: any;
  private diagonal: any;
  private attackTree: TreeNode[] = [];

  constructor(private elementRef: ElementRef, private attackDataService: AttackDataService) { }

  ngOnInit(): void {
    this.attackDataService.getAttackData().subscribe({
      next: (data) => {
        this.attackData = data;
        if (this.attackData) {
          this.processData();
          this.initializeChart();
        }
      },
      error: (err) => {
        console.error('Error loading ATT&CK data:', err);
      }
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attackData'] && !changes['attackData'].firstChange) {
      this.processData();
      this.initializeChart();
    }
  }

  private processData(): void {
    const attackList = this.attackData.objects;
    const techniques = attackList.filter(
      (attack: StixObject) => attack.type === "attack-pattern" && attack.x_mitre_is_subtechnique === false
    );
    const subtechniques = attackList.filter(
      (attack: StixObject) => attack.type === "attack-pattern" && attack.x_mitre_is_subtechnique === true
    );
    const tactics = attackList.filter(
      (attack: StixObject) => attack.type === "x-mitre-tactic"
    );
    const matrix = attackList.filter(
      (attack: StixObject) => attack.type === "x-mitre-matrix"
    );

    // Create relationships map for subtechniques
    const subtechniqueRelationships = attackList.filter(
      (obj: StixObject) => obj.type === "relationship" && obj['relationship_type'] === "subtechnique-of"
    );

    this.attackTree = [this.getMatrix(matrix[0], tactics, techniques, subtechniques, subtechniqueRelationships)];
  }

  private getMatrix(stixObj: StixObject, tactics: StixObject[], techniques: StixObject[], subtechniques: StixObject[], subtechniqueRelationships: any[]): TreeNode {
    const layer: TreeNode = {
      type: "matrix",
      stix: stixObj,
      nodes: this.getTactics(tactics, techniques, subtechniques, subtechniqueRelationships)
    };
    return layer;
  }

  private getTactics(tactics: StixObject[], techniques: StixObject[], subtechniques: StixObject[], subtechniqueRelationships: any[]): TreeNode[] {
    const all: TreeNode[] = [];
    for (let i = 0; i < tactics.length; i++) {
      const layer: TreeNode = {
        type: "tactics",
        stix: tactics[i],
        nodes: this.getTechniques(tactics[i].x_mitre_shortname, techniques, subtechniques, subtechniqueRelationships)
      };
      all.push(layer);
    }
    return all;
  }

  private getTechniques(shortname: string, techniques: StixObject[], subtechniques: StixObject[], subtechniqueRelationships: any[]): TreeNode[] {
    const all: TreeNode[] = [];
    for (let i = 0; i < techniques.length; i++) {
      const killChainPhases = techniques[i].kill_chain_phases || [];
      const check = killChainPhases.map(a => a.phase_name);
      if (check.includes(shortname)) {
        const layer: TreeNode = {
          type: "techniques",
          stix: techniques[i],
          nodes: this.getSubTechniques(techniques[i].id, subtechniques, subtechniqueRelationships)
        };
        all.push(layer);
      }
    }

    all.sort((a, b) => {
      const fa = a.stix.id || '';
      const fb = b.stix.id || '';
      if (fa < fb) return -1;
      if (fa > fb) return 1;
      return 0;
    });

    return all;
  }

  private getSubTechniques(stixid: string, subtechniques: StixObject[], subtechniqueRelationships: any[]): TreeNode[] {
    const all: TreeNode[] = [];
    const relatMap = subtechniqueRelationships.filter(e => e.target_ref === stixid);

    for (let i = 0; i < relatMap.length; i++) {
      const sro = relatMap[i];
      const targetId = sro.source_ref;
      for (let j = 0; j < subtechniques.length; j++) {
        if (subtechniques[j].id === targetId) {
          const layer: TreeNode = {
            type: "subtechnique",
            stix: subtechniques[j],
            nodes: []
          };
          all.push(layer);
        }
      }
    }

    all.sort((a, b) => {
      const fa = a.stix.id || '';
      const fb = b.stix.id || '';
      if (fa < fb) return -1;
      if (fa > fb) return 1;
      return 0;
    });

    return all;
  }

  private initializeChart(): void {
    // Clear existing SVG if any
    const container = this.elementRef.nativeElement.querySelector('#tree-container');
    if (container) {
      container.innerHTML = '';
    }

    this.root = d3.hierarchy(this.attackTree[0], d => d.nodes);
    this.dy = (this.width - this.marginRight - this.marginLeft) / (1 + this.root.height);

    // Define the tree layout and the shape for links
    // this.tree = d3.tree().nodeSize([this.dx * 1.9, this.dy * 1.9]);
    this.tree = d3.tree().nodeSize([this.dx, this.dy]);

    // Modified diagonal function to account for 90 degree rotation
    this.diagonal = d3.linkHorizontal()
      // Swap x and y coordinates due to 90 degree rotation
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    // Create the SVG container and layers
    this.svg = d3.select(container)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.dy)
      // Adjusted viewBox for 90 degree rotation
      .attr("viewBox", [-this.marginTop, -this.marginLeft, this.width, this.dx])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    this.gLink = this.svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    this.gNode = this.svg.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    this.update(null, this.root);

    // Initialize the nodes' positions
    // Swapped for 90 degree rotation
    this.root.x0 = 0;
    this.root.y0 = this.dy / 2;
    this.root.descendants().forEach((d: { id: any; _children: any; children: null; data: { type: string; }; }, i: any) => {
      d.id = i;
      d._children = d.children;
      if (d.data.type === "techniques" || d.data.type === "subtechnique") {
        d.children = null;
      }
    });


  }

  private update(event: any, source: any): void {
    const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
    const nodes = this.root.descendants().reverse();
    const links = this.root.links();

    // Compute the new tree layout
    this.tree(this.root);

    // For 90 degree rotation, we're now concerned with left/right bounds instead of top/bottom
    let top = this.root;
    let bottom = this.root;
    this.root.eachBefore((node: { y: number; }) => {
      if (node.y < top.y) top = node;
      if (node.y > bottom.y) bottom = node;
    });

    // Width and height are swapped due to rotation
    const width = bottom.y - top.y + this.marginLeft + this.marginRight;


    const transition = this.svg.transition()
      .duration(duration)
      .attr("width", width)
      // .attr("height", this.dx * 380)
      // Adjusted viewBox for 90 degree rotation
      .attr("viewBox", [-this.marginTop, -this.marginLeft, this.width, this.dx])
    // Adjusted viewBox for rotation - x and y are swapped
    // .attr("viewBox", [top.y - this.marginLeft - 1000, -this.marginTop + 600, width, this.width]);

    // Update the nodes
    const node = this.gNode.selectAll("g")
      .data(nodes, (d: { id: any; }) => d.id);

    // Enter any new nodes at the parent's previous position
    // Rotated transform - x and y are swapped
    const nodeEnter = node.enter().append("g")
      .attr("transform", (d: any) => `translate(${source.x0},${source.y0}) rotate(90)`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .on("click", (event: any, d: { children: any; _children: any; }) => {
        d.children = d.children ? null : d._children;
        this.update(event, d);
      });

    nodeEnter.append("circle")
      .attr("r", 2.5)
      .attr("fill", (d: { _children: any; }) => d._children ? "#555" : "#999")
      .attr("stroke-width", 10);

    // Adjusted text positioning for rotation
    nodeEnter.append("text")
      .attr("dy", "0.31em") // Adjusted for rotation
      .attr("x", 0)
      .attr("y", (d: { _children: any; }) => d._children ? 6 : -6) // Swapped for rotation
      .attr("text-anchor", "middle") // Center text after rotation
      .text((d: any) => this.nodeName(d))
      .clone(true).lower()
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .attr("stroke", "white");

    // Transition nodes to their new position with rotation
    const nodeUpdate = node.merge(nodeEnter).transition(transition)
      .attr("transform", (d: { x: any; y: any; }) => `translate(${d.x},${d.y}) rotate(90)`)
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);

    // Transition exiting nodes to the parent's new position
    const nodeExit = node.exit().transition(transition).remove()
      .attr("transform", (d: any) => `translate(${source.x},${source.y}) rotate(90)`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0);

    // Update the links
    const link = this.gLink.selectAll("path")
      .data(links, (d: { target: { id: any; }; }) => d.target.id);

    // Enter any new links at the parent's previous position
    // Modified for 90 degree rotation
    const linkEnter = link.enter().append("path")
      .attr("d", (d: any) => {
        const o = { x: source.x0, y: source.y0 };
        return this.diagonal({ source: o, target: o });
      });

    // Transition links to their new position
    link.merge(linkEnter).transition(transition)
      .attr("d", (d: { source: { x: any; y: any; }; target: { y: any; x: any; }; }) => {
        // For 90 degree rotation, swap source and target x/y
        return `M${d.source.x},${d.source.y}
                C${d.source.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${d.target.y}`;
      });

    // Transition exiting nodes to the parent's new position
    link.exit().transition(transition).remove()
      .attr("d", (d: any) => {
        const o = { x: source.x, y: source.y };
        return this.diagonal({ source: o, target: o });
      });

    // Stash the old positions for transition
    this.root.eachBefore((d: { x0: any; x: any; y0: any; y: any; }) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  private nodeName(node: any): string {
    const stix = node.data.stix;
    const stixType = node.data.type;
    let name = "";
    let extId = "";

    if (stixType === 'tactics') {
      name = stix.name;
      extId = stix.external_references?.[0]?.external_id || "";
    } else if (stixType === 'matrix') {
      name = stix.name;
      extId = "";
    } else if (stixType === 'techniques') {
      name = stix.name;
      extId = stix.external_references?.[0]?.external_id || "";
    } else if (stixType === 'subtechnique') {
      name = stix.name;
      extId = stix.external_references?.[0]?.external_id || "";
    } else if (stixType === 'technique_detail') {
      name = "details";
      extId = "test";
    } else {
      name = node;
    }

    return extId ? `${extId}: ${name}` : name;
  }
}