import type { ProductTechnicalFact } from "../content/schemas.ts";

const catalogReviewedBy = "Official company catalog review";
const catalogReviewedDate = "2026-07-31";

const contactTipConfirmationRequirements = [
  "Match the contact tip to an approved sample, controlled drawing or factory SKU record.",
  "Confirm the wire bore, overall length and thread on the same physical variant.",
  "Record the supplied material grade for the quoted SKU.",
];

const tipHolderConfirmationRequirements = [
  "Match both connection ends to an approved sample, controlled drawing or factory SKU record.",
  "Confirm the complete holder length and thread directions on the same physical variant.",
  "Record the matching contact tip and torch-neck arrangement.",
];

const nozzleConfirmationRequirements = [
  "Match the nozzle profile and opening to an approved sample, drawing or factory SKU record.",
  "Confirm the overall length and attachment method on the same physical variant.",
  "Record a front, side and connection-detail image for the approved variant.",
];

function createCatalogFact(
  fact: Omit<
    ProductTechnicalFact,
    | "sourceType"
    | "sourceLevel"
    | "verificationStatus"
    | "evidenceBasis"
    | "reviewedBy"
    | "lastVerifiedDate"
  >,
): ProductTechnicalFact {
  return {
    ...fact,
    sourceType: "official_catalog",
    sourceLevel: "A",
    verificationStatus: "NEEDS_FACTORY_CONFIRMATION",
    evidenceBasis: ["company_catalog"],
    reviewedBy: catalogReviewedBy,
    lastVerifiedDate: catalogReviewedDate,
  };
}

export const productTechnicalFacts: ProductTechnicalFact[] = [
  createCatalogFact({
    id: "tech-af-mig-ct-0004-material-options",
    productSlug: "mig-contact-tip-m6-0-8mm",
    field: "material",
    sourceField: "material",
    label: "Material options",
    fieldValue: "E-Cu / CuCrZr",
    displayOrder: 10,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table, 0.8 mm references.",
    publicNote: "Company catalog options; confirm the supplied grade for the quoted SKU.",
    confirmationRequirements: contactTipConfirmationRequirements,
    notesInternal:
      "The catalog lists both material options. It does not prove which grade is assigned to every ArcFort Weld SKU or quotation.",
  }),
  createCatalogFact({
    id: "tech-af-mig-ct-0004-wire-size",
    productSlug: "mig-contact-tip-m6-0-8mm",
    field: "wire_size",
    sourceField: "size",
    label: "Wire size reference",
    fieldValue: "0.8",
    unit: "mm",
    displayOrder: 20,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table, 0.8 mm row.",
    publicNote: "Company catalog reference; confirm the required wire diameter before quotation.",
    confirmationRequirements: contactTipConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-ct-0004-length",
    productSlug: "mig-contact-tip-m6-0-8mm",
    field: "overall_length",
    sourceField: "size",
    label: "Overall length reference",
    fieldValue: "25",
    unit: "mm",
    displayOrder: 30,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table.",
    publicNote: "Company catalog reference; confirm against the approved sample or drawing.",
    confirmationRequirements: contactTipConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-ct-0004-thread",
    productSlug: "mig-contact-tip-m6-0-8mm",
    field: "thread",
    sourceField: "thread",
    label: "Thread reference",
    fieldValue: "M6",
    displayOrder: 40,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table.",
    publicNote: "Company catalog reference; confirm the mating holder before quotation.",
    confirmationRequirements: contactTipConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-ct-0005-material-options",
    productSlug: "mig-contact-tip-m6-1-0mm",
    field: "material",
    sourceField: "material",
    label: "Material options",
    fieldValue: "E-Cu / CuCrZr",
    displayOrder: 10,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table, 1.0 mm references.",
    publicNote: "Company catalog options; confirm the supplied grade for the quoted SKU.",
    confirmationRequirements: contactTipConfirmationRequirements,
    notesInternal:
      "The catalog lists both material options. It does not prove which grade is assigned to every ArcFort Weld SKU or quotation.",
  }),
  createCatalogFact({
    id: "tech-af-mig-ct-0005-wire-size",
    productSlug: "mig-contact-tip-m6-1-0mm",
    field: "wire_size",
    sourceField: "size",
    label: "Wire size reference",
    fieldValue: "1.0",
    unit: "mm",
    displayOrder: 20,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table, 1.0 mm row.",
    publicNote: "Company catalog reference; confirm the required wire diameter before quotation.",
    confirmationRequirements: contactTipConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-ct-0005-length",
    productSlug: "mig-contact-tip-m6-1-0mm",
    field: "overall_length",
    sourceField: "size",
    label: "Overall length reference",
    fieldValue: "25",
    unit: "mm",
    displayOrder: 30,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table.",
    publicNote: "Company catalog reference; confirm against the approved sample or drawing.",
    confirmationRequirements: contactTipConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-ct-0005-thread",
    productSlug: "mig-contact-tip-m6-1-0mm",
    field: "thread",
    sourceField: "thread",
    label: "Thread reference",
    fieldValue: "M6",
    displayOrder: 40,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table.",
    publicNote: "Company catalog reference; confirm the mating holder before quotation.",
    confirmationRequirements: contactTipConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-th-0007-length",
    productSlug: "mig-tip-holder-for-mb15",
    field: "overall_length",
    sourceField: "size",
    label: "Overall length reference",
    fieldValue: "42",
    unit: "mm",
    displayOrder: 10,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK contact-tip holder drawing.",
    publicNote: "Company catalog reference; confirm against the approved holder sample or drawing.",
    confirmationRequirements: tipHolderConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-th-0007-contact-tip-thread",
    productSlug: "mig-tip-holder-for-mb15",
    field: "thread",
    sourceField: "thread",
    label: "Contact-tip side thread",
    fieldValue: "M6",
    variant: "Contact-tip side",
    displayOrder: 20,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK contact-tip holder drawing.",
    publicNote: "Company catalog reference; confirm the mating contact tip before quotation.",
    confirmationRequirements: tipHolderConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-th-0007-torch-neck-thread",
    productSlug: "mig-tip-holder-for-mb15",
    field: "thread",
    sourceField: "thread",
    label: "Torch-neck side thread",
    fieldValue: "M8 x 1 LH",
    variant: "Torch-neck side",
    displayOrder: 30,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK contact-tip holder drawing.",
    publicNote: "Company catalog reference; confirm the neck-side connection before quotation.",
    confirmationRequirements: tipHolderConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-gn-0008-length",
    productSlug: "mig-gas-nozzle-for-mb15",
    field: "overall_length",
    sourceField: "size",
    label: "Overall length reference",
    fieldValue: "53",
    unit: "mm",
    displayOrder: 10,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK nozzle drawing and table.",
    publicNote: "Company catalog reference; confirm against the approved nozzle variant.",
    confirmationRequirements: nozzleConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-gn-0008-cylindrical-opening",
    productSlug: "mig-gas-nozzle-for-mb15",
    field: "nozzle_opening",
    sourceField: "size",
    label: "Cylindrical nozzle opening",
    fieldValue: "16",
    unit: "mm",
    variant: "Cylindrical",
    displayOrder: 20,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK cylindrical nozzle reference.",
    publicNote:
      "Company catalog variant reference; confirm profile, opening and connection together.",
    confirmationRequirements: nozzleConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-gn-0008-conical-opening",
    productSlug: "mig-gas-nozzle-for-mb15",
    field: "nozzle_opening",
    sourceField: "size",
    label: "Conical nozzle opening",
    fieldValue: "12",
    unit: "mm",
    variant: "Conical",
    displayOrder: 30,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK conical nozzle reference.",
    publicNote:
      "Company catalog variant reference; confirm profile, opening and connection together.",
    confirmationRequirements: nozzleConfirmationRequirements,
  }),
  createCatalogFact({
    id: "tech-af-mig-gn-0008-tapered-opening",
    productSlug: "mig-gas-nozzle-for-mb15",
    field: "nozzle_opening",
    sourceField: "size",
    label: "Tapered nozzle opening",
    fieldValue: "9.5",
    unit: "mm",
    variant: "Tapered",
    displayOrder: 40,
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK tapered nozzle reference.",
    publicNote:
      "Company catalog variant reference; confirm profile, opening and connection together.",
    confirmationRequirements: nozzleConfirmationRequirements,
  }),
];
