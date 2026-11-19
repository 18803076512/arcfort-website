import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { observeDocumentRefresh, type RefreshRequest } from "./document-refresh-observer.ts";

const origin = "http://127.0.0.1:3000";
const pathname = "/console/products/synthetic-private-id/documents";
const privateMarker = "SYNTHETIC_PRIVATE_VALUE_MUST_NOT_APPEAR";
const request = (
  options: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    error?: string;
  } = {},
): RefreshRequest => ({
  url: () => options.url ?? `${origin}${pathname}?_rsc=${privateMarker}`,
  method: () => options.method ?? "GET",
  headers: () => ({ authorization: privateMarker, ...options.headers }),
  failure: () => ({ errorText: options.error ?? "net::ERR_ABORTED" }),
});
const response = (value: RefreshRequest, status = 200) => ({
  request: () => value,
  status: () => status,
});

// The old aggregate could report 1/1/1 even though the 200 belonged to an older request.
{
  const page = new EventEmitter();
  const older = request();
  page.emit("request", older);
  const observer = observeDocumentRefresh(page, origin, pathname, () => 0);
  const current = request();
  page.emit("request", current);
  page.emit("response", response(older));
  page.emit("requestfailed", current);
  assert.equal(observer.traffic.requests, 1);
  assert.equal(observer.traffic.responses, 0);
  assert.equal(observer.traffic.failures, 1);
  assert.deepEqual(observer.traffic.preexistingEvents, { responses: 1, finished: 0, failures: 0 });
  assert.deepEqual(observer.traffic.samples, [
    {
      request: 1,
      status: null,
      finished: false,
      failed: true,
      failureCategory: "aborted",
      requestElapsedMs: 0,
      responseElapsedMs: null,
      finishedElapsedMs: null,
      failedElapsedMs: 0,
    },
  ]);
  observer.stop();
}

// A header response is distinct from completion, including an actual same-request 200 then failure.
{
  const page = new EventEmitter();
  const olderFinished = request();
  const olderFailed = request();
  page.emit("request", olderFinished);
  page.emit("request", olderFailed);
  const observer = observeDocumentRefresh(page, origin, pathname, () => 0);
  page.emit("response", response(olderFinished));
  page.emit("requestfinished", olderFinished);
  page.emit("requestfailed", olderFailed);
  const failed = request({ error: "net::ERR_CONNECTION_RESET" });
  const finished = request({ url: `${origin}${pathname}`, headers: { rsc: "1" } });
  page.emit("request", failed);
  page.emit("request", finished);
  page.emit("response", response(failed));
  page.emit("requestfailed", failed);
  page.emit("response", response(finished));
  assert.equal(observer.traffic.finished, 0);
  page.emit("requestfinished", finished);
  assert.deepEqual(observer.traffic.preexistingEvents, { responses: 1, finished: 1, failures: 1 });
  assert.equal(observer.traffic.requests, 2);
  assert.equal(observer.traffic.responses, 2);
  assert.equal(observer.traffic.finished, 1);
  assert.equal(observer.traffic.failures, 1);
  assert.deepEqual(observer.traffic.samples, [
    {
      request: 1,
      status: 200,
      finished: false,
      failed: true,
      failureCategory: "connection_reset",
      requestElapsedMs: 0,
      responseElapsedMs: 0,
      finishedElapsedMs: null,
      failedElapsedMs: 0,
    },
    {
      request: 2,
      status: 200,
      finished: true,
      failed: false,
      failureCategory: null,
      requestElapsedMs: 0,
      responseElapsedMs: 0,
      finishedElapsedMs: 0,
      failedElapsedMs: null,
    },
  ]);
  observer.stop();
}

// Only the intended origin, path, GET method and RSC requests enter the observation.
{
  const page = new EventEmitter();
  const observer = observeDocumentRefresh(page, origin, pathname);
  for (const unrelated of [
    request({ url: `${origin}${pathname}` }),
    request({ url: `https://example.invalid${pathname}?_rsc=${privateMarker}` }),
    request({ url: `${origin}/console/other?_rsc=${privateMarker}` }),
    request({ method: "POST" }),
    request({ url: "invalid URL" }),
  ]) {
    page.emit("request", unrelated);
    page.emit("response", response(unrelated));
    page.emit("requestfinished", unrelated);
    page.emit("requestfailed", unrelated);
  }
  assert.equal(observer.traffic.requests, 0);
  assert.equal(observer.traffic.responses, 0);
  assert.equal(observer.traffic.finished, 0);
  assert.equal(observer.traffic.failures, 0);
  assert.deepEqual(observer.traffic.preexistingEvents, { responses: 0, finished: 0, failures: 0 });
  observer.stop();
}

// Failure-only reports remain bounded and cannot copy private URL/header/error values into samples.
{
  const page = new EventEmitter();
  const observer = observeDocumentRefresh(page, origin, pathname);
  for (let index = 0; index < 12; index++) {
    const value = request({ error: `${privateMarker} ${"x".repeat(1000)}` });
    page.emit("request", value);
    page.emit("response", response(value));
    page.emit("requestfailed", value);
  }
  assert.equal(observer.traffic.requests, 12);
  assert.equal(observer.traffic.responses, 12);
  assert.equal(observer.traffic.failures, 12);
  assert.equal(observer.traffic.samples.length, 8);
  assert.equal(observer.traffic.samplesOmitted, 4);
  assert.equal(observer.traffic.responseStatuses.length, 8);
  assert.ok(observer.traffic.samples.every((sample) => sample.failureCategory === "other"));
  const serialized = JSON.stringify(observer.traffic);
  for (const privateText of [privateMarker, pathname, origin, "authorization", "errorText", "_rsc"])
    assert.equal(serialized.includes(privateText), false);
  assert.ok(serialized.length < 4096);
  const snapshot = JSON.stringify(observer.snapshot());
  for (const privateText of [privateMarker, pathname, origin, "authorization", "errorText", "_rsc"])
    assert.equal(snapshot.includes(privateText), false);
  assert.ok(snapshot.length < 4096);
  observer.stop();
}

// Stopping twice removes exactly this observer's four listeners and freezes its report.
{
  const page = new EventEmitter();
  const events = ["request", "response", "requestfinished", "requestfailed"];
  for (const event of events) page.on(event, () => {});
  const observer = observeDocumentRefresh(page, origin, pathname);
  for (const event of events) assert.equal(page.listenerCount(event), 2);
  const before = JSON.stringify(observer.traffic);
  observer.stop();
  observer.stop();
  for (const event of events) assert.equal(page.listenerCount(event), 1);
  const value = request();
  page.emit("request", value);
  page.emit("response", response(value));
  page.emit("requestfinished", value);
  page.emit("requestfailed", value);
  assert.equal(JSON.stringify(observer.traffic), before);
}

// An abort already observed when the locator rejects stays distinct from later diagnostics.
{
  let now = 1_900_000_000_000;
  const page = new EventEmitter();
  const observer = observeDocumentRefresh(page, origin, pathname, () => now);
  const current = request();
  now += 1.2;
  page.emit("request", current);
  now += 2.8;
  page.emit("response", response(current));
  const waitStartedAtMs = observer.elapsedMs();
  now += 15;
  page.emit("requestfailed", current);
  now += 1;
  const rejected = observer.snapshot();
  assert.equal(waitStartedAtMs, 4);
  assert.equal(rejected.capturedElapsedMs, 20);
  assert.deepEqual(rejected.samples[0], {
    request: 1,
    status: 200,
    finished: false,
    failed: true,
    failureCategory: "aborted",
    requestElapsedMs: 1,
    responseElapsedMs: 4,
    finishedElapsedMs: null,
    failedElapsedMs: 19,
  });
  assert.equal(JSON.stringify(rejected).includes("1900000000000"), false);
  observer.stop();
}

// Async diagnostics can observe a later abort without changing the rejection snapshot.
{
  let now = 0;
  const page = new EventEmitter();
  const observer = observeDocumentRefresh(page, origin, pathname, () => now);
  const current = request();
  page.emit("request", current);
  now = 3;
  page.emit("response", response(current));
  now = 15;
  const rejected = observer.snapshot();
  const before = JSON.stringify(rejected);
  await Promise.resolve().then(() => {
    now = 17;
    page.emit("requestfailed", current);
    const later = request();
    page.emit("request", later);
    page.emit("response", response(later, 204));
    page.emit("requestfinished", later);
    page.emit("response", response(request()));
  });
  const diagnosed = observer.snapshot();
  assert.equal(rejected.failures, 0);
  assert.equal(rejected.samples[0].failedElapsedMs, null);
  assert.equal(diagnosed.failures, 1);
  assert.equal(diagnosed.samples[0].failedElapsedMs, 17);
  assert.equal(diagnosed.samples[1].finishedElapsedMs, 17);
  assert.deepEqual(rejected.responseStatuses, [200]);
  assert.deepEqual(diagnosed.responseStatuses, [200, 204]);
  assert.equal(rejected.preexistingEvents.responses, 0);
  assert.equal(diagnosed.preexistingEvents.responses, 1);
  assert.equal(JSON.stringify(rejected), before);
  assert.ok(Object.isFrozen(rejected));
  assert.ok(Object.isFrozen(rejected.samples));
  assert.ok(Object.isFrozen(rejected.samples[0]));
  assert.ok(Object.isFrozen(rejected.responseStatuses));
  assert.ok(Object.isFrozen(rejected.preexistingEvents));
  assert.equal(Reflect.set(rejected.samples[0], "failed", true), false);
  observer.stop();
}

// Equal rounded times cannot establish order; membership in the rejection snapshot can.
{
  const page = new EventEmitter();
  const observer = observeDocumentRefresh(page, origin, pathname, () => 10);
  const current = request();
  page.emit("request", current);
  page.emit("response", response(current, 999));
  const rejected = observer.snapshot();
  page.emit("requestfailed", current);
  const diagnosed = observer.snapshot();
  assert.equal(rejected.capturedElapsedMs, diagnosed.samples[0].failedElapsedMs);
  assert.equal(rejected.samples[0].failed, false);
  assert.equal(diagnosed.samples[0].failed, true);
  assert.equal(rejected.samples[0].status, null);
  assert.equal(rejected.samples[0].responseElapsedMs, 0);
  assert.deepEqual(rejected.responseStatuses, []);
  observer.stop();
}

console.log(
  "Document refresh correlation, monotonic timing, rejection snapshots, privacy bounds and cleanup regressions passed.",
);
