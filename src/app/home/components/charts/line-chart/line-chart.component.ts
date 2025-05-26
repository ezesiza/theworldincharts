import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { annotation, annotationLabel, annotationCallout, annotationCalloutCircle, annotationCalloutCurve } from 'd3-svg-annotation';

@Component({
  selector: 'app-d3-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.less'],
})
export class LineChartComponent implements OnInit {
  showAnnotations = false; // Boolean to control annotation visibility
  showDownload: boolean = false;
  isLoading: boolean = true;


  ngOnInit(): void {
    setTimeout(() => (this.isLoading = false), 3000)
    this.createChart();
  }

  destroyChart(svg: any) {
    if (svg && !svg.empty()) {
      svg.attr("width", "0");
      svg.selectAll("*").remove();
    }
  }

  createChart() {
    d3.csv('assets/datasets/bitcoin.csv', d3.autoType)
      .then((data: any) => {
        let svg: any = null;
        const margin = { top: 20, right: 30, bottom: 50, left: 40 };
        const width = 1200;
        const height = 600;

        // Create SVG container
        this.destroyChart(d3.select("#line-chart"));
        svg = d3
          .select('#line-chart')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);


        // X scale
        const x = d3
          .scaleTime()
          .domain(d3.extent(data, (d: any) => d.date) as [Date, Date])
          .range([margin.left, width - margin.right])

        // Y scale
        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d: any) => d.value) as any]).nice()
          .range([height - margin.bottom, margin.top])

        // X axis
        const xAxis = (g: any) => g
          .attr("transform", `translate(0,${height - margin.bottom})`)
          .attr("class", "x-axis")
          .call(d3.axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0));

        const yAxis = (g: any) => g
          .attr("transform", `translate(${margin.left},0)`)
          .attr("class", "y-axis")
          .call(d3.axisLeft(y))
          // .call((g: any) => g.select(".domain").remove())
          .call((g: any) => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data[1].y)
          )

        // // Line generator
        const line = d3
          .line().defined((d: any) => !isNaN(d.value))
          .x((d: any) => x(d.date))
          .y((d: any) => y(d.value));

        svg.append("g")
          .call(xAxis);

        svg.append("g")
          .call(yAxis);

        svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#3172bc")  // Enigma Blue
          .attr("stroke-width", 1.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("d", line)


        // Add annotations
        const annotations = [{
          id: "bitcoin-cash-fork",
          // If you don't provide a custom "type" attribute in your options dictionary, , 
          // the default type in the getAnnotations function will be used.
          note: {
            label: "Bitcoin splits into Bitcoins and Bitcoin Cash",
            title: "08-01-2017"
          },
          data: this.getDateData("1991-12-31T23:00Z", data),
          dx: -15,
          dy: -57,
        }, {
          id: "china-shutdown-exchanges",
          note: {
            label: "China shuts down all crypto exchanges",
            title: "09-15-2017",
          },
          data: this.getDateData("1995-12-31T23:00Z", data),
          dx: -18,
          dy: -50,
        }, {
          id: "segwit-2x-delayed",
          type: annotationCallout, // this type of annotation draws a line under your label.
          note: {
            label: "Segwit2X delayed",
            title: "11-08-2017"
          },
          data: this.getDateData("1985-12-31T23:00Z", data),
          dx: -2,
          dy: 104,
        }, {
          id: "cross-ten-thousand",
          type: annotationCalloutCurve, // this type of annotation lets you used a curved connector.
          note: {
            label: "First time over $10k",
            title: "2000-12-31T23:00Z"
          },
          connector: { // pass the connector an array of points to define your curve.
            points: [
              [-9, -24],
              [-30, -44.6]
            ]
          },
          data: this.getDateData("2005-12-31T23:00Z", data),
          dx: -53,
          dy: -47,
        }, {
          id: "all-time-high",
          note: {
            label: "First time over $20k",
            title: "12-16-2017"
          },
          data: this.getDateData("2010-12-31T23:00Z", data),
          dx: -102,
          dy: 2,
        }, {
          id: "segwit-2x-hard-fork",
          note: {
            label: "Segwit2X hard fork",
            title: "12-29-2017"
          },
          data: this.getDateData("2015-12-31T23:00Z", data),
          dx: -4,
          dy: 89,
        },
        {
          id: "valley-of-uncertainty",
          note: {
            label: "What caused this rapid drop + rebound?",
            title: "Jan - Feb '18"
          },
          color: "#ef4837", // Brighter color to make this annotation stand out
          x: 803,
          y: 336,
          dx: -5,
          dy: 115,
          subject: {
            radius: 52,
            radiusPadding: 5
          },
          type: annotationCalloutCircle  // This annotation refers to an area rather than a point
        },
        ];

        const labels = this.getAnnotations(annotations, x, y, this.parseTime, this.formatTime);
        this.applyAnnotations(labels, svg);
      })
      .catch(error => console.log(error))
  }

  toggleAnnotations() {
    this.showAnnotations = !this.showAnnotations;
    this.createChart();
  }

  setDownload() {
    this.showDownload = !this.showDownload;
  }

  parseTime = d3.isoParse;
  formatTime = d3.isoFormat;

  getDateData(dateString: any, data: any[]) {
    /* 
    Returns the first item in a data whose date property matches the provided dateString
    Args:
       data: an array of data points to filter on
       dateString: a string representing a datetime
    */
    const filtered = data.filter((x: any) => this.daysAreEqual(x.date, this.parseTime(dateString)));

    return {
      date: dateString,
      close: filtered[0].value
    }
  }
  daysAreEqual(dayA: any, dayB: any) {

    /* True if two datetimes occur on the same day */
    return (dayA.getDate() === dayB.getDate() &&
      dayA.getMonth() === dayB.getMonth() &&
      dayA.getFullYear() == dayB.getFullYear())
  }

  applyAnnotations(annotations: any, target: any) {
    /*Draws d3.annotation objects onto a designated DOM node  */
    d3.select(target.node())
      .append("g")
      .attr("class", "annotation-group")
      .call(annotations);

    // return annotations
  }

  getAnnotations(annotationList: any, x: any, y: any, parseTime: any, formatTime: any) {

    console.log(this.showAnnotations);
    /* 
      Return a list of d3.annotation objects
    */
    // reactive hack to force annotations to render whenever the chart is redrawn

    let makeLabelAnnotations = annotation()
      .editMode(this.showAnnotations)          // GLOBAL VARIABLE
      .type(annotationLabel) // Adjust this arg to adjust the default annotation styling.
      .accessors({
        x: (d: any) => x(parseTime(d.date)),
        y: (d: any) => y(d.close)  // If you use a new dataset, you may need to update this accessor.
      })
      .accessorsInverse({
        date: (d: any) => formatTime(x.invert(d.x)),
        close: (d: any) => y.invert(d.y)
      })
      .annotations(annotationList)

    return makeLabelAnnotations
  }
}



