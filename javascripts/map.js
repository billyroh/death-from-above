// Map variables

var projection = d3.geo.kavrayskiy7()
    .center([midLon, midLat])
    .scale(600)

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select(".map").append("svg")
    .attr("width", width)
    .attr("height", height)

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g")


//// TODO actually implement tooltips
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    console.log("test");
    return "<strong>Frequency:</strong> <span style='color:red'>" + d[selectedDataType] + "</span>";
  })
//// TODO actually implement tooltips
g.call(tip)

svg.call(zoom.event);

// Draw Map
d3.json("data/readme-world-names.json", function(error, world) {
  var countries = topojson.feature(world, world.objects.countries).features
  g.selectAll("path")
      .data(countries)
    .enter().append("path")
      .attr("d", path)
      .attr("class", "feature")
      .attr("id", function(d) { return d.id.replace(" ", "-") })
      .on("click", clicked)

  g.append("path")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

  // TODO make the country the country-name's parent node...
  // Label country names
  g.selectAll(".country-name")
    .data(countries)
  .enter().append("text")
    .attr("class", function(d) { return "country-name" })
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("dx", "-1.5em")
    .text(function(d) { return d.id; });
})

// Click handler for map
function clicked(d) {
  if (active.node() === this || jQuery.inArray(d.id, affectedCountries) == -1) {
    return reset()
  }

  active.classed("active", false);
  active = d3.select(this).classed("active", true);
  
  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y],
      circleScaleValue = 1 / scale

  svg.transition()
      .duration(transitionTime)
      .call(zoom.translate(translate).scale(scale).event)

  // Scale circles on zoom
  scaleCircles(circleScaleValue)

  // Fade out the strikes in the timeline not in country
  var selector = ".timeline-circle:not(.timeline-" + d.id.replace(" ", "-") + ")"

  // $(selector).attr("class", ($(selector).attr("class") + " not-applicable"))
  $(selector).css("opacity", 0)
  // $(".timeline-" + d.id.replace(" ", "-")).css("opacity", circleOpacityDefault)
}

// Scale circles on map
function scaleCircles(circleScaleValue) {
  g.selectAll(".strike")
    .transition()
    .duration(transitionTime)
    // .attr("r", function(d) { if(!isNumber(d[selectedDataType])) { return 0 } return yScale(d[selectedDataType]) * circleScaleValue })
    .attr("r", function(d) { if(!isNumber(d[selectedDataType])) { return 0 } return d[selectedDataType] * circleScaleValue })
  
  // g.selectAll(".feature")
  //   .transition()
  //   .duration(transitionTime)
  //   .style("opacity", opacityValue)

  // g.selectAll(".feature.active")
  //   .transition()
  //   .duration(transitionTime)
  //   .style("opacity", 1)
}

// Dispatches click event for d3 objects
jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = document.createEvent("MouseEvents")
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    e.dispatchEvent(evt);
  })
}

// Resets map back to default state
function reset() {
  // Scale circles
  scaleCircles(1)
  
  // Reset node thing
  active.classed("active", false);
  active = d3.select(null);

  // Reset opacity
  $("circle.timeline-circle").css("opacity", circleOpacityDefault)
  $("circle.strike").css("opacity", circleOpacityDefault)

  // Reset zoom
  svg.transition()
      .duration(transitionTime)
      .call(zoom.translate([0, 0]).scale(1).event);
}

// Zoom behaviour 
function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// Set the max radius for the strikes
var radiusMax = 50,
    circleOpacityHighlight = 0.5,
    circleOpacityDefault = 0.2,
    circleOpacitySuppressed = 0.05,
    strikesOnMap

// Checks if input is a number
function isNumber(n){
  return typeof(n) != "boolean" && !isNaN(n);
}

// Store array of affected countries to check against later
var affectedCountries = []

// Draw circles on map
d3.json("data/drones.json", function(error, json) {
  dataset = json.strike
  yScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) { if(isNumber(d[selectedDataType])) { return parseInt(d[selectedDataType]) } else { return 0 } })])
        .range([5, radiusMax])


  strikesOnMap = g.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
      .attr("class", "strike")
      .attr("id", function(d) { if (jQuery.inArray(d.country, affectedCountries) == -1) { affectedCountries.push(d.country) } ; return d._id })
      // .attr("r", function(d) { if(!isNumber(d[selectedDataType])) { return 0 } return yScale(d[selectedDataType]) } )
      .attr("r", function(d) { if(!isNumber(d[selectedDataType])) { return 0 } return d[selectedDataType] } )
      .attr("transform", function(d) { return "translate(" + projection([d.lon, d.lat]) + ")" } )
      .on("click", function(d) { return $("#" + d.country.replace(" ", "-")).d3Click() } )
      //// TODO actually implement tooltips
      .on("mouseover", function(d) { tip.show; highlightStrike(d._id, d.country) } )
      .on("mouseout", function(d) { tip.hide; fadeInStrikes(d.country)} )
})

function highlightStrike(id, country) {
  var selector = ".timeline-" + country.replace(" ", "-")
  $("circle.strike").css("opacity", circleOpacitySuppressed)
  $("circle#" + id).css("opacity", circleOpacityHighlight)
  $(selector).css("opacity", circleOpacitySuppressed)
  $("circle#timeline-" + id).css("opacity", circleOpacityHighlight)
}

function fadeInStrikes(country) {
  var selector = ".timeline-" + country.replace(" ", "-")
  $("circle.strike").css("opacity", circleOpacityDefault)
  $(selector).css("opacity", circleOpacityDefault)
}

function resetOpacity() {
  $("circle.timeline-circle").css("opacity", circleOpacityDefault)
  $("circle.strike").css("opacity", circleOpacityDefault)
}

// Timeline variables
var timelineWidth = $(".timeline").width(),
    timelineHeight = $(".timeline").height(), 
    xScale,
    timeline,
    dataset,
    strikesOnTimeline

timeline = d3.select(".timeline").append("svg")
        .attr("width", timelineWidth)
        .attr("height", timelineHeight)

// Set up timeline
d3.json("data/drones.json", function(error, json) {
  dataset = json.strike
  xScale = d3.time.scale()
          .domain([new Date(dataset[0].date), new Date(dataset[dataset.length - 1].date)])
          .range([padding.left, width - padding.right])

  strikesOnTimeline = timeline.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", function(d) { return ("timeline-circle timeline-" + d.country) })
    .attr("id", function(d) { return "timeline-" + d._id })
    .attr("r", 3)
    .attr("cx", function(d) { return xScale(new Date(d.date)) })
    .attr("cy", 18)
    .on("mouseover", function(d) { return highlightStrike(d._id, d.country) } )
    .on("mouseout", function(d) { fadeInStrikes() } )
    .on("click", function(d) { return $("#" + d.country.replace(" ", "-")).d3Click() } )

  // Define and draw x-axis
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("top")
    .ticks(10)

  timeline.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(10," + (timelineHeight - padding.top) + ")")
    .call(xAxis)
})

// TODO Change data type on change event
// how to call change
// http://bl.ocks.org/mbostock/3943967

// join/update/exit
// part 1
// http://bl.ocks.org/mbostock/3808218
// part 2
// http://bl.ocks.org/mbostock/3808221
// part 3
// http://bl.ocks.org/mbostock/3808234

d3.select(".data-type-selector").on("change", change)

// TODO Change data types
function change() {
  // Get new data type
  selectedDataType = $(".data-type-selector").val()

  // Shrink circles for old data
  // Animate in new data

  // Join new data
  var strikesOnMapNew = strikesOnMap
    .data(function(d) { d[selectedDataType] })

  strikesOnMapNew

  strikesOnMap.transition()
    .duration(transitionTime)
    .attr("r", function(d) {  } )
}


/*

Timeline per country

*/

d3.json("data/drones.json", function(error, json) {
  dataset = json.strike
  xScale = d3.time.scale()
          .domain([new Date(dataset[0].date), new Date(dataset[dataset.length - 1].date)])
          .range([padding.left, width - padding.right])


  
  // Define and draw x-axis
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("top")
    .ticks(10)

  // timeline.append("g")
  //   .attr("class", "axis")
  //   .attr("transform", "translate(10," + (timelineHeight - padding.top) + ")")
  //   .call(xAxis)
})