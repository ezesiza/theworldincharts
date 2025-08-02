import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import * as migrationtable from './../../../../../assets/datasets/migrationtable.json';
import * as worldData from './../../../../../assets/datasets/world.json';

interface DisplacementData {
  Country: string;
  Type: string;
  'Total Displacements': number;
  Population: number;
  Text: string;
  dotCoords?: [number, number];
  ISO2FlagCode?: string;
}

interface DisasterGroup {
  disaster: string;
  countryCount: number;
  data: DisplacementData[];
  totalDisplacements: number;
  populationShift: number;
  accumulativeTotal?: number;
}

interface ColorIcon {
  color: string;
  icon: string;
}

@Component({
  selector: 'world-vizualizer',
  templateUrl: './world-vizualizer.component.html',
  styleUrls: ['./world-vizualizer.component.less']
})
export class WorldVizualizerComponent implements OnInit, OnDestroy {
  @ViewChild('chartSvg', { static: true }) chartSvg!: ElementRef<SVGSVGElement>;

  @Input() migrationData: any = migrationtable['default' as any];
  @Input() worldTopology: any = null;
  @Input() countriesData: any[] = [];

  selectedMetric: 'totalDisplacements' | 'populationShift' = 'totalDisplacements';

  // Chart dimensions and configuration
  private width = 1100;
  private height = this.width * 0.4;
  private mapWidth = this.width * 0.35;
  private mapHeight = this.height / 2;
  private circleRadius = 16;

  private margin = {
    top: 80,
    right: 10,
    bottom: 40,
    left: 30,
    circle: 20,
    countryBars: this.width * 0.6
  };

  private colorAndIcons: Record<string, ColorIcon> = {
    earthquake: { color: "#de2d26", icon: "\ue3b1" },
    wildfires: { color: "#fc4e2a", icon: "\uf06d" },
    "severe storm": { color: "#2171b5", icon: "\uf76c" },
    "tropical storm": { color: "#08306b", icon: "\uf751" },
    drought: { color: "#6baed6", icon: "\ue57a" },
    "volcanic activity": { color: "#a50f15", icon: "\uf770" },
    "harsh winter conditions": { color: "#9ecae1", icon: "\uf2dc" },
    multiple: { color: "#feb24c", icon: "\uf0e9" }
  };

  private countryMapper: Record<string, string> = {
    "Antigua and Barbuda": "Antigua and Barb.",
    "Bolivia (Plurinational State of)": "Bolivia",
    "Dominican Republic": "Dominican Rep.",
    "Iran (Islamic Republic of)": "Iran",
    "Republic of Korea": "South Korea",
    "Saint Vincent and the Grenadines": "St. Vin. and Gren.",
    "Solomon Islands": "Solomon Is.",
    "Türkiye": "Turkey",
    "United Republic of Tanzania": "Tanzania",
    "United States": "United States of America",
    "Viet Nam": "Vietnam"
  };

  private axisLabelMapper = {
    totalDisplacements: "Total Displacements",
    populationShift: "Population Change",
    countryCount: "Countries"
  };

  private dataFormat = {
    totalDisplacements: ".1s",
    populationShift: ".1%",
    countryCount: ".1s"
  };

  // D3 objects
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private projection!: d3.GeoProjection;
  private path!: d3.GeoPath;
  private countries: any;
  private disasterGroups: DisasterGroup[] = [];
  private countryBarData: DisplacementData[] = [];

  ngOnInit(): void {
    setTimeout(() => {
      this.initializeVisualization();
    }, 100)
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or timers if needed
  }

  onMetricChange(): void {
    this.updateVisualization();
  }

  private async initializeVisualization() {
    if (!this.worldTopology) {
      // Load world topology if not provided
      this.worldTopology = await this.loadWorldTopology();
    }

    this.setupD3Objects();
    this.processData();
    this.createVisualization();
  }

  private async loadWorldTopology(): Promise<any> {
    // try {
    //     // You would need to provide the world topology JSON file
    //     // For now, returning a placeholder
    //     console.warn('World topology not provided. Please pass worldTopology as input.');
    //     return null;
    // } catch (error) {
    //     console.error('Error loading world topology:', error);
    //     return null;
    // }

    return worldData;
  }

  private async loadMigrationTable(): Promise<any> {
    return migrationtable
  }

  private setupD3Objects(): void {
    this.svg = d3.select(this.chartSvg.nativeElement);

    if (this.worldTopology) {
      // Filter out Antarctica
      const filteredCountries = this.worldTopology.objects.countries.geometries.filter(
        (f: any) => f.properties.name !== "Antarctica"
      );
      this.worldTopology.objects.countries.geometries = filteredCountries;

      this.countries = topojson.feature(
        this.worldTopology,
        this.worldTopology.objects.countries
      );

      this.projection = d3.geoMercator().fitSize([this.mapWidth, this.mapHeight * 1.2], this.countries);
      this.path = d3.geoPath(this.projection);
    }
  }

  private processData(): void {
    this.loadMigrationTable().then(res => {
      console.log(res.default);
    })
    if (!this.migrationData || this.migrationData.length === 0) {
      console.warn('No migration data provided');
      return;
    }

    // Group data by disaster type
    this.disasterGroups = Array.from(d3.group(this.migrationData, (d: any) => d.Type))
      .map(([disaster, data]) => ({
        disaster,
        countryCount: data.length,
        data,
        totalDisplacements: d3.sum(data, (d: any) => +d['Total Displacements']),
        populationShift: d3.sum(data, (d: any) => +d['Total Displacements']) / d3.sum(data, (d: any) => +d.Population)
      }))
      .sort((a, b) => d3.ascending(a[this.selectedMetric], b[this.selectedMetric])) as any;

    // Process country bar data
    this.countryBarData = this.migrationData.map((entry: any) => {
      const newEntry = { ...entry };
      const countryName = this.countryMapper[newEntry.Country] || newEntry.Country;

      if (this.countries) {
        const countryFeature = this.countries.features.find(
          (f: any) => f.properties.name === countryName
        );

        if (countryFeature) {
          newEntry.dotCoords = this.path.centroid(countryFeature);

          // Find ISO2 code if countries data is available
          if (this.countriesData.length > 0) {
            const countryInfo = this.countriesData.find(
              (c: any) => c['Numeric code'] === +countryFeature.id
            );
            if (countryInfo) {
              newEntry.ISO2FlagCode = countryInfo['Alpha-2 code'].toLowerCase();
            }
          }
        }
      }

      return newEntry;
    });
  }

  private createVisualization(): void {
    this.svg.selectAll("*").remove();

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    this.setupAxes();
    this.createArcChart();
    this.createMap();
    this.createLabelsAndLegend();
    this.drawCountryBarsAndDots(this.countryBarData, 0);
  }

  private updateVisualization(): void {
    // Reprocess data with new metric
    this.processData();

    // Update the visualization
    this.createVisualization();
  }

  private setupAxes(): void {
    const yAxis = this.svg.append("g").attr("pointer-events", "none");
    // Store reference for later use in other methods
    (this.svg.node() as any).__yAxis = yAxis;
  }

  private createArcChart(): void {
    const radius = (this.height - this.margin.top - this.margin.bottom) / 2;
    const arcTotal = d3.sum(this.disasterGroups, (s) => s[this.selectedMetric]);
    const maxValue = d3.max(this.disasterGroups, (d) => d[this.selectedMetric]) || 0;
    const innerRadius = radius * 0.2;

    let accumulativeTotal = 0;
    const chartData = this.disasterGroups.map(dataEntry => {
      dataEntry.accumulativeTotal = accumulativeTotal;
      accumulativeTotal += dataEntry[this.selectedMetric];
      return dataEntry;
    });

    const xScale = d3.scaleLinear()
      .domain([0, arcTotal])
      .range([0, Math.PI * 2]);

    const radiusScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([innerRadius, radius]);

    const arc = d3.arc<DisasterGroup>()
      .innerRadius(innerRadius)
      .outerRadius((d) => radiusScale(d[this.selectedMetric]))
      .startAngle((d) => xScale(d.accumulativeTotal || 0))
      .endAngle((d) => xScale((d.accumulativeTotal || 0) + d[this.selectedMetric]));

    const disastersGroup = this.svg
      .selectAll(".disastersGroup")
      .data(chartData)
      .join("g")
      .attr("class", "disastersGroup")
      .attr("cursor", "pointer")
      .attr("id", (d) => d.disaster.replace(/ /g, "")) as any;

    // Add arc paths
    disastersGroup
      .append("path")
      .attr("class", "arcPath")
      .attr("fill", (d: any) => this.colorAndIcons[d.disaster]?.color || "#ccc")
      .attr("stroke-width", 0)
      .attr("d", arc)
      .attr("transform", `translate(${this.margin.left + radius},${this.margin.top + radius - this.circleRadius / 2})`);

    // Add legend circles
    disastersGroup
      .append("circle")
      .attr("class", "disasterCircle")
      .attr("cx", this.margin.left + radius * 2 + this.margin.circle + this.circleRadius)
      .attr("cy", (d: any, i: any) => this.margin.top + this.circleRadius + i * (this.circleRadius * 2 + 5))
      .attr("fill", (d: any) => this.colorAndIcons[d.disaster]?.color || "#ccc")
      .attr("r", this.circleRadius);

    // Add legend icons
    disastersGroup
      .append("text")
      .attr("class", "fa fa-solid disasterIcon")
      .attr("text-anchor", "middle")
      .attr("font-size", 16)
      .attr("fill", "white")
      .attr("x", this.margin.left + radius * 2 + this.margin.circle + this.circleRadius)
      .attr("y", (d: any, i: any) => this.margin.top + this.circleRadius + i * (this.circleRadius * 2 + 5) + 5.5)
      .text((d: any) => this.colorAndIcons[d.disaster]?.icon || "");

    // Add legend labels
    disastersGroup
      .append("text")
      .attr("class", "disasterLabel")
      .attr("x", this.margin.left + radius * 2 + this.margin.circle + this.circleRadius * 2 + 5)
      .attr("y", (d: any, i: any) => this.margin.top + this.circleRadius + i * (this.circleRadius * 2 + 5) + 5)
      .attr("fill", "#4d4d4d")
      .attr("font-size", 14)
      .text((d: any) => d.disaster.toUpperCase());

    // Add event handlers
    this.addArcEventHandlers(disastersGroup);
  }

  private createMap(): void {
    if (!this.countries) return;

    const clipPathSvg = this.svg
      .append("g")
      .attr("clip-path", "url(#mapClipPath)")
      .attr("transform", `translate(${this.width - this.mapWidth - this.margin.right},${20})`);

    const mapSvg = clipPathSvg.append("g");
    (this.svg.node() as any).__mapSvg = mapSvg;

    // Add clip path
    this.svg
      .append("clipPath")
      .attr("id", "mapClipPath")
      .append("rect")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("width", this.mapWidth)
      .attr("height", this.mapHeight);

    // Add map border
    this.svg
      .append("rect")
      .attr("fill", "none")
      .attr("pointer-events", "none")
      .attr("stroke", "#D0D0D0")
      .attr("stroke-width", 0.5)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("width", this.mapWidth)
      .attr("height", this.mapHeight)
      .attr("transform", `translate(${this.width - this.mapWidth - this.margin.right},${20})`);

    // Add countries
    const countryGroup = mapSvg
      .selectAll(".countryGroup")
      .data(this.countries.features)
      .join("g")
      .attr("class", "countryGroup")
      .attr("transform", `translate(0,${-this.mapHeight * 0.2})`);

    countryGroup
      .append("path")
      .attr("class", "countryPath")
      .attr("fill", "#F0F0F0")
      .attr("d", this.path as any);
  }

  private createLabelsAndLegend(): void {
    // Add logo placeholder
    this.svg
      .append("rect")
      .attr("width", 200)
      .attr("height", 52)
      .attr("x", 0)
      .attr("y", this.height - 52)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#ccc")
      .attr("pointer-events", "none");

    // Add title
    this.svg
      .append("text")
      .attr("x", 10)
      .attr("y", 30)
      .attr("font-size", 28)
      .attr("fill", "#4d4d4d")
      .text("2023 Disaster Hotspots")
      .attr("pointer-events", "none");

    // Add source
    this.svg
      .append("text")
      .attr("x", 10)
      .attr("y", 50)
      .attr("font-size", 12)
      .attr("fill", "#A0A0A0")
      .text("Source: UN State of the World's Children dataset, Internal Displacements due to Disaster")
      .attr("pointer-events", "none");

    // Add country count
    this.svg
      .append("text")
      .attr("class", "countryCount")
      .attr("x", this.width - 10)
      .attr("y", 15)
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .attr("fill", "#A0A0A0")
      .text(`${this.migrationData.length} Countries`)
      .attr("pointer-events", "none");

    // Add axis label
    this.svg
      .append("text")
      .attr("x", this.margin.countryBars - this.circleRadius - 5)
      .attr("y", this.height - this.margin.bottom + 25)
      .attr("font-size", 16)
      .attr("text-anchor", "end")
      .attr("fill", "#A0A0A0")
      .text(this.axisLabelMapper[this.selectedMetric])
      .attr("pointer-events", "none");

    // Add country text area
    this.svg
      .append("text")
      .attr("class", "countryText")
      .attr("pointer-events", "none")
      .attr("transform", `translate(${this.margin.countryBars + this.width * 0.195},${this.height * 0.75})`)
      .attr("dy", 0)
      .attr("text-anchor", "middle")
      .attr("font-size", 16)
      .attr("fill", "white");

    // Add bar group
    this.svg.append("g").attr("class", "barGroup");
  }

  private addArcEventHandlers(disastersGroup: d3.Selection<SVGGElement, DisasterGroup, SVGSVGElement, unknown>): void {
    const mapSvg = (this.svg.node() as any).__mapSvg;
    const yAxis = (this.svg.node() as any).__yAxis;

    disastersGroup
      .on("mouseover", (event, d) => {
        this.svg.selectAll(".disastersGroup").attr("opacity", 0.2);
        d3.select(event.currentTarget).attr("opacity", 1);

        const filteredData = this.countryBarData.filter(f => f.Type === d.disaster);
        this.drawCountryBarsAndDots(filteredData, 500);
      })
      .on("mouseout", (event, d) => {
        this.svg.selectAll(".disastersGroup").attr("opacity", 1);
        this.drawCountryBarsAndDots(this.countryBarData, 500);
      });
  }

  private drawCountryBarsAndDots(filteredCountryData: DisplacementData[], transitionTime: number): void {
    const mapSvg = (this.svg.node() as any).__mapSvg;

    if (!mapSvg) return;

    // Update country count and text
    if (filteredCountryData.length === 1) {
      this.svg.select(".countryCount").text("");
      this.addCountryText(filteredCountryData[0].Text || "");
    } else {
      this.addCountryText("");
      this.svg.select(".countryCount").text(`${filteredCountryData.length} Countries`);
    }

    // Draw data dots on map
    const dataDots = mapSvg
      .selectAll(".dataDots")
      .data(filteredCountryData)
      .join("g")
      .attr("class", "dataDots")
      .attr("cursor", "pointer")
      .attr("transform", `translate(0,${-this.mapHeight * 0.2})`);

    dataDots
      .selectAll("circle")
      .data((d: any) => [d])
      .join("circle")
      .attr("class", "dataDot")
      .attr("id", (d: any) => d.Country.replace(/ /g, ""))
      .attr("r", filteredCountryData.length === 1 ? 6 : 3)
      .attr("cx", (d: any) => d.dotCoords?.[0] || 0)
      .attr("cy", (d: any) => d.dotCoords?.[1] || 0)
      .attr("fill", (d: any) => this.colorAndIcons[d.Type]?.color || "#ccc")
      .attr("stroke-width", 0);

    // Add dot event handlers
    this.addDotEventHandlers(dataDots, filteredCountryData);

    // Draw country bars
    this.drawCountryBars(filteredCountryData, transitionTime);
  }

  private addDotEventHandlers(dataDots: d3.Selection<SVGGElement, DisplacementData, any, unknown>, filteredCountryData: DisplacementData[]): void {
    dataDots
      .on("mouseover", (event, d) => {
        this.svg.selectAll(".disastersGroup").attr("opacity", 0.2);
        const mapSvg = (this.svg.node() as any).__mapSvg;
        mapSvg.selectAll(".dataDot").attr("r", 0);
        d3.select(event.currentTarget).select(".dataDot").attr("r", 6);
        d3.select(`#${d.Type.replace(/ /g, "")}`).attr("opacity", 1);

        const countryData = filteredCountryData.filter(f => f.Country === d.Country);
        this.drawCountryBars(countryData, 500);
        this.addCountryText(d.Text || "");
      })
      .on("mouseout", (event, d) => {
        const mapSvg = (this.svg.node() as any).__mapSvg;
        mapSvg.selectAll(".dataDot").attr("r", 3);
        this.svg.selectAll(".disastersGroup").attr("opacity", 1);
        this.drawCountryBars(filteredCountryData, 500);
        this.addCountryText("");
      });
  }

  private drawCountryBars(filteredCountryData: DisplacementData[], transitionTime: number): void {
    const getBarYVal = (d: DisplacementData) => {
      if (this.selectedMetric === "totalDisplacements") return d["Total Displacements"];
      return d["Total Displacements"] / d["Population"];
    };

    const sortedData = [...filteredCountryData].sort((a, b) =>
      d3.descending(getBarYVal(a), getBarYVal(b))
    );

    const countryBarMax = d3.max(sortedData, (d) => getBarYVal(d)) || 0;

    const countryBandScale = d3
      .scaleBand()
      .paddingInner(0.1)
      .domain(sortedData.map(m => m.Country))
      .range([0, this.width - this.margin.countryBars - this.margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([countryBarMax, 0])
      .range([0, this.height / 4]);

    // Update y-axis
    const yAxis = (this.svg.node() as any).__yAxis;
    if (yAxis) {
      yAxis
        .call(
          d3.axisLeft(yScale)
            .tickSizeOuter(0)
            .ticks(sortedData.length <= 2 ? 2 : 4)
        )
        .attr("transform", `translate(${this.margin.countryBars},${this.height * 0.75 - this.margin.bottom})`);

      const currentDataFormat = d3.format(this.dataFormat[this.selectedMetric]);

      yAxis
        .selectAll("text")
        .attr("font-size", 12)
        .attr("x", -5)
        .text((d: any) => d === 0 ? "" : currentDataFormat(d));

      yAxis.selectAll("line").attr("display", "none");
      yAxis.selectAll("path").attr("stroke", "#D0D0D0");
    }

    // Draw bars
    const countryBarGroup = this.svg
      .select(".barGroup")
      .selectAll(".countryBarGroup")
      .data(sortedData, (d: any) => d.Country)
      .join("g")
      .attr("class", "countryBarGroup")
      .attr("transform", `translate(${this.margin.countryBars},${this.mapHeight + 70})`) as any;

    // Add bar rectangles
    countryBarGroup
      .selectAll(".countryBar")
      .data((d: any) => [d])
      .join("rect")
      .attr("class", "countryBar")
      .attr("fill", (d: { Type: string | number; }) => this.colorAndIcons[d.Type]?.color || "#ccc")
      .attr("width", countryBandScale.bandwidth())
      .attr("x", (d: { Country: string; }) => countryBandScale(d.Country) || 0)
      .transition()
      .duration(transitionTime)
      .attr("height", (d: DisplacementData) => yScale(0) - yScale(getBarYVal(d)))
      .attr("y", (d: DisplacementData) => yScale(getBarYVal(d)));

    // Add country flags and labels (simplified)
    this.addCountryLabelsAndFlags(countryBarGroup, sortedData, countryBandScale, yScale, getBarYVal, transitionTime);
  }

  private addCountryLabelsAndFlags(
    countryBarGroup: d3.Selection<SVGGElement, DisplacementData, SVGGElement, unknown>,
    sortedData: DisplacementData[],
    countryBandScale: d3.ScaleBand<string>,
    yScale: d3.ScaleLinear<number, number, never>,
    getBarYVal: (d: DisplacementData) => number,
    transitionTime: number
  ): void {
    const labelDataFormat = this.selectedMetric === "populationShift" ? d3.format(".2%") : d3.format(",");

    // Add country labels
    countryBarGroup
      .selectAll(".countryLabel")
      .data(d => [d])
      .join("text")
      .attr("class", "countryLabel")
      .attr("pointer-events", "none")
      .attr("visibility", "hidden")
      .attr("x", (d) => (countryBandScale(d.Country) || 0) + countryBandScale.bandwidth() / 2)
      .attr("y", (d) => yScale(getBarYVal(d)) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 18)
      .text((d) => `${d.Country} - ${labelDataFormat(getBarYVal(d))}`);

    // Add flag circles (simplified - using colored circles instead of actual flags)
    countryBarGroup
      .selectAll(".countryCircle")
      .data(d => [d])
      .join("circle")
      .attr("class", "countryCircle")
      .attr("pointer-events", "none")
      .attr("visibility", "hidden")
      .attr("r", this.circleRadius)
      .attr("fill", (d) => this.colorAndIcons[d.Type]?.color || "#ccc")
      .attr("cx", (d) => (countryBandScale(d.Country) || 0) + countryBandScale.bandwidth() / 2)
      .attr("cy", () => yScale(0) + 5 + this.circleRadius);
  }

  private addCountryText(contents: string): void {
    const countryText = this.svg.select(".countryText");
    countryText.selectAll("tspan").remove();

    if (contents) {
      countryText.text(contents);
      // Note: wrap function would need to be implemented for text wrapping
    } else {
      countryText.text("");
    }
  }

  private measureWidth(text: string, fontSize: number): number {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      context.font = `${fontSize}px Arial`;
      return context.measureText(text).width;
    }
    return 0;
  }

  private getSet(dataset: any[], setVar: string): any {
    return Array.from(
      dataset.reduce((acc, dataEntry) => {
        acc.add(dataEntry[setVar]);
        return acc;
      }, new Set())
    ).sort((a, b) => d3.ascending(a as any, b as any));
  }
}