import { percentile } from "./percentile.js";

export function computeDailyPercentileBands(curves) {
    if (curves.length === 0) {
        return null;
    }

    const dates = curves[0].dates;

    const minimum = [];
    const p10 = [];
    const p25 = [];
    const median = [];
    const p75 = [];
    const p90 = [];
    const maximum = [];

    for (let i = 0; i < dates.length; i++) {
        const values = curves
            .map(curve => curve.cumulativeVolume[i])
            .filter(v => v !== undefined)
            .sort((a, b) => a - b);

        if (values.length === 0) {
            minimum.push(null);
            p10.push(null);
            p25.push(null);
            median.push(null);
            p75.push(null);
            p90.push(null);
            maximum.push(null);

            continue;
        }

        minimum.push(values[0]);

        p10.push(percentile(values, 10));

        p25.push(percentile(values, 25));

        median.push(percentile(values, 50));

        p75.push(percentile(values, 75));

        p90.push(percentile(values, 90));

        maximum.push(values.at(-1));
    }

    return {
        dates,
        minimum,
        p10,
        p25,
        median,
        p75,
        p90,
        maximum
    };
}
