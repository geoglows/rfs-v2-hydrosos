export function getHistoricalForecastCurves(
    historicalCurves,
    currentCurve
) {
    const startIndex =
        currentCurve.cumulativeVolume.length - 1;

    return historicalCurves.map(curve => {
        const dates =
            curve.dates.slice(startIndex);

        const cumulativeVolume =
            curve.cumulativeVolume.slice(startIndex);

        const startVolume =
            cumulativeVolume[0];

        return {
            year: curve.year,
            dates,
            startVolume,
            endVolume: cumulativeVolume.at(-1),
            incrementalVolume:
                cumulativeVolume.map(v => v - startVolume)
        };
    });
}
