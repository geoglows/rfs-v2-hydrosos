import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function createMap() {

    const map = L.map("map", {

        minZoom: 3,

        maxBounds: [
            [-90, -180],
            [90, 180]
        ],

        maxBoundsViscosity: 1.0

    }).setView([20, 0], 2);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 18,
            noWrap: true
        }
    ).addTo(map);

    return map;

}