import { Component, AfterViewInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrl: './matrix.component.less'
})
export class MatrixComponent implements AfterViewInit {
  matrixLoading = true;
  rawdata = `Candidate,Company,Z,Network Security,Incident Response,Penetration Testing,Cloud Security,Application Security,Compliance,Threat Intelligence,Key Skill\n` +
    this.generateCyberSecurityData();

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.matrixLoading = false;
      this.createMatrixChart();
    });
  }

  private generateCyberSecurityData(): string {
    // List of company names
    const companies = [
      'CyberGuard', 'NetDefend', 'SecureWave', 'FireWallX', 'CryptoSafe',
      'ThreatLock', 'InfoSec Solutions', 'RedShield', 'BlueVector', 'DarkTrace'
    ];
    // List of industries for the Company column
    const industries = [
      'Finance', 'Healthcare', 'Retail', 'Energy', 'Telecom',
      'Education', 'Government', 'Technology', 'Manufacturing', 'Logistics'
    ];
    // Helper to get a random float between min and max
    const rand = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);
    // Helper to get a random int between min and max
    const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    let csv = '';
    for (let i = 0; i < companies.length; i++) {
      const candidate = companies[i];
      const company = industries[i];
      const Z = rand(7.5, 9.5);
      const NetworkSecurity = randInt(3, 5);
      const IncidentResponse = randInt(3, 5);
      const PenetrationTesting = randInt(3, 5);
      const CloudSecurity = randInt(3, 5);
      const ApplicationSecurity = randInt(3, 5);
      const Compliance = randInt(3, 5);
      const ThreatIntelligence = randInt(3, 5);
      // Key Skill is the average of the above
      const keySkill = (
        NetworkSecurity + IncidentResponse + PenetrationTesting + CloudSecurity +
        ApplicationSecurity + Compliance + ThreatIntelligence
      ) / 7;
      csv += `${candidate},${company},${Z},${NetworkSecurity},${IncidentResponse},${PenetrationTesting},${CloudSecurity},${ApplicationSecurity},${Compliance},${ThreatIntelligence},${keySkill.toFixed(2)}\n`;
    }
    return csv;
  }

  createMatrixChart() {
    const c1w = 130,
      c2w = 80,
      c3w = 40,
      r1h = 150,
      w = 600,
      h = w,
      pad = 20,
      leftpad = 50;

    // Remove any previous SVG
    d3.select(this.el.nativeElement).select('#matrixChart').selectAll('svg').remove();

    const svg = d3.select(this.el.nativeElement).select('#matrixChart')
      .append('svg')
      .attr('width', c1w + c2w + c3w + w + pad + 30)
      .attr('height', r1h + h);

    const tabdata = d3.csvParse(this.rawdata);
    const traits = tabdata.columns.filter(x => !(x in { "Z": 0, "Key Skill": 0, "Company": 0, "Candidate": 0 }));
    const candidates = tabdata.map(r => r["Candidate"]);

    const rowdata = [];
    for (const row of tabdata) {
      for (const prop of traits) {
        rowdata.push({
          name: row["Candidate"],
          prop: prop,
          value: +row[prop]
        });
      }
    }

    const xstep = (w - pad - leftpad) / (traits.length + 1),
      ystep = ((h - pad * 2) - pad) / (candidates.length + 1),
      xrange = traits.map((v, i) => c1w + c2w + c3w + leftpad + ((1 + xstep) * i)),
      yrange = candidates.map((v, i) => r1h + pad + ((1 + ystep) * i)),
      x = d3.scaleOrdinal(traits, xrange),
      y = d3.scaleOrdinal(candidates, yrange);

    const maxr = 5,
      r = d3.scaleLinear()
        .domain([0, maxr])
        .range([0, 16]);

    const classinate = (t: string) => (t ? t.replace(/\s+/gi, "") : "");
    const opacity = (m: string) => (m in { "Managed Money": 0, "Location": 0 }) ? "0.5" : (m in { "Municipal": 0 }) ? "0.3" : "1.0";

    const onMouseOver = (d: any) => {
      const name = classinate(d["name"]);
      const prop = classinate(d["prop"]);

      if (prop) svg.selectAll(`text.label.${prop}`).attr("display", "block");
      if (name) svg.selectAll(`text.label.${name}`).attr("display", "block");
    };

    const onMouseOut = (d: any) => {
      if (!d["name"] || !d["prop"]) {
        console.warn("onMouseOut: missing name or prop", d);
      }
      const name = classinate(d["name"]);
      const prop = classinate(d["prop"]);
      if (prop) svg.selectAll(`text.label.${prop}`).attr("display", "none");
      if (name) svg.selectAll(`text.label.${name}`).attr("display", "none");
    };

    const circlegroups = svg.selectAll("g.cgroup")
      .data(rowdata, (d: any, i: number) => `cgroup${i}`)
      .enter()
      .append("g")
      .attr("class", "cgroup")
      .attr("opacity", (d: any) => opacity(d["prop"]))
      .on("mouseleave", function (event: any, d: any) { onMouseOut(d); })
      .on("mouseenter", function (event: any, d: any) { onMouseOver(d); });

    const circles = circlegroups.append("circle")
      .attr("class", (d: any) => "circle " + classinate(d["prop"]) + " " + classinate(d["name"]))
      .attr("cx", (d: any) => x(d["prop"]))
      .attr("cy", (d: any) => y(d["name"]));

    circlegroups.append("text")
      .attr("class", (d: any) => "label " + classinate(d["prop"]) + " " + classinate(d["name"]))
      .attr("display", "none")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("stroke", "black")
      .attr("fill", "black")
      .attr("stroke-width", "1px")
      .attr("x", (d: any) => x(d["prop"]))
      .attr("y", (d: any) => y(d["name"]))
      .text((d: any) => d["value"]);

    // Z circles
    const zx = c1w + (c2w / 2);
    const zcirclegroups = svg.selectAll("g.zcgroup")
      .data(tabdata, (d: any, i: number) => `zcgroup${i}`)
      .enter()
      .append("g")
      .attr("class", "zcgroup")
      .on("mouseleave", function (event: any, d: any) { d["name"] = d["Candidate"]; d["prop"] = "Z-Score"; onMouseOut(d); })
      .on("mouseenter", function (event: any, d: any) { d["name"] = d["Candidate"]; d["prop"] = "Z-Score"; onMouseOver(d); });

    const zcircles = zcirclegroups.append("circle")
      .attr("class", (d: any) => "zcircle " + classinate("Z-Score") + " " + classinate(d["Candidate"]))
      .attr("cx", (d: any) => zx)
      .attr("cy", (d: any) => y(d["Candidate"]));

    zcirclegroups.append("text")
      .attr("class", (d: any) => "label " + classinate("Z-Score") + " " + classinate(d["Candidate"]))
      .attr("display", "none")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("stroke", "black")
      .attr("fill", "black")
      .attr("stroke-width", "1px")
      .attr("x", (d: any) => zx)
      .attr("y", (d: any) => y(d["Candidate"]))
      .text((d: any) => d["Z"]);

    // Key Skill circles
    const kx = c1w + c2w + (c3w / 2);
    const kcirclegroups = svg.selectAll("g.kcgroup")
      .data(tabdata, (d: any, i: number) => `kcgroup${i}`)
      .enter()
      .append("g")
      .attr("class", "kcgroup")
      .on("mouseleave", function (event: any, d: any) { d["name"] = d["Candidate"]; d["prop"] = "Key Skill"; onMouseOut(d); })
      .on("mouseenter", function (event: any, d: any) { d["name"] = d["Candidate"]; d["prop"] = "Key Skill"; onMouseOver(d); });

    const kcircles = kcirclegroups.append("circle")
      .attr("class", (d: any) => "kcircle " + classinate("Key Skill") + " " + classinate(d["Candidate"]))
      .attr("cx", (d: any) => kx)
      .attr("cy", (d: any) => y(d["Candidate"]));

    kcirclegroups.append("text")
      .attr("class", (d: any) => "label " + classinate("Key Skill") + " " + classinate(d["Candidate"]))
      .attr("display", "none")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("stroke", "black")
      .attr("fill", "black")
      .attr("stroke-width", "1px")
      .attr("x", (d: any) => kx)
      .attr("y", (d: any) => y(d["Candidate"]))
      .text((d: any) => d["Key Skill"]);

    // Trait labels
    svg.selectAll("text.trait")
      .data(traits)
      .enter()
      .append("text")
      .attr("class", (d: any) => "trait " + classinate(d))
      .attr("x", (d: any) => x(d))
      .attr("y", r1h - 10)
      .attr("font-size", "14px")
      .attr("stroke", "black")
      .attr("fill", "black")
      .attr("stroke-width", "1px")
      .attr("opacity", (d: any) => opacity(d))
      .attr("transform", (d: any) => `rotate(-40 ${x(d)},${r1h - 10})`)
      .text((d: any) => d);

    svg.append("text")
      .attr("class", "trait " + classinate("Z-Score"))
      .attr("x", zx)
      .attr("y", r1h - 10)
      .attr("font-size", "14px")
      .attr("stroke", "black")
      .attr("fill", "black")
      .attr("stroke-width", "1px")
      .attr("opacity", (d: any) => opacity(d))
      .attr("transform", `rotate(-40 ${zx},${r1h - 10})`)
      .text("Z-Score");

    svg.append("text")
      .attr("class", "trait " + classinate("Key Skill"))
      .attr("x", kx)
      .attr("y", r1h - 10)
      .attr("font-size", "14px")
      .attr("stroke", "black")
      .attr("fill", "black")
      .attr("stroke-width", "1px")
      .attr("opacity", (d: any) => opacity(d))
      .attr("transform", `rotate(-40 ${kx},${r1h - 10})`)
      .text("Key Skill");

    // Candidate labels
    svg.selectAll("text.candidate")
      .data(candidates)
      .enter()
      .append("text")
      .attr("class", "candidate")
      .attr("x", 10)
      .attr("y", (d: any) => y(d))
      .attr("font-size", "14px")
      .attr("stroke", "black")
      .attr("fill", "black")
      .attr("stroke-width", "1px")
      .text((d: any) => d);

    // Animate circles
    circles.transition()
      .duration(800)
      .attr("r", (d: any) => r(d["value"]))
      .attr("fill", (d: any) => d3.interpolateRdYlGn(d["value"] / 7));

    kcircles.transition()
      .duration(1600)
      .attr("r", (d: any) => r(d["Key Skill"]))
      .attr("fill", (d: any) => d3.interpolateRdYlGn(d["Key Skill"] / 7));

    zcircles.transition()
      .duration(2400)
      .attr("r", (d: any) => r(d["Z"]) / 2)
      .attr("fill", (d: any) => d3.interpolateRdBu(d["Z"] / 12));
  }
}
