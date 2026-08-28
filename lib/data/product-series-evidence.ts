import type {
  CategoryReferenceFamily,
  ProductSourceType,
  TechnicalEvidenceLevel,
  TechnicalVerificationStatus,
  WeldingProcess,
} from "../content/schemas.ts";

export type ProductSeriesPublicationStatus = "published" | "evidence_review" | "blocked";

export type ProductSeriesImageEvidenceStatus =
  "reviewed_product_images" | "catalog_page_only" | "needs_photos";

export type ProductSeriesEvidence = {
  id: string;
  name: string;
  seriesSlug: string;
  publicSeriesSlug?: string;
  categorySlug: string;
  process: WeldingProcess;
  sourceType: ProductSourceType;
  sourceLevel: TechnicalEvidenceLevel;
  verificationStatus: TechnicalVerificationStatus;
  sourceReference: string;
  catalogUrl: string;
  pdfPages: number[];
  catalogPages: number[];
  documentedComponents: string[];
  buyerCheck: string;
  publicationStatus: ProductSeriesPublicationStatus;
  imageEvidenceStatus: ProductSeriesImageEvidenceStatus;
  missingEvidence: string[];
  reviewedBy: string;
  reviewedDate: string;
};

const catalogUrl = "/downloads/renqiu-ailesen-welding-catalog.pdf";
const reviewedBy = "Official company catalog review";
const reviewedDate = "2026-08-21";

const commonMissingEvidence = [
  "Exact product-to-series SKU mapping for every documented component",
  "Approved sample, drawing or factory-confirmed final fitment record",
  "Company-owned or legally usable individual product and connection-detail images",
];

const airCooledComponents = [
  "Complete torch",
  "Gas nozzle",
  "Contact tip",
  "Tip holder",
  "Swan neck",
  "Torch liner",
];

const airCooledComponentsWithDiffuser = [
  ...airCooledComponents.slice(0, 4),
  "Gas diffuser",
  ...airCooledComponents.slice(4),
];

const waterCooledComponents = [
  "Complete water-cooled torch",
  "Gas nozzle",
  "Contact tip",
  "Tip holder",
  "Gas diffuser",
  "Swan neck",
  "Torch liner",
  "Water and cable connections",
];

function createBuyerCheck(seriesName: string, coolingNote: string) {
  return `Treat ${seriesName} as a company-catalog sourcing reference, not proof that every similarly named part fits. Confirm the exact torch label, ${coolingNote}, contact-tip marking, nozzle profile, complete front-end stack, liner ends and rear connections. Provide a drawing, approved sample or clear photographs before final product matching.`;
}

function createEvidenceRecord(
  record: Omit<
    ProductSeriesEvidence,
    | "categorySlug"
    | "process"
    | "sourceType"
    | "sourceLevel"
    | "verificationStatus"
    | "catalogUrl"
    | "missingEvidence"
    | "reviewedBy"
    | "reviewedDate"
  >,
): ProductSeriesEvidence {
  return {
    ...record,
    categorySlug: "mig-mag-torch-parts",
    process: "MIG/MAG",
    sourceType: "official_catalog",
    sourceLevel: "A",
    verificationStatus: "NEEDS_FACTORY_CONFIRMATION",
    catalogUrl,
    missingEvidence: [...commonMissingEvidence],
    reviewedBy,
    reviewedDate,
  };
}

export const productSeriesEvidence: ProductSeriesEvidence[] = [
  createEvidenceRecord({
    id: "mig-series-ork-200a",
    name: "ORK 200A catalog reference group",
    seriesSlug: "ork-200a-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 4 (catalog pages 1-2), ORK 200A product-family section.",
    pdfPages: [4],
    catalogPages: [1, 2],
    documentedComponents: airCooledComponents,
    buyerCheck: createBuyerCheck("ORK 200A", "the air-cooled arrangement"),
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "catalog_page_only",
  }),
  createEvidenceRecord({
    id: "mig-series-ork-350a",
    name: "ORK 350A catalog reference group",
    seriesSlug: "ork-350a-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 5 (catalog pages 3-4), ORK 350A product-family section.",
    pdfPages: [5],
    catalogPages: [3, 4],
    documentedComponents: [...airCooledComponentsWithDiffuser, "Insulator"],
    buyerCheck: createBuyerCheck("ORK 350A", "the air-cooled arrangement"),
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "catalog_page_only",
  }),
  createEvidenceRecord({
    id: "mig-series-ork-500a",
    name: "ORK 500A catalog reference group",
    seriesSlug: "ork-500a-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 6 (catalog pages 5-6), ORK 500A product-family section.",
    pdfPages: [6],
    catalogPages: [5, 6],
    documentedComponents: [...airCooledComponentsWithDiffuser, "Insulator"],
    buyerCheck: createBuyerCheck("ORK 500A", "the air-cooled arrangement"),
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "catalog_page_only",
  }),
  createEvidenceRecord({
    id: "mig-series-15ak",
    name: "15AK catalog reference group",
    seriesSlug: "15ak-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF pages 7-8 (catalog pages 7-10), 15AK air-valve and standard product-family sections.",
    pdfPages: [7, 8],
    catalogPages: [7, 8, 9, 10],
    documentedComponents: [
      ...airCooledComponents,
      "Insulator or holder spring",
      "Air-valve arrangement",
    ],
    buyerCheck:
      "The company catalog shows more than one 15AK torch arrangement. Send the complete torch and label, keep the nozzle-to-neck parts in removal order, and record only measured or visibly marked wire size, thread and length references before requesting a match.",
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "needs_photos",
  }),
  createEvidenceRecord({
    id: "mig-series-24kd",
    name: "24KD catalog reference group",
    seriesSlug: "24kd-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 9 (catalog pages 11-12), 24KD product-family section.",
    pdfPages: [9],
    catalogPages: [11, 12],
    documentedComponents: airCooledComponentsWithDiffuser,
    buyerCheck: createBuyerCheck("24KD", "the air-cooled arrangement"),
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "catalog_page_only",
  }),
  createEvidenceRecord({
    id: "mig-series-25ak",
    name: "25AK catalog reference group",
    seriesSlug: "25ak-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 10 (catalog pages 13-14), 25AK product-family section.",
    pdfPages: [10],
    catalogPages: [13, 14],
    documentedComponents: airCooledComponents,
    buyerCheck: createBuyerCheck("25AK", "the air-cooled arrangement"),
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "catalog_page_only",
  }),
  createEvidenceRecord({
    id: "mig-series-36kd",
    name: "36KD catalog reference group",
    seriesSlug: "36kd-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 11 (catalog pages 15-16), 36KD product-family section.",
    pdfPages: [11],
    catalogPages: [15, 16],
    documentedComponents: airCooledComponentsWithDiffuser,
    buyerCheck: createBuyerCheck("36KD", "the documented torch arrangement"),
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "catalog_page_only",
  }),
  createEvidenceRecord({
    id: "mig-series-40kd",
    name: "40KD catalog reference group",
    seriesSlug: "40kd-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 12 (catalog pages 17-18), 40KD product-family section.",
    pdfPages: [12],
    catalogPages: [17, 18],
    documentedComponents: airCooledComponentsWithDiffuser,
    buyerCheck: createBuyerCheck("40KD", "the documented torch arrangement"),
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "catalog_page_only",
  }),
  createEvidenceRecord({
    id: "mig-series-501d",
    name: "501D catalog reference group",
    seriesSlug: "501d-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 13 (catalog pages 19-20), 501D water-cooled product-family section.",
    pdfPages: [13],
    catalogPages: [19, 20],
    documentedComponents: [...waterCooledComponents, "Insulator"],
    buyerCheck: createBuyerCheck("501D", "the water-cooled connection layout"),
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "catalog_page_only",
  }),
  createEvidenceRecord({
    id: "mig-series-602",
    name: "602 catalog reference group",
    seriesSlug: "602-mig-mag-torch-parts",
    sourceReference:
      "Renqiu Ailesen welding catalog PDF page 14 (catalog pages 21-22), 602 water-cooled product-family section.",
    pdfPages: [14],
    catalogPages: [21, 22],
    documentedComponents: waterCooledComponents,
    buyerCheck: createBuyerCheck("602", "the water-cooled connection layout"),
    publicationStatus: "evidence_review",
    imageEvidenceStatus: "catalog_page_only",
  }),
];

export function getProductSeriesEvidenceById(evidenceId: string) {
  return productSeriesEvidence.find((record) => record.id === evidenceId);
}

function requireProductSeriesEvidence(evidenceId: string): ProductSeriesEvidence {
  const record = getProductSeriesEvidenceById(evidenceId);

  if (!record) {
    throw new Error(`Product-series evidence record ${evidenceId} is required.`);
  }

  return record;
}

export const fifteenAkSeriesEvidence = requireProductSeriesEvidence("mig-series-15ak");

const migMagBuyerSeriesEvidenceIds = [
  "mig-series-15ak",
  "mig-series-24kd",
  "mig-series-25ak",
  "mig-series-36kd",
  "mig-series-40kd",
  "mig-series-501d",
  "mig-series-602",
  "mig-series-ork-200a",
  "mig-series-ork-350a",
  "mig-series-ork-500a",
] as const;

export const migMagCatalogReferenceFamilies: CategoryReferenceFamily[] =
  migMagBuyerSeriesEvidenceIds.map(requireProductSeriesEvidence).map((record) => ({
    evidenceId: record.id,
    name: record.name,
    documentedComponents: record.documentedComponents,
    buyerCheck: record.buyerCheck,
    seriesSlug: record.publicationStatus === "published" ? record.publicSeriesSlug : undefined,
  }));
