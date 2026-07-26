#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  rfqFieldLimits,
  rfqMaxFileSize,
  type RfqTextValues,
  validateRfqFiles,
  validateRfqTextValues,
} from "../lib/rfq-constraints.ts";
import {
  createFixedWindowRateLimiter,
  getRfqRateLimitClientKey,
  getRfqRateLimitHeaders,
} from "../lib/rfq-rate-limit.ts";
import { createRfqReference } from "../lib/rfq-reference.ts";
import { isTrustedRfqRequest } from "../lib/rfq-request-security.ts";

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
