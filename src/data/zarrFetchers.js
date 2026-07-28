'use strict';

// all data from rfsv2 are zarr version/format 2
// the stores are written with blosc, which zarrita's default codec registry resolves through a
// dynamic import of numcodecs/blosc - no registration step needed here.
import {FetchStore, get, open} from "zarrita";

const openZarrArray = async ({zarrUrl, variable}) => {
  const store = new FetchStore(`${zarrUrl}/${variable}`);
  return await open.v2(store, {kind: "array"});
}

const fetchZarrValues = async ({zarrUrl, variable, selection = null}) => {
  const node = await openZarrArray({zarrUrl, variable});
  const array = await get(node, selection);
  return [...array.data];
}

const getCoordinateValues = async ({zarrUrl, variable}) => {
  return await fetchZarrValues({zarrUrl, variable, selection: [null]});
}

const getCoordinateIndex = async ({zarrUrl, variable, value}) => {
  const coordinates = await getCoordinateValues({zarrUrl, variable});
  return coordinates.indexOf(value);
}

const resolveRiverIdToIndex = async ({zarrUrl, riverId, idx, idVariable = 'river_id'}) => {
  // idx is preferred. if not provided, riverId must be given to look up the index.
  if (idx === undefined && riverId === undefined) {
    throw new Error("Either 'riverId' or 'idx' must be provided.");
  }
  if (idx === undefined) {
    idx = await getCoordinateIndex({zarrUrl, variable: idVariable, value: Number(riverId)});
  }
  if (idx === -1) {
    throw new Error(`River ID not found in the retrospective archive: ${riverId}`);
  }
  return idx;
}

const getTimeCoordinateValues = async ({zarrUrl}) => {
  const node = await openZarrArray({zarrUrl, variable: 'time'});
  const array = await get(node, [null]);

  const units = node.attrs.units;
  const originTime = new Date(units.split("since")[1].trim());
  const conversionFactor = {
    seconds: 1,
    minutes: 60,
    hours: 60 * 60,
    days: 60 * 60 * 24,
  }[units.split("since")[0].trim()];

  // Offset the epoch directly rather than with Date.setSeconds - setSeconds writes local time
  // fields, so any timestamp that lands on the far side of a DST boundary comes back shifted by an
  // hour (23:00 the previous day) and reads as the wrong date under getUTC*.
  const originEpoch = originTime.getTime();
  return [...array.data].map(t => new Date(originEpoch + (Number(t) * conversionFactor * 1000)));
}

export {
  openZarrArray,
  fetchZarrValues,
  getCoordinateValues,
  getCoordinateIndex,
  getTimeCoordinateValues,
  resolveRiverIdToIndex,
}
