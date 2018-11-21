const svgWidth = 960;
const svgHeight = 500;

const labels = {
  poverty: 'In Poverty (%)',
  age: 'Age (Median)',
  income: 'Household Income (Median, $/year)',
  healthcare: 'Lacks Healthcare (%)',
  obesity: 'Obese (%)',
  smokes: 'Smokes (%)'
}

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

//Extra space (percentage from the actual range) that is added between axes and min/max values
const chartPad = 0.2;

const transitionDuration = 500;

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const svg = d3
  .select('.chart')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

const chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

let activePropX = 'poverty';
let activePropY = 'healthcare';

function getScale(data, property) {
  return d3.scaleLinear()
    .domain([
      d3.min(data, d => d[property]) * (1 - chartPad),
      d3.max(data, d => d[property]) * (1 + chartPad)
    ])
    .range([0, width]);
}

function renderXAxis(newScale, axis) {
  const xAxis = d3.axisBottom(newScale);
  axis.transition()
    .duration(transitionDuration)
    .call(xAxis);
  return axis;
}

function renderYAxis(scale, axis) {
  const yAxis = d3.axisLeft(scale);
  axis.transition()
    .duration(transitionDuration)
    .call(yAxis);
  return axis;
}

function renderCircles(circlesGroup, scaleX, scaleY, propX, propY) {  
  circlesGroup.transition()
    .duration(transitionDuration)
    .attr('cx', d => scaleX(d[propX]))
    .attr('cy', d => scaleY(d[propY]));
  return circlesGroup;
}

function updateToolTip(xProperty, circlesGroup) {
  let xLabel = 'In Po'
  if (xProperty === 'povert') {
    label = 'Poverty';
  }

  const toolTip = d3.tip()
    .attr('class', 'tooltip')
    .offset([80, -60])
    .html(function(d) {
      return (`${d[xProperty]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on('mouseover', function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on('mouseout', function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv('data.csv', function(err, data) {
  if (err) {
    throw err;
  }

  // parse data
  data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  let xLinearScale = xScale(data, activePropX);

  // Create y scale function
  const yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.num_hits)])
    .range([height, 0]);

  // Create initial axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  let xAxis = chartGroup.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append('g')
    .call(leftAxis);

  // append initial circles
  let circlesGroup = chartGroup.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xLinearScale(d[activePropX]))
    .attr('cy', d => yLinearScale(d.num_hits))
    .attr('r', 20)
    .attr('fill', 'pink')
    .attr('opacity', '.5');

  // Create group for  2 x- axis labels
  const labelsGroup = chartGroup.append('g')
    .attr('transform', `translate(${width / 2}, ${height + 20})`);

  const povertyLabel = labelsGroup.append('text')
    .attr('x', 0)
    .attr('y', 20)
    .attr('value', 'poverty')
    .classed('active', true)
    .text('In Poverty (%)');

  const ageLabel = labelsGroup.append('text')
    .attr('x', 0)
    .attr('y', 40)
    .attr('value', 'age')
    .classed('inactive', true)
    .text('Age (Median)');

  // append y axis
  chartGroup.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .classed('axis-text', true)
    .text('Lacks Helthcare (%)');

  // updateToolTip function above csv import
  circlesGroup = updateToolTip(activePropX, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll('text')
    .on('click', function() {
      // get value of selection
      const value = d3.select(this).attr('value');
      if (value !== activePropX) {

        // replaces chosenXaxis with value
        activePropX = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, activePropX);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, activePropX);

        // updates tooltips with new info
        circlesGroup = updateToolTip(activePropX, circlesGroup);

        // changes classes to change bold text
        if (activePropX === 'age') {
          ageLabel
            .classed('active', true)
            .classed('inactive', false);
          povertyLabel
            .classed('active', false)
            .classed('inactive', true);
        }
        else {
          ageLabel
            .classed('active', false)
            .classed('inactive', true);
          povertyLabel
            .classed('active', true)
            .classed('inactive', false);
        }
      }
    });
});
