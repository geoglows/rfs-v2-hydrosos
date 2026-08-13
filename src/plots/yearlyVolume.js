import {buildRecords} from "../utils/buildRecords";
import {computeRollingWindowCurves} from "../utils/computeRollingWindowCurves";
import {computeMovingAverage} from "../utils/computeMovingAverage";
import {formatVolume} from "../utils/formatVolume";
import {legendDefaults, renderChart, titleOptions, tooltipDefaults, unifiedHover} from "./chartSetup.js";

const MOVING_AVERAGE_YEARS = 5;

export function plotAnnualRunoff(data) {
  const records = buildRecords(data);

  const curves =
    computeRollingWindowCurves(records);

  // One point per year: the total volume the rolling window accumulated.
  const annualVolumes = curves.map(curve => ({
    year: curve.year,
    volume: curve.records.reduce(
      (total, record) => total + record.volume,
      0
    ) / 1e9
  }));

  const movingAverage =
    computeMovingAverage(annualVolumes, MOVING_AVERAGE_YEARS);

  const years = annualVolumes.map(d => d.year);

  renderChart("annual-runoff", {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: "Annual Runoff",
          data: annualVolumes.map(d => d.volume),
          borderColor: "#A8A8A8",
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#A8A8A8",
          order: 1
        },
        {
          label: `${MOVING_AVERAGE_YEARS}-Year Moving Average`,
          data: movingAverage,
          borderColor: "#1f77b4",
          borderWidth: 4,
          pointRadius: 0,
          order: 0
        }
      ]
    },
    options: {
      responsive: true,
      interaction: unifiedHover,
      plugins: {
        title: titleOptions("Historical Annual Runoff"),
        legend: {
          ...legendDefaults,
          position: "top"
        },
        tooltip: {
          ...tooltipDefaults,
          callbacks: {
            label: item =>
              `${item.dataset.label}: ` +
              `${formatVolume(item.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Water Year"
          },
          ticks: {
            // One label a decade, rather than one per year
            callback(value) {
              const year = this.getLabelForValue(value);

              return year % 10 === 0 ? year : "";
            },
            autoSkip: false,
            maxRotation: 0
          }
        },
        y: {
          title: {
            display: true,
            text: "Annual Runoff (billion m³)"
          }
        }
      }
    }
  });
}
