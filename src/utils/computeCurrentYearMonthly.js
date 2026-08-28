import {getRollingMonths} from "./getRollingMonths.js";

export function computeCurrentYearMonthly(monthlyMeans) {
  const today = new Date();

  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;
  const currentDay = today.getUTCDate();

  const daysInCurrentMonth = new Date(
    Date.UTC(currentYear, currentMonth, 0)
  ).getUTCDate();

  const halfwayPoint = daysInCurrentMonth / 2;

  const rollingMonths = getRollingMonths();

  const currentYearMonthly = [];

  // Find the actual position of the current month
  // within the rolling window.
  const currentMonthIndex =
    rollingMonths.indexOf(currentMonth);

  rollingMonths.forEach((month, index) => {

    // Determine which calendar year this month belongs to.
    const dataYear =
      month > currentMonth
        ? currentYear - 1
        : currentYear;

    // Leave future months blank.
    if (index > currentMonthIndex) {
      currentYearMonthly.push(null);
      return;
    }

    // Don't plot the current month until halfway through.
    if (
      month === currentMonth &&
      currentDay < halfwayPoint
    ) {
      currentYearMonthly.push(null);
      return;
    }

    currentYearMonthly.push(
      monthlyMeans[dataYear]?.[month] ?? null
    );
  });

  return {
    currentYear,
    currentYearMonthly
  };
}