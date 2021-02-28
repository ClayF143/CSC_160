
////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////

var margin = {left:120, top:50, right:120, bottom:50},
    width = 800,
    height = 800,
    innerRadius = 244,
    outerRadius = innerRadius * 1.05;

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

////////////////////////////////////////////////////////////
/////////////////// Set-up Loom parameters /////////////////
////////////////////////////////////////////////////////////

//Some default parameters
var pullOutSize = 20 + 30/135 * innerRadius;
var numFormat = d3.format(",.0f");



//Initiate the loom function with all the options
var loom = d3.loom()
    .padAngle(0.05)
    .heightInner(20)
    .emptyPerc(0.20)
    .widthInner(70)
    .value(function(d) { return d.quantity; })
    .inner(function(d) { return d.cat_2; })
    .outer(function(d) { return d.cat_1; })

//Initiate the inner string function that belongs to the loom
var string = d3.string()
    .radius(innerRadius)
    .pullout(pullOutSize);

//Initiate an arc drawing function that is also needed
var arc = d3.arc()
    .innerRadius(innerRadius*1.01)
    .outerRadius(outerRadius);

////////////////////////////////////////////////////////////
///////////////////////// Colors ///////////////////////////
////////////////////////////////////////////////////////////

//Color for the unique locations
var cat_2 = ["male", "female", "obese", "Normal Weight", ">2 hrs screen time", "<2 hrs screen time"];
var colors = ["#223e15", "#C6CAC9",  "#53821a", "#000000", "#8A2BE2", "#A52A2A", "#5F9EA0"];
var color = d3.scaleOrdinal()
    .domain(cat_2)
    .range(colors);

//read in data

d3.json("datasheet.json", function (error, data) {

    //create a structure to hold the data
    var g = svg.append("g")
        .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
        .datum(loom(data));	

    ////////////////////////////////////////////////////////////
    ////////////////////// Draw outer arcs /////////////////////
    ////////////////////////////////////////////////////////////

    var arcGroup = g.append("g").attr("class", "arc-outer-wrapper");

    //the outer arcs
    var arcs = arcGroup.selectAll(".arc-wrapper")
        .data(function(s) { return s.groups; })
        .enter().append("g")
        .attr("class", "arc-wrapper")
        .each(function(d) { d.pullOutSize = (pullOutSize * ( d.startAngle > Math.PI + 1e-2 ? -1 : 1)) });

    //ribbons woo
    var outerArcs = arcs.append("path")
        .attr("class", "arc")
        .style("fill", function(d) { return color(d.outername); })
        .attr("d", arc)
        .attr("transform", function(d, i) { 
            return "translate(" + d.pullOutSize + ',' + 0 + ")"; //Pull the two slices apart
        });

    //The text needs to be rotated with the offset in the clockwise direction
    var outerLabels = arcs.append("g")
        .each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2); })
        .attr("class", "outer-labels")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d,i) { 
            var c = arc.centroid(d);
            return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
            + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + 26 + ",0)"
            + (d.angle > Math.PI ? "rotate(180)" : "")
        })

    //The outer name
    outerLabels.append("text")
        .attr("class", "outer-label")
        .attr("dy", ".35em")
        .text(function(d,i){ return d.outername; });

    //inner text
    var stringGroup = g.append("g").attr("class", "string-wrapper");

    //Draw the paths of the inner strings
    var strings = stringGroup.selectAll("path")
        .data(function(strings) { return strings; })
        .enter().append("path")
        .attr("class", "string")
        .style("fill", function(d) { return d3.rgb( color(d.outer.outername) ).brighter(0.2) ; })
        .style("opacity", 0.85)
        .attr("d", string);

    var innerLabelGroup = g.append("g").attr("class","inner-label-wrapper");

    //Place the inner text labels in the middle
    var innerLabels = innerLabelGroup.selectAll("text")
        .data(function(s) { return s.innergroups; })
        .enter().append("text")
        .attr("class", "inner-label")
        .attr("x", function(d,i) { return d.x; })
        .attr("y", function(d,i) { return d.y; })
        .attr("dy", ".35em")
        .text(function(d,i) { return d.name; });

});