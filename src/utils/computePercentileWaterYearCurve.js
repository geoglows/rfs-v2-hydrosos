import { percentile } from "./percentile";

export function computePercentileWaterYearCurve(
    waterYearCurves,
    p
) {
    if (waterYearCurves.length === 0) {
        throw new Error("No water year curves were provided.");
    }

    const days = [...waterYearCurves[0].days];
    const cumulativeVolume = [];

    days.forEach((day, index) => {
        const values = waterYearCurves
            .map(curve => curve.cumulativeVolume[index])
            .filter(value => value !== undefined);

        cumulativeVolume.push(
            percentile(values, p)
        );
    });

    return {
        name: `P${p}`,
        days,
        cumulativeVolume,
        finalVolume: cumulativeVolume.at(-1)
    };
}
