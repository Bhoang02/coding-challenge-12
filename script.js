// U89173488


d3.csv("mock_stock_data.csv").then(data => {
    
    data.forEach(d => {
        d.date = new Date(d.date);
        d.value = +d.value;
    });

    const stockNames = [...new Set(data.map(d => d.stock))];
    const stockSelect = d3.select("#stock-select");
    stockSelect.selectAll("option")
        .data(stockNames)
        .enter()
        .append("option")
        .text(d => d);

    
    updateVisualization(data);

   
    stockSelect.on("change", () => updateVisualization(data));
    d3.select("#start-date").on("change", () => updateVisualization(data));
    d3.select("#end-date").on("change", () => updateVisualization(data));

    function updateVisualization(data) {
        const selectedStock = stockSelect.node().value;
        const startDate = new Date(d3.select("#start-date").node().value);
        const endDate = new Date(d3.select("#end-date").node().value);

        let filteredData = data.filter(d => d.stock === selectedStock);
        if (!isNaN(startDate)) filteredData = filteredData.filter(d => d.date >= startDate);
        if (!isNaN(endDate)) filteredData = filteredData.filter(d => d.date <= endDate);

        drawChart(filteredData);
    }

    function drawChart(data) {
        const svg = d3.select("#chart").html("").append("svg")
            .attr("width", 600)
            .attr("height", 600);

        const margin = {top: 20, right: 20, bottom: 30, left: 50};
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime()
            .rangeRound([0, width])
            .domain(d3.extent(data, d => d.date));

        const y = d3.scaleLinear()
            .rangeRound([height, 0])
            .domain(d3.extent(data, d => d.value));

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value));

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        g.append("g")
            .call(d3.axisLeft(y));

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        
        const tooltip = d3.select("body").append("div").attr("class", "tooltip");

        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => x(d.date) + margin.left)
            .attr("cy", d => y(d.value) + margin.top)
            .attr("r", 5)
            .attr("fill", "red")
            .on("mouseover", (event, d) => {
                tooltip.style("display", "block")
                    .html(`Stock: ${d.stock}<br>Date: ${d.date.toLocaleDateString()}<br>Value: ${d.value}`)
                    .style("left", `${event.pageX + 5}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", () => tooltip.style("display", "none"));
    }
})

