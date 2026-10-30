#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  assessSearchConsoleFreshness,
  formatSearchConsoleFreshness,
  formatSearchConsoleReviewSchedule,
  isValidIsoEvidenceDate,
  searchConsoleFreshnessMaxDays,
} from "./search-console-freshness.ts";

assert.equal(searchConsoleFreshnessMaxDays, 35);
assert.equal(isValidIsoEvidenceDate("2026-02-30"), false);
assert.equal(isValidIsoEvidenceDate("2024-02-29"), true);

const oldBaseline = assessSearchConsoleFreshness("2026-10-29", "2026-08-09");
assert.deepEqual(oldBaseline, { ageDays: 81, stale: true });
assert.match(
  formatSearchConsoleFreshness("2026-10-29", "2026-08-09"),
  /Historical baseline; current search performance is unknown/,
);
assert.match(formatSearchConsoleFreshness("2026-10-29", "2026-08-09"), /81 days/);

// Advancing only the production-check date must not refresh an unchanged GSC export.
assert.deepEqual(assessSearchConsoleFreshness("2026-09-10", "2026-08-09"), {
  ageDays: 32,
  stale: false,
});
assert.deepEqual(assessSearchConsoleFreshness("2026-09-20", "2026-08-09"), {
  ageDays: 42,
  stale: true,
});

assert.deepEqual(assessSearchConsoleFreshness("2026-10-29", "2026-09-24"), {
  ageDays: 35,
  stale: false,
});
assert.deepEqual(assessSearchConsoleFreshness("2026-10-29", "2026-09-23"), {
  ageDays: 36,
  stale: true,
});
assert.doesNotMatch(
  formatSearchConsoleFreshness("2026-10-29", "2026-10-15"),
  /current search performance is unknown/,
);

assert.throws(() => assessSearchConsoleFreshness("2026-10-29", "2026-10-30"), /cannot be after/);
assert.throws(
  () => assessSearchConsoleFreshness("2026-02-30", "2026-02-01"),
  /valid YYYY-MM-DD date/,
);

assert.match(
  formatSearchConsoleReviewSchedule("2026-10-29", "2026-08-09", "2026-09-12"),
  /Review overdue since 2026-09-12/,
);
assert.match(
  formatSearchConsoleReviewSchedule("2026-09-01", "2026-08-09", "2026-09-12"),
  /eligible on or after 2026-09-12/,
);
assert.match(
  formatSearchConsoleReviewSchedule("2026-09-12", "2026-08-09", "2026-09-12"),
  /Review due as of 2026-09-12/,
);
assert.match(
  formatSearchConsoleReviewSchedule("2026-10-29", "2026-10-15", "2026-09-12"),
  /data now reaches the planned 2026-09-12 review date/,
);

console.log("Search Console evidence freshness tests passed.");
