import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { observeDocumentRefresh, type RefreshRequest } from "./document-refresh-observer.ts";

class NavigationSession extends EventEmitter {
  detached = 0;
  commands: string[] = [];
  failureAt: string | null = null;
  pendingAt: string | null = null;
  complete: (() => void) | undefined;
  async send(method: "Page.enable"): Promise<unknown>;
  async send(method: "Page.getFrameTree"): Promise<{ frameTree: { frame: { id: string } } }>;
  async send(method: string) {
    this.commands.push(method);
    if (this.pendingAt === method) await new Promise<void>((resolve) => (this.complete = resolve));
    if (this.failureAt === method) throw new Error(privateMarker);
    return { frameTree: { frame: { id: privateMarker } } };
  }
  async detach() {
    this.detached++;
    if (this.pendingAt === "detach")
      await new Promise<void>((resolve) => (this.complete = resolve));
    if (this.failureAt === "detach") throw new Error(privateMarker);
  }
}

const settlesWithinTestDeadline = async (work: Promise<unknown>) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      work,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Diagnostic work stalled the test.")), 1000);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const origin = "http://127.0.0.1:3000";
const pathname = "/console/products/synthetic-private-id/documents";
const privateMarker = "SYNTHETIC_PRIVATE_VALUE_MUST_NOT_APPEAR";
const request = (
  options: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    headersUnavailable?: boolean;
    error?: string;
  } = {},
): RefreshRequest => ({
  url: () => options.url ?? `${origin}${pathname}?_rsc=${privateMarker}`,
  method: () => options.method ?? "GET",
  headers: () => {
    if (options.headersUnavailable) throw new Error(privateMarker);
    return { authorization: privateMarker, ...options.headers };
  },
  failure: () => ({ errorText: options.error ?? "net::ERR_ABORTED" }),
});
const response = (
  value: RefreshRequest,
  status = 200,
  headers: Record<string, string> | "unavailable" = { "content-type": "text/x-component" },
) => ({
  request: () => value,
  status: () => status,
  headers: () => {
    if (headers === "unavailable") throw new Error(privateMarker);
    return { "set-cookie": privateMarker, ...headers };
  },
});
const consoleMessage = (type: string, text = privateMarker) => ({
  type: () => type,
  text: () => text,
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
      responseContentType: null,
      rscHeaderPresent: false,
      requestHeadersAvailable: true,
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
      responseContentType: "flight",
      rscHeaderPresent: false,
      requestHeadersAvailable: true,
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
      responseContentType: "flight",
      rscHeaderPresent: true,
      requestHeadersAvailable: true,
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

// Response MIME metadata stays an enum and does not imply response-stream completion.
for (const [headers, expected] of [
  [{ "content-type": "text/x-component; charset=utf-8" }, "flight"],
  [{ "content-type": " TEXT/X-COMPONENT ; charset=utf-8 " }, "flight"],
  [{ "content-type": "text/html; charset=utf-8" }, "html"],
  [{ "content-type": "application/json" }, "json"],
  [{ "content-type": "application/problem+json; charset=utf-8" }, "json"],
  [{ "content-type": `application/${privateMarker}` }, "other"],
  [{}, "missing"],
  ["unavailable", "unavailable"],
] as const) {
  const page = new EventEmitter();
  const observer = observeDocumentRefresh(page, origin, pathname, () => 0);
  const current = request();
  page.emit("request", current);
  page.emit("response", response(current, 200, headers));
  const captured = observer.snapshot();
  assert.equal(captured.samples[0].responseContentType, expected);
  assert.equal(captured.samples[0].finished, false);
  assert.equal(captured.samples[0].failed, false);
  assert.equal(JSON.stringify(captured).includes(privateMarker), false);
  await observer.stop();
}

// Header presence is independent of its value; an unavailable header lookup remains explicit.
{
  const page = new EventEmitter();
  const observer = observeDocumentRefresh(page, origin, pathname, () => 0);
  for (const current of [
    request(),
    request({ headers: { rsc: "0" } }),
    request({ url: `${origin}${pathname}`, headers: { rsc: "1" } }),
    request({ headersUnavailable: true }),
  ])
    page.emit("request", current);
  assert.deepEqual(
    observer.snapshot().samples.map(({ rscHeaderPresent, requestHeadersAvailable }) => ({
      rscHeaderPresent,
      requestHeadersAvailable,
    })),
    [
      { rscHeaderPresent: false, requestHeadersAvailable: true },
      { rscHeaderPresent: true, requestHeadersAvailable: true },
      { rscHeaderPresent: true, requestHeadersAvailable: true },
      { rscHeaderPresent: false, requestHeadersAvailable: false },
    ],
  );
  await observer.stop();
}

// Browser observations use the request clock and retain only allowlisted categories.
{
  let now = 100;
  const page = new EventEmitter();
  const observer = observeDocumentRefresh(page, origin, pathname, () => now);
  for (const type of ["log", "info", "debug"]) page.emit("console", consoleMessage(type));
  now = 101.2;
  page.emit(
    "console",
    consoleMessage(
      "error",
      `Failed to fetch RSC payload for ${origin}${pathname}?${privateMarker}. Falling back to browser navigation. ${privateMarker}`,
    ),
  );
  now = 102.2;
  page.emit("console", consoleMessage("error"));
  now = 103.2;
  page.emit("console", consoleMessage("warning"));
  now = 104.2;
  page.emit("pageerror", new Error(privateMarker));
  const snapshot = observer.snapshot();
  assert.deepEqual(snapshot.browserEvents, [
    { event: "console", elapsedMs: 1, category: "router_rsc_fetch_failure" },
    { event: "console", elapsedMs: 2, category: "console_error" },
    { event: "console", elapsedMs: 3, category: "console_warning" },
    { event: "pageerror", elapsedMs: 4, category: "uncaught" },
  ]);
  assert.equal(snapshot.browserEventsOmitted, 0);
  for (const privateText of [privateMarker, pathname, origin])
    assert.equal(JSON.stringify(snapshot).includes(privateText), false);
  await observer.stop();
}

// Failure-only reports remain bounded and cannot copy private URL/header/error values into samples.
{
  const page = new EventEmitter();
  const observer = observeDocumentRefresh(page, origin, pathname);
  for (let index = 0; index < 12; index++) {
    const value = request({ error: `${privateMarker} ${"x".repeat(1000)}` });
    page.emit("request", value);
    page.emit("response", response(value, 200, { "content-type": `private/${privateMarker}` }));
    page.emit("requestfailed", value);
    page.emit("console", consoleMessage("error", `${privateMarker} ${"x".repeat(1000)}`));
    page.emit("pageerror", new Error(privateMarker));
  }
  assert.equal(observer.traffic.requests, 12);
  assert.equal(observer.traffic.responses, 12);
  assert.equal(observer.traffic.failures, 12);
  assert.equal(observer.traffic.samples.length, 8);
  assert.equal(observer.traffic.samplesOmitted, 4);
  assert.equal(observer.traffic.responseStatuses.length, 8);
  assert.equal(observer.traffic.responseStatusesOmitted, 4);
  assert.equal(observer.traffic.browserEvents.length, 8);
  assert.equal(observer.traffic.browserEventsOmitted, 16);
  assert.ok(observer.traffic.samples.every((sample) => sample.failureCategory === "other"));
  const serialized = JSON.stringify(observer.traffic);
  for (const privateText of [privateMarker, pathname, origin, "authorization", "errorText", "_rsc"])
    assert.equal(serialized.includes(privateText), false);
  assert.ok(serialized.length < 8192);
  const snapshot = JSON.stringify(observer.snapshot());
  for (const privateText of [privateMarker, pathname, origin, "authorization", "errorText", "_rsc"])
    assert.equal(snapshot.includes(privateText), false);
  assert.ok(snapshot.length < 8192);
  observer.stop();
}

// Stopping twice removes this observer's listeners while preserving unrelated subscribers.
{
  const page = new EventEmitter();
  const events = [
    "request",
    "response",
    "requestfinished",
    "requestfailed",
    "console",
    "pageerror",
  ];
  for (const event of events) page.on(event, () => {});
  const observer = observeDocumentRefresh(page, origin, pathname);
  for (const event of events) assert.equal(page.listenerCount(event), 2);
  const before = JSON.stringify(observer.traffic);
  await observer.stop();
  await observer.stop();
  for (const event of events) assert.equal(page.listenerCount(event), 1);
  const value = request();
  page.emit("request", value);
  page.emit("response", response(value));
  page.emit("requestfinished", value);
  page.emit("requestfailed", value);
  page.emit("console", consoleMessage("error"));
  page.emit("pageerror", new Error(privateMarker));
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
    responseContentType: "flight",
    rscHeaderPresent: false,
    requestHeadersAvailable: true,
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
  page.emit("console", consoleMessage("warning"));
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
    page.emit("console", consoleMessage("error"));
    page.emit("pageerror", new Error(privateMarker));
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
  assert.deepEqual(rejected.browserEvents, [
    { event: "console", elapsedMs: 3, category: "console_warning" },
  ]);
  assert.equal(diagnosed.browserEvents.length, 3);
  assert.equal(diagnosed.browserEvents[1].elapsedMs, 17);
  assert.equal(diagnosed.browserEvents[2].elapsedMs, 17);
  assert.equal(JSON.stringify(rejected), before);
  assert.ok(Object.isFrozen(rejected));
  assert.ok(Object.isFrozen(rejected.samples));
  assert.ok(Object.isFrozen(rejected.samples[0]));
  assert.ok(Object.isFrozen(rejected.responseStatuses));
  assert.ok(Object.isFrozen(rejected.preexistingEvents));
  assert.ok(Object.isFrozen(rejected.browserEvents));
  assert.ok(Object.isFrozen(rejected.browserEvents[0]));
  assert.equal(Reflect.set(rejected.samples[0], "failed", true), false);
  assert.equal(Reflect.set(rejected.browserEvents[0], "category", "console_error"), false);
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

// CDP's same-document history/anchor events must never become cross-document navigation evidence.
{
  let now = 100;
  const page = new EventEmitter();
  const session = new NavigationSession();
  const observer = observeDocumentRefresh(page, origin, pathname, () => now);
  const beforeSetup = observer.snapshot();
  assert.deepEqual(beforeSetup.capabilities, {
    mainFrameNavigation: false,
    pagehide: false,
    pageshow: false,
  });
  await observer.startNavigationObservation(async () => session);
  await observer.startNavigationObservation(async () => {
    throw new Error("A second diagnostic session must not be created.");
  });
  assert.deepEqual(session.commands, ["Page.getFrameTree", "Page.enable"]);
  session.emit("Page.frameNavigated", { frame: { id: "child", parentId: privateMarker } });
  session.emit("Page.navigatedWithinDocument", {
    frameId: "child",
    navigationType: "historyApi",
    url: `${origin}/${privateMarker}`,
  });
  now = 104;
  session.emit("Page.navigatedWithinDocument", {
    frameId: privateMarker,
    navigationType: "historyApi",
    url: `${origin}/${privateMarker}`,
  });
  now = 107;
  session.emit("Page.navigatedWithinDocument", {
    frameId: privateMarker,
    navigationType: "fragment",
    url: `${origin}/#${privateMarker}`,
  });
  const rejected = observer.snapshot();
  now = 113;
  session.emit("Page.frameNavigated", { frame: { id: `${privateMarker}-new-document` } });
  now = 115;
  session.emit("Page.navigatedWithinDocument", {
    frameId: `${privateMarker}-new-document`,
    navigationType: privateMarker,
  });
  assert.deepEqual(observer.traffic.browserEvents, [
    {
      event: "main_frame_same_document_navigation",
      elapsedMs: 4,
      category: "history_api",
    },
    {
      event: "main_frame_same_document_navigation",
      elapsedMs: 7,
      category: "fragment",
    },
    {
      event: "main_frame_cross_document_navigation",
      elapsedMs: 13,
      category: null,
    },
    {
      event: "main_frame_same_document_navigation",
      elapsedMs: 15,
      category: "other",
    },
  ]);
  assert.equal(rejected.browserEvents.length, 2);
  assert.equal(beforeSetup.capabilities.mainFrameNavigation, false);
  assert.equal(rejected.capabilities.mainFrameNavigation, true);
  assert.ok(Object.isFrozen(rejected.capabilities));
  assert.equal(JSON.stringify(observer.snapshot()).includes(privateMarker), false);
  await observer.stop();
}

// Session startup/partial failure and teardown preserve outside listeners and the original test.
{
  for (const failureAt of [null, "Page.getFrameTree", "Page.enable", "detach", "create"]) {
    const page = new EventEmitter();
    const session = new NavigationSession();
    session.failureAt = failureAt;
    const events = ["Page.frameNavigated", "Page.navigatedWithinDocument"];
    for (const event of events) session.on(event, () => {});
    const observer = observeDocumentRefresh(page, origin, pathname);
    await observer.startNavigationObservation(async () => {
      if (failureAt === "create") throw new Error(privateMarker);
      return session;
    });
    const failedSetup = failureAt !== null && failureAt !== "detach";
    assert.equal(observer.traffic.diagnosticSetupFailed, failedSetup);
    assert.equal(observer.traffic.capabilities.mainFrameNavigation, !failedSetup);
    await observer.stop();
    await observer.stop();
    for (const event of events) assert.equal(session.listenerCount(event), 1);
    assert.equal(session.detached, failureAt === "create" ? 0 : 1);
    assert.equal(observer.traffic.diagnosticCleanupFailed, failureAt === "detach");
    const afterStop = JSON.stringify(observer.snapshot().browserEvents);
    session.emit("Page.frameNavigated", { frame: { id: privateMarker } });
    session.emit("Page.navigatedWithinDocument", { frameId: privateMarker });
    assert.equal(JSON.stringify(observer.snapshot().browserEvents), afterStop);
    assert.equal(JSON.stringify(observer.snapshot()).includes(privateMarker), false);
  }
}

// Stopping while session creation is pending still cleans the eventual session without subscribing.
{
  const page = new EventEmitter();
  const session = new NavigationSession();
  const observer = observeDocumentRefresh(page, origin, pathname);
  let create!: (session: NavigationSession) => void;
  const starting = observer.startNavigationObservation(
    () => new Promise((resolve) => (create = resolve)),
  );
  const stopping = observer.stop();
  create(session);
  await Promise.all([starting, stopping]);
  assert.equal(session.detached, 1);
  assert.deepEqual(session.commands, []);
  assert.equal(session.listenerCount("Page.frameNavigated"), 0);
  assert.equal(session.listenerCount("Page.navigatedWithinDocument"), 0);
  assert.equal(observer.traffic.capabilities.mainFrameNavigation, false);
}

// Stalled setup returns within its diagnostic budget; late completions cannot revive observation.
{
  for (const pendingAt of ["create", "Page.getFrameTree", "Page.enable"]) {
    const page = new EventEmitter();
    const session = new NavigationSession();
    session.pendingAt = pendingAt;
    const observer = observeDocumentRefresh(page, origin, pathname);
    let created: ((session: NavigationSession) => void) | undefined;
    const starting = observer.startNavigationObservation(
      () =>
        pendingAt === "create"
          ? new Promise((resolve) => (created = resolve))
          : Promise.resolve(session),
      5,
    );
    await settlesWithinTestDeadline(starting);
    assert.equal(observer.traffic.diagnosticSetupFailed, true);
    assert.equal(observer.traffic.capabilities.mainFrameNavigation, false);
    await settlesWithinTestDeadline(observer.stop());
    const stopped = JSON.stringify(observer.traffic);
    assert.equal(session.listenerCount("Page.frameNavigated"), 0);
    assert.equal(session.listenerCount("Page.navigatedWithinDocument"), 0);
    if (pendingAt === "create") created!(session);
    else session.complete!();
    await new Promise<void>((resolve) => setImmediate(resolve));
    session.emit("Page.frameNavigated", { frame: { id: privateMarker } });
    session.emit("Page.navigatedWithinDocument", { frameId: privateMarker });
    assert.equal(session.detached, 1);
    assert.equal(session.listenerCount("Page.frameNavigated"), 0);
    assert.equal(session.listenerCount("Page.navigatedWithinDocument"), 0);
    assert.equal(JSON.stringify(observer.traffic), stopped);
  }
}

// A never-resolving detach cannot replace or indefinitely delay a browser failure.
{
  const page = new EventEmitter();
  const session = new NavigationSession();
  session.pendingAt = "detach";
  const observer = observeDocumentRefresh(page, origin, pathname);
  await observer.startNavigationObservation(async () => session, 5);
  const browserFailure = new Error("Original synthetic locator failure.");
  await assert.rejects(
    settlesWithinTestDeadline(
      (async () => {
        try {
          throw browserFailure;
        } finally {
          await observer.stop();
        }
      })(),
    ),
    (failure) => failure === browserFailure,
  );
  assert.equal(observer.traffic.diagnosticCleanupFailed, true);
  assert.equal(session.listenerCount("Page.frameNavigated"), 0);
  assert.equal(session.listenerCount("Page.navigatedWithinDocument"), 0);
  const stopped = JSON.stringify(observer.traffic);
  session.complete!();
  await new Promise<void>((resolve) => setImmediate(resolve));
  await observer.stop();
  assert.equal(session.detached, 1);
  assert.equal(JSON.stringify(observer.traffic), stopped);
}

console.log(
  "Document refresh correlation, response metadata, browser categories, rejection snapshots, privacy bounds and cleanup regressions passed.",
);
