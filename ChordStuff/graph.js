//I copy and pasted this function, it returns a color a bit darker or lighter depending on input, I didn't look into it more than that
var lightenDarkenColor = function(col, amt) {
  
    var usePound = false;
  
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
 
    var num = parseInt(col,16);
 
    var r = (num >> 16) + amt;
 
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
 
    var b = ((num >> 8) & 0x00FF) + amt;
 
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
 
    var g = (num & 0x0000FF) + amt;
 
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
 
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  
}

var svg = d3.select("#diagram")
  .append("svg")
    .attr("width", 440)
    .attr("height", 440)
  .append("g")
    .attr("transform", "translate(220,220)")

// data input, this is a matrix of immigration between some large regions
var matrix = [
[3.142471, 0, 2.107883, 0, 0.540887, 0.155988, 0, 0, 0, 0.673004],
[0,1.630997,0.601265,0,0.97306,0.333608,0,0.380388, 0, 0.869311],
[0, 0, 2.401476, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1.762587, 0.879198, 3.627847, 0, 0, 0, 0, 0],
[0, 0, 1.215929, 0.276908, 0, 0, 0, 0, 0, 0],
[0, 0, 0.17037, 0, 0, 0.190706, 0, 0, 0, 0],
[0, 0.525881, 1.390272, 0, 1.508008, 0.34742, 1.307907, 0, 0, 4.902081],
[0, 0.145264,0.468762, 0, 1.057904, 0.278746, 0, 0.781316, 0, 0],
[0, 0, 0.60923, 0, 0, 0, 0, 0, 1.870501, 0],
[0, 0, 0.449623, 0, 0.169274, 0, 0, 0, 0, 0.927243]
];

var colors = ["#00FFFF", "#F5F5DC", "#7FFFD4", "#000000", "#8A2BE2", "#A52A2A", "#5F9EA0", "#FF7F50", "#DC143C", "#A9A9A9"]


var res = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)
    (matrix)

// Add the links between groups
svg.datum(res)
  .append("g")
  .selectAll("path")
  .data(function(d) { return d; })
  .enter()
  .append("path")
    .attr("d", d3.ribbon()
      .radius(190)
    )
    .style("fill", function(d){ return colors[d.source.index] })
    .style("stroke", "black");

// this group object use each group of the data.groups object
var group = svg
  .datum(res)
  .append("g")
  .selectAll("g")
  .data(function(d) { return d.groups; })
  .enter()

// add the group arcs on the outer part of the circle
group.append("g")
    .append("path")
    .style("fill", function(d,i){ return lightenDarkenColor(colors[i], 100)})
    .style("stroke", "black")
    .attr("d", d3.arc()
      .innerRadius(190)
      .outerRadius(200)
    )
// Add the ticks
group
  .selectAll(".group-tick")
  .data(function(d) { return groupTicks(d, 1); })    // Controls the number of ticks: one tick each 25 here.
  .enter()
  .append("g")
    .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + 200 + ",0)"; })
  .append("line")               // By default, x1 = y1 = y2 = 0, so no need to specify it.
    .attr("x2", 6)
    .attr("stroke", "black")

// Add the labels of a few ticks:
group
  .selectAll(".group-tick-label")
  .data(function(d) { return groupTicks(d, 1); })
  .enter()
  .filter(function(d) { return d.value % 1 === 0; })
  .append("g")
    .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + 200 + ",0)"; })
  .append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .text(function(d) { return d.value })
    .style("font-size", 9)


// Returns an array of tick angles and values for a given group and step.
function groupTicks(d, step) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, step).map(function(value) {
    return {value: value, angle: value * k + d.startAngle};
  });
    

}
