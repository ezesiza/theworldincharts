import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

interface ChartData {
  hex: string;
  name: string;
  startAngle?: number;
  endAngle?: number;
  s?: number;
  e?: number;
}

@Component({
  selector: 'radial-donut-chart',
  templateUrl: 'radial-donut-chart.component.html',
  styleUrls: ['./radial-donut-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class RadialDonutChartComponent implements OnInit {


  @ViewChild('chartContainer', { static: true }) private chartContainer!: ElementRef;


  private readonly tau = 2 * Math.PI;
  private readonly w = 960;
  private readonly h = 960;
  private readonly outerThickness = 30;
  private readonly outerMargin = 3;
  private readonly maxWordLength = 20;

  private outer: ChartData[] = [
    { hex: "#D6D6D6", name: "1. volt" },
    { hex: "#D6D6D6", name: "2. tour yellow" },
    { hex: "#D6D6D6", name: "3. total orange" },
    { hex: "#D6D6D6", name: "4. hot punch" },
    { hex: "#D6D6D6", name: "5. speed red" },
    { hex: "#D6D6D6", name: "6. fuchsia blast" },
    { hex: "#D6D6D6", name: "7. hyper magenta" },
    { hex: "#D6D6D6", name: "8. hyper grape" },
    { hex: "#D6D6D6", name: "9. ocean bliss" },
    { hex: "#D6D6D6", name: "10. photo blue" },
    { hex: "#D6D6D6", name: "11. ultramarine" },
    { hex: "#D6D6D6", name: "12. solar red" },
  ];

  private outer2: ChartData[] = [
    { hex: "#D6D6D6", name: "11. volt" },
    { hex: "#D6D6D6", name: "22. tour yellow" },
    { hex: "#D6D6D6", name: "33. total orange" },
    { hex: "#D6D6D6", name: "44. hot punch" },
    { hex: "#D6D6D6", name: "55. speed red" },
    { hex: "#D6D6D6", name: "66. fuchsia blast" },
    { hex: "#D6D6D6", name: "77. hyper magenta" },
    { hex: "#D6D6D6", name: "88. hyper grape" },
    { hex: "#D6D6D6", name: "99. ocean bliss" },
    { hex: "#D6D6D6", name: "1010. photo blue" },
    { hex: "#D6D6D6", name: "1111. ultramarine" },
    { hex: "#D6D6D6", name: "1212. solar red" },
  ];

  private outerLabels: ChartData[] = [
    { hex: "#51BE58", name: "1. yellows yellows", s: 0, e: 3 },
    { hex: "#3EB4F0", name: "2. reds reds", s: 3, e: 6 },
    { hex: "#FA44B3", name: "3. blues blues", s: 6, e: 9 },
    { hex: "#FED130", name: "4. neutrals neutrals", s: 9, e: 12 }
  ];

  private svg: any;
  private g: any;

  ngOnInit() {
    this.createChart();
  }

  private createChart(): void {
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.w)
      .attr('height', this.h);

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.w / 2},${this.h / 2})`);

    this.setupArcs();
    this.drawOuterLabels();
    this.drawOuterPies();
    this.drawOuterColorArcs();
  }

  private setupArcs(): void {
    const spliterSeg = this.tau / 72;
    const seg = (this.tau - spliterSeg * this.outerLabels.length) / this.outer.length;

    // Add start and end angles to data
    this.outer.forEach((el, i) => {
      const offset = (Math.floor(i / (this.outer.length / this.outerLabels.length)) * spliterSeg) - (this.tau / 8);
      el.startAngle = i * seg + offset;
      el.endAngle = (i + 1) * seg + offset;
    });

    this.outer2.forEach((el, i) => {
      const offset = (Math.floor(i / (this.outer2.length / this.outerLabels.length)) * spliterSeg) - (this.tau / 8);
      el.startAngle = i * seg + offset;
      el.endAngle = (i + 1) * seg + offset;
    });
  }

  private isTextInverted(d: any): boolean {
    return (d.startAngle > (this.tau / 8 * 3 - 0.1) && d.endAngle < (this.tau / 8 * 5 + 0.1));
  }

  private getLabelArc(d: string, startAngle: number, endAngle: number): string {
    const firstArcSection = /(^.+?)L/;
    let newArc = firstArcSection.exec(d)?.[1] || '';

    if (this.isTextInverted({ startAngle, endAngle })) {
      const startLoc = /M(.*?)A/;
      const middleLoc = /A(.*?)0,0,1/;
      const endLoc = /0,0,1,(.*?)$/;

      const newStart = endLoc.exec(newArc)?.[1] || '';
      const newEnd = startLoc.exec(newArc)?.[1] || '';
      const middleSec = middleLoc.exec(newArc)?.[1] || '';

      newArc = `M${newStart}A${middleSec}0,0,0,${newEnd}`;
    }

    return newArc;
  }

  private drawOuterLabels(): void {
    const arcOuterLabels_innerRadius = this.getOuterArc2OuterRadius() + this.outerMargin + this.outerThickness;
    const arcOuterLabels_OuterRadius = arcOuterLabels_innerRadius + 18;

    const arcOuterLabelsArc = d3.arc()
      .innerRadius(arcOuterLabels_innerRadius)
      .outerRadius(arcOuterLabels_OuterRadius);

    const arcOuterLabelsStartAngle = -this.tau / this.outerLabels.length / 2;
    const arcOuterLabelsPie = d3.pie()
      .startAngle(arcOuterLabelsStartAngle)
      .endAngle(arcOuterLabelsStartAngle + this.tau)
      .value(() => 1)
      .padAngle(.01)
      .sort(null);

    // Create paths for labels
    this.g.selectAll('.outerLabel')
      .data(arcOuterLabelsPie(this.outerLabels as any))
      .enter()
      .each((d: any, i: number) => {
        const labelArc = this.getLabelArc(arcOuterLabelsArc(d), d.startAngle, d.endAngle);

        this.g.append('path')
          .classed('outerLabel', true)
          .attr('class', 'hiddenOuterLabelArcs')
          .attr('id', `outerLabelArc${i}`)
          .attr('d', labelArc)
          .style('fill', 'none');
      });

    // Add text labels
    this.g.selectAll('.outerLabelText')
      .data(arcOuterLabelsPie(this.outerLabels as any))
      .enter()
      .append('text')
      .attr('class', 'outerLabelText')
      .attr('dy', (d: any) => this.isTextInverted(d) ? 18 : -11)
      .append('textPath')
      .attr('startOffset', '50%')
      .style('text-anchor', 'middle')
      .attr('xlink:href', (d: any, i: number) => `#outerLabelArc${i}`)
      .text((d: any) => d.data.name)
      .attr('font-size', `${(18 / 750) * this.w}px`)
      .attr('font-weight', 700)
      .attr('letter-spacing', 2.2);
  }

  private getOuterArcOuterRadius(): number {
    return 350;
  }

  private getOuterArc2OuterRadius(): number {
    return this.getOuterArcOuterRadius() + this.outerMargin + this.outerThickness;
  }

  private drawOuterPies(): void {
    // First outer ring
    const arcOuter = d3.arc()
      .innerRadius(this.getOuterArcOuterRadius())
      .outerRadius(this.getOuterArcOuterRadius() - this.outerThickness)
      .padAngle(0.001 * this.tau);

    const pieOuter = this.g.selectAll('.outer')
      .data(this.outer)
      .enter();

    this.drawPieSection(pieOuter, arcOuter, 'outer', 1);

    // Second outer ring
    const arcOuter2 = d3.arc()
      .innerRadius(this.getOuterArc2OuterRadius())
      .outerRadius(this.getOuterArc2OuterRadius() - this.outerThickness)
      .padAngle(0.0009 * this.tau);

    const pieOuter2 = this.g.selectAll('.outer2')
      .data(this.outer2)
      .enter();

    this.drawPieSection(pieOuter2, arcOuter2, 'outer2', 2);
  }

  private drawPieSection(selection: any, arc: any, className: string, layer: number): void {
    selection.append('path')
      .classed(className, true)
      .attr('id', (d: any, i: number) => `${className}Arc_${i}`)
      .style('fill', (d: any) => d.hex)
      .attr('d', arc)
      .each((d: any, i: number) => {
        const labelArc = this.getLabelArc(arc(d), d.startAngle, d.endAngle);

        this.g.append('path')
          .classed('outerLabel', true)
          .attr('class', 'hiddenOuterLabelArcs')
          .attr('id', `outerLayer${layer}LabelArc${i}`)
          .attr('d', labelArc)
          .style('fill', 'none');
      });

    selection.append('text')
      .attr('id', (d: any) => d.name)
      .attr('dy', (d: any) => this.isTextInverted(d) ? -10 : 20)
      .append('textPath')
      .attr('startOffset', '50%')
      .style('text-anchor', 'middle')
      .attr('xlink:href', (d: any, i: number) => `#outerLayer${layer}LabelArc${i}`)
      .text((d: any) => d.name)
      .attr('font-size', `${(12 / 750) * this.w}px`)
      .style('fill', '#000')
      .attr('font-weight', 700);
  }

  private drawOuterColorArcs(): void {
    const arcOuterColorArc_innerRadius = this.getOuterArcOuterRadius();
    const arcOuterColorArc = d3.arc()
      .innerRadius(arcOuterColorArc_innerRadius)
      .outerRadius(arcOuterColorArc_innerRadius + this.outerMargin + 3);

    const arcOuterColorArcStartAngle = -this.tau / this.outerLabels.length / 2;
    const arcOuterColorArcPie = d3.pie()
      .startAngle(arcOuterColorArcStartAngle)
      .endAngle(arcOuterColorArcStartAngle + this.tau)
      .value(() => 1)
      .padAngle(.35)
      .sort(null);

    this.g.selectAll('.outerColor')
      .data(arcOuterColorArcPie(this.outerLabels as any))
      .enter()
      .append('path')
      .attr('class', 'outerColor')
      .attr('id', (d: any, i: number) => `outerColorArc${i}`)
      .style('fill', (d: any) => d.data.hex)
      .attr('d', arcOuterColorArc);
  }
}