/**
 * Display a multiple line chart.
 *
 * @param {string} source
 *   A location such as data/multivalued-1000-rows-20-columns.csv
 * @param {string} chartLocation
 *   An element on the page, often a div with an id, where the chart will be
 *   displayed.
 * @param {int} width
 *   Width of the chart.
 * @param {int} height
 *   Height of the chart.
 * @param {int} margin
 *   Margins provides padding around the chart.
 * @param {bool} displayXAxisPlotting
 *   If displayXAxisPlotting is true to then X axis displayed in chart.
 * @param {bool} displayYAxisPlotting
 *   If displayYAxisPlotting is true to then Y axis displayed in chart.
 *
 * See https://d3-graph-gallery.com/graph/shape.html#myline.
 */
 function multipleLineChart(
    source,
    chartLocation,
    width,
    height,
    margin,
    displayXAxisPlotting,
    displayYAxisPlotting
) {
    /*
        Create SVG element
        chartLocation is a selector string or a reference to an
        existing HTML element where the SVG will be inserted.
        For example, it might be a string like "#chart" to select
        an element with the ID chart.
    */
    const svg = d3.select(chartLocation).append("svg")
        /*
            Sets the width of the SVG element.
            Total width including margins then only x,y axis rendered completely inside chart.
        */
        .attr("width", width + margin.left + margin.right)
        /*
            Sets the height of the SVG element.
            Total height including margins then only x,y axis rendered completely inside chart.
        */
        .attr("height", height + margin.top + margin.bottom)
        /*
            append("g") Appends a group element (<g>) to the SVG container.
            Explanation:
                The <g> element is used to group other SVG elements
            together. It is often used to apply transformations and
            styling to a collection of elements. By appending this
            <g> element, you create a group that can be transformed or
            styled as a unit.
        */
        .append("g")
        /*
            .attr("transform", translate(${margin.left},${margin.top})):
            Moves the group element to account for margins, so the
            actual chart area starts after the margin space.
        */
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Read the CSV file.
    d3.csv(source).then(data => {
        // Identify the X-axis column (first column).
        const xAxisColumn = Object.keys(data[0])[0];
        // Extract Y-axis columns (all columns except the first one).
        const columns = Object.keys(data[0]).slice(1);

        /*
          Parse data: convert strings to numbers
        */
        data.forEach(d => {
            d[xAxisColumn] = +d[xAxisColumn];
            columns.forEach(column => d[column] = +d[column]);
        });

        /*
            Define scales and axes
            d3.scaleLinear() is a function from D3.js that creates
            a linear scale. Linear scales map numerical data values to
            a continuous range of pixel values. It’s used for axes
            where the data is distributed in a linear fashion.
        */
        const x = d3.scaleLinear()
            /*
                d3.extent(data, d => d[xAxisColumn]) calculates the
                extent (i.e., minimum and maximum) of the data values for
                the x-axis.
                data is your dataset (an array of objects).
                d => d[xAxisColumn] is a function that extracts the value
                corresponding to xAxisColumn from each data object.
                d3.extent returns an array with two values: the minimum
                and maximum values in the dataset for the specified key.
                This array sets the domain of the scale.
            */
            .domain(d3.extent(data, d => d[xAxisColumn]))
            /*
                range specifies the range of pixel values the data values will be mapped to.
                [0, width] means that the smallest data value will be
                mapped to pixel position 0, and the largest data value will
                be mapped to pixel position width. If width is,
                for example, 730 pixels, then the data values will be
                mapped from 0 to 730 pixels along the x-axis.
            */
            .range([0, width]);

        /*
            Linear scales map numerical data values to
            a continuous range of pixel values
        */
        let y = d3.scaleLinear()
            /*
                The .domain() method defines the input range for the scale.
                In this case, 0 is the minimum value, ensuring that the scale starts at zero.
                d3.max(data, d => d3.max(columns, col => d[col])) calculates
                the maximum value of all the other columns across the data(except first column),
                ensuring that the scale can accommodate the highest value found in the dataset.
                This setup is particularly useful in line charts where you want the y-axis
                to dynamically adjust to the range of values in your data, ensuring that all
                lines fit well within the chart’s vertical space.
            */
            .domain([0, d3.max(data, d => d3.max(columns, col => d[col]))])
            /*
               .range([height, 0]) sets the output range of the scale.
               It maps data values to pixel positions on the y-axis, where
               height corresponds to the bottom of the chart and 0
               corresponds to the top.
            */
            .range([height, 0]);

        /*
            d3.axisBottom(x): Creates a bottom-oriented axis using the x scale.
            .ticks(data.length): Configures the axis to have tick marks for each
            data point in the dataset, which helps in clearly displaying and aligning
            the data points along the x-axis.
        */
        const xAxis = d3.axisBottom(x).ticks(data.length);
        /*
            d3.axisLeft(y): Creates a vertical axis positioned on the left side of the SVG,
            using the y scale function to map data values to pixel positions.
        */
        const yAxis = d3.axisLeft(y);

        if (displayXAxisPlotting) {
            /*
                The append('g') method adds a new group element to the SVG. This group element
                will contain all the parts of the x-axis (ticks, labels, etc.).
            */
            svg.append('g')
                .attr('class', 'x-axis')
                /*
                    The transform attribute is used to position the axis correctly. By translating
                    the group to the bottom of the SVG (translate(0,${height})), the x-axis is
                    placed along the bottom edge of the chart area.
                */
                .attr('transform', `translate(0,${height})`)
                /*
                    The .call(xAxis) method applies the axis generator to the group element. This
                    method draws the x-axis based on the scale and configuration provided to
                    d3.axisBottom(x).
                */
                .call(xAxis)
                .attr('stroke', '#333')
                .attr('fill', 'none');
        }

        if (displayYAxisPlotting) {
            // svg.append('g'): Adds a new group element to the SVG.
            svg.append('g')
                // .attr('class', 'y-axis'): Sets the class for CSS styling and targeting.
                .attr('class', 'y-axis')
                // .call(yAxis): Draws the y-axis using the yAxis generator function.
                .call(yAxis)
                .attr('stroke', '#333')
                .attr('fill', 'none');
        }

        // Add gridlines
        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat('')
            );

        /*
          Define line generators
          d3.line(): Creates a line generator function.
        */
        const line = d3.line()
            // .x(d => x(d[xAxisColumn])): Maps data values to x-coordinates using the x scale.
            .x(d => x(d[xAxisColumn]))
            // .y(d => y(d.value)): Maps data values to y-coordinates using the y scale.
            .y(d => y(d.value))
            // Smooth curve.
            .curve(d3.curveMonotoneX);

        /*
            This code creates and configures  separate line paths for a line chart
            within the SVG element. Each line represents a different data series
            (amount1, amount2, amount3......).
        */
        const amountLines = {};
        columns.forEach((column, i) => {
            amountLines[column] = svg.append('path')
                .attr('class', 'line')
                .attr('data-column', column) // Add data-column attribute
                .style('stroke', d3.schemeCategory10[i % 10])
                .style('stroke-width', 2) // Thicker line
                .style('fill', 'none')
                .style('opacity', 0); // Initially hide the line
        });

        // Create dynamic checkboxes and legends.
        const checkboxContainer = d3.select('.checkbox-container');
        columns.forEach((column, i) => {
            checkboxContainer.append('label')
                .html(`<input type="checkbox" checked id="checkbox-${column}"> <span style="color: ${d3.schemeCategory10[i % 10]};">&#9679;</span> ${column}`)
                .style('display', 'block');
        });

        // Add tooltips
        const tooltip = d3.select(chartLocation).append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', '#fff')
            .style('border', '1px solid #ccc')
            .style('padding', '5px')
            .style('border-radius', '4px');

        // Create a tooltip container for each line path.
        svg.selectAll('.line')
            .on('mouseover', function(event, d) {
                tooltip.transition().duration(200).style('opacity', .9);
                // Bring the hovered line to the front.
                d3.select(this).raise();
            })
            .on('mousemove', function(event, d) {
                const [mx, my] = d3.pointer(event);
                const xValue = x.invert(mx);

                // Find the closest data point to the mouse
                const closestData = data.reduce((prev, curr) => {
                    const prevDist = Math.abs(prev[xAxisColumn] - xValue);
                    const currDist = Math.abs(curr[xAxisColumn] - xValue);
                    return currDist < prevDist ? curr : prev;
                });

                // Get column name from the data-column attribute.
                const column = d3.select(this).attr('data-column');
                tooltip.html(`Week: ${closestData[xAxisColumn]}<br>${column}: ${closestData[column]}`)
                    .style('left', `${event.pageX + 5}px`)
                    .style('top', `${event.pageY - 28}px`);
            })
            .on('mouseout', function(d) {
                tooltip.transition().duration(500).style('opacity', 0);
            });

        /*
            Update function for lines
            The function first determines which lines should be visible based on the state
            of the checkboxes.
        */
        function updateLines() {
            const selectedLines = columns.filter(col => document.getElementById(`checkbox-${col}`).checked);

            // Calculate new y-axis domain based on selected lines.
            if (selectedLines.length > 0) {
                const yExtent = d3.extent(data.flatMap(d => selectedLines.map(col => d[col])));
                y.domain([yExtent[0], yExtent[1]]);
            } else {
                // Handle case with no selected lines.
                y.domain([0, 0]);
            }

            // Animate the y-axis transition
            svg.select('.y-axis')
                .transition()
                .duration(750)
                .call(d3.axisLeft(y));

            // It updates the path data and color of each visible line to reflect the current
            // data and styling preferences.
            selectedLines.forEach((column, index) => {
                amountLines[column]
                    .datum(data.map(d => ({ [xAxisColumn]: d[xAxisColumn], value: d[column] })))
                    // Apply transition to the path.
                    .transition()
                    // Staggered delay for each line.
                    .delay(index * 500)
                    .duration(750)
                    .attr('d', line)
                    // Make line visible.
                    .style('opacity', 1)
                    .style('stroke', d3.schemeCategory10[columns.indexOf(column) % 10]);
            });

            // It hides or shows each line accordingly.
            columns.forEach(column => {
                if (!selectedLines.includes(column)) {
                    amountLines[column].transition()
                        .duration(750)
                        // Hide line with animation.
                        .style('opacity', 0);
                }
            });
        }

        // Initial rendering of lines and y-axis
        updateLines();

        // Add event listeners to checkboxes
        columns.forEach(column => {
            document.getElementById(`checkbox-${column}`).addEventListener('change', updateLines);
        });
    }).catch(error => {
        console.error('Error loading or parsing data:', error);
        d3.select(chartLocation).append('p').text('Failed to load data.').style('color', 'red');
    });
}
