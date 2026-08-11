import {Map, NavigationControl, setWorkerUrl} from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(maplibreWorkerUrl);

// The basin tiles are built to zoom 6, so there is no more detail to show
// past here. Also caps how far fitBounds will go on a search.
export const MAX_MAP_ZOOM = 5;

const styleReady = new WeakMap();

export function createMap() {
  const map = new Map({
    container: "map",
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: [
            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
          ],
          tileSize: 256,
          maxzoom: 18,
          attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
        }
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm"
        }
      ]
    },
    center: [0, 20],
    zoom: 1,
    minZoom: 1,
    maxZoom: MAX_MAP_ZOOM,
    renderWorldCopies: false
  });

  // Latched here, while the event is still guaranteed to be ahead of us.
  // Checking isStyleLoaded() later is not enough: it goes back to false
  // whenever a source is still loading, and by then "load" has been and gone.
  styleReady.set(
    map,
    new Promise(resolve => map.once("load", resolve))
  );

  map.addControl(
    new NavigationControl({showCompass: false}),
    "top-left"
  );
  return map;
}

/** Sources and layers can only be added once the style has finished loading. */
export function whenStyleReady(map) {
  return styleReady.get(map) ?? Promise.resolve();
}
