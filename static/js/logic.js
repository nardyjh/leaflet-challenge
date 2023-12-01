// Create map
let myMap = L.map("map", {
    center: [0, 0],
    zoom: 2,
});

// Add a tile layer for the base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Function to determine radius based on magnitude
function getRadius(magnitude) {
    // You can customize this function to map magnitude to a specific radius scale
    // For example, using a linear scale for simplicity
    return Math.sqrt(magnitude) * 5;
}

// Function to determine color based on depth
function getColor(depth) {
    // You can customize this function to map depth to a specific color scale
    // For example, using a gradient from light to dark based on depth values
    return depth > 90 ? 'darkred' :
           depth > 70 ? 'red' :
           depth > 50 ? 'orange' :
           depth > 30 ? 'yellow' :
           depth > 10 ? 'green' :
           depth > -10 ? 'lightgreen' :
                       'lightblue';
}

// Function to create legend
function createLegend() {
    // Define legend values based on depth thresholds
    const legendValues = [-10, 10, 30, 50, 70, 90];

    // Create SVG element for the legend
    let svg = d3.select("body")  // You can select any container element or the body
        .append("svg")
        .attr("class", "legend");

    // Use the same color scale for legend and markers
    let legendColorScale = d3.scaleLinear()
        .domain([legendValues[0], legendValues[legendValues.length - 1]])
        .range(["lightblue", "darkred"]);

    // Create legend rectangles
    svg.selectAll("rect")
        .data(legendValues)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 30)
        .attr("y", 0)
        .attr("width", 30)
        .attr("height", 10)
        .style("fill", d => legendColorScale(d));

    // Add legend labels
    svg.selectAll("text")
        .data(legendValues)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 30)
        .attr("y", 20)
        .text(d => d.toFixed(2)); // Format the legend values as needed
}

// Define URL for earthquake data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Use D3 to load and parse the GeoJSON data
d3.json(url).then((data) => {
    // Loop through features and create markers
    data.features.forEach((feature) => {
        // Extract properties from the feature
        let coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        let magnitude = feature.properties.mag;
        let depth = feature.geometry.coordinates[2];

        // Use the same color scale for legend and markers
        let marker = L.circleMarker(coordinates, {
            radius: getRadius(magnitude),
            color: "black",
            fillColor: getColor(depth),
            fillOpacity: 0.7,
        });

        // Bind a popup with additional information
        marker.bindPopup(`<b>Magnitude:</b> ${magnitude}<br><b>Depth:</b> ${depth}`);

        // Add the marker to the map
        marker.addTo(myMap);
    });

    // Call the createLegend function after adding markers to the map
    createLegend();
});
