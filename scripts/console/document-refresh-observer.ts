// Diagnostic-only structural types keep the regression independent of a running browser/server.
export type RefreshRequest = {
  url: () => string;
  method: () => string;
  headers: () => Record<string, string>;
  failure: () => { errorText: string } | null;
};
type RefreshResponse = {
  request: () => RefreshRequest;
  status: () => number;
  headers: () => Record<string, string>;
};
type RequestListener = (request: RefreshRequest) => void;
type ResponseListener = (response: RefreshResponse) => void;
type ConsoleListener = (message: { type: () => string; text: () => string }) => void;
type CrossDocumentNavigation = { frame: { id: string; parentId?: string } };
type SameDocumentNavigation = { frameId: string; navigationType?: string };
// A separate, passive CDP session distinguishes history/anchor changes from document navigation.
export type RefreshNavigationSession = {
  send(method: "Page.enable"): Promise<unknown>;
  send(method: "Page.getFrameTree"): Promise<{ frameTree: { frame: { id: string } } }>;
  on(event: "Page.frameNavigated", listener: (event: CrossDocumentNavigation) => void): unknown;
  on(
    event: "Page.navigatedWithinDocument",
    listener: (event: SameDocumentNavigation) => void,
  ): unknown;
  off(event: "Page.frameNavigated", listener: (event: CrossDocumentNavigation) => void): unknown;
  off(
    event: "Page.navigatedWithinDocument",
    listener: (event: SameDocumentNavigation) => void,
  ): unknown;
  detach(): Promise<unknown>;
};
type RefreshEventSource = {
  on(event: "request", listener: RequestListener): unknown;
  on(event: "response", listener: ResponseListener): unknown;
  on(event: "requestfinished", listener: RequestListener): unknown;
  on(event: "requestfailed", listener: RequestListener): unknown;
  on(event: "console", listener: ConsoleListener): unknown;
  on(event: "pageerror", listener: () => void): unknown;
  off(event: "request", listener: RequestListener): unknown;
  off(event: "response", listener: ResponseListener): unknown;
  off(event: "requestfinished", listener: RequestListener): unknown;
  off(event: "requestfailed", listener: RequestListener): unknown;
  off(event: "console", listener: ConsoleListener): unknown;
  off(event: "pageerror", listener: () => void): unknown;
};
const failureCategories = {
  "net::ERR_ABORTED": "aborted",
  "net::ERR_CONNECTION_RESET": "connection_reset",
  "net::ERR_CONNECTION_CLOSED": "connection_closed",
  "net::ERR_CONNECTION_REFUSED": "connection_refused",
  "net::ERR_CONNECTION_TIMED_OUT": "connection_timed_out",
  "net::ERR_NETWORK_CHANGED": "network_changed",
  "net::ERR_INTERNET_DISCONNECTED": "internet_disconnected",
  "net::ERR_FAILED": "failed",
} as const;
type FailureCategory = (typeof failureCategories)[keyof typeof failureCategories] | "other";
type ResponseContentType = "flight" | "html" | "json" | "other" | "missing" | "unavailable";
type RefreshSample = {
  request: number;
  status: number | null;
  finished: boolean;
  failed: boolean;
  failureCategory: FailureCategory | null;
  responseContentType: ResponseContentType | null;
  rscHeaderPresent: boolean;
  requestHeadersAvailable: boolean;
  requestElapsedMs: number;
  responseElapsedMs: number | null;
  finishedElapsedMs: number | null;
  failedElapsedMs: number | null;
};
type TrackedRequest = { sample: RefreshSample | null };
type BrowserEvent = {
  event:
    | "console"
    | "pageerror"
    | "main_frame_cross_document_navigation"
    | "main_frame_same_document_navigation";
  elapsedMs: number;
  category:
    | "router_rsc_fetch_failure"
    | "console_error"
    | "console_warning"
    | "uncaught"
    | "history_api"
    | "fragment"
    | "other"
    | null;
};
const header = (headers: Record<string, string>, name: string) =>
  Object.entries(headers).find(([key]) => key.toLowerCase() === name)?.[1];
const responseContentType = (response: RefreshResponse): ResponseContentType => {
  try {
    const value = header(response.headers(), "content-type");
    if (value === undefined) return "missing";
    const mime = value.split(";", 1)[0].trim().toLowerCase();
    if (mime === "text/x-component") return "flight";
    if (mime === "text/html" || mime === "application/xhtml+xml") return "html";
    if (mime === "application/json" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/.test(mime))
      return "json";
    return "other";
  } catch {
    return "unavailable";
  }
};
const diagnosticDeadline = async <T>(work: Promise<T>, budgetMs: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Diagnostic deadline exceeded.")), budgetMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export function observeDocumentRefresh(
  source: RefreshEventSource,
  origin: string,
  pathname: string,
  monotonicNow: () => number = () => performance.now(),
) {
  const startedAt = monotonicNow();
  // Relative callback times only. Equal rounded values do not establish event ordering.
  const elapsedMs = () => Math.round(monotonicNow() - startedAt);
  const traffic = {
    requests: 0,
    responses: 0,
    finished: 0,
    failures: 0,
    responseStatuses: [] as number[],
    responseStatusesOmitted: 0,
    preexistingEvents: { responses: 0, finished: 0, failures: 0 },
    samples: [] as RefreshSample[],
    samplesOmitted: 0,
    browserEvents: [] as BrowserEvent[],
    browserEventsOmitted: 0,
    capabilities: {
      mainFrameNavigation: false,
      // Real navigation probes lost outgoing pagehide delivery through both CDP bridges.
      // No DOM listeners are installed; absent events cannot establish lifecycle absence.
      pagehide: false,
      pageshow: false,
    },
    diagnosticSetupFailed: false,
    diagnosticCleanupFailed: false,
  };
  let stopped = false;
  let navigationSetup: Promise<void> | undefined;
  let cleanupNavigation: (() => Promise<void>) | undefined;
  let closeNavigationReport = () => {};
  const browserEvent = (value: Omit<BrowserEvent, "elapsedMs">) => {
    if (stopped) return;
    if (traffic.browserEvents.length < 8)
      traffic.browserEvents.push({ ...value, elapsedMs: elapsedMs() });
    else traffic.browserEventsOmitted++;
  };
  const tracked = new WeakMap<RefreshRequest, TrackedRequest>();
  const matches = (request: RefreshRequest) => {
    try {
      const url = new URL(request.url());
      return (
        request.method() === "GET" &&
        url.origin === origin &&
        url.pathname === pathname &&
        (url.searchParams.has("_rsc") || header(request.headers(), "rsc") === "1")
      );
    } catch {
      return false;
    }
  };
  const onRequest = (request: RefreshRequest) => {
    if (!matches(request) || tracked.has(request)) return;
    traffic.requests++;
    let rscHeaderPresent = false;
    let requestHeadersAvailable = false;
    try {
      rscHeaderPresent = header(request.headers(), "rsc") !== undefined;
      requestHeadersAvailable = true;
    } catch {
      // Query-matched requests remain observable even if header metadata is unavailable.
    }
    const sample: RefreshSample | null =
      traffic.samples.length < 8
        ? {
            request: traffic.requests,
            status: null,
            finished: false,
            failed: false,
            failureCategory: null,
            responseContentType: null,
            rscHeaderPresent,
            requestHeadersAvailable,
            requestElapsedMs: elapsedMs(),
            responseElapsedMs: null,
            finishedElapsedMs: null,
            failedElapsedMs: null,
          }
        : null;
    if (sample) traffic.samples.push(sample);
    else traffic.samplesOmitted++;
    tracked.set(request, { sample });
  };
  const onResponse = (response: RefreshResponse) => {
    const request = response.request();
    const current = tracked.get(request);
    if (!current) {
      if (matches(request)) traffic.preexistingEvents.responses++;
      return;
    }
    traffic.responses++;
    if (current.sample) {
      current.sample.responseElapsedMs = elapsedMs();
      current.sample.responseContentType = responseContentType(response);
    }
    const status = response.status();
    if (Number.isInteger(status) && status >= 100 && status <= 599) {
      if (traffic.responseStatuses.length < 8) traffic.responseStatuses.push(status);
      else traffic.responseStatusesOmitted++;
      if (current.sample) {
        current.sample.status = status;
      }
    }
  };
  const onFinished = (request: RefreshRequest) => {
    const current = tracked.get(request);
    if (!current) {
      if (matches(request)) traffic.preexistingEvents.finished++;
      return;
    }
    traffic.finished++;
    if (current.sample) {
      current.sample.finished = true;
      current.sample.finishedElapsedMs = elapsedMs();
    }
  };
  const onFailure = (request: RefreshRequest) => {
    const current = tracked.get(request);
    if (!current) {
      if (matches(request)) traffic.preexistingEvents.failures++;
      return;
    }
    traffic.failures++;
    if (current.sample) {
      current.sample.failedElapsedMs = elapsedMs();
      let category: FailureCategory = "other";
      try {
        const error = request.failure()?.errorText;
        if (error && Object.hasOwn(failureCategories, error))
          category = failureCategories[error as keyof typeof failureCategories];
      } catch {
        // A diagnostic lookup must not replace the original browser failure.
      }
      current.sample.failed = true;
      current.sample.failureCategory = category;
    }
  };
  const onConsole: ConsoleListener = (message) => {
    try {
      const type = message.type();
      if (type !== "error" && type !== "warning") return;
      let category: BrowserEvent["category"] =
        type === "error" ? "console_error" : "console_warning";
      if (type === "error") {
        const text = message.text();
        if (
          text.startsWith("Failed to fetch RSC payload for ") &&
          text.includes(". Falling back to browser navigation.")
        )
          category = "router_rsc_fetch_failure";
      }
      browserEvent({ event: "console", category });
    } catch {
      // Never surface a console-metadata lookup failure to the acceptance workflow.
    }
  };
  const onPageError = () => browserEvent({ event: "pageerror", category: "uncaught" });
  source.on("request", onRequest);
  source.on("response", onResponse);
  source.on("requestfinished", onFinished);
  source.on("requestfailed", onFailure);
  source.on("console", onConsole);
  source.on("pageerror", onPageError);
  return {
    traffic,
    elapsedMs,
    startNavigationObservation(
      createSession: () => Promise<RefreshNavigationSession>,
      diagnosticBudgetMs = 2500,
    ) {
      if (stopped) return Promise.resolve();
      if (navigationSetup) return navigationSetup;
      const budgetMs =
        Number.isFinite(diagnosticBudgetMs) && diagnosticBudgetMs >= 0
          ? Math.min(diagnosticBudgetMs, 2500)
          : 2500;
      let reportClosed = false;
      let abandoned = false;
      closeNavigationReport = () => {
        reportClosed = true;
      };
      const setup = (async () => {
        const connection: { session?: RefreshNavigationSession } = {};
        let mainFrameId: string | undefined;
        let cleanupWork: Promise<void> | undefined;
        const onCrossDocument = ({ frame }: CrossDocumentNavigation) => {
          if (stopped || abandoned) return;
          if (frame.parentId !== undefined) return;
          mainFrameId = frame.id;
          browserEvent({
            event: "main_frame_cross_document_navigation",
            category: null,
          });
        };
        const onSameDocument = ({ frameId, navigationType }: SameDocumentNavigation) => {
          if (stopped || abandoned) return;
          if (frameId !== mainFrameId) return;
          browserEvent({
            event: "main_frame_same_document_navigation",
            category:
              navigationType === "historyApi"
                ? "history_api"
                : navigationType === "fragment"
                  ? "fragment"
                  : "other",
          });
        };
        cleanupNavigation = async () => {
          abandoned = true;
          const session = connection.session;
          if (!session) return;
          if (cleanupWork) return cleanupWork;
          // Attempt every cleanup even when another operation is unavailable during page closure.
          try {
            session.off("Page.frameNavigated", onCrossDocument);
          } catch {
            if (!reportClosed) traffic.diagnosticCleanupFailed = true;
          }
          try {
            session.off("Page.navigatedWithinDocument", onSameDocument);
          } catch {
            if (!reportClosed) traffic.diagnosticCleanupFailed = true;
          }
          cleanupWork = diagnosticDeadline(
            Promise.resolve().then(() => session.detach()),
            budgetMs,
          )
            .then(() => {})
            .catch(() => {
              if (!reportClosed) traffic.diagnosticCleanupFailed = true;
            });
          return cleanupWork;
        };
        const session = await createSession();
        connection.session = session;
        if (stopped || abandoned) return await cleanupNavigation();
        const { frameTree } = await session.send("Page.getFrameTree");
        if (stopped || abandoned) return await cleanupNavigation();
        mainFrameId = frameTree.frame.id;
        session.on("Page.frameNavigated", onCrossDocument);
        session.on("Page.navigatedWithinDocument", onSameDocument);
        await session.send("Page.enable");
        if (stopped || abandoned) return await cleanupNavigation();
        traffic.capabilities.mainFrameNavigation = true;
      })();
      navigationSetup = diagnosticDeadline(setup, budgetMs).catch(async () => {
        abandoned = true;
        if (!reportClosed) traffic.diagnosticSetupFailed = true;
        await cleanupNavigation?.();
        closeNavigationReport();
      });
      return navigationSetup;
    },
    snapshot() {
      // Capture before awaiting any diagnostic work; later callbacks must not alter this view.
      return Object.freeze({
        capturedElapsedMs: elapsedMs(),
        ...traffic,
        responseStatuses: Object.freeze([...traffic.responseStatuses]),
        preexistingEvents: Object.freeze({ ...traffic.preexistingEvents }),
        capabilities: Object.freeze({ ...traffic.capabilities }),
        samples: Object.freeze(traffic.samples.map((sample) => Object.freeze({ ...sample }))),
        browserEvents: Object.freeze(
          traffic.browserEvents.map((event) => Object.freeze({ ...event })),
        ),
      });
    },
    async stop() {
      stopped = true;
      source.off("request", onRequest);
      source.off("response", onResponse);
      source.off("requestfinished", onFinished);
      source.off("requestfailed", onFailure);
      source.off("console", onConsole);
      source.off("pageerror", onPageError);
      await navigationSetup;
      await cleanupNavigation?.();
      closeNavigationReport();
    },
  };
}
