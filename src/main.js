import "./styles.css";

import {addRasterLayer} from "./map/rasterLayer.js";
import {createMap} from "./map/initMap.js";
import {findLatestTif} from "./utils/findLatestTif.js";
import {fetchRetrospective} from "./data/fetchRetrospective.js";
import {plotCumulativeVolume} from "./plots/cumVol.js";
import {plotHydroSOSBands} from "./plots/hydroSOSbands.js";
import {plotForecastEnvelope} from "./plots/forecastEnvelope.js";
import {buildRecords} from "./utils/buildRecords.js";
import {getHydroSOSData} from "./utils/getHydroSOSdata.js";
import {addBasinLayer, selectBasin} from "./map/basinLayer.js";
import {destroyAllCharts} from "./plots/chartSetup.js";

const map = createMap();
const tifUrl = await findLatestTif();
await addRasterLayer(map, tifUrl);

const panel = document.getElementById("basin-panel");
const toggleButton = document.getElementById("toggle-panel");

// The panel takes half the row away from the map, so MapLibre has to
// remeasure once the width transition has finished.
function syncPanelState() {
  const open = !panel.classList.contains("hidden");
  toggleButton.textContent = open ? "Hide Charts" : "Show Charts";
  toggleButton.setAttribute("aria-expanded", String(open));
  setTimeout(() => map.resize(), 320);
}

function openPanel() {
  panel.classList.remove("hidden");
  syncPanelState();
}

function closePanel() {
  panel.classList.add("hidden");
  document.getElementById("loading").style.display = "none";
  destroyAllCharts();
  syncPanelState();
}

const searchBox = document.getElementById("basin-search");
const searchButton = document.getElementById("search-button");

document
  .getElementById("close-modal")
  .addEventListener("click", closePanel);

toggleButton.addEventListener("click", () => {
  if (panel.classList.contains("hidden")) openPanel();
  else closePanel();
});

// Corrects the url builder so this could work in multiple environments
const base = import.meta.env.BASE_URL;
const basinBounds = await fetch(`${base}basin_index.json`).then(r => r.json());
const outletLookup = await fetch(`${base}outlet_lookup.json`).then(r => r.json());

// -------------------------------
// Open a basin (used by BOTH clicks and search)
// -------------------------------

async function openBasin(feature) {
  openPanel();
  document.querySelector(".panel-content").scrollTop = 0;

  const props = feature.properties;
  const riverID = outletLookup[props.HYBAS_ID].riverID;

  document.getElementById("basin-info").innerHTML = `
      <h2>Basin Information</h2>
      <p><strong>Hydrobasin ID:</strong> ${props.HYBAS_ID}</p>
      <p><strong>Outlet River ID:</strong> ${riverID}</p>
  `;

  document.getElementById("loading").style.display = "flex";

  try {
    const data = await fetchRetrospective(riverID);
    plotCumulativeVolume(data);
    const records = buildRecords(data);
    const hydroSOSData = getHydroSOSData(records);

    plotHydroSOSBands(
      hydroSOSData.bands,
      hydroSOSData.currentYearMonthly
    );
    plotForecastEnvelope(data);
  } catch (error) {
    console.error(error);
    alert("Unable to load basin data.");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

// -------------------------------
// Add basin layer
// -------------------------------
await addBasinLayer(
  map,
  {tilesUrl: `${base}hydrobasins.pmtiles`, bounds: basinBounds},
  openBasin
)

function runSearch() {
  const hybasID = searchBox.value.trim();
  const feature = selectBasin(hybasID, map);

  if (!feature) {
    alert("HYBAS_ID not found.");
    return;
  }
  openBasin(feature);
}

searchButton.addEventListener("click", runSearch)
searchBox.addEventListener(
  "keydown", event => {
    if (event.key === "Enter") runSearch();
  }
)
