export const defaultRetryableHttpStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

export type LiveAuditRetryEvent = {
  attempt: number;
  nextAttempt: number;
  delayMs: number;
  url: string;
  kind: "network" | "status";
  status?: number;
  error?: string;
};

export type LiveAuditFetchOptions<T> = {
  attempts?: number;
  timeoutMs?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryableStatuses?: ReadonlySet<number>;
  read?: (response: Response) => Promise<T>;
  onRetry?: (event: LiveAuditRetryEvent) => void;
  fetchImpl?: typeof fetch;
  sleep?: (delayMs: number) => Promise<void>;
};

export type LiveAuditFetchResult<T> = {
  response: Response;
  data: T;
};

function requirePositiveInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive integer.`);
  }
}

function requestUrl(input: FetchInput) {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    const cause = error.cause as { code?: string } | undefined;
    return cause?.code ?? error.message;
  }

  return String(error);
}

async function cancelBody(response: Response) {
  try {
    await response.body?.cancel();
  } catch {
    // The body may already be closed after a transport failure.
  }
}

export async function fetchReadOnlyWithRetry<T = undefined>(
  input: FetchInput,
  init: FetchInit = {},
  options: LiveAuditFetchOptions<T> = {},
): Promise<LiveAuditFetchResult<T>> {
  const attempts = options.attempts ?? 3;
  const timeoutMs = options.timeoutMs ?? 20_000;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 4_000;
  const retryableStatuses = options.retryableStatuses ?? defaultRetryableHttpStatuses;
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep =
    options.sleep ?? ((delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs)));
  const method = (init.method ?? "GET").toUpperCase();
  const url = requestUrl(input);

  requirePositiveInteger(attempts, "attempts");
  requirePositiveInteger(timeoutMs, "timeoutMs");
  requirePositiveInteger(baseDelayMs, "baseDelayMs");
  requirePositiveInteger(maxDelayMs, "maxDelayMs");

  if (attempts > 1 && method !== "GET" && method !== "HEAD") {
    throw new Error(`Retrying non-read-only method ${method} is not allowed.`);
  }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;

    try {
      const response = await fetchImpl(input, { ...init, signal });
      const shouldRetryStatus = retryableStatuses.has(response.status) && attempt < attempts;

      if (shouldRetryStatus) {
        await cancelBody(response);
        const delayMs = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
        options.onRetry?.({
          attempt,
          nextAttempt: attempt + 1,
          delayMs,
          url,
          kind: "status",
          status: response.status,
        });
        await sleep(delayMs);
        continue;
      }

      if (options.read) {
        return { response, data: await options.read(response) };
      }

      await cancelBody(response);
      return { response, data: undefined as T };
    } catch (error) {
      if (init.signal?.aborted || attempt >= attempts) {
        throw new Error(
          `Request failed after ${attempt} attempt${attempt === 1 ? "" : "s"}: ${url} (${errorMessage(error)}).`,
          { cause: error },
        );
      }

      const delayMs = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      options.onRetry?.({
        attempt,
        nextAttempt: attempt + 1,
        delayMs,
        url,
        kind: "network",
        error: errorMessage(error),
      });
      await sleep(delayMs);
    }
  }

  throw new Error(`Request retry loop ended unexpectedly: ${url}.`);
}
