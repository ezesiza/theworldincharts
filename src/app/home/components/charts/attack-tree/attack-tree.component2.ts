import { Component, OnInit, ElementRef, ViewChild, Input, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { firstValueFrom } from 'rxjs';

interface StixObject {
    id: string;
    type: string;
    name: string;
    external_references?: Array<{ external_id: string }>;
    x_mitre_is_subtechnique?: boolean;
    x_mitre_shortname?: string;
    kill_chain_phases?: Array<{ phase_name: string }>;
}

interface TreeNode {
    type: string;
    stix: StixObject;
    nodes: TreeNode[];
    id?: number;
    children?: TreeNode[];
    _children?: TreeNode[];
    x?: number;
    y?: number;
    x0?: number;
    y0?: number;
}

interface AttackData {
    objects: StixObject[];
}

@Component({
    selector: 'app-attack-tree',
    template: `
    <div class="attack-tree-container">
    <header>
        <div class="header">
            <h1>MITRE ATT&CK Summary</h1>
            <div class="button-group">
                <button class="button" routerLink="">&laquo; Home</button>
                <button class="button button2" routerLink="/earth">Next &raquo;</button>
            </div>
        </div>
    </header>
        <single-card [loading]="false">
        <div class="panel-body">
            <div class="controls-container">
                <div class="search-container">
                    <input 
                        type="text" 
                        [(ngModel)]="searchFilter" 
                        (ngModelChange)="onSearchChange()"
                        placeholder="Search techniques and subtechniques..."
                        class="search-input"
                    >
                </div>
                <button class="toggle-button" (click)="toggleAllTechniques()">
                    {{ areTechniquesCollapsed ? 'Expand All' : 'Collapse All' }}
                </button>
            </div>
            <div id="tree-container" class="tree-container"></div>
        </div>
        </single-card>
      <div *ngIf="loading" class="loading">Loading MITRE ATT&CK data...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
    styles: [`
    .attack-tree-container {
      width: 100%;
      height: 600px;
      border: 1px solid #ccc;
      position: relative;
    }
    
    .tree-container {
      width: 100%;
      height: calc(100% - 50px);
      overflow: auto;
    }
    
    .controls-container {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: #f5f5f5;
      border-bottom: 1px solid #ccc;
    }

    .search-container {
      flex: 1;
    }

    .search-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    .toggle-button {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      white-space: nowrap;
    }

    .toggle-button:hover {
      background: #0056b3;
    }
    
    .loading, .error {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 4px;
    }
    
    .error {
      color: red;
      border: 1px solid red;
    }
    
    .loading {
      color: #666;
      border: 1px solid #ccc;
    }

    .highlight {
      background-color: yellow;
      padding: 0 2px;
      border-radius: 2px;
    }

    .node-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class AttackTreeComponent2 implements OnInit, OnDestroy {
    @ViewChild('treeContainer', { static: true }) treeContainer!: ElementRef;
    @Input() dataUrl: string = 'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack-13.1.json';

    loading = false;
    error: string | null = null;

    private svg: any;
    private gLink: any;
    private gNode: any;
    private root: any;
    private tree: any;
    private diagonal: any;

    // Chart dimensions
    private readonly width = 928;
    private readonly marginTop = 10;
    private readonly marginRight = 10;
    private readonly marginBottom = 10;
    private readonly marginLeft = 40;
    private readonly dx = 10;
    private dy: number;

    // Data arrays
    private techniques: StixObject[] = [];
    private subtechniques: StixObject[] = [];
    private tactics: StixObject[] = [];
    private matrix: StixObject[] = [];
    private subtechniqueOf: any[] = [];

    searchFilter: string = '';
    private filteredTechniques: StixObject[] = [];
    private filteredSubtechniques: StixObject[] = [];

    areTechniquesCollapsed = false;

    constructor(private http: HttpClient) {
        this.dy = (this.width - this.marginRight - this.marginLeft) / 2; // Initial value
    }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        if (this.svg) {
            this.svg.remove();
        }
    }

    private async loadData(): Promise<void> {
        this.loading = true;
        this.error = null;

        try {
            const data: AttackData = await firstValueFrom(this.http.get<AttackData>(this.dataUrl));
            this.processData(data);
            this.initializeChart();
        } catch (err) {
            this.error = 'Failed to load MITRE ATT&CK data';
            console.error('Error loading data:', err);
        } finally {
            this.loading = false;
        }
    }

    private processData(data: AttackData): void {
        const attackList = data.objects;

        this.techniques = attackList.filter(obj =>
            obj.type === "attack-pattern" && obj.x_mitre_is_subtechnique === false
        );

        this.subtechniques = attackList.filter(obj =>
            obj.type === "attack-pattern" && obj.x_mitre_is_subtechnique === true
        );

        this.tactics = attackList.filter(obj => obj.type === "x-mitre-tactic");
        this.matrix = attackList.filter(obj => obj.type === "x-mitre-matrix");

        this.subtechniqueOf = attackList.filter(obj =>
            obj.type === "relationship" && (obj as any).relationship_type === "subtechnique-of"
        );

        // Initialize filtered arrays
        this.filteredTechniques = [...this.techniques];
        this.filteredSubtechniques = [...this.subtechniques];
    }

    private destroyChart(svg: any) {
        if (svg && !svg.empty()) {
            svg.attr("width", "0");
            svg.selectAll("*").remove();
        }
    }

    private initializeChart(): void {
        const attackTree = this.buildAttackTree();

        // Create hierarchy
        this.root = d3.hierarchy(attackTree[0], d => d.nodes);
        this.dy = (this.width - this.marginRight - this.marginLeft) / (1 + this.root.height);

        // Define tree layout and diagonal
        this.tree = d3.tree().nodeSize([this.dx, this.dy]);
        this.diagonal = d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x);

        // Create SVG
        this.destroyChart(this.svg)
        this.svg = d3.select("#tree-container")
            .append("svg")
            .attr("width", this.width * 1.5)
            .attr("height", this.dx)
            .attr("viewBox", [-this.marginLeft, -this.marginTop, this.width, this.dx])
            .style("max-width", "100%")
            .style("height", "auto")
            .style("font", "10px sans-serif")
            .style("user-select", "none");

        // Create groups for links and nodes
        this.gLink = this.svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5);

        this.gNode = this.svg.append("g")
            .attr("cursor", "pointer")
            .attr("pointer-events", "all");

        // Initialize tree state
        this.root.x0 = this.dy / 2;
        this.root.y0 = 0;
        this.root.descendants().forEach((d: any, i: number) => {
            d.id = i;
            d._children = d.children;
            if (d.data.type === "techniques" || d.data.type === "subtechnique") {
                d.children = null;
            }
        });

        this.update(null, this.root);
    }

    private buildAttackTree(): TreeNode[] {
        const matrixData = this.getMatrix(this.matrix[0]);
        return [matrixData];
    }

    private getMatrix(stixObj: StixObject): TreeNode {
        return {
            type: "matrix",
            stix: stixObj,
            nodes: this.getTactics()
        };
    }

    private getTactics(): TreeNode[] {
        const all: TreeNode[] = [];

        for (const tactic of this.tactics) {
            const layer: TreeNode = {
                type: "tactics",
                stix: tactic,
                nodes: this.getTechniques(tactic.x_mitre_shortname || '')
            };
            all.push(layer);
        }

        return all;
    }

    private getTechniques(shortname: string): TreeNode[] {
        const all: TreeNode[] = [];

        for (const technique of this.filteredTechniques) {
            const killChainPhases = technique.kill_chain_phases || [];
            const phaseNames = killChainPhases.map(phase => phase.phase_name);

            if (phaseNames.includes(shortname)) {
                const layer: TreeNode = {
                    type: "techniques",
                    stix: technique,
                    nodes: this.getSubTechniques(technique.id)
                };
                all.push(layer);
            }
        }

        return all.sort((a, b) => a.stix.id.localeCompare(b.stix.id));
    }

    private getSubTechniques(stixId: string): TreeNode[] {
        const all: TreeNode[] = [];
        const relatMap = this.subtechniqueOf.filter((e: any) => e.target_ref === stixId);

        for (const sro of relatMap) {
            const targetId = sro.source_ref;
            const subtechnique = this.filteredSubtechniques.find(sub => sub.id === targetId);

            if (subtechnique) {
                const layer: TreeNode = {
                    type: "subtechnique",
                    stix: subtechnique,
                    nodes: []
                };
                all.push(layer);
            }
        }

        return all.sort((a, b) => a.stix.id.localeCompare(b.stix.id));
    }

    private getNodeName(node: any): string {
        const stix = node.data.stix;
        const stixType = node.data.type;
        let name = "";
        let extId = "";

        switch (stixType) {
            case 'tactics':
            case 'techniques':
            case 'subtechnique':
                name = stix.name;
                extId = stix.external_references?.[0]?.external_id || '';
                break;
            case 'matrix':
                name = stix.name;
                extId = "";
                break;
            case 'technique_detail':
                name = "details";
                extId = "test";
                break;
            default:
                name = String(node);
        }

        return extId ? `${extId}: ${name}` : name;
    }

    private highlightText(text: string, searchTerm: string): string {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    private update(event: any, source: any): void {
        const duration = event?.altKey ? 2500 : 250;
        const nodes = this.root.descendants().reverse();
        const links = this.root.links();

        // Compute new tree layout
        this.tree(this.root);

        let left = this.root;
        let right = this.root;
        this.root.eachBefore((node: any) => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });

        const height = right.x - left.x + this.marginTop + this.marginBottom;

        const transition = this.svg.transition()
            .duration(duration)
            .attr("height", height)
            .attr("viewBox", [-this.marginLeft - 150, left.x - this.marginTop, this.width, height]);

        // Update nodes
        const node = this.gNode.selectAll("g").data(nodes, (d: any) => d.id);

        // Enter new nodes
        const nodeEnter = node.enter().append("g")
            .attr("transform", `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event: any, d: any) => {
                // Recursively toggle children
                const toggleChildren = (node: any, collapsed: boolean) => {
                    if (node._children) {
                        node.children = collapsed ? null : node._children;
                        node._children.forEach((child: any) => toggleChildren(child, collapsed));
                    }
                };

                const isCollapsing = d.children !== null;
                toggleChildren(d, isCollapsing);
                this.update(event, d);
            });

        nodeEnter.append("circle")
            .attr("r", 2.5)
            .attr("fill", (d: any) => d._children ? "#555" : "#999")
            .attr("stroke-width", 10);


        // Create foreignObject for HTML content
        const foreignObject = nodeEnter.append("foreignObject")
            .attr("x", (d: any) => d._children ? -150 : 15)
            // .attr("dy", "0.31em")
            .attr("text-anchor", (d: any) => d._children ? "end" : "start")
            .attr("y", -5)
            .attr("width", 550)
            .attr("height", 15);

        // Add HTML content with highlighting
        foreignObject.append("xhtml:div")
            .attr("class", "node-text")
            .style("font-size", "10px")
            .style("font-family", "sans-serif")

            .html((d: any) => {
                const text = this.getNodeName(d);
                return this.highlightText(text, this.searchFilter);
            });

        // Update existing nodes
        node.merge(nodeEnter).transition(transition)
            .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // Update text content for existing nodes
        node.select("foreignObject div")
            .html((d: any) => {
                const text = this.getNodeName(d);
                return this.highlightText(text, this.searchFilter);
            });

        // Remove exiting nodes
        node.exit().transition(transition).remove()
            .attr("transform", `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // Update links
        const link = this.gLink.selectAll("path").data(links, (d: any) => d.target.id);

        // Enter new links
        const linkEnter = link.enter().append("path")
            .attr("d", () => {
                const o = { x: source.x0, y: source.y0 };
                return this.diagonal({ source: o, target: o });
            });

        // Update existing links
        link.merge(linkEnter).transition(transition)
            .attr("d", this.diagonal);

        // Remove exiting links
        link.exit().transition(transition).remove()
            .attr("d", () => {
                const o = { x: source.x, y: source.y };
                return this.diagonal({ source: o, target: o });
            });

        // Store old positions for transition
        this.root.eachBefore((d: any) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    onSearchChange(): void {
        if (!this.searchFilter.trim()) {
            this.filteredTechniques = [...this.techniques];
            this.filteredSubtechniques = [...this.subtechniques];
        } else {
            const searchLower = this.searchFilter.toLowerCase();

            // First, find all matching techniques and subtechniques
            const matchingTechniques = this.techniques.filter(tech =>
                tech.name.toLowerCase().includes(searchLower) ||
                tech.external_references?.[0]?.external_id.toLowerCase().includes(searchLower)
            );

            const matchingSubtechniques = this.subtechniques.filter(sub =>
                sub.name.toLowerCase().includes(searchLower) ||
                sub.external_references?.[0]?.external_id.toLowerCase().includes(searchLower)
            );

            // Get all parent techniques of matching subtechniques
            const parentTechniqueIds = new Set(
                this.subtechniqueOf
                    .filter((rel: any) => matchingSubtechniques.some(sub => sub.id === rel.source_ref))
                    .map((rel: any) => rel.target_ref)
            );

            // Include all techniques that either match directly or are parents of matching subtechniques
            this.filteredTechniques = this.techniques.filter(tech =>
                matchingTechniques.includes(tech) || parentTechniqueIds.has(tech.id)
            );

            // Include all subtechniques that either match directly or belong to matching techniques
            this.filteredSubtechniques = this.subtechniques.filter(sub => {
                const parentRel = this.subtechniqueOf.find((rel: any) => rel.source_ref === sub.id);
                return matchingSubtechniques.includes(sub) ||
                    (parentRel && this.filteredTechniques.some(tech => tech.id === parentRel.target_ref));
            });
        }
        this.initializeChart();
    }

    toggleAllTechniques(): void {
        this.areTechniquesCollapsed = !this.areTechniquesCollapsed;

        // Recursively toggle all nodes
        const toggleNode = (node: any) => {
            if (node._children) {
                node.children = this.areTechniquesCollapsed ? null : node._children;
                node._children.forEach(toggleNode);
            }
        };

        // Start from root and toggle all nodes
        toggleNode(this.root);

        // Update the visualization
        this.update(null, this.root);
    }
}