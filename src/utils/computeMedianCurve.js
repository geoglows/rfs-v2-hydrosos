import {percentile} from "./percentile.js";

export function computeMedianCurve(curves) {
  if (!curves || curves.length === 0) {
    return null;
  }

  // Use the shortest curve so leap years don't cause indexing issues
  const n = Math.min(
    ...curves.map(c => c.cumulativeVolume.length)
  );

  const dates = curves[0].dates.slice(0, n);

  const cumulativeVolume = [];

  for (let i = 0; i < n; i++) {
    const values = curves
      .map(curve => curve.cumulativeVolume[i])
      .filter(v => v !== undefined)
      .sort((a, b) => a - b);

    cumulativeVolume.push(
      percentile(values, 50)
    );
  }

  return {
    dates,
    cumulativeVolume
  };
}
