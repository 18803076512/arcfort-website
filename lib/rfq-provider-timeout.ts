export const rfqEmailProviderTimeoutMs = 12_000;
export const rfqEmailProviderTimeoutSeconds = rfqEmailProviderTimeoutMs / 1000;

type FetchImplementation = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export class RfqProviderTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`RFQ email provider did not respond within ${timeoutMs} ms.`);
    this.name = "RfqProviderTimeoutError";
  }
}

export function isRfqProviderTimeoutError(error: unknown) {
  return error instanceof RfqProviderTimeoutError;
}

export async function fetchRfqEmailProvider(
  input: string | URL | Request,
  init: RequestInit,
  options: {
    fetchImplementation?: FetchImplementation;
    timeoutMs?: number;
  } = {},
) {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const timeoutMs = options.timeoutMs ?? rfqEmailProviderTimeoutMs;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchImplementation(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new RfqProviderTimeoutError(timeoutMs);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
