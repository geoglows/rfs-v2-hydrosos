import {MONTHS_BACK, MONTHS_FORWARD} from "./getRollingMonths.js";

export function computeRollingWindowCurves(
  records,
  monthsBack = MONTHS_BACK,
  monthsForward = MONTHS_FORWARD
) {
  const today = new Date();

  // Rolling window relative to today
  const windowStart = new Date(today);
  windowStart.setUTCMonth(
    windowStart.getUTCMonth() - monthsBack
  );

  const windowEnd = new Date(today);
  windowEnd.setUTCMonth(
    windowEnd.getUTCMonth() + monthsForward
  );

  const referenceDates = [];

  let d = new Date(windowStart);

  while (d <= windowEnd) {
    referenceDates.push(new Date(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }

  const curves = [];

  const endYears = [
    ...new Set(records.map(r => r.year))
  ];

  for (const endYear of endYears) {
    // Shift today's rolling window into this historical year
    const start = new Date(windowStart);
    const end = new Date(windowEnd);

    const currentEndYear = today.getUTCFullYear();

    start.setUTCFullYear(
      start.getUTCFullYear() + (endYear - currentEndYear)
    );

    end.setUTCFullYear(
      end.getUTCFullYear() + (endYear - currentEndYear)
    );

    const curve = records.filter(record => {
      return (
        record.date >= start &&
        record.date <= end
      );
    });

    if (curve.length === 0) continue;

    curves.push({
      year: endYear,
      records: curve,
      referenceDates
    });
  }

  return curves;
}
