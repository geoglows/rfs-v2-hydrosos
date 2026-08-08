import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(...registerables);

Chart.defaults.font.family = "Arial, sans-serif";
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.animation = false;

const charts = new Map();

/**
 * Draw a chart into a container div, replacing whatever was there before.
 * The <canvas> is created here so the markup only has to provide the div.
 */
export function renderChart(containerId, config) {
    destroyChart(containerId);

    const container = document.getElementById(containerId);

    if (!container) return null;

    container.innerHTML = "";

    const canvas = document.createElement("canvas");

    container.appendChild(canvas);

    const chart = new Chart(canvas, config);

    charts.set(containerId, chart);

    return chart;
}

export function destroyChart(containerId) {
    const chart = charts.get(containerId);

    if (chart) {
        chart.destroy();

        charts.delete(containerId);
    }
}

export function destroyAllCharts() {
    for (const id of [...charts.keys()]) {
        destroyChart(id);
    }
}

/**
 * One tooltip listing every series at the hovered x, rather than one per
 * point. Datasets flagged with `skipTooltip` (the shaded bands) stay out of it.
 */
export const unifiedHover = {
    mode: "index",
    intersect: false
};

export const tooltipDefaults = {
    filter: item => !item.dataset.skipTooltip,
    itemSort: (a, b) => b.parsed.y - a.parsed.y
};

/** Keep unlabeled helper datasets out of the legend. */
export const legendDefaults = {
    labels: {
        filter: item => Boolean(item.text),
        boxHeight: 8,
        usePointStyle: false
    }
};

export function titleOptions(text) {
    return {
        display: true,
        text,
        font: {
            size: 16
        },
        padding: {
            bottom: 12
        }
    };
}
