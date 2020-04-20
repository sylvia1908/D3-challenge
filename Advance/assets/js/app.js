var svgWidth = 960;
var svgHeight = 500;

// margins
var margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100
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


// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
// function used for updating x-scale var upon click on axis label
function xScale(Data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenXAxis]) * 0.8,
      d3.max(Data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}
// y-scale
function yScale(Data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenYAxis])* 0.8 ,
      d3.max(Data, d => d[chosenYAxis])  * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// y
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis])+5);

  return textGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {

  var xLabel;

  if (chosenXAxis === "poverty") {
    xLabel = "Poverty:";
  }
  else if (chosenXAxis === "age"){
    xLabel = "Age:";
  }

  var yLabel;

  if (chosenYAxis === "healthcare") {
    yLabel = "Healthcare:";
  }
  else if (chosenYAxis === "smokes"){
    yLabel = "Smokes:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
  .on("mouseover", function(data) {
    toolTip.show(data);
    });

  return circlesGroup;
}



// Import Data
d3.csv("assets/data/data.csv").then(function(Data, err) {
  if (err) throw err;
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    Data.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.smokes = +data.smokes;
      data.age = +data.age;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(Data, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(Data, chosenYAxis);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    // append x axis
    var xAxis = chartGroup.append("g")
    // .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
    
    // .attr("transform", `translate(0,-10)`)
    .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 9)
    .classed('stateCircle',true)
    // .on("mouseover", handleMouseOver)
    // function handleMouseOver(d, i) {  // Add interactivity

    //   // Use D3 to select element, change color and size
    //   d3.select(this).attr({
    //     fill: "orange",
    //     r: 20
    //     })};
   //Styling text
   var textGroup = chartGroup.append('g').attr('id','chartText').selectAll("text")
    .data(Data)
    .enter()
    .append("text")
    .attr('font-size',10)
    .attr('font-weight','bold')
    .attr("x", (d,i) => xLinearScale(d[chosenXAxis]))
    .attr("y", (d,i) => yLinearScale(d[chosenYAxis])+5)
    .text((d) =>d.abbr)
    .classed('stateText',true)

   // Create group for  x- axis labels
   var labelsGroup = chartGroup.append("g")
   .attr("transform", `translate(${width / 2}, ${height + 20})`);
//  x- axis labels
   var povertyLengthLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 25)
   .attr("value", "poverty") // value to grab for event listener
   .classed("active", true)
   .text("In Poverty %")
   .attr('font-size',17)
   .attr('font-weight','bold');

   var ageLengthLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 45)
   .attr("value", "age") // value to grab for event listener
   .classed("inactive", true)
   .text("Age ( Mean )")
   .attr('font-size',17)
   .attr('font-weight','bold');

    //  y- axis labels
    var healthcareLengthLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -475 )
    .attr("x", (height / 2))
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks health care %")
    .attr('font-size',17)
    .attr('font-weight','bold');

    var smokesLengthLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -450 )
    .attr("x",  (height / 2))
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes % ")
    .attr('font-size',17)
    .attr('font-weight','bold');

      // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
    
    var xOption = ['poverty','age'];
    var yOption = ['healthcare','smokes'];
    // x axis labels event listener
    labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (xOption.indexOf(value)>=0) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(Data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLengthLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLengthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLengthLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLengthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
      else if (yOption.indexOf(value)>=0){
         // replaces chosenXAxis with value
         chosenYAxis = value;

         // functions here found above csv import
         // updates x scale for new data
         YLinearScale = yScale(Data, chosenYAxis);
 
         // updates x axis with transition
         yAxis = renderYAxes(yLinearScale, yAxis);
 
         // updates circles with new x values
         circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
         textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
         // updates tooltips with new info
         circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
 
         // changes classes to change bold text
         if (chosenYAxis === "healthcare") {
          healthcareLengthLabel
             .classed("active", true)
             .classed("inactive", false);
          smokesLengthLabel
             .classed("active", false)
             .classed("inactive", true);
         }
         else {
          healthcareLengthLabel
             .classed("active", false)
             .classed("inactive", true);
          smokesLengthLabel
             .classed("active", true)
             .classed("inactive", false);
         };


      }
    });










  }).catch(function(error) {
    console.log(error);
  });



