#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  fetchRfqEmailProvider,
  isRfqProviderTimeoutError,
  rfqEmailProviderTimeoutMs,
  rfqEmailProviderTimeoutSeconds,
  RfqProviderTimeoutError,
} from "../lib/rfq-provider-timeout.ts";

assert.equal(rfqEmailProviderTimeoutMs, 12_000);
assert.equal(rfqEmailProviderTimeoutSeconds, 12);
assert.equal(isRfqProviderTimeoutError(new RfqProviderTimeoutError(10)), true);
assert.equal(isRfqProviderTimeoutError(new Error("network failure")), false);

let receivedSignalWasAborted: boolean | null = null;
const successResponse = await fetchRfqEmailProvider(
  "https://api.resend.com/emails",
  { method: "POST" },
  {
    fetchImplementation: async (_input, init) => {
      receivedSignalWasAborted = init?.signal?.aborted ?? null;
      return new Response(JSON.stringify({ id: "email-test" }), { status: 200 });
    },
    timeoutMs: 50,
  },
);
assert.equal(successResponse.ok, true);
assert.equal(receivedSignalWasAborted, false);

await assert.rejects(
  fetchRfqEmailProvider(
    "https://api.resend.com/emails",
    { method: "POST" },
    {
      fetchImplementation: (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("aborted by test timeout");
            error.name = "AbortError";
            reject(error);
          });
        }),
      timeoutMs: 10,
    },
  ),
  (error: unknown) =>
    error instanceof RfqProviderTimeoutError &&
    error.message === "RFQ email provider did not respond within 10 ms.",
);

const providerError = new Error("provider unavailable");
await assert.rejects(
  fetchRfqEmailProvider(
    "https://api.resend.com/emails",
    { method: "POST" },
    {
      fetchImplementation: async () => {
        throw providerError;
      },
      timeoutMs: 50,
    },
  ),
  providerError,
);

const routeSource = readFileSync(new URL("../app/api/rfq/route.ts", import.meta.url), "utf8");
const statusSource = readFileSync(
  new URL("../app/api/rfq/status/route.ts", import.meta.url),
  "utf8",
);
assert.equal((routeSource.match(/fetchRfqEmailProvider\(/g) ?? []).length, 2);
assert.doesNotMatch(routeSource, /fetch\("https:\/\/api\.resend\.com\/emails"/);
assert.match(routeSource, /export const maxDuration = 30/);
assert.match(routeSource, /Resend sales email timed out/);
assert.match(routeSource, /Resend buyer confirmation timed out/);
assert.match(statusSource, /providerRequestTimeoutSeconds: rfqEmailProviderTimeoutSeconds/);

console.log("RFQ provider timeout tests passed.");
