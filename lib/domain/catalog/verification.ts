export const VERIFICATION_STATUSES = [
  "CONFIRMED",
  "OEM_REFERENCE",
  "STANDARD_REFERENCE",
  "NEEDS_FACTORY_CONFIRMATION",
  "DATA_CONFLICT",
] as const;

export const SOURCE_LEVELS = ["A", "B", "C", "D"] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];
export type SourceLevel = (typeof SOURCE_LEVELS)[number];

export const QUALIFYING_CONFIRMATION_EVIDENCE = [
  "factory_confirmation",
  "factory_specification",
  "drawing",
  "approved_sample",
  "verified_reference_number",
  "confirmed_dimensions",
  "measurement_record",
  "packaging_record",
] as const;

export type QualifyingConfirmationEvidence = (typeof QUALIFYING_CONFIRMATION_EVIDENCE)[number];

export type ConfirmationCandidate = {
  sourceLevel: SourceLevel;
  exactSubject: boolean;
  evidenceBasis: readonly string[];
  reviewerId?: string | null;
  reviewedAt?: string | null;
  hasConflict?: boolean;
};

export type ConfirmationAssessment = {
  eligible: boolean;
  blockers: string[];
};

export function assessConfirmationCandidate(
  candidate: ConfirmationCandidate,
): ConfirmationAssessment {
  const blockers: string[] = [];

  if (candidate.hasConflict) {
    blockers.push("Credible source values conflict.");
  }

  if (candidate.sourceLevel !== "A") {
    blockers.push("Confirmation requires Level A evidence.");
  }

  if (!candidate.exactSubject) {
    blockers.push("Evidence is not tied to the exact product or variant.");
  }

  if (
    !candidate.evidenceBasis.some((basis) =>
      QUALIFYING_CONFIRMATION_EVIDENCE.some((qualifying) => qualifying === basis),
    )
  ) {
    blockers.push("No qualifying confirmation evidence is linked.");
  }

  if (!candidate.reviewerId) {
    blockers.push("An authenticated reviewer is required.");
  }

  if (!candidate.reviewedAt || Number.isNaN(Date.parse(candidate.reviewedAt))) {
    blockers.push("A valid review timestamp is required.");
  }

  return {
    eligible: blockers.length === 0,
    blockers,
  };
}

export function isReferenceOnlyStatus(status: VerificationStatus): boolean {
  return status === "OEM_REFERENCE" || status === "STANDARD_REFERENCE";
}

export function isBlockingVerificationStatus(status: VerificationStatus): boolean {
  return status === "NEEDS_FACTORY_CONFIRMATION" || status === "DATA_CONFLICT";
}
