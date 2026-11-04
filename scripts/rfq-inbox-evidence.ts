import { isValidIsoEvidenceDate } from "./search-console-freshness.ts";

export type RfqInboxSideEvidence = {
  observedReference: string | null;
  receivedAt: string | null;
  checkedAt: string | null;
};

export type RfqInboxVerification = {
  submittedReference: string | null;
  submittedAt: string | null;
  sales: RfqInboxSideEvidence;
  buyer: RfqInboxSideEvidence;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type RfqInboxEvidence = {
  salesMailboxPlacementConfirmed: boolean | null;
  buyerMailboxPlacementConfirmed: boolean | null;
  salesAttachmentPresentConfirmed: boolean | null;
  inboxVerification: RfqInboxVerification;
};

const referencePattern = /^AF-RFQ-(\d{8})-[A-F0-9]{8}$/;
const utcTimestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function isValidUtcTimestamp(value: string) {
  if (!utcTimestampPattern.test(value)) return false;
  const timestamp = Date.parse(value);
  const canonical = value.includes(".") ? value : value.replace(/Z$/, ".000Z");
  return !Number.isNaN(timestamp) && new Date(timestamp).toISOString() === canonical;
}

export function validateRfqInboxEvidence(evidence: RfqInboxEvidence, asOf: string) {
  const errors: string[] = [];
  const scope = "RFQ inbox evidence";
  const verification = evidence.inboxVerification;

  if (!isValidIsoEvidenceDate(asOf)) {
    errors.push(`${scope}: production evidence date must be a real YYYY-MM-DD date.`);
  }
  for (const [label, value] of [
    ["sales", evidence.salesMailboxPlacementConfirmed],
    ["buyer", evidence.buyerMailboxPlacementConfirmed],
    ["sales attachment", evidence.salesAttachmentPresentConfirmed],
  ] as const) {
    if (value !== true && value !== false && value !== null) {
      errors.push(`${scope}: ${label} confirmation must be true, false or null.`);
    }
  }
  if (!verification || typeof verification !== "object") {
    errors.push(`${scope}: inboxVerification must be present.`);
    return errors;
  }
  if (
    evidence.salesAttachmentPresentConfirmed !== null &&
    evidence.salesMailboxPlacementConfirmed !== true
  ) {
    errors.push(`${scope}: sales attachment outcome requires confirmed sales mailbox receipt.`);
  }

  function optionalText(value: unknown, label: string) {
    if (value === null) return null;
    if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
      errors.push(`${scope}: ${label} must be a nonempty trimmed string or null.`);
      return null;
    }
    return value;
  }

  function optionalTimestamp(value: unknown, label: string) {
    const text = optionalText(value, label);
    if (text && !isValidUtcTimestamp(text)) {
      errors.push(`${scope}: ${label} must be a real UTC ISO timestamp.`);
      return null;
    }
    return text;
  }

  const submittedReference = optionalText(verification.submittedReference, "submittedReference");
  const submittedAt = optionalTimestamp(verification.submittedAt, "submittedAt");
  const reviewedBy = optionalText(verification.reviewedBy, "reviewedBy");
  const reviewedAt = optionalTimestamp(verification.reviewedAt, "reviewedAt");
  const referenceMatch = submittedReference ? referencePattern.exec(submittedReference) : null;

  if (submittedReference && !referenceMatch) {
    errors.push(`${scope}: submittedReference must be an AF-RFQ-YYYYMMDD-XXXXXXXX reference.`);
  }
  if (Boolean(submittedReference) !== Boolean(submittedAt)) {
    errors.push(`${scope}: submittedReference and submittedAt must be recorded together.`);
  }
  if (referenceMatch?.[1] && submittedAt) {
    const compactDate = referenceMatch[1];
    const referenceDate = `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`;
    const dayDifference = Math.abs(
      Date.parse(`${referenceDate}T00:00:00Z`) -
        Date.parse(`${submittedAt.slice(0, 10)}T00:00:00Z`),
    );

    // The browser token remains accepted for one UTC day on either side of server time.
    if (!isValidIsoEvidenceDate(referenceDate) || dayDifference > 24 * 60 * 60 * 1000) {
      errors.push(`${scope}: submittedReference date must be within one UTC day of submittedAt.`);
    }
  }
  if (reviewedBy && (reviewedBy.length > 80 || /@|https?:|mailto:|wa\.me/i.test(reviewedBy))) {
    errors.push(`${scope}: reviewedBy must be a reviewer name or ID, not an address or URL.`);
  }

  const anyChecked =
    evidence.salesMailboxPlacementConfirmed !== null ||
    evidence.buyerMailboxPlacementConfirmed !== null;
  if (anyChecked && (!submittedReference || !submittedAt || !reviewedBy || !reviewedAt)) {
    errors.push(
      `${scope}: a checked outcome requires submission reference/time and reviewer/time.`,
    );
  }
  if (!anyChecked && (reviewedBy || reviewedAt)) {
    errors.push(`${scope}: review attribution requires at least one checked mailbox outcome.`);
  }

  const checkedTimes: string[] = [];
  function validateSide(
    label: "sales" | "buyer",
    status: boolean | null,
    side: RfqInboxSideEvidence | undefined,
  ) {
    if (!side || typeof side !== "object") {
      errors.push(`${scope}: ${label} verification fields must be present.`);
      return;
    }
    const observedReference = optionalText(side.observedReference, `${label}.observedReference`);
    const receivedAt = optionalTimestamp(side.receivedAt, `${label}.receivedAt`);
    const checkedAt = optionalTimestamp(side.checkedAt, `${label}.checkedAt`);

    if (status === true) {
      if (!observedReference || !receivedAt || !checkedAt) {
        errors.push(
          `${scope}: confirmed ${label} receipt requires its observed reference and times.`,
        );
      }
      if (observedReference && observedReference !== submittedReference) {
        errors.push(`${scope}: ${label} observed reference must match the submitted reference.`);
      }
    } else if (status === false) {
      if (!checkedAt || observedReference || receivedAt) {
        errors.push(
          `${scope}: failed ${label} receipt requires a check time and no received message.`,
        );
      }
    } else if (observedReference || receivedAt || checkedAt) {
      errors.push(`${scope}: unchecked ${label} receipt must not carry mailbox evidence.`);
    }

    if (checkedAt) checkedTimes.push(checkedAt);
    if (submittedAt && receivedAt && Date.parse(receivedAt) < Date.parse(submittedAt)) {
      errors.push(`${scope}: ${label} receipt cannot precede submission.`);
    }
    if (submittedAt && checkedAt && Date.parse(checkedAt) < Date.parse(submittedAt)) {
      errors.push(`${scope}: ${label} mailbox check cannot precede submission.`);
    }
    if (receivedAt && checkedAt && Date.parse(receivedAt) > Date.parse(checkedAt)) {
      errors.push(`${scope}: ${label} receipt cannot be later than its mailbox check.`);
    }
  }

  validateSide("sales", evidence.salesMailboxPlacementConfirmed, verification.sales);
  validateSide("buyer", evidence.buyerMailboxPlacementConfirmed, verification.buyer);

  if (submittedAt && reviewedAt && Date.parse(reviewedAt) < Date.parse(submittedAt)) {
    errors.push(`${scope}: review cannot precede submission.`);
  }
  if (
    reviewedAt &&
    checkedTimes.some((checkedAt) => Date.parse(reviewedAt) < Date.parse(checkedAt))
  ) {
    errors.push(`${scope}: review cannot precede a mailbox check.`);
  }
  if (isValidIsoEvidenceDate(asOf)) {
    const endOfEvidenceDay = Date.parse(`${asOf}T23:59:59.999Z`);
    if (submittedAt && Date.parse(submittedAt) > endOfEvidenceDay) {
      errors.push(`${scope}: submission cannot be after the production evidence date.`);
    }
    if (reviewedAt && Date.parse(reviewedAt) > endOfEvidenceDay) {
      errors.push(`${scope}: review cannot be after the production evidence date.`);
    }
  }

  return errors;
}

export function formatRfqCheckedOutcome(
  value: boolean | null,
  checkedAt: string | null,
  subject: "mailbox" | "attachment" = "mailbox",
) {
  if (value === null) return "Needs external confirmation";
  const date = checkedAt?.slice(0, 10) ?? "date missing";
  if (value) return `Confirmed on ${date}`;
  return `${subject === "attachment" ? "Not present" : "Not received"} at check on ${date}`;
}
