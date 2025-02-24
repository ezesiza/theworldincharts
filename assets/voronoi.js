// import * as d3 from "d3";
// import "d3-weighted-voronoi";
// import "d3-voronoi-map";
// data = require("./data.json");
// import data from "./data.json"
// import { voronoiTreemap } from "d3-voronoi-treemap";
// var voronoiTreemap  = require("d3-voronoi-treemap");
// import "./styles.css";

//begin: constants
var _2PI = 2 * Math.PI;
//end: constants

//begin: layout conf.
var svgWidth = 960,
  svgHeight = 500,
  margin = { top: 10, right: 10, bottom: 10, left: 10 },
  height = svgHeight - margin.top - margin.bottom,
  width = svgWidth - margin.left - margin.right,
  halfWidth = width / 2,
  halfHeight = height / 2,
  quarterWidth = width / 4,
  quarterHeight = height / 4,
  titleY = 20,
  legendsMinY = height - 20,
  treemapRadius = 220,
  treemapCenter = [halfWidth, halfHeight + 5];
//end: layout conf.

//begin: treemap conf.
var _voronoiTreemap = voronoiTreemap();
var hierarchy, circlingPolygon;
//end: treemap conf.

//begin: drawing conf.
var fontScale = d3.scaleLinear();
//end: drawing conf.

//begin: reusable d3Selection
var svg, drawingArea, treemapContainer;
//end: reusable d3Selection

var init = function (rootData) {
  console.log(rootData);
  initData();
  initLayout(rootData);
  hierarchy = d3.hierarchy(rootData).sum(function (d) {
    return d.weight;
  });
  _voronoiTreemap.clip(circlingPolygon)(hierarchy);

  drawTreemap(hierarchy);
}

init(data);

var initData = function (rootData) {
  circlingPolygon = computeCirclingPolygon(treemapRadius);
  fontScale.domain([3, 20]).range([8, 20]).clamp(true);
}

var computeCirclingPolygon = function (radius) {
  var points = 60,
    increment = _2PI / points,
    circlingPolygon = [];

  for (var a = 0, i = 0; i < points; i++, a += increment) {
    circlingPolygon.push([
      radius + radius * Math.cos(a),
      radius + radius * Math.sin(a)
    ]);
  }

  return circlingPolygon;
}

var initLayout = function (rootData) {
  svg = d3.create("svg").attr("width", svgWidth).attr("height", svgHeight);

  drawingArea = svg
    .append("g")
    .classed("drawingArea", true)
    .attr("transform", "translate(" + [margin.left, margin.top] + ")");

  treemapContainer = drawingArea
    .append("g")
    .classed("treemap-container", true)
    .attr("transform", "translate(" + treemapCenter + ")");

  treemapContainer
    .append("path")
    .classed("world", true)
    .attr("transform", "translate(" + [-treemapRadius, -treemapRadius] + ")")
    .attr("d", "M" + circlingPolygon.join(",") + "Z");

  drawTitle();
  // drawFooter();
  drawLegends(rootData);
}

var drawTitle = function () {
  drawingArea
    .append("text")
    .attr("id", "title")
    .attr("transform", "translate(" + [halfWidth, titleY] + ")")
    .attr("text-anchor", "middle")
    .text("The Global Economy by GDP (as of 01/2017)");
}

var drawFooter = function () {
  drawingArea
    .append("text")
    .classed("tiny light", true)
    .attr("transform", "translate(" + [0, height] + ")")
    .attr("text-anchor", "start")
    .text("Remake of HowMuch.net's article 'The Global Economy by GDP'");
  drawingArea
    .append("text")
    .classed("tiny light", true)
    .attr("transform", "translate(" + [halfWidth, height] + ")")
    .attr("text-anchor", "middle")
    .text("by @_Kcnarf");
  drawingArea
    .append("text")
    .classed("tiny light", true)
    .attr("transform", "translate(" + [width, height] + ")")
    .attr("text-anchor", "end")
    .text("bl.ocks.org/Kcnarf/fa95aa7b076f537c00aed614c29bb568");
}

var drawLegends = function (rootData) {
  var legendHeight = 13,
    interLegend = 4,
    colorWidth = legendHeight * 6,
    continents = rootData.children.reverse();

  var legendContainer = drawingArea
    .append("g")
    .classed("legend", true)
    .attr("transform", "translate(" + [0, legendsMinY] + ")");

  var legends = legendContainer.selectAll(".legend").data(continents).enter();

  var legend = legends
    .append("g")
    .classed("legend", true)
    .attr("transform", function (d, i) {
      return "translate(" + [0, -i * (legendHeight + interLegend)] + ")";
    });

  legend
    .append("rect")
    .classed("legend-color", true)
    .attr("y", -legendHeight)
    .attr("width", colorWidth)
    .attr("height", legendHeight)
    .style("fill", function (d) {
      return d.color;
    });
  legend
    .append("text")
    .classed("tiny", true)
    .attr("transform", "translate(" + [colorWidth + 5, -2] + ")")
    .text(function (d) {
      return d.name;
    });

  legendContainer
    .append("text")
    .attr(
      "transform",
      "translate(" +
      [0, -continents.length * (legendHeight + interLegend) - 5] +
      ")"
    )
    .text("Continents");
}

var drawTreemap = function (hierarchy) {
  var leaves = hierarchy.leaves();

  var cells = treemapContainer
    .append("g")
    .classed("cells", true)
    .attr("transform", "translate(" + [-treemapRadius, -treemapRadius] + ")")
    .selectAll(".cell")
    .data(leaves)
    .enter()
    .append("path")
    .classed("cell", true)
    .attr("d", function (d) {
      return "M" + d.polygon.join(",") + "z";
    })
    .style("fill", function (d) {
      return d.parent.data.color;
    });

  var labels = treemapContainer
    .append("g")
    .classed("labels", true)
    .attr("transform", "translate(" + [-treemapRadius, -treemapRadius] + ")")
    .selectAll(".label")
    .data(leaves)
    .enter()
    .append("g")
    .classed("label", true)
    .attr("transform", function (d) {
      return "translate(" + [d.polygon.site.x, d.polygon.site.y] + ")";
    })
    .style("font-size", function (d) {
      return fontScale(d.data.weight);
    });

  labels
    .append("text")
    .classed("name", true)
    .html(function (d) {
      return d.data.weight < 1 ? d.data.code : d.data.name;
    });
  labels
    .append("text")
    .classed("value", true)
    .text(function (d) {
      return d.data.weight + "%";
    });

  var hoverers = treemapContainer
    .append("g")
    .classed("hoverers", true)
    .attr("transform", "translate(" + [-treemapRadius, -treemapRadius] + ")")
    .selectAll(".hoverer")
    .data(leaves)
    .enter()
    .append("path")
    .classed("hoverer", true)
    .attr("d", function (d) {
      return "M" + d.polygon.join(",") + "z";
    });

  hoverers.append("title").text(function (d) {
    return d.data.name + "\n" + d.value + "%";
  });
}


module.exports = { init }