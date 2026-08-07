import { buildRecords } from "../utils/buildRecords.js";
import { getHistoricalForecastCurves } from "../utils/getHistoricalForecastCurves.js";
import { computeForecastEnvelope } from "../utils/computeForecastEnvelope.js";
import { computeDailyPercentileBands } from "../utils/computeDailyPercentileBands.js";
import { computeRollingWindowCurves } from "../utils/computeRollingWindowCurves.js";
import {
    renderChart,
    unifiedHover,
    tooltipDefaults,
    legendDefaults,
    titleOptions
} from "./chartSetup.js";


export function plotForecastEnvelope(data) {

    const records = buildRecords(data);

    const rollingCurves =
        computeRollingWindowCurves(records);

    const cumulativeCurves = rollingCurves.map(curve => {

        let runningTotal = 0;

        return {

            year: curve.year,

            dates: curve.referenceDates,

            cumulativeVolume: curve.records.map(record => {

                runningTotal += record.volume;

                return runningTotal;

            })

        };

    });

    const today = new Date();

    const historicalCurves =
        cumulativeCurves
            .filter(c => c.year < today.getUTCFullYear())
            .sort((a, b) => a.year - b.year)
            .slice(-30);

    const currentCurve =
        cumulativeCurves.find(
            c => c.year === today.getUTCFullYear()
        );

    const lastObservedDate =
        currentCurve.dates[currentCurve.cumulativeVolume.length - 1];

    const historicalForecasts =
        getHistoricalForecastCurves(
            historicalCurves,
            currentCurve,
            lastObservedDate
        );

    const forecast =
        computeForecastEnvelope(
            historicalForecasts
        );

    const dailyBands =
        computeDailyPercentileBands(historicalCurves);

    const currentVolume =
        currentCurve.cumulativeVolume.at(-1);

    // Forecast is stored as volume added since the last observation,
    // so shift it up onto the end of the observed curve.
    const shifted = values =>
        values.map(
            v => v == null ? null : (currentVolume + v) / 1e9
        );

    const bandPoints = values =>
        toPoints(dailyBands.dates, values);

    const forecastPoints = key => {

        const values = shifted(forecast[key]);

        return forecast.dates.map((date, index) => ({
            x: date,
            y: values[index]
        }));

    };

    const datasets = [];

    // Historical percentile bands, each filling down to the one before it
    datasets.push({

        label: "",

        data: bandPoints(dailyBands.minimum),

        borderWidth: 0,

        pointRadius: 0,

        skipTooltip: true

    });

    const bands = [
        ["Very Dry", dailyBands.p10, "#CD233F80"],
        ["Dry", dailyBands.p25, "#FFA88580"],
        ["Normal", dailyBands.p75, "#E7E2BC80"],
        ["Wet", dailyBands.p90, "#8ECEEE80"],
        ["Very Wet", dailyBands.maximum, "#2C7DCD80"]
    ];

    for (const [label, values, color] of bands) {

        datasets.push({

            label,

            data: bandPoints(values),

            backgroundColor: color,

            borderColor: "rgba(0,0,0,0.15)",

            borderWidth: 0.5,

            pointRadius: 0,

            fill: datasets.length - 1,

            skipTooltip: true

        });

    }

    const forecastMaxIndex = datasets.length;

    datasets.push({

        label: "Historical Max",

        data: forecastPoints("maximum"),

        borderColor: "green",

        borderDash: [6, 4],

        borderWidth: 2,

        pointRadius: 0

    });

    datasets.push({

        label: "Historical Min",

        data: forecastPoints("minimum"),

        borderColor: "red",

        borderDash: [6, 4],

        borderWidth: 2,

        pointRadius: 0,

        fill: forecastMaxIndex,

        backgroundColor: "rgba(180,180,180,0.25)"

    });

    datasets.push({

        label: "30-year Median Forecast",

        data: forecastPoints("median"),

        borderColor: "#1f77b4",

        borderDash: [6, 4],

        borderWidth: 4,

        pointRadius: 0

    });

    datasets.push({

        label: "Observed",

        data: toPoints(
            currentCurve.dates,
            currentCurve.cumulativeVolume
        ),

        borderColor: "black",

        borderWidth: 4,

        pointRadius: 0

    });

    renderChart("forecast-envelope", {

        type: "line",

        data: { datasets },

        options: {

            responsive: true,

            interaction: unifiedHover,

            plugins: {

                title: titleOptions("Three-Month Seasonal Outlook"),

                legend: {
                    ...legendDefaults,
                    position: "top"
                },

                tooltip: {

                    ...tooltipDefaults,

                    callbacks: {

                        label: item =>
                            `${item.dataset.label}: ` +
                            `${item.parsed.y.toFixed(1)} billion m³`

                    }

                }

            },

            scales: {

                x: {

                    type: "time",

                    time: {
                        unit: "month",
                        displayFormats: { month: "MMM" },
                        tooltipFormat: "d MMM yyyy"
                    },

                    title: {
                        display: true,
                        text: "Water Year"
                    }

                },

                y: {

                    title: {
                        display: true,
                        text: "Cumulative Volume (billion m³)"
                    }

                }

            }

        }

    });

}

function toPoints(dates, volumes) {

    return volumes.map((volume, index) => ({

        x: dates[index],

        y: volume == null ? null : volume / 1e9

    }));

}
