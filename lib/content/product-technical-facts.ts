import type { ProductTechnicalFact, ProductTechnicalSourceField, SpecRow } from "./schemas.ts";
import { productTechnicalFacts } from "../data/product-technical-facts.ts";

export type ProductTechnicalSpecificationProjection = {
  rows: SpecRow[];
  managedSourceFields: ProductTechnicalSourceField[];
  confirmationLabels: string[];
};

export function getAllProductTechnicalFacts() {
  return [...productTechnicalFacts];
}

export function getProductTechnicalFacts(productSlug: string) {
  return productTechnicalFacts
    .filter((fact) => fact.productSlug === productSlug)
    .sort(
      (left, right) => left.displayOrder - right.displayOrder || left.id.localeCompare(right.id),
    );
}

export function isPublicTechnicalFact(fact: ProductTechnicalFact) {
  return fact.verificationStatus !== "DATA_CONFLICT";
}

export function formatTechnicalFactValue(fact: ProductTechnicalFact) {
  return fact.unit ? `${fact.fieldValue} ${fact.unit}` : fact.fieldValue;
}

function getVerificationNote(fact: ProductTechnicalFact) {
  if (fact.verificationStatus === "CONFIRMED") {
    return fact.publicNote;
  }

  if (fact.verificationStatus === "OEM_REFERENCE") {
    return `${fact.publicNote} OEM reference only.`;
  }

  if (fact.verificationStatus === "STANDARD_REFERENCE") {
    return `${fact.publicNote} Standard reference only.`;
  }

  return fact.publicNote;
}

export function getProductTechnicalSpecificationProjection(
  productSlug: string,
): ProductTechnicalSpecificationProjection {
  const facts = getProductTechnicalFacts(productSlug).filter(isPublicTechnicalFact);

  return {
    rows: facts.map((fact) => ({
      label: fact.label,
      value: formatTechnicalFactValue(fact),
      note: getVerificationNote(fact),
    })),
    managedSourceFields: Array.from(new Set(facts.map((fact) => fact.sourceField))),
    confirmationLabels: Array.from(
      new Set(
        facts.filter((fact) => fact.verificationStatus !== "CONFIRMED").map((fact) => fact.label),
      ),
    ),
  };
}
