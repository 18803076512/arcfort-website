const dayMilliseconds = 24 * 60 * 60 * 1000;

// A 28-day comparison window plus seven days to export and review the final data.
// This is an internal reporting threshold, not a Google indexing or data-finalization promise.
export const searchConsoleFreshnessMaxDays = 35;

export function isValidIsoEvidenceDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const timestamp = Date.parse(`${value}T00:00:00Z`);

  return !Number.isNaN(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

function parseEvidenceDate(value: string, label: string) {
  if (!isValidIsoEvidenceDate(value)) {
    throw new Error(`${label} must be a valid YYYY-MM-DD date.`);
  }

  return Date.parse(`${value}T00:00:00Z`);
}

export function assessSearchConsoleFreshness(asOf: string, dataEnd: string) {
  const evidenceTime = parseEvidenceDate(asOf, "Production evidence date");
  const searchDataTime = parseEvidenceDate(dataEnd, "Search Console data end");
  const ageDays = (evidenceTime - searchDataTime) / dayMilliseconds;

  if (ageDays < 0) {
    throw new Error("Search Console data end cannot be after the production evidence date.");
  }

  return {
    ageDays,
    stale: ageDays > searchConsoleFreshnessMaxDays,
  };
}

export function formatSearchConsoleFreshness(asOf: string, dataEnd: string) {
  const freshness = assessSearchConsoleFreshness(asOf, dataEnd);
  const age = `${freshness.ageDays} day${freshness.ageDays === 1 ? "" : "s"}`;
  const period = `Recorded Search Console data ends ${dataEnd}, ${age} before the production evidence date ${asOf}.`;
  const threshold = `The internal review threshold is ${searchConsoleFreshnessMaxDays} days (a 28-day comparison window plus seven days for export and review).`;

  return freshness.stale
    ? `**Search measurement: Historical baseline; current search performance is unknown.** ${period} ${threshold} Do not infer a current trend, indexing status or conversion result from these numbers.`
    : `**Search measurement:** ${period} This is within the internal ${searchConsoleFreshnessMaxDays}-day review threshold. Indexing status and conversions still require their own evidence.`;
}

export function formatSearchConsoleReviewSchedule(
  asOf: string,
  dataEnd: string,
  reviewOnOrAfter: string,
) {
  assessSearchConsoleFreshness(asOf, dataEnd);
  const evidenceTime = parseEvidenceDate(asOf, "Production evidence date");
  const searchDataTime = parseEvidenceDate(dataEnd, "Search Console data end");
  const reviewTime = parseEvidenceDate(reviewOnOrAfter, "Search Console review date");

  if (searchDataTime >= reviewTime) {
    return `Recorded Search Console data now reaches the planned ${reviewOnOrAfter} review date; set the next review date from the verified export.`;
  }

  if (evidenceTime > reviewTime) {
    return `Review overdue since ${reviewOnOrAfter}; obtain a new native Search Console export and compare equivalent periods.`;
  }

  if (evidenceTime === reviewTime) {
    return `Review due as of ${reviewOnOrAfter}; obtain a native Search Console export and compare equivalent periods.`;
  }

  return `Next comparable review eligible on or after ${reviewOnOrAfter}.`;
}
