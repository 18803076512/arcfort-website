import {
  assertProductLifecycleTransition,
  canTransitionProductLifecycle,
  initialShadowLifecycle,
} from "../../lib/domain/catalog/lifecycle.ts";
import { compareShadowTableRows } from "../../lib/domain/catalog/shadow-parity.ts";
import { assessConfirmationCandidate } from "../../lib/domain/catalog/verification.ts";

const failures: string[] = [];

function expect(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

expect(initialShadowLifecycle() === "INGESTED", "Shadow imports must start at INGESTED.");
expect(canTransitionProductLifecycle("DRAFT", "INGESTED"), "DRAFT -> INGESTED must be allowed.");
expect(
  !canTransitionProductLifecycle("INGESTED", "VERIFIED"),
  "INGESTED -> VERIFIED must be blocked.",
);
expect(
  !canTransitionProductLifecycle("NEEDS_VERIFICATION", "PUBLISHED"),
  "NEEDS_VERIFICATION -> PUBLISHED must be blocked.",
);
expect(
  canTransitionProductLifecycle("PUBLISHED", "NEEDS_UPDATE"),
  "PUBLISHED -> NEEDS_UPDATE must be allowed.",
);

try {
  assertProductLifecycleTransition("INGESTED", "PUBLISHED");
  failures.push("Invalid lifecycle transition did not throw.");
} catch {
  // Expected.
}

const incompleteConfirmation = assessConfirmationCandidate({
  sourceLevel: "A",
  exactSubject: false,
  evidenceBasis: ["company_catalog"],
});
expect(!incompleteConfirmation.eligible, "Catalog-only evidence must not confirm a value.");

const completeConfirmation = assessConfirmationCandidate({
  sourceLevel: "A",
  exactSubject: true,
  evidenceBasis: ["measurement_record"],
  reviewerId: "00000000-0000-4000-8000-000000000001",
  reviewedAt: "2026-08-30T00:00:00.000Z",
});
expect(completeConfirmation.eligible, "Exact reviewed Level A evidence should pass eligibility.");

const conflict = assessConfirmationCandidate({
  sourceLevel: "A",
  exactSubject: true,
  evidenceBasis: ["drawing"],
  reviewerId: "00000000-0000-4000-8000-000000000001",
  reviewedAt: "2026-08-30T00:00:00.000Z",
  hasConflict: true,
});
expect(!conflict.eligible, "Conflicting evidence must remain blocked.");

const matchingParity = compareShadowTableRows(
  [
    {
      id: "row-1",
      lifecycle_state: "INGESTED",
      raw_snapshot: { source: "catalog", nested: { left: 1, right: 2 } },
    },
  ],
  [
    {
      id: "row-1",
      lifecycle_state: "INGESTED",
      raw_snapshot: { nested: { right: 2, left: 1 }, source: "catalog" },
      created_at: "database-generated",
    },
  ],
);
expect(matchingParity.matches, "Parity must ignore JSON object order and database-only columns.");

const changedStatusParity = compareShadowTableRows(
  [{ id: "row-1", lifecycle_state: "INGESTED" }],
  [{ id: "row-1", lifecycle_state: "VERIFIED" }],
);
expect(!changedStatusParity.matches, "Parity must detect a changed lifecycle state.");
expect(changedStatusParity.missing.length === 1, "Parity must report the missing expected row.");
expect(
  changedStatusParity.unexpected.length === 1,
  "Parity must report the unexpected destination row.",
);

const duplicateParity = compareShadowTableRows(
  [{ id: "row-1", verification_status: "DATA_CONFLICT" }],
  [
    { id: "row-1", verification_status: "DATA_CONFLICT" },
    { id: "row-1", verification_status: "DATA_CONFLICT" },
  ],
);
expect(!duplicateParity.matches, "Parity must detect duplicate destination rows.");

if (failures.length > 0) {
  console.error("Catalog domain tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Catalog domain tests passed.");
}
