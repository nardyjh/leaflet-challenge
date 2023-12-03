// Create map
let myMap = L.map("map", {
    center: [0, 0],
    zoom: 2,
});

// Add tile layer for base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Function for radius based on magnitude
function getRadius(magnitude) {
    return Math.sqrt(magnitude) * 5;
}

// Function to create legend
function createLegend() {
    // Legend values based on depth 
    let legendValues = [-10, 10, 30, 50, 70, 90];

    // Use same colors for legend and markers
    let legendColorScale = d3.scaleLinear()
        .domain([legendValues[0], legendValues[legendValues.length - 1]])
        .range(["yellow", "darkred"]);

    // Create Leaflet control for legend
    let legend = L.control({ position: 'bottomright' });

    // Function to update legend
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'legend');
        
        // Add white background 
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';

        // Create legend colors and labels
        legendValues.forEach((value, index) => {
            div.innerHTML +=
                `<div style="background-color:${legendColorScale(value)}; width:30px; height:10px; display:inline-block;"></div>` +
                `<div style="display:inline-block; padding-left: 5px; padding-right: 10px;">${index === legendValues.length - 1 ? `${value}+` : `${value}-${legendValues[index + 1]}`}</div><br>`;
        });
        return div;
    };

    // Add legend to map
    legend.addTo(myMap);

    // Return color for later access
    return legendColorScale;
}

// Function to determine color based on depth
function getColor(depth, legendColorScale) {
    return legendColorScale(depth);
}

// Define URL for earthquake data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Use D3 to load and parse GeoJSON data
d3.json(url).then((data) => {
    // Call createLegend function after adding markers 
    let legendColorScale = createLegend();

    // Loop through features and create markers
    data.features.forEach((feature) => {
        // Find data in features for markers
        let coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        let magnitude = feature.properties.mag;
        let depth = feature.geometry.coordinates[2];

        // Use the same color scale for legend and markers
        let marker = L.circleMarker(coordinates, {
            radius: getRadius(magnitude),
            color: "black",
            fillColor: getColor(depth, legendColorScale),
            fillOpacity: 0.8,
        });

        // Bind popup with information
        marker.bindPopup(`<b>Magnitude:</b> ${magnitude}<br><b>Depth:</b> ${depth}`);

        // Add marker to map
        marker.addTo(myMap);
    });
});
