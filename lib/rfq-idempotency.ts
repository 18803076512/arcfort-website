export type RfqSubmissionAttempt = {
  fingerprint: string;
  token: string;
};

export type RfqEmailAudience = "sales" | "buyer";

export const rfqEmailIdempotencyWindowHours = 24;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const submissionTokenPattern =
  /^(\d{8})-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function createSecureUuid() {
  const cryptoApi = globalThis.crypto;

  if (!cryptoApi) {
    throw new Error("Secure browser randomness is required for an RFQ submission identifier.");
  }

  if (typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

function isValidCompactDate(value: string) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function normalizeRfqSubmissionToken(value: string) {
  const match = submissionTokenPattern.exec(value.trim());

  if (!match || !match[1] || !match[2] || !isValidCompactDate(match[1])) {
    return null;
  }

  return `${match[1]}-${match[2].toLowerCase()}`;
}

export function isRfqSubmissionTokenCurrent(value: string, now = new Date()) {
  const token = normalizeRfqSubmissionToken(value);

  if (!token) {
    return false;
  }

  const datePart = token.slice(0, 8);
  const tokenDate = Date.UTC(
    Number(datePart.slice(0, 4)),
    Number(datePart.slice(4, 6)) - 1,
    Number(datePart.slice(6, 8)),
  );
  const currentDate = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayDifference = Math.abs(currentDate - tokenDate) / (24 * 60 * 60 * 1000);

  return dayDifference <= 1;
}

export function createRfqSubmissionToken(date = new Date(), randomValue = createSecureUuid()) {
  const normalizedUuid = randomValue.trim().toLowerCase();

  if (!uuidPattern.test(normalizedUuid)) {
    throw new Error("RFQ submission identifiers require a valid UUID.");
  }

  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `${datePart}-${normalizedUuid}`;
}

export function getOrCreateRfqSubmissionAttempt(
  currentAttempt: RfqSubmissionAttempt | null,
  fingerprint: string,
  date = new Date(),
  randomValue?: string,
): RfqSubmissionAttempt {
  const currentToken = currentAttempt ? normalizeRfqSubmissionToken(currentAttempt.token) : null;

  if (
    currentAttempt?.fingerprint === fingerprint &&
    currentToken &&
    isRfqSubmissionTokenCurrent(currentToken, date)
  ) {
    return {
      fingerprint,
      token: currentToken,
    };
  }

  return {
    fingerprint,
    token: createRfqSubmissionToken(date, randomValue),
  };
}

export function createRfqReferenceFromSubmissionToken(value: string) {
  const token = normalizeRfqSubmissionToken(value);

  if (!token) {
    return null;
  }

  const datePart = token.slice(0, 8);
  const uuidPart = token.slice(9);
  return `AF-RFQ-${datePart}-${uuidPart.slice(0, 8).toUpperCase()}`;
}

export function createRfqEmailIdempotencyKey(audience: RfqEmailAudience, value: string) {
  const token = normalizeRfqSubmissionToken(value);

  if (!token) {
    throw new Error("Cannot create an RFQ email idempotency key from an invalid submission token.");
  }

  return `arcfort-rfq-${audience}/${token}`;
}
