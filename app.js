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

const circleRadius = 10;

const margin = {
  top: 20,
  right: 40,
  bottom: 90,
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

function getXScale(data, property) {
  return d3.scaleLinear()
    .domain([
      d3.min(data, d => d[property]) * (1 - chartPad),
      d3.max(data, d => d[property]) * (1 + chartPad)
    ])
    .range([0, width]);
}

function getYScale(data, property) {
  return d3.scaleLinear()
    .domain([
      d3.max(data, d => d[property]) * (1 + chartPad),
      d3.min(data, d => d[property]) * (1 - chartPad)
    ])
    .range([0, height]);
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
  circlesGroup.select('circle')
    .transition()
    .duration(transitionDuration)
    .attr('cx', d => scaleX(d[propX]))
    .attr('cy', d => scaleY(d[propY]));
  circlesGroup.select('text')
    .transition()
    .duration(transitionDuration)
    .attr('x', d => scaleX(d[propX]))
    .attr('y', d => scaleY(d[propY]) + circleRadius / 2 - 1);
  return circlesGroup;
}

function updateToolTip(circlesGroup, xProperty, yProperty) {
  let xLabel = labels[xProperty];
  let yLabel = labels[yProperty];
  const tooltip = d3.tip()
    .attr('class', 'tooltip')
    .offset([100, 90])
    .html(function(d) {
      return `<p>${d.state}</p><p>${xLabel}: ${d[xProperty]}</p><p>${yLabel}: ${d[yProperty]}</p>`;
    });

  let circles = circlesGroup.select('circle');
  circles.call(tooltip);
  circles.on('mouseover', function(data) {
    tooltip.show(data);
  })
    .on('mouseout', function(data) {
      tooltip.hide(data);
    });
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

  // Configuring x-axis
  let xScale = getXScale(data, activePropX);
  const bottomAxis = d3.axisBottom(xScale);
  let xAxis = chartGroup.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${height})`)
    .call(bottomAxis);
  const xLabelsGroup = chartGroup.append('g')
    .attr('transform', `translate(${width / 2}, ${height + 20})`);
  const povertyLabel = xLabelsGroup.append('text')
    .attr('class', 'axis-text')
    .attr('x', 0)
    .attr('y', 20)
    .attr('value', 'poverty')
    .classed('active', true)
    .text(labels.poverty);
  const ageLabel = xLabelsGroup.append('text')
    .attr('class', 'axis-text')
    .attr('x', 0)
    .attr('y', 40)
    .attr('value', 'age')
    .classed('inactive', true)
    .text(labels.age);
  const incomeLabel = xLabelsGroup.append('text')
    .attr('class', 'axis-text')
    .attr('x', 0)
    .attr('y', 60)
    .attr('value', 'income')
    .classed('inactive', true)
    .text(labels.income);
  const xLabels = {
    poverty: povertyLabel,
    age: ageLabel,
    income: incomeLabel
  };
  // Configuring y-axis
  let yScale = getYScale(data, activePropY);
  const leftAxis = d3.axisLeft(yScale);
  let yAxis = chartGroup.append('g')
    .call(leftAxis);
  const yLabelsGroup = chartGroup.append('g')
    .attr('transform', `translate(-100, ${height / 2}) rotate(-90)`);
  const healthcareLabel = yLabelsGroup.append('text')
    .attr('class', 'axis-text')
    .attr('x', 0)
    .attr('y', 20)
    .attr('value', 'healthcare')
    .classed('active', true)
    .text(labels.healthcare);
  const obesityLabel = yLabelsGroup.append('text')
    .attr('class', 'axis-text')
    .attr('x', 0)
    .attr('y', 40)
    .attr('value', 'obesity')
    .classed('inactive', true)
    .text(labels.obesity);
  const smokesLabel = yLabelsGroup.append('text')
    .attr('class', 'axis-text')
    .attr('x', 0)
    .attr('y', 60)
    .attr('value', 'smokes')
    .classed('inactive', true)
    .text(labels.smokes);  
    const yLabels = {
      healthcare: healthcareLabel,
      obesity: obesityLabel,
      smokes: smokesLabel
    };
  //Configuring circles and tooltips
  let circlesGroup = chartGroup.selectAll('circle')
    .data(data)
    .enter()
    .append('g');
  circlesGroup.append('circle')
    .attr('cx', d => xScale(d[activePropX]))
    .attr('cy', d => yScale(d[activePropY]))
    .attr('r', circleRadius)
    .attr('class', 'circle');
  circlesGroup.append('text')
    .attr('x', d => xScale(d[activePropX]))
    .attr('y', d => yScale(d[activePropY]) + circleRadius / 2 - 1)
    .attr('class', 'circle-text')
    .text(d => d.abbr);

  updateToolTip(circlesGroup, activePropX, activePropY);
  //Adding interactivity to x-axis labels
  xLabelsGroup.selectAll('text')
    .on('click', function() {
      const value = d3.select(this).attr('value');
      if (value !== activePropX) {
        activePropX = value;
        xScale = getXScale(data, activePropX);
        xAxis = renderXAxis(xScale, xAxis);
        circlesGroup = renderCircles(circlesGroup, xScale, yScale, activePropX, activePropY);
        updateToolTip(circlesGroup, activePropX, activePropY);
        for (let xLabel of d3.entries(xLabels)) {
          let isActive = xLabel.key === activePropX;
          xLabel.value.classed('active', isActive)
            .classed('inactive', !isActive);
        }
      }
    });
    //Adding interactivity to y-axis labels
    yLabelsGroup.selectAll('text')
      .on('click', function() {
        const value = d3.select(this).attr('value');
        if (value !== activePropY) {
          activePropY = value;
          yScale = getYScale(data, activePropY);
          yAxis = renderYAxis(yScale, yAxis);
          circlesGroup = renderCircles(circlesGroup, xScale, yScale, activePropX, activePropY);
          updateToolTip(circlesGroup, activePropX, activePropY);
          for (let yLabel of d3.entries(yLabels)) {
            let isActive = yLabel.key === activePropY;
            yLabel.value.classed('active', isActive)
              .classed('inactive', !isActive);
          }
        }
      });
});
