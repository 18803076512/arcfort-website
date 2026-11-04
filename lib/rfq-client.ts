export const rfqSubmissionTimeoutMs = 45_000;
export const rfqSubmissionTimeoutSeconds = rfqSubmissionTimeoutMs / 1000;

export async function runRfqRequestWithDeadline<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs = rfqSubmissionTimeoutMs,
): Promise<T> {
  const controller = new AbortController();
  let requestTimeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    requestTimeout = setTimeout(() => {
      const error = new Error("RFQ request deadline exceeded.");
      error.name = "AbortError";
      // BotID can wait for a challenge before fetch and ignore the signal until that wait ends.
      reject(error);
      controller.abort();
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation(controller.signal), deadline]);
  } finally {
    if (requestTimeout !== undefined) {
      clearTimeout(requestTimeout);
    }
  }
}

export function isRfqSubmissionAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

export function getRfqSubmissionFailureMessage(error: unknown, requestStarted = true) {
  if (!requestStarted) {
    return "Your RFQ could not be prepared and was not sent. Please try again or use the email and WhatsApp contacts below.";
  }

  if (isRfqSubmissionAbortError(error)) {
    return `The website did not receive a delivery confirmation within ${rfqSubmissionTimeoutSeconds} seconds. Check your email for an RFQ confirmation. If none arrives, contact our sales team with the RFQ attempt reference shown below before submitting again. The status of this attempt is unknown.`;
  }

  return "The website could not confirm whether your RFQ was accepted. Check your email for an RFQ confirmation. If none arrives, contact our sales team with the RFQ attempt reference shown below before submitting again. The status of this attempt is unknown.";
}
