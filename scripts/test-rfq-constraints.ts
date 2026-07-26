#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  rfqFieldLimits,
  rfqMaxFileSize,
  type RfqTextValues,
  validateRfqFiles,
  validateRfqTextValues,
} from "../lib/rfq-constraints.ts";
import { createRfqReference } from "../lib/rfq-reference.ts";

const validValues: RfqTextValues = {
  name: "Alex Buyer",
  company: "Industrial Distributor Ltd.",
  email: "buyer@example.com",
  whatsapp: "+1 000 000 0000",
  country: "United States",
  productRequirements: "MIG contact tips, M6, quantity 500 pcs.",
  quantity: "500 pcs",
  message: "Please confirm packaging and lead time.",
};

assert.deepEqual(validateRfqTextValues(validValues), {});

const missingEmail = validateRfqTextValues({
  ...validValues,
  email: "",
});
assert.equal(missingEmail.email, "This field is required.");

const invalidEmail = validateRfqTextValues({
  ...validValues,
  email: "buyer-at-example.com",
});
assert.equal(invalidEmail.email, "Please enter a valid business email address.");

const longCompany = validateRfqTextValues({
  ...validValues,
  company: "A".repeat(rfqFieldLimits.company + 1),
});
assert.match(longCompany.company ?? "", /160 characters or fewer/);

assert.equal(
  validateRfqFiles([{ name: "drawing.exe", size: 1024 }]),
  "Allowed files: PDF, Excel, CSV, Word, JPG and PNG.",
);
assert.equal(validateRfqFiles([{ name: "drawing.pdf", size: 1024 }]), null);
assert.equal(
  validateRfqFiles([{ name: "drawing.pdf", size: rfqMaxFileSize + 1 }]),
  "Total attachment size must be 4 MB or smaller.",
);

assert.equal(
  createRfqReference(new Date("2026-07-26T08:00:00.000Z"), "12345678-abcd-4000-8000-123456789abc"),
  "AF-RFQ-20260726-12345678",
);

console.log("RFQ constraint and reference tests passed.");
