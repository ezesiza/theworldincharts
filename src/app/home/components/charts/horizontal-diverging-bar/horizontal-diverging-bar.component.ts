import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';

interface StateData {
  State: string;
  '2010': number;
  '2019': number;
  value?: number;
}

@Component({
  selector: 'horizontal-diverging-bar',
  templateUrl: './horizontal-diverging-bar.component.html',
  styleUrl: './horizontal-diverging-bar.component.less'
})

export class HorizontalDivergingBarComponent implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() width: number = 800;

  metric: 'absolute' | 'relative' = 'absolute';

  private states: StateData[] = [
    // { State: "California", "2010": 37254523, "2019": 39512223 },
    // { State: "Texas", "2010": 25145561, "2019": 28995881 },
    // { State: "Florida", "2010": 18801310, "2019": 21477737 },
    // { State: "New York", "2010": 19378102, "2019": 19453561 },
    // { State: "Pennsylvania", "2010": 12702379, "2019": 12801989 },
    { State: "Illinois", "2010": 12830632, "2019": 12671821 },
    // { State: "Ohio", "2010": 11536504, "2019": 11689100 },
    // { State: "Georgia", "2010": 9687653, "2019": 10617423 },
    // { State: "North Carolina", "2010": 9535483, "2019": 10488084 },
    // { State: "Michigan", "2010": 9883640, "2019": 9986857 },
    // { State: "New Jersey", "2010": 8791894, "2019": 8882190 },
    { State: "Virginia", "2010": 8001024, "2019": 8535519 },
    // { State: "Washington", "2010": 6724540, "2019": 7614893 },
    // { State: "Arizona", "2010": 6392017, "2019": 7278717 },
    // { State: "Massachusetts", "2010": 6547629, "2019": 6949503 },
    // { State: "Tennessee", "2010": 6346105, "2019": 6833174 },
    { State: "Indiana", "2010": 6483802, "2019": 6732219 },
    { State: "Missouri", "2010": 5988927, "2019": 6137428 },
    { State: "Maryland", "2010": 5773552, "2019": 6045680 },
    { State: "Wisconsin", "2010": 5686986, "2019": 5822434 },
    { State: "Colorado", "2010": 5029196, "2019": 5758736 },
    { State: "Minnesota", "2010": 5303925, "2019": 5639632 },
    { State: "South Carolina", "2010": 4625364, "2019": 5148714 },
    { State: "Alabama", "2010": 4779736, "2019": 4903185 },
    { State: "Louisiana", "2010": 4533372, "2019": 4648794 },
    { State: "Kentucky", "2010": 4339367, "2019": 4467673 },
    { State: "Oregon", "2010": 3831074, "2019": 4217737 },
    { State: "Oklahoma", "2010": 3751351, "2019": 3956971 },
    { State: "Connecticut", "2010": 3574097, "2019": 3565287 },
    { State: "Utah", "2010": 2763885, "2019": 3205958 },
    { State: "Puerto Rico", "2010": 3725789, "2019": 3193694 },
    // { State: "Iowa", "2010": 3046355, "2019": 3155070 },
    // { State: "Nevada", "2010": 2700551, "2019": 3080156 },
    // { State: "Arkansas", "2010": 2915918, "2019": 3017825 },
    // { State: "Mississippi", "2010": 2967297, "2019": 2976149 },
    // { State: "Kansas", "2010": 2853118, "2019": 2913314 },
    // { State: "New Mexico", "2010": 2059179, "2019": 2096829 },
    // { State: "Nebraska", "2010": 1826341, "2019": 1934408 },
    // { State: "West Virginia", "2010": 1852994, "2019": 1792065 },
    // { State: "Idaho", "2010": 1567582, "2019": 1787147 },
    // { State: "Hawaii", "2010": 1360301, "2019": 1415872 },
    // { State: "New Hampshire", "2010": 1316470, "2019": 1359711 },
    // { State: "Maine", "2010": 1328361, "2019": 1344212 },
    // { State: "Montana", "2010": 989415, "2019": 1068778 },
    // { State: "Rhode Island", "2010": 1052567, "2019": 1059361 },
    // { State: "Delaware", "2010": 897934, "2019": 973764 },
    // { State: "South Dakota", "2010": 814180, "2019": 884659 },
    // { State: "North Dakota", "2010": 672591, "2019": 762062 },
    // { State: "Alaska", "2010": 710231, "2019": 731545 },
    // { State: "District of Columbia", "2010": 601723, "2019": 705749 },
    // { State: "Vermont", "2010": 625741, "2019": 623989 },
    // { State: "Wyoming", "2010": 563626, "2019": 578759 }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.createChart();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }


  updateChart(): void {
    // Clear existing chart
    d3.select(this.chartContainer.nativeElement).selectAll("*").remove();
    this.createChart();
  }

  private createChart(): void {
    // Prepare data based on selected metric
    const data = d3.sort(this.states, d => d["2019"] - d["2010"])
      .map((d) => ({
        ...d,
        value: this.metric === "absolute" ?
          d["2019"] - d["2010"] :
          (d["2019"] - d["2010"]) / d["2010"]
      }));

    // Chart dimensions
    const barHeight = 25;
    const marginTop = 30;
    const marginRight = 60;
    const marginBottom = 10;
    const marginLeft = 60;
    const height = Math.ceil((data.length + 0.1) * barHeight) + marginTop + marginBottom;

    // Create scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.value) as [number, number])
      .rangeRound([marginLeft, this.width - marginRight]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.State))
      .rangeRound([marginTop, height - marginBottom])
      .padding(0.1);

    // Format functions
    const format = d3.format(this.metric === "absolute" ? "+,d" : "+.1%");
    const tickFormat = this.metric === "absolute" ?
      d3.formatPrefix("+.1", 1e6) :
      d3.format("+.0%");

    // Create SVG
    const svg = d3.select(this.chartContainer.nativeElement)
      .append("svg")
      .attr("viewBox", [0, 0, this.width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Add bars
    svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("fill", (d) => d3.schemeRdBu[3][d.value! > 0 ? 2 : 0])
      .attr("x", (d) => x(Math.min(d.value!, 0)))
      .attr("y", (d) => y(d.State)!)
      .attr("width", d => Math.abs(x(d.value!) - x(0)))
      .attr("height", y.bandwidth());

    // Add value labels
    svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("text-anchor", d => d.value! < 0 ? "end" : "start")
      .attr("x", (d) => x(d.value!) + Math.sign(d.value! - 0) * 4)
      .attr("y", (d) => y(d.State)! + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .text(d => format(d.value!));

    // Add top axis and grid lines
    svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(d3.axisTop(x).ticks(this.width / 80).tickFormat(tickFormat))
      .call(g => g.selectAll(".tick line").clone()
        .attr("y2", height - marginTop - marginBottom)
        .attr("stroke-opacity", 0.1))
      .call(g => g.select(".domain").remove());

    // Add left axis (state names)
    svg.append("g")
      .attr("transform", `translate(${x(0)},0)`)
      .call(d3.axisLeft(y).tickSize(0).tickPadding(6))
      .call(g => g.selectAll(".tick text")
        .filter((d, i) => data[i].value! < 0)
        .attr("text-anchor", "start")
        .attr("x", 6));
  }
}
