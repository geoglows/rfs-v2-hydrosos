'use strict';

// Reads the GEOGLOWS v2 retrospective straight from the public Zarr archive instead of the REST
// API. Approach copied from riverforecastsystem v2 (src/v2/retrospective.js): resolve the river ID to its index
// on the river_id coordinate, then read the discharge column for that index.
import {fetchZarrValues, getCoordinateValues, getTimeCoordinateValues,} from "./zarrFetchers.js";

const cloudfrontUri = "https://d2grb3c773p1iz.cloudfront.net";
const dischargeVariable = "Q";
const resolutions = ['hourly', 'daily', 'monthly', 'yearly'];

// The values are float32, so the raw numbers carry float noise (e.g. 12.340000152587891). The REST
// API returned 2 decimal places - round to match.
const roundValue = (value) => Math.round(value * 100) / 100;

const zarrUrlFor = (resolution) => {
  if (!resolutions.includes(resolution)) {
    throw new Error(`Invalid resolution: ${resolution}. Must be one of ${resolutions.join(', ')}.`);
  }
  if (['monthly', 'yearly'].includes(resolution)) resolution = `${resolution}-timeseries`;
  return `${cloudfrontUri}/retrospective/${resolution}.zarr`;
}

// The time and river_id coordinates are the same for every river, and the river_id coordinate is a
// ~7 million value array, so both are fetched once and reused for the rest of the session.
const timeCache = new Map();
const riverIdCache = new Map();

const getTimes = (zarrUrl) => {
  if (!timeCache.has(zarrUrl)) {
    timeCache.set(zarrUrl, getTimeCoordinateValues({zarrUrl}).catch(error => {
      timeCache.delete(zarrUrl);
      throw error;
    }));
  }
  return timeCache.get(zarrUrl);
}

const getRiverIdIndices = (zarrUrl) => {
  if (!riverIdCache.has(zarrUrl)) {
    const indices = getCoordinateValues({zarrUrl, variable: 'river_id'})
      .then(riverIds => new Map(riverIds.map((riverId, i) => [Number(riverId), i])))
      .catch(error => {
        riverIdCache.delete(zarrUrl);
        throw error;
      });
    riverIdCache.set(zarrUrl, indices);
  }
  return riverIdCache.get(zarrUrl);
}

/*
Retrieves the full retrospective discharge record for a river. The dimension order of Q is
(time, river_id). Returns the same shape the REST API did:
{
  datetime: [Date, Date, ...],
  [riverId]: [Number, Number, ...],
  metadata: {river_id, units, resolution},
}
 */
export async function fetchRetrospective(linkno, {resolution = 'daily'} = {}) {
  const zarrUrl = zarrUrlFor(resolution);
  const riverId = Number(linkno);

  const [datetime, riverIdIndices] = await Promise.all([
    getTimes(zarrUrl),
    getRiverIdIndices(zarrUrl),
  ]);

  const idx = riverIdIndices.get(riverId);
  if (idx === undefined) {
    throw new Error(`River ID not found in the retrospective archive: ${linkno}`);
  }

  const discharge = await fetchZarrValues({
    zarrUrl,
    variable: dischargeVariable,
    selection: [null, idx],
  });

  return {
    datetime,
    [riverId]: discharge.map(roundValue),
    metadata: {
      river_id: riverId,
      units: 'm^3 s^-1',
      resolution,
    },
  };
}
