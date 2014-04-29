var width = 300,
    height = 300;

var projection = d3.geo.mercator()
    .center([79.1, 22])
    .scale(450)
    .translate([width, height]);

var pathPakistan = d3.geo.path()
    .projection(projection)
    .pointRadius(2);

var pakistan = d3.select(".timeline-map#Pakistan")
    .attr("width", width)
    .attr("height", height);

d3.json("data/pakistan.json", function(error, country) {
  pakistan.selectAll(".subunit")
      .data(topojson.feature(country, country.objects.subunits).features)
    .enter().append("path")
      .attr("class", function(d) { return "subunit " + d.id; })
      .attr("d", pathPakistan);

  pakistan.append("path")
      .datum(topojson.feature(country, country.objects.subunits))
      .attr("d", pathPakistan)
      .attr("class", "hello")

  pakistan.append("path")
      .datum(topojson.feature(country, country.objects.places))
      .attr("d", pathPakistan)
      .attr("class", "place");

  pakistan.selectAll(".place-label")
      .data(topojson.feature(country, country.objects.places).features)
    .enter().append("text")
      .attr("class", "place-label")
      .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
      .attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
      .attr("dy", ".35em")
      .style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; })
      .text(function(d) { return d.properties.name; });
});

var projectionYemen = d3.geo.mercator()
    .center([55, 9.25])
    .scale(660)
    .translate([width, height]);

var pathYemen = d3.geo.path()
    .projection(projectionYemen)
    .pointRadius(2);

var yemen = d3.select(".timeline-map#Yemen")
    .attr("width", width)
    .attr("height", height);

d3.json("data/yemen.json", function(error, country) {
  yemen.selectAll(".subunit")
      .data(topojson.feature(country, country.objects.subunits).features)
    .enter().append("path")
      .attr("class", function(d) { return "subunit " + d.id; })
      .attr("d", pathYemen)
      // .attr("transform", "translate(200, -200)")

  yemen.append("path")
      .datum(topojson.feature(country, country.objects.subunits))
      .attr("d", pathYemen)
      .attr("class", "hello")

  yemen.append("path")
      .datum(topojson.feature(country, country.objects.places))
      .attr("d", pathYemen)
      .attr("class", "place");

  yemen.selectAll(".place-label")
      .data(topojson.feature(country, country.objects.places).features)
    .enter().append("text")
      .attr("class", "place-label")
      .attr("transform", function(d) { return "translate(" + projectionYemen(d.geometry.coordinates) + ")"; })
      .attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
      .attr("dy", ".35em")
      .style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; })
      .text(function(d) { return d.properties.name; });
});

var projectionSomalia = d3.geo.mercator()
    .center([54.2, -2.5])
    .scale(550)
    .translate([width, height]);

var pathSomalia = d3.geo.path()
    .projection(projectionSomalia)
    .pointRadius(2);

var somalia = d3.select(".timeline-map#Somalia")
    .attr("width", width)
    .attr("height", height);

d3.json("data/somalia.json", function(error, country) {
  somalia.selectAll(".subunit")
      .data(topojson.feature(country, country.objects.subunits).features)
    .enter().append("path")
      .attr("class", function(d) { return "subunit " + d.id; })
      .attr("d", pathSomalia)

  somalia.append("path")
      .datum(topojson.feature(country, country.objects.subunits))
      .attr("d", pathSomalia)
      .attr("class", "hello")

  somalia.append("path")
      .datum(topojson.feature(country, country.objects.places))
      .attr("d", pathSomalia)
      .attr("class", "place");

  somalia.selectAll(".place-label")
      .data(topojson.feature(country, country.objects.places).features)
    .enter().append("text")
      .attr("class", "place-label")
      .attr("transform", function(d) { return "translate(" + pathSomalia(d.geometry.coordinates) + ")"; })
      .attr("x", 71)
      .attr("dy", "10.9em")
      .style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; })
      .text(function(d) { return d.properties.name; });
});