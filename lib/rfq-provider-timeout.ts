export const rfqEmailProviderTimeoutMs = 12_000;
export const rfqEmailProviderTimeoutSeconds = rfqEmailProviderTimeoutMs / 1000;

type FetchImplementation = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type RfqEmailProviderResult = {
  ok: boolean;
  messageId: string | null;
};

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
  const observed = { providerAccepted: false };
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new RfqProviderTimeoutError(timeoutMs));
    }, timeoutMs);
  });
  const cancelBody = (value: Response) => {
    try {
      void value.body?.cancel().catch(() => {});
    } catch {
      // Cleanup must not replace the known provider status.
    }
  };
  const request = async (): Promise<RfqEmailProviderResult> => {
    const received = await fetchImplementation(input, {
      ...init,
      signal: controller.signal,
    });
    if (controller.signal.aborted) {
      cancelBody(received);
      throw new RfqProviderTimeoutError(timeoutMs);
    }
    observed.providerAccepted = received.ok;
    if (!received.ok) {
      cancelBody(received);
      return { ok: false, messageId: null };
    }
    try {
      const body: unknown = await received.json();
      return {
        ok: true,
        messageId:
          body !== null && typeof body === "object" && "id" in body && typeof body.id === "string"
            ? body.id
            : null,
      };
    } catch {
      // A missing receipt ID cannot undo a provider's already observed 2xx acceptance.
      return { ok: true, messageId: null };
    }
  };

  try {
    // The independent deadline also bounds response-body readers that do not observe abort.
    return await Promise.race([request(), deadline]);
  } catch (error) {
    if (observed.providerAccepted) {
      return { ok: true, messageId: null };
    }
    if (controller.signal.aborted) {
      throw new RfqProviderTimeoutError(timeoutMs);
    }

    throw error;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
