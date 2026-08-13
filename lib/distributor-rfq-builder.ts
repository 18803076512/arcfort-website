export const distributorBuyerProfileOptions = [
  "Welding and cutting product distributor",
  "Importer or regional wholesaler",
  "Welding equipment and consumable supplier",
  "Repair-shop or industrial supply network",
  "OEM or private-label buyer",
] as const;

export const distributorProductCategoryOptions = [
  "MIG/MAG torch parts",
  "TIG torch parts",
  "Plasma cutting consumables",
  "Welding consumables",
  "Welding machines and cutting equipment",
  "Welding accessories",
] as const;

export const distributorSourcingStageOptions = [
  "Initial product-range review",
  "Supplier comparison and sample review",
  "Trial-order planning",
  "Repeat-order purchasing program",
  "Private-label range planning",
] as const;

export const distributorEvidenceOptions = [
  "Existing product or SKU list",
  "Current part or physical sample",
  "Drawing or dimension sheet",
  "Product photos or model labels",
  "Current packaging or label reference",
] as const;

export const distributorPackingOptions = [
  "Standard export packing",
  "Mixed products in one shipment",
  "Buyer label or barcode review",
  "Private label packaging",
  "Packing recommendation requested",
] as const;

export type DistributorRfqBuilderInput = {
  buyerProfile: string;
  productCategories: string[];
  sourcingStage: string;
  trialQuantity: string;
  repeatPlan: string;
  destination: string;
  packing: string;
  evidence: string[];
  currentReferences: string;
};

function normalizeBuyerValue(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeAllowedValue(value: string, allowedValues: readonly string[], fallback: string) {
  return allowedValues.includes(value) ? value : fallback;
}

function normalizeAllowedSelections(values: string[], allowedValues: readonly string[]) {
  const allowed = new Set(allowedValues);

  return [...new Set(values)]
    .map((value) => normalizeBuyerValue(value, 100))
    .filter((value) => allowed.has(value));
}

export function getDistributorRfqReadiness(input: DistributorRfqBuilderInput) {
  const productCategories = normalizeAllowedSelections(
    input.productCategories,
    distributorProductCategoryOptions,
  );
  const evidence = normalizeAllowedSelections(input.evidence, distributorEvidenceOptions);
  const checks = [
    {
      key: "buyer_profile",
      complete: distributorBuyerProfileOptions.includes(
        input.buyerProfile as (typeof distributorBuyerProfileOptions)[number],
      ),
    },
    { key: "product_categories", complete: productCategories.length > 0 },
    { key: "trial_quantity", complete: Boolean(input.trialQuantity.trim()) },
    { key: "destination", complete: Boolean(input.destination.trim()) },
    { key: "evidence", complete: evidence.length > 0 },
  ] as const;
  const completeCount = checks.filter((check) => check.complete).length;

  return {
    completeCount,
    totalCount: checks.length,
    isComplete: completeCount === checks.length,
    missingKeys: checks.filter((check) => !check.complete).map((check) => check.key),
  };
}

export function buildDistributorRfqPrompt(input: DistributorRfqBuilderInput) {
  const buyerProfile = normalizeAllowedValue(
    input.buyerProfile,
    distributorBuyerProfileOptions,
    "Buyer profile to be provided",
  );
  const productCategories = normalizeAllowedSelections(
    input.productCategories,
    distributorProductCategoryOptions,
  );
  const sourcingStage = normalizeAllowedValue(
    input.sourcingStage,
    distributorSourcingStageOptions,
    distributorSourcingStageOptions[0],
  );
  const packing = normalizeAllowedValue(
    input.packing,
    distributorPackingOptions,
    distributorPackingOptions[0],
  );
  const evidence = normalizeAllowedSelections(input.evidence, distributorEvidenceOptions);
  const trialQuantity = normalizeBuyerValue(input.trialQuantity, 160);
  const repeatPlan = normalizeBuyerValue(input.repeatPlan, 160);
  const destination = normalizeBuyerValue(input.destination, 120);
  const currentReferences = normalizeBuyerValue(input.currentReferences, 240);

  return [
    "Distributor and importer mixed-product RFQ",
    `Buyer profile: ${buyerProfile}`,
    `Target product categories: ${productCategories.length > 0 ? productCategories.join(", ") : "Product range to be provided"}`,
    `Sourcing stage: ${sourcingStage}`,
    `Trial-order quantity plan: ${trialQuantity || "Please advise suitable trial quantities by product line"}`,
    `Expected repeat purchasing: ${repeatPlan || "Not confirmed - buyer will review after sample or trial order"}`,
    `Destination market: ${destination || "To be provided"}`,
    `Packing requirement: ${packing}`,
    `Available product evidence: ${evidence.length > 0 ? evidence.join(", ") : "Buyer will provide available references"}`,
    `Current product, supplier or model references: ${currentReferences || "Can be provided in an attached product list, drawing or photo set"}`,
    "Please review the attached or submitted line items, identify technical details that require confirmation, and provide itemized MOQ, packing, lead-time and delivery options before quotation.",
    "No compatibility, specification, price, certification or territory arrangement should be assumed until confirmed in writing for the requested products.",
  ].join("\n");
}

export function buildDistributorRfqHref(input: DistributorRfqBuilderInput) {
  const params = new URLSearchParams({ product: buildDistributorRfqPrompt(input) });
  const quantity = normalizeBuyerValue(input.trialQuantity, 160);

  if (quantity) {
    params.set("quantity", quantity);
  }

  return `/rfq?${params.toString()}`;
}
