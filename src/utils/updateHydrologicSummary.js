function basinInformation(basinID, riverID) {
  return `
    <div class="basin-information">
      <h2>Basin Information</h2>
      <p><strong>Hydrobasin ID:</strong> ${basinID}</p>
      <p><strong>Outlet River ID:</strong> ${riverID}</p>
    </div>
  `;
}

function metric(label, value) {
  return `
    <div class="status-metric">
      <div class="status-metric-label">${label}</div>
      <div class="status-metric-value">${value}</div>
    </div>
  `;
}

function asPercentile(value) {
  return value != null
    ? `${Math.round(value)}th percentile`
    : "Unavailable";
}

export function updateHydrologicSummary(summary, basinID, riverID) {
  const element = document.getElementById("basin-info");

  if (!element) return;

  if (!summary) {
    element.innerHTML = `
      <h2>Hydrologic Status</h2>
      <p>Hydrologic status unavailable.</p>
      ${basinInformation(basinID, riverID)}
    `;

    return;
  }

  element.innerHTML = `
    <div class="hydrologic-summary">

      <h2>Hydrologic Status</h2>

      <div class="hydrologic-status"><strong>${summary.status}</strong></div>

      ${metric(
    "Current Flow",
    `${asPercentile(summary.flowPercentile)} · ` +
    `${summary.currentFlow.toFixed(0)} m³/s`
  )}
      ${metric("9-Month Volume", asPercentile(summary.volumePercentile))}
      ${metric("3-Month Outlook", summary.outlook)}

    </div>

    ${basinInformation(basinID, riverID)}
  `;
}
