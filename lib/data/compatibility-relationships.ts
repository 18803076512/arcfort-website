import type { CompatibilityRelationship } from "../content/schemas.ts";

const sourceReference =
  "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK standard product-family section.";
const reviewedBy = "Official company catalog review";
const reviewedDate = "2026-08-21";

function create15AkRelationship(
  relationship: Pick<
    CompatibilityRelationship,
    "id" | "subject" | "role" | "confirmationRequirements"
  >,
): CompatibilityRelationship {
  return {
    ...relationship,
    relationshipType: "product_to_series",
    target: {
      type: "series",
      id: "mig-series-15ak",
    },
    relationshipStatus: "reference_only",
    sourceType: "official_catalog",
    sourceLevel: "A",
    verificationStatus: "NEEDS_FACTORY_CONFIRMATION",
    evidenceBasis: ["company_catalog"],
    sourceReference,
    buyerConfirmationRequired: true,
    reviewedBy,
    reviewedDate,
    notesInternal:
      "The company catalog places the product reference inside the 15AK group. Final fit remains unconfirmed.",
  };
}

export const compatibilityRelationships: CompatibilityRelationship[] = [
  create15AkRelationship({
    id: "compat-mig-15ak-contact-tip-m6-0-8",
    subject: {
      type: "product",
      id: "mig-contact-tip-m6-0-8mm",
    },
    role: "Contact tip - 0.8 mm catalog reference",
    confirmationRequirements: [
      "Exact torch label and installed front-end arrangement",
      "Visible contact-tip marking or documented wire diameter",
      "Tip-holder thread and seating geometry from an approved sample or drawing",
    ],
  }),
  create15AkRelationship({
    id: "compat-mig-15ak-contact-tip-m6-1-0",
    subject: {
      type: "product",
      id: "mig-contact-tip-m6-1-0mm",
    },
    role: "Contact tip - 1.0 mm catalog reference",
    confirmationRequirements: [
      "Exact torch label and installed front-end arrangement",
      "Visible contact-tip marking or documented wire diameter",
      "Tip-holder thread and seating geometry from an approved sample or drawing",
    ],
  }),
  create15AkRelationship({
    id: "compat-mig-15ak-tip-holder",
    subject: {
      type: "product",
      id: "mig-tip-holder-for-mb15",
    },
    role: "Contact tip holder catalog reference",
    confirmationRequirements: [
      "Exact torch label and complete front-end component order",
      "Contact-tip side and torch-neck side connection details",
      "Approved sample, drawing or measured reference for the complete holder geometry",
    ],
  }),
  create15AkRelationship({
    id: "compat-mig-15ak-gas-nozzle",
    subject: {
      type: "product",
      id: "mig-gas-nozzle-for-mb15",
    },
    role: "Gas nozzle catalog reference",
    confirmationRequirements: [
      "Exact torch label and installed front-end arrangement",
      "Nozzle profile, opening and attachment details",
      "Approved sample, drawing or clear front and side photographs",
    ],
  }),
];
