async function loadGeoJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const geojson = await response.json();
        console.log("GeoJSON Loaded:", geojson);

        // Display GeoJSON data in a preformatted text block
        document.getElementById('output').textContent = JSON.stringify(geojson, null, 2);
    } catch (error) {
        console.error("Error loading GeoJSON:", error);
    }
}

// Load a GeoJSON file (update the path if needed)
loadGeoJSON('data.geojson');