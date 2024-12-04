import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'radial-donut-chart',
  templateUrl: 'radial-donut-chart.component.html',
  styleUrls: ['./radial-donut-chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadialDonutChartComponent implements OnInit {
  svg: any;
  margin = 0;
  width = 600;
  height = 600;
  maxBarHeight = this.height / 2 - (this.margin + 70);
  innerRadius = 0.1 * this.maxBarHeight; // innermost circle

  ngOnInit() {
    this.initChart();
    d3.csv('assets/datasets/intent-index.csv', d3.autoType)
      .then((data: any) => {
        this.renderChart(data);
      })
      .catch(error => console.log(error))
  }

  initChart() {
    this.svg = d3.select('body')
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr("class", "chart")
      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    const defs = this.svg.append("defs");

    let gradients = defs
      .append("linearGradient")
      .attr("id", "gradient-chart-area")
      .attr("x1", "50%")
      .attr("y1", "0%")
      .attr("x2", "50%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    gradients.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#EDF0F0")
      .attr("stop-opacity", 1);

    gradients.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ACB7BE")
      .attr("stop-opacity", 1);

    gradients = defs
      .append("linearGradient")
      .attr("id", "gradient-questions")
      .attr("x1", "50%")
      .attr("y1", "0%")
      .attr("x2", "50%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    gradients.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F6F8F9")
      .attr("stop-opacity", 1);

    gradients.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#D4DAE0")
      .attr("stop-opacity", 1);

    gradients = defs
      .append("radialGradient")
      .attr("id", "gradient-bars")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("cx", "0")
      .attr("cy", "0")
      .attr("r", this.maxBarHeight)
      .attr("spreadMethod", "pad") as any;

    gradients.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F3D5AA");

    gradients.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#F4A636");

    gradients.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#AF4427");

    this.svg.append("circle")
      .attr("r", this.maxBarHeight + 70)
      .classed("category-circle", true);

    this.svg.append("circle")
      .attr("r", this.maxBarHeight + 40)
      .classed("question-circle", true);

    this.svg.append("circle")
      .attr("r", this.maxBarHeight)
      .classed("chart-area-circle", true);

    this.svg.append("circle")
      .attr("r", this.innerRadius)
      .classed("center-circle", true);
  }


  renderChart(data: any) {

    let cats = data.map((d: any, i: number) => {
      return d.category_label;
    });

    let catCounts: any = {};
    for (let i = 0; i < cats.length; i++) {
      let num = cats[i];
      catCounts[num] = catCounts[num] ? catCounts[num] + 1 : 1;
    }
    // remove dupes (not exactly the fastest)
    cats = cats.filter((v: any, i: number) => {
      return cats.indexOf(v) == i;
    });
    let numCatBars = cats.length;

    let angle = 0,
      rotate = 0;

    data.forEach((d: any, i: any) => {
      // bars start and end angles
      d.startAngle = angle;
      angle += (2 * Math.PI) / numCatBars / catCounts[d.category_label];
      d.endAngle = angle;

      // y axis minor lines (i.e. questions) rotation

      d.rotate = rotate;
      rotate += 360 / numCatBars / catCounts[d.category_label];
    });

    // categoryLabel
    const arc_category_label = d3.arc()
      .startAngle(function (d, i) {
        return (i * 2 * Math.PI) / numCatBars;
      })
      .endAngle(function (d, i) {

        return ((i + 1) * 2 * Math.PI) / numCatBars;
      })
      .innerRadius(this.maxBarHeight + 40)
      .outerRadius(this.maxBarHeight + 64);


    const categoryText = this.svg.selectAll("path.category_label_arc")
      .data(cats)
      .enter().append("path")
      .classed("category-label-arc", true)
      .attr("id", (d: any, i: any) => {
        return "category_label_" + i;
      }) //Give each slice a unique ID
      .attr("fill", "none")
      .attr("d", arc_category_label);


    categoryText.each((d: any, i: number) => {
      //Search pattern for everything between the start and the first capital L
      const firstArcSection = /(^.+?)L/;
      // console.log(this.svg);
      //Grab everything up to the first Line statement
      let newArc = firstArcSection.exec(d3.select(this as any)?.attr("d"))[1];

      //Replace all the commas so that IE can handle it
      newArc = newArc.replace(/,/g, " ");
      console.log(newArc);

      //If the whole bar lies beyond a quarter of a circle (90 degrees or pi/2)
      // and less than 270 degrees or 3 * pi/2, flip the end and start position
      const startAngle = (i * 2 * Math.PI) / numCatBars,
        endAngle = ((i + 1) * 2 * Math.PI) / numCatBars;

      if (startAngle > Math.PI / 2 && startAngle < 3 * Math.PI / 2 && endAngle > Math.PI / 2 && endAngle < 3 * Math.PI / 2) {
        const startLoc = /M(.*?)A/, //Everything between the capital M and first capital A
          middleLoc = /A(.*?)0 0 1/, //Everything between the capital A and 0 0 1
          endLoc = /0 0 1 (.*?)$/; //Everything between the 0 0 1 and the end of the string (denoted by $)
        //Flip the direction of the arc by switching the start and end point (and sweep flag)
        const newStart = endLoc.exec(newArc)[1];
        const newEnd = startLoc.exec(newArc)[1];
        const middleSec = middleLoc.exec(newArc)[1];

        //Build up the new arc notation, set the sweep-flag to 0
        newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;

      } //if

      //Create a new invisible arc that the text can flow along

      // modifying existing arc instead
      d3.select(this as any).attr("d", newArc);
    });

    this.svg.selectAll(".category-label-text")
      .data(cats)
      .enter().append("text")
      .attr("class", "category-label-text")
      //.attr("x", 0)   //Move the text from the start angle of the arc
      //Move the labels below the arcs for those slices with an end angle greater than 90 degrees
      .attr("dy", function (d: any, i: number) {
        const startAngle = (i * 2 * Math.PI) / numCatBars,
          endAngle = ((i + 1) * 2 * Math.PI) / numCatBars;
        return (startAngle > Math.PI / 2 && startAngle < 3 * Math.PI / 2 && endAngle > Math.PI / 2 && endAngle < 3 * Math.PI / 2 ? -4 : 14);
      })
      .append("textPath")
      .attr("startOffset", "50%")
      .style("text-anchor", "middle")
      .attr("xlink:href", function (d: any, i: number) {
        return "#category_label_" + i;
      })
      .text(function (d: any) {
        return d;
      });


    // question_label
    const arc_question_label = d3.arc()
      .startAngle(function (d, i) {
        return d.startAngle;
      })
      .endAngle(function (d, i) {
        return d.endAngle;
      })
      //.innerRadius(maxBarHeight + 2)
      .outerRadius(this.maxBarHeight + 2);

    let questionText = this.svg.selectAll("path.question_label_arc")
      .data(data)
      .enter().append("path")
      .classed("question-label-arc", true)
      .attr("id", function (d: any, i: any) {
        return "question_label_" + i;
      }) //Give each slice a unique ID
      .attr("fill", "none")
      .attr("d", arc_question_label);

    questionText.each((d: any, i: number) => {
      //Search pattern for everything between the start and the first capital L
      const firstArcSection = /(^.+?)L/;

      //Grab everything up to the first Line statement
      let newArc = firstArcSection.exec(d3.select(this as any).attr("d"))[1];
      //Replace all the commas so that IE can handle it
      newArc = newArc.replace(/,/g, " ");

      //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2)
      //flip the end and start position
      if (d.startAngle > Math.PI / 2 && d.startAngle < 3 * Math.PI / 2 && d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2) {
        const startLoc = /M(.*?)A/, //Everything between the capital M and first capital A
          middleLoc = /A(.*?)0 0 1/, //Everything between the capital A and 0 0 1
          endLoc = /0 0 1 (.*?)$/; //Everything between the 0 0 1 and the end of the string (denoted by $)
        //Flip the direction of the arc by switching the start and end point (and sweep flag)
        const newStart = endLoc.exec(newArc)[1];
        const newEnd = startLoc.exec(newArc)[1];
        const middleSec = middleLoc.exec(newArc)[1];

        //Build up the new arc notation, set the sweep-flag to 0
        newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
      } //if

      //Create a new invisible arc that the text can flow along
      /*                            svg.append("path")
       .attr("class", "hiddenDonutArcs")
       .attr("id", "question_label_"+i)
       .attr("d", newArc)
       .style("fill", "none");*/

      // modifying existing arc instead
      d3.select(this as any).attr("d", newArc);
    });

    questionText = this.svg.selectAll(".question-label-text")
      .data(data)
      .enter().append("text")
      .attr("class", "question-label-text")
      //.attr("x", 0)   //Move the text from the start angle of the arc
      //.attr("y", 0)
      //Move the labels below the arcs for those slices with an end angle greater than 90 degrees
      /*                        .attr("dy", function (d, i) {
       return (d.startAngle > Math.PI / 2 && d.startAngle < 3 * Math.PI / 2 && d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2 ? 10 : -10);
       })*/
      .append("textPath")
      //.attr("startOffset", "50%")
      //.style("text-anchor", "middle")
      //.style("dominant-baseline", "central")
      .style('font-size', '7px')
      .style('font-family', 'sans-serif')
      .attr("xlink:href", function (d: any, i: any) {
        return "#question_label_" + i;
      })
      .text(function (d: any) {
        return d.question_label.toUpperCase();
      })
      .call(this.wrapTextOnArc, this.maxBarHeight);

    // adjust dy (labels vertical start) based on number of lines (i.e. tspans)
    questionText.each((d: any, i: any) => {
      //console.log(d3.select(this)[0]);
      const textPath: any = d3.select(this as any),
        tspanCount = textPath[0][0].childNodes.length;

      if (d.startAngle > Math.PI / 2 && d.startAngle < 3 * Math.PI / 2 && d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2) {
        // set baseline for one line and adjust if greater than one line
        d3.select(textPath.childNodes[0]).attr("dy", 3 + (tspanCount - 1) * -0.6 + 'em');
      } else {
        d3.select(textPath.childNodes[0]).attr("dy", -2.1 + (tspanCount - 1) * -0.6 + 'em');
      }
    });

    /* bars */
    const arc = d3.arc()
      .startAngle(function (d, i) {
        return d.startAngle;
      })
      .endAngle(function (d, i) {
        return d.endAngle;
      })
      .innerRadius(this.innerRadius);

    const bars = this.svg.selectAll("path.bar")
      .data(data)
      .enter().append("path")
      .classed("bars", true)
      .each((d: any) => {
        console.log(d);
        d.outerRadius = this.innerRadius;
      })
      .attr("d", arc);

    bars.transition().ease("elastic").duration(1000).delay((d: any, i: any) => {
      return i * 100;
    })
      .attrTween("d", (d: any, index: any) => {
        let i = d3.interpolate(d.outerRadius, x_scale(+d.value));
        return (t: any) => {
          d.outerRadius = i(t);
          return arc(d, index);
        };
      });

    let x_scale = d3.scaleLinear()
      .domain([0, 100])
      .range([this.innerRadius, this.maxBarHeight]);


    let y_scale = d3.scaleLinear()
      .domain([0, 100])
      .range([-this.innerRadius, -this.maxBarHeight]);

    this.svg.selectAll("circle.x.minor")
      .data(y_scale.ticks(10))
      .enter().append("circle")
      .classed("gridlines minor", true)
      .attr("r", function (d: any) {
        return x_scale(d);
      });

    // question lines
    this.svg.selectAll("line.y.minor")
      .data(data)
      .enter().append("line")
      .classed("gridlines minor", true)
      .attr("y1", -this.innerRadius)
      .attr("y2", -this.maxBarHeight - 40)
      .attr("transform", function (d: any, i: any) {
        return "rotate(" + (d.rotate) + ")";
      });

    // category lines
    this.svg.selectAll("line.y.major")
      .data(cats)
      .enter().append("line")
      .classed("gridlines major", true)
      .attr("y1", -this.innerRadius)
      .attr("y2", -this.maxBarHeight - 70)
      .attr("transform", function (d: any, i: any) {
        return "rotate(" + (i * 360 / numCatBars) + ")";
      });

  }


  wrapTextOnArc = (text: any, radius: number) => {
    // note getComputedTextLength() doesn't work correctly for text on an arc,
    // hence, using a hidden text element for measuring text length.
    let temporaryText = d3.select('svg')
      .append("text")
      .attr("class", "temporary-text") // used to select later
      .style("font", "7px sans-serif")
      .style("opacity", 0); // hide element

    let getTextLength = function (string: any) {
      temporaryText.text(string);
      return temporaryText.node().getComputedTextLength();
    };

    text.each((d: any) => {
      let text = d3.select(this as any);
      let words: any = text.text().split(/[ \f\n\r\t\v]+/).reverse(); //Don't cut non-breaking space (\xA0), as well as the Unicode characters \u00A0 \u2028 \u2029)
      let word: any;
      let wordCount = words.length;
      let line: any = [];
      let textLength;
      let lineHeight = 1.1; // ems
      let x = 0;
      let y = 0;
      let dy = 0;
      let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      let arcLength = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * (2 * Math.PI * radius);
      let paddedArcLength = arcLength - 16;

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        textLength = getTextLength(tspan.text());
        tspan.attr("x", (arcLength - textLength) / 2);

        if (textLength > paddedArcLength && line.length > 1) {
          // remove last word
          line.pop();
          tspan.text(line.join(" "));
          textLength = getTextLength(tspan.text());
          tspan.attr("x", (arcLength - textLength) / 2);

          // start new line with last word
          line = [word];
          tspan = text.append("tspan").attr("dy", lineHeight + dy + "em").text(word);
          textLength = getTextLength(tspan.text());
          tspan.attr("x", (arcLength - textLength) / 2);
        }
      }
    });

    d3.selectAll("text.temporary-text").remove()
  }

}
