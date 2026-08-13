

import { computeRollingVolumePercentile } from "./computeRollingVolumePercentile.js";
import { computeRollingVolumeOutlook } from "./computeRollingVolumeOutlook.js";

// Each entry is the percentile the band starts at and the width it spans,
// so a flow landing inside it interpolates between the two edges.
const BAND_STOPS = [
  ["p10", "p25", 10, 15],
  ["p25", "median", 25, 25],
  ["median", "p75", 50, 25],
  ["p75", "p90", 75, 15]
];

function interpolatePercentile(value, band) {
  if (value == null || !band) {
    return null;
  }

  if (value <= band.p10) return 10;

  for (const [lower, upper, start, span] of BAND_STOPS) {
    if (value <= band[upper]) {
      return start + (
        (value - band[lower]) /
        (band[upper] - band[lower])
      ) * span;
    }
  }

  return 90;
}

function getStatus(percentile) {
  if (percentile == null) return null;
  if (percentile < 10) return "Very Dry";
  if (percentile < 25) return "Dry";
  if (percentile < 75) return "Normal";
  if (percentile < 90) return "Wet";

  return "Very Wet";
}

export function computeHydrologicSummary(
  records,
  bands,
  currentYearMonthly
) {
  const lastObserved =
    currentYearMonthly.findLastIndex(v => v != null);

  if (lastObserved === -1) {
    return null;
  }

  const currentFlow = currentYearMonthly[lastObserved];

  const flowPercentile = interpolatePercentile(
    currentFlow,
    bands[lastObserved]
  );

  const rollingVolume =
    computeRollingVolumePercentile(records);

  // The forecast is drawn from the historical median, so until it carries a
  // basin-specific signal the outlook it implies is always a normal one.
  const volumeOutlook =
    computeRollingVolumeOutlook(records);

  return {
    status: getStatus(flowPercentile),
    flowPercentile,
    currentFlow,
    volumePercentile: rollingVolume?.percentile ?? null,
    rollingVolumeValue: rollingVolume?.currentVolume ?? null,
    outlookPercentile:
    volumeOutlook?.percentile ?? null,

outlook:
    volumeOutlook?.outlook ?? null,

projectedVolume:
    volumeOutlook?.projectedVolume ?? null
   
  };
}
