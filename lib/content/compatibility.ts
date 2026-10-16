import type { ProductSeriesReference } from "./schemas.ts";
import { compatibilityRelationships } from "../data/compatibility-relationships.ts";

export function getAllCompatibilityRelationships() {
  return compatibilityRelationships;
}

export function getCompatibilityRelationshipsForProduct(productSlug: string) {
  return compatibilityRelationships.filter(
    (relationship) =>
      relationship.subject.type === "product" && relationship.subject.id === productSlug,
  );
}

export function getCompatibilityRelationshipsForSeriesEvidence(seriesEvidenceId: string) {
  return compatibilityRelationships.filter(
    (relationship) =>
      relationship.target.type === "series" && relationship.target.id === seriesEvidenceId,
  );
}

export function getProductSeriesReferencesForEvidence(
  seriesEvidenceId: string,
): ProductSeriesReference[] {
  return getCompatibilityRelationshipsForSeriesEvidence(seriesEvidenceId)
    .filter(
      (relationship) =>
        relationship.relationshipType === "product_to_series" &&
        relationship.subject.type === "product" &&
        relationship.relationshipStatus !== "unverified" &&
        relationship.verificationStatus !== "DATA_CONFLICT",
    )
    .map((relationship) => ({
      productSlug: relationship.subject.id,
      role: relationship.role,
      relationshipStatus: relationship.relationshipStatus,
    }));
}
