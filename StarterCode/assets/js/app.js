var svgWidth = 960;
var svgHeight = 500;

// margins
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  var chartGroup = svg.append("g")
  
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(function(Data) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    Data.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([9, d3.max(Data, d => d.poverty)])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([4, d3.max(Data, d => d.healthcare)])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale).ticks(5);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(-0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .call(log,"Data")
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "11")
    // .attr("fill", "#89bdd3")
    // .attr("stroke", "#e3e3e3");
    .classed('stateCircle',true)

   //Styling text
   chartGroup.append('g').attr('id','chartText').selectAll("text")
    .data(Data)
    .call(log,"Data")
    .enter()
    .append("text")
    .attr("x", (d,i) => xLinearScale(d.poverty))
    .attr("y", (d,i) => yLinearScale(d.healthcare)+5)
    .text((d) =>d.abbr)
    // .attr("font-size", "10px")
    // .attr("fill", "white")
    // .style("font-weight", "bold")
    .classed('stateText',true)

    function log(sel,msg) {
        console.log(msg,sel);
      }
    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>poverty: ${d.poverty}<br>healthcare: ${d.healthcare}`);
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left )
      .attr("x", 0 - (height / 1.5))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks health care %")
      .style("font-weight", "bold")

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${svgHeight - 60})`)
      .attr("class", "axisText")
      .style("font-weight", "bold")
      .text("In Poverty %");
  }).catch(function(error) {
    console.log(error);
  });



