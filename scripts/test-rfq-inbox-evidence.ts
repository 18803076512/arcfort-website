#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  formatRfqCheckedOutcome,
  validateRfqInboxEvidence,
  type RfqInboxEvidence,
} from "./rfq-inbox-evidence.ts";

const asOf = "2026-10-29";
const reference = "AF-RFQ-20261029-AB12CD34";
const unchecked: RfqInboxEvidence = {
  salesMailboxPlacementConfirmed: null,
  buyerMailboxPlacementConfirmed: null,
  salesAttachmentPresentConfirmed: null,
  inboxVerification: {
    submittedReference: null,
    submittedAt: null,
    sales: { observedReference: null, receivedAt: null, checkedAt: null },
    buyer: { observedReference: null, receivedAt: null, checkedAt: null },
    reviewedBy: null,
    reviewedAt: null,
  },
};

assert.deepEqual(validateRfqInboxEvidence(unchecked, asOf), []);
assert.equal(formatRfqCheckedOutcome(null, null), "Needs external confirmation");

const booleanOnly = structuredClone(unchecked);
booleanOnly.salesMailboxPlacementConfirmed = true;
assert.match(validateRfqInboxEvidence(booleanOnly, asOf).join(" "), /requires submission/);
assert.match(validateRfqInboxEvidence(booleanOnly, asOf).join(" "), /confirmed sales receipt/);

const verified = structuredClone(unchecked);
verified.salesMailboxPlacementConfirmed = true;
verified.buyerMailboxPlacementConfirmed = true;
verified.inboxVerification.submittedReference = reference;
verified.inboxVerification.submittedAt = "2026-10-29T10:00:00Z";
verified.inboxVerification.sales = {
  observedReference: reference,
  receivedAt: "2026-10-29T10:00:08Z",
  checkedAt: "2026-10-29T10:04:00Z",
};
verified.inboxVerification.buyer = {
  observedReference: reference,
  receivedAt: "2026-10-29T10:00:12Z",
  checkedAt: "2026-10-29T10:05:00Z",
};
verified.inboxVerification.reviewedBy = "owner-reviewer";
verified.inboxVerification.reviewedAt = "2026-10-29T10:06:00Z";
assert.deepEqual(validateRfqInboxEvidence(verified, asOf), []);
assert.equal(
  formatRfqCheckedOutcome(true, verified.inboxVerification.sales.checkedAt),
  "Confirmed on 2026-10-29",
);
assert.equal(
  formatRfqCheckedOutcome(false, verified.inboxVerification.sales.checkedAt, "attachment"),
  "Not present at check on 2026-10-29",
);

const withAttachment = structuredClone(verified);
withAttachment.salesAttachmentPresentConfirmed = true;
assert.deepEqual(validateRfqInboxEvidence(withAttachment, asOf), []);
withAttachment.salesAttachmentPresentConfirmed = false;
assert.deepEqual(validateRfqInboxEvidence(withAttachment, asOf), []);

const attachmentWithoutSales = structuredClone(unchecked);
attachmentWithoutSales.salesAttachmentPresentConfirmed = true;
assert.match(
  validateRfqInboxEvidence(attachmentWithoutSales, asOf).join(" "),
  /sales attachment outcome requires confirmed sales mailbox/,
);

for (const adjacentReference of ["AF-RFQ-20261028-AB12CD34", "AF-RFQ-20261030-AB12CD34"]) {
  const adjacentDay = structuredClone(verified);
  adjacentDay.inboxVerification.submittedReference = adjacentReference;
  adjacentDay.inboxVerification.sales.observedReference = adjacentReference;
  adjacentDay.inboxVerification.buyer.observedReference = adjacentReference;
  assert.deepEqual(validateRfqInboxEvidence(adjacentDay, asOf), []);
}

const distantReference = structuredClone(verified);
distantReference.inboxVerification.submittedReference = "AF-RFQ-20261031-AB12CD34";
distantReference.inboxVerification.sales.observedReference =
  distantReference.inboxVerification.submittedReference;
distantReference.inboxVerification.buyer.observedReference =
  distantReference.inboxVerification.submittedReference;
assert.match(validateRfqInboxEvidence(distantReference, asOf).join(" "), /within one UTC day/);

const impossibleReference = structuredClone(verified);
impossibleReference.inboxVerification.submittedReference = "AF-RFQ-20260230-AB12CD34";
impossibleReference.inboxVerification.sales.observedReference =
  impossibleReference.inboxVerification.submittedReference;
impossibleReference.inboxVerification.buyer.observedReference =
  impossibleReference.inboxVerification.submittedReference;
assert.match(validateRfqInboxEvidence(impossibleReference, asOf).join(" "), /within one UTC day/);

const mismatched = structuredClone(verified);
mismatched.inboxVerification.buyer.observedReference = "AF-RFQ-20261029-FF00EE11";
assert.match(validateRfqInboxEvidence(mismatched, asOf).join(" "), /buyer observed reference/);

const invalidReference = structuredClone(verified);
invalidReference.inboxVerification.submittedReference = "AF-RFQ-20261029-NOTHEX00";
assert.match(
  validateRfqInboxEvidence(invalidReference, asOf).join(" "),
  /submittedReference must be/,
);

const invalidDate = structuredClone(verified);
invalidDate.inboxVerification.sales.receivedAt = "2026-02-30T10:00:08Z";
assert.match(validateRfqInboxEvidence(invalidDate, asOf).join(" "), /real UTC ISO timestamp/);

const outOfOrder = structuredClone(verified);
outOfOrder.inboxVerification.sales.receivedAt = "2026-10-29T09:59:59Z";
assert.match(validateRfqInboxEvidence(outOfOrder, asOf).join(" "), /cannot precede submission/);

const prematureReview = structuredClone(verified);
prematureReview.inboxVerification.reviewedAt = "2026-10-29T10:03:00Z";
assert.match(
  validateRfqInboxEvidence(prematureReview, asOf).join(" "),
  /cannot precede a mailbox check/,
);

const futureReview = structuredClone(verified);
futureReview.inboxVerification.reviewedAt = "2026-10-30T10:06:00Z";
assert.match(
  validateRfqInboxEvidence(futureReview, asOf).join(" "),
  /after the production evidence date/,
);

const missingMessage = structuredClone(verified);
missingMessage.buyerMailboxPlacementConfirmed = false;
missingMessage.inboxVerification.buyer.observedReference = null;
missingMessage.inboxVerification.buyer.receivedAt = null;
assert.deepEqual(validateRfqInboxEvidence(missingMessage, asOf), []);

console.log("RFQ inbox evidence gate tests passed.");
