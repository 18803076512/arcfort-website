// Diagnostic-only structural types keep the regression independent of a running browser/server.
export type RefreshRequest = {
  url: () => string;
  method: () => string;
  headers: () => Record<string, string>;
  failure: () => { errorText: string } | null;
};
type RefreshResponse = { request: () => RefreshRequest; status: () => number };
type RequestListener = (request: RefreshRequest) => void;
type ResponseListener = (response: RefreshResponse) => void;
type RefreshEventSource = {
  on(event: "request", listener: RequestListener): unknown;
  on(event: "response", listener: ResponseListener): unknown;
  on(event: "requestfinished", listener: RequestListener): unknown;
  on(event: "requestfailed", listener: RequestListener): unknown;
  off(event: "request", listener: RequestListener): unknown;
  off(event: "response", listener: ResponseListener): unknown;
  off(event: "requestfinished", listener: RequestListener): unknown;
  off(event: "requestfailed", listener: RequestListener): unknown;
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
type RefreshSample = {
  request: number;
  status: number | null;
  finished: boolean;
  failed: boolean;
  failureCategory: FailureCategory | null;
};
type TrackedRequest = { sample: RefreshSample | null };

export function observeDocumentRefresh(
  source: RefreshEventSource,
  origin: string,
  pathname: string,
) {
  const traffic = {
    requests: 0,
    responses: 0,
    finished: 0,
    failures: 0,
    responseStatuses: [] as number[],
    preexistingEvents: { responses: 0, finished: 0, failures: 0 },
    samples: [] as RefreshSample[],
    samplesOmitted: 0,
  };
  const tracked = new WeakMap<RefreshRequest, TrackedRequest>();
  const matches = (request: RefreshRequest) => {
    try {
      const url = new URL(request.url());
      return (
        request.method() === "GET" &&
        url.origin === origin &&
        url.pathname === pathname &&
        (url.searchParams.has("_rsc") || request.headers().rsc === "1")
      );
    } catch {
      return false;
    }
  };
  const onRequest = (request: RefreshRequest) => {
    if (!matches(request) || tracked.has(request)) return;
    traffic.requests++;
    const sample: RefreshSample | null =
      traffic.samples.length < 8
        ? {
            request: traffic.requests,
            status: null,
            finished: false,
            failed: false,
            failureCategory: null,
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
    const status = response.status();
    if (Number.isInteger(status) && status >= 100 && status <= 599) {
      if (traffic.responseStatuses.length < 8) traffic.responseStatuses.push(status);
      if (current.sample) current.sample.status = status;
    }
  };
  const onFinished = (request: RefreshRequest) => {
    const current = tracked.get(request);
    if (!current) {
      if (matches(request)) traffic.preexistingEvents.finished++;
      return;
    }
    traffic.finished++;
    if (current.sample) current.sample.finished = true;
  };
  const onFailure = (request: RefreshRequest) => {
    const current = tracked.get(request);
    if (!current) {
      if (matches(request)) traffic.preexistingEvents.failures++;
      return;
    }
    traffic.failures++;
    if (current.sample) {
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
  source.on("request", onRequest);
  source.on("response", onResponse);
  source.on("requestfinished", onFinished);
  source.on("requestfailed", onFailure);
  return {
    traffic,
    stop() {
      source.off("request", onRequest);
      source.off("response", onResponse);
      source.off("requestfinished", onFinished);
      source.off("requestfailed", onFailure);
    },
  };
}
