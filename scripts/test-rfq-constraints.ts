#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  rfqFieldLimits,
  rfqMaxFileSize,
  type RfqTextValues,
  validateRfqFiles,
  validateRfqTextValues,
} from "../lib/rfq-constraints.ts";
import { validateRfqFileContents } from "../lib/rfq-file-content.ts";
import {
  getRfqSubmissionFailureMessage,
  isRfqSubmissionAbortError,
  rfqSubmissionTimeoutMs,
  rfqSubmissionTimeoutSeconds,
} from "../lib/rfq-client.ts";
import {
  createFixedWindowRateLimiter,
  getRfqRateLimitClientKey,
  getRfqRateLimitHeaders,
} from "../lib/rfq-rate-limit.ts";
import { createRfqReference } from "../lib/rfq-reference.ts";
import {
  createRfqEmailIdempotencyKey,
  createRfqReferenceFromSubmissionToken,
  createRfqSubmissionToken,
  getOrCreateRfqSubmissionAttempt,
  isRfqSubmissionTokenCurrent,
  normalizeRfqSubmissionToken,
  rfqEmailIdempotencyWindowHours,
} from "../lib/rfq-idempotency.ts";
import { isTrustedRfqRequest } from "../lib/rfq-request-security.ts";
import { buildRfqProductRequirements, formatRfqListItems } from "../lib/rfq-list.ts";

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

const abortError = new Error("Request aborted");
abortError.name = "AbortError";
assert.equal(rfqSubmissionTimeoutMs, 45_000);
assert.equal(rfqSubmissionTimeoutSeconds, 45);
assert.equal(isRfqSubmissionAbortError(abortError), true);
assert.equal(isRfqSubmissionAbortError(new Error("Network unavailable")), false);
assert.match(getRfqSubmissionFailureMessage(abortError), /same protected submission identifier/i);
assert.match(getRfqSubmissionFailureMessage(new Error("Network unavailable")), /try again/i);

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

const lineItemRequirements = [
  {
    sku: "AF-MIG-CT-0005",
    name: "MIG Contact Tip M6 1.0mm",
    category: "MIG/MAG Torch Parts",
    categorySlug: "mig-mag-torch-parts",
    slug: "mig-contact-tip-m6-1-0mm",
    requestedQuantity: "500 pcs",
    buyerReference: "MB15 reference, drawing item 2",
  },
];

assert.equal(
  formatRfqListItems(lineItemRequirements),
  "1. MIG Contact Tip M6 1.0mm | SKU: AF-MIG-CT-0005 | Category: MIG/MAG Torch Parts | Requested quantity: 500 pcs | Buyer reference: MB15 reference, drawing item 2",
);
assert.match(
  buildRfqProductRequirements(lineItemRequirements, "Private label bag required."),
  /Additional product requirements:\nPrivate label bag required\./,
);
assert.doesNotMatch(
  formatRfqListItems([
    {
      ...lineItemRequirements[0],
      requestedQuantity: "",
      buyerReference: "",
    },
  ]),
  /Requested quantity|Buyer reference/,
);

assert.equal(
  validateRfqFiles([{ name: "drawing.exe", size: 1024 }]),
  "Allowed files: PDF, Excel, CSV, Word, JPG and PNG.",
);
assert.equal(validateRfqFiles([{ name: "drawing.pdf", size: 1024 }]), null);
assert.equal(
  validateRfqFiles([{ name: "drawing.pdf", size: rfqMaxFileSize + 1 }]),
  "Total attachment size must be 4 MB or smaller.",
);

const validFileFixtures = [
  new File([new TextEncoder().encode("%PDF-1.7\n")], "drawing.pdf"),
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "sample.jpg"),
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe1])], "sample.jpeg"),
  new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "sample.png"),
  new File([new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])], "product-list.xls"),
  new File([new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])], "requirements.doc"),
  new File(
    [
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      new TextEncoder().encode("[Content_Types].xml xl/workbook.xml"),
    ],
    "product-list.xlsx",
  ),
  new File(
    [
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      new TextEncoder().encode("[Content_Types].xml word/document.xml"),
    ],
    "requirements.docx",
  ),
  new File([new TextEncoder().encode("sku,quantity\nAF-MIG-CT-0001,500\n")], "products.csv"),
  new File(
    [new Uint8Array([0xff, 0xfe, 0x73, 0x00, 0x6b, 0x00, 0x75, 0x00, 0x0a, 0x00])],
    "products-utf16.csv",
  ),
];

for (const file of validFileFixtures) {
  assert.equal(await validateRfqFileContents([file]), null);
}

assert.match(
  (await validateRfqFileContents([
    new File([new Uint8Array([0x4d, 0x5a, 0x90, 0x00])], "renamed.pdf"),
  ])) ?? "",
  /does not match its file extension/,
);
assert.match(
  (await validateRfqFileContents([
    new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04])], "renamed.docx"),
  ])) ?? "",
  /does not match its file extension/,
);
assert.match(
  (await validateRfqFileContents([
    new File([new Uint8Array([0x4d, 0x5a, 0x00, 0x01])], "renamed.csv"),
  ])) ?? "",
  /does not match its file extension/,
);
assert.match(
  (await validateRfqFileContents([new File([new Uint8Array([0xef, 0xbb, 0xbf])], "empty.csv")])) ??
    "",
  /does not match its file extension/,
);

assert.equal(
  createRfqReference(new Date("2026-07-26T08:00:00.000Z"), "12345678-abcd-4000-8000-123456789abc"),
  "AF-RFQ-20260726-12345678",
);

const submissionUuid = "12345678-abcd-4000-8000-123456789abc";
const alternateSubmissionUuid = "87654321-dcba-4000-8000-cba987654321";
const submissionToken = createRfqSubmissionToken(
  new Date("2026-08-02T08:00:00.000Z"),
  submissionUuid,
);
assert.equal(submissionToken, "20260802-12345678-abcd-4000-8000-123456789abc");
assert.equal(
  normalizeRfqSubmissionToken("20260802-12345678-ABCD-4000-8000-123456789ABC"),
  submissionToken,
);
assert.equal(normalizeRfqSubmissionToken("20260230-12345678-abcd-4000-8000-123456789abc"), null);
assert.equal(normalizeRfqSubmissionToken("not-a-submission-token"), null);
assert.equal(
  isRfqSubmissionTokenCurrent(submissionToken, new Date("2026-08-02T23:59:00.000Z")),
  true,
);
assert.equal(
  isRfqSubmissionTokenCurrent(submissionToken, new Date("2026-08-03T00:01:00.000Z")),
  true,
);
assert.equal(
  isRfqSubmissionTokenCurrent(submissionToken, new Date("2026-08-04T00:01:00.000Z")),
  false,
);
assert.equal(createRfqReferenceFromSubmissionToken(submissionToken), "AF-RFQ-20260802-12345678");
assert.equal(rfqEmailIdempotencyWindowHours, 24);
assert.equal(
  createRfqEmailIdempotencyKey("sales", submissionToken),
  `arcfort-rfq-sales/${submissionToken}`,
);
assert.equal(
  createRfqEmailIdempotencyKey("buyer", submissionToken),
  `arcfort-rfq-buyer/${submissionToken}`,
);
assert.notEqual(
  createRfqEmailIdempotencyKey("sales", submissionToken),
  createRfqEmailIdempotencyKey("buyer", submissionToken),
);
assert.ok(createRfqEmailIdempotencyKey("sales", submissionToken).length <= 256);

const firstSubmissionAttempt = getOrCreateRfqSubmissionAttempt(
  null,
  "unchanged-form",
  new Date("2026-08-02T08:00:00.000Z"),
  submissionUuid,
);
const retriedSubmissionAttempt = getOrCreateRfqSubmissionAttempt(
  firstSubmissionAttempt,
  "unchanged-form",
  new Date("2026-08-02T08:01:00.000Z"),
  alternateSubmissionUuid,
);
const changedSubmissionAttempt = getOrCreateRfqSubmissionAttempt(
  firstSubmissionAttempt,
  "changed-form",
  new Date("2026-08-02T08:01:00.000Z"),
  alternateSubmissionUuid,
);
const expiredSubmissionAttempt = getOrCreateRfqSubmissionAttempt(
  firstSubmissionAttempt,
  "unchanged-form",
  new Date("2026-08-04T08:01:00.000Z"),
  alternateSubmissionUuid,
);
assert.equal(retriedSubmissionAttempt.token, firstSubmissionAttempt.token);
assert.notEqual(changedSubmissionAttempt.token, firstSubmissionAttempt.token);
assert.equal(changedSubmissionAttempt.fingerprint, "changed-form");
assert.notEqual(expiredSubmissionAttempt.token, firstSubmissionAttempt.token);

const productionUrl = "https://www.arcfortweld.com";

assert.equal(
  isTrustedRfqRequest({
    requestUrl: `${productionUrl}/api/rfq`,
    requestHost: "www.arcfortweld.com",
    origin: productionUrl,
    fetchSite: "same-origin",
    productionUrl,
  }),
  true,
);
assert.equal(
  isTrustedRfqRequest({
    requestUrl: "https://arcfort-preview.vercel.app/api/rfq",
    requestHost: "arcfort-preview.vercel.app",
    origin: "https://arcfort-preview.vercel.app",
    fetchSite: "same-origin",
    productionUrl,
  }),
  true,
);
assert.equal(
  isTrustedRfqRequest({
    requestUrl: `${productionUrl}/api/rfq`,
    requestHost: "www.arcfortweld.com",
    origin: null,
    fetchSite: null,
    productionUrl,
  }),
  true,
);
assert.equal(
  isTrustedRfqRequest({
    requestUrl: `${productionUrl}/api/rfq`,
    requestHost: "www.arcfortweld.com",
    origin: "https://untrusted.example",
    fetchSite: "cross-site",
    productionUrl,
  }),
  false,
);
assert.equal(
  isTrustedRfqRequest({
    requestUrl: `${productionUrl}/api/rfq`,
    requestHost: "www.arcfortweld.com",
    origin: "not-a-valid-origin",
    fetchSite: null,
    productionUrl,
  }),
  false,
);
assert.equal(
  isTrustedRfqRequest({
    requestUrl: "http://localhost:3104/api/rfq",
    requestHost: "127.0.0.1:3104",
    origin: "http://127.0.0.1:3104",
    fetchSite: "same-origin",
    productionUrl,
  }),
  true,
);

const testRateLimiter = createFixedWindowRateLimiter({
  limit: 2,
  windowMs: 1000,
  maxEntries: 2,
});
const firstAttempt = testRateLimiter.check("buyer-a", 1000);
const secondAttempt = testRateLimiter.check("buyer-a", 1100);
const blockedAttempt = testRateLimiter.check("buyer-a", 1200);
const resetAttempt = testRateLimiter.check("buyer-a", 2000);

assert.deepEqual(
  {
    allowed: firstAttempt.allowed,
    remaining: firstAttempt.remaining,
    resetAt: firstAttempt.resetAt,
  },
  {
    allowed: true,
    remaining: 1,
    resetAt: 2000,
  },
);
assert.equal(secondAttempt.allowed, true);
assert.equal(secondAttempt.remaining, 0);
assert.equal(blockedAttempt.allowed, false);
assert.equal(blockedAttempt.retryAfterSeconds, 1);
assert.equal(resetAttempt.allowed, true);
assert.equal(resetAttempt.remaining, 1);
assert.equal(resetAttempt.resetAt, 3000);

const rateLimitHeaders = getRfqRateLimitHeaders(blockedAttempt);
assert.equal(rateLimitHeaders["X-RateLimit-Limit"], "2");
assert.equal(rateLimitHeaders["X-RateLimit-Remaining"], "0");
assert.equal(rateLimitHeaders["X-RateLimit-Reset"], "2");
assert.equal(rateLimitHeaders["X-RateLimit-Policy"], "2;w=1");

const forwardedHeaders = new Headers({
  "x-vercel-forwarded-for": "203.0.113.25",
  "user-agent": "Test Browser",
});
assert.equal(
  getRfqRateLimitClientKey(forwardedHeaders),
  getRfqRateLimitClientKey(forwardedHeaders),
);
assert.notEqual(
  getRfqRateLimitClientKey(forwardedHeaders),
  getRfqRateLimitClientKey(
    new Headers({
      "x-vercel-forwarded-for": "203.0.113.26",
      "user-agent": "Test Browser",
    }),
  ),
);

console.log("RFQ constraint and reference tests passed.");
