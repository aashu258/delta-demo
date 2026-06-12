const mapDiv = document.getElementById("map");

const listingData = JSON.parse(
    mapDiv.dataset.listing
);

console.log(listingData);
const coordinates = listingData.geometry.coordinates;
console.log(coordinates);

const map = L.map("map").setView(
    [coordinates[1], coordinates[0]],
    10
);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors",
    }
).addTo(map);

L.marker([coordinates[1], coordinates[0]])
    .addTo(map)
    .bindPopup("Exact location will be provided after booking.")
    .openPopup();