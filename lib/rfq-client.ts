export const rfqSubmissionTimeoutMs = 45_000;
export const rfqSubmissionTimeoutSeconds = rfqSubmissionTimeoutMs / 1000;

export function isRfqSubmissionAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

export function getRfqSubmissionFailureMessage(error: unknown) {
  if (isRfqSubmissionAbortError(error)) {
    return `The website did not receive a delivery confirmation within ${rfqSubmissionTimeoutSeconds} seconds. Check your email for an RFQ confirmation first. If no confirmation arrives, retrying this unchanged form will reuse the same protected submission identifier, or you can send the details by email or WhatsApp.`;
  }

  return "RFQ submission failed. Please try again or use the email and WhatsApp contacts below.";
}
