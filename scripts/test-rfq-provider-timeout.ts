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

async function beforeWatchdog<T>(work: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Synthetic provider test did not settle.")),
          1000,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

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
assert.deepEqual(successResponse, { ok: true, messageId: "email-test" });
assert.equal(receivedSignalWasAborted, false);

for (const content of ["not-json", "null", JSON.stringify({ id: 42 })]) {
  assert.deepEqual(
    await fetchRfqEmailProvider(
      "https://api.resend.com/emails",
      { method: "POST" },
      {
        fetchImplementation: async () => new Response(content, { status: 200 }),
        timeoutMs: 50,
      },
    ),
    { ok: true, messageId: null },
    "An unreadable or absent optional ID must preserve observed provider acceptance.",
  );
}

const stalledBody = {
  signal: undefined as AbortSignal | undefined,
  controller: undefined as ReadableStreamDefaultController<Uint8Array> | undefined,
};
try {
  const accepted = await beforeWatchdog(
    fetchRfqEmailProvider(
      "https://api.resend.com/emails",
      { method: "POST" },
      {
        fetchImplementation: async (_input, init) => {
          stalledBody.signal = init?.signal ?? undefined;
          // Deliberately ignore abort: the independent deadline must still settle the caller.
          return new Response(
            new ReadableStream<Uint8Array>({
              start(controller) {
                stalledBody.controller = controller;
              },
            }),
            { status: 200 },
          );
        },
        timeoutMs: 10,
      },
    ),
  );
  assert.deepEqual(accepted, { ok: true, messageId: null });
  assert.equal(stalledBody.signal?.aborted, true);
} finally {
  stalledBody.controller?.error(new Error("Synthetic stalled-body cleanup."));
}

let rejectedBodyCanceled = false;
assert.deepEqual(
  await beforeWatchdog(
    fetchRfqEmailProvider(
      "https://api.resend.com/emails",
      { method: "POST" },
      {
        fetchImplementation: async () =>
          new Response(
            new ReadableStream({
              cancel() {
                rejectedBodyCanceled = true;
              },
            }),
            { status: 503 },
          ),
        timeoutMs: 50,
      },
    ),
  ),
  { ok: false, messageId: null },
);
assert.equal(rejectedBodyCanceled, true, "A rejected provider response body is not needed.");

await assert.rejects(
  beforeWatchdog(
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
  ),
  (error: unknown) =>
    error instanceof RfqProviderTimeoutError &&
    error.message === "RFQ email provider did not respond within 10 ms.",
);

const ignoredAbort = { signal: undefined as AbortSignal | undefined };
await assert.rejects(
  beforeWatchdog(
    fetchRfqEmailProvider(
      "https://api.resend.com/emails",
      { method: "POST" },
      {
        fetchImplementation: (_input, init) => {
          ignoredAbort.signal = init?.signal ?? undefined;
          return new Promise(() => {});
        },
        timeoutMs: 10,
      },
    ),
  ),
  RfqProviderTimeoutError,
);
assert.equal(ignoredAbort.signal?.aborted, true);

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

console.log("RFQ provider header/body deadline and acceptance tests passed without network calls.");
