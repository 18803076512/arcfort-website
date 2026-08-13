export const oemProductScopeOptions = [
  "MIG/MAG torch parts",
  "TIG torch parts",
  "Plasma cutting consumables",
  "Welding consumables and accessories",
  "Welding or cutting equipment",
  "Mixed distributor product range",
] as const;

export const oemServiceOptions = [
  "Logo printing",
  "Private label packaging",
  "Product label design review",
  "Export carton design",
  "Model customization",
  "Mixed product assortment",
] as const;

export const oemEvidenceOptions = [
  "Product list or SKU sheet",
  "Current sample or reference part",
  "Drawing or dimension sheet",
  "Product photo or model label",
  "Logo artwork",
  "Packaging reference",
] as const;

export const oemProjectStageOptions = [
  "Initial sourcing review",
  "Trial order planning",
  "Repeat-order program",
  "New private-label product range",
  "Replacement product matching",
] as const;

export const oemPackingOptions = [
  "Standard export packing",
  "Private label individual packaging",
  "Customized inner box and export carton",
  "Mixed product shipment",
  "Packing format requires supplier review",
] as const;

export const oemDestinationRegionOptions = [
  "Destination country will be entered on the RFQ form",
  "European Union",
  "Other Europe",
  "North America",
  "South America",
  "Middle East",
  "Africa",
  "Asia-Pacific",
] as const;

export const oemQuantityPlanOptions = [
  "Exact quantity will be entered on the RFQ form",
  "Sample or approval quantity",
  "Small trial order",
  "Trial order followed by repeat quantities",
  "Repeat-order purchasing program",
  "Mixed product quantities in an attached SKU sheet",
] as const;

export type OemRfqBuilderInput = {
  productScopes: string[];
  services: string[];
  evidence: string[];
  projectStage: string;
  quantity: string;
  destinationMarket: string;
  packing: string;
};

function normalizeBuyerValue(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeSelections(values: string[], maxItems: number) {
  return [...new Set(values)]
    .map((value) => normalizeBuyerValue(value, 80))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeAllowedSelections(values: string[], allowedValues: readonly string[]) {
  return normalizeSelections(
    values.filter((value) => allowedValues.includes(value)),
    allowedValues.length,
  );
}

function normalizeAllowedValue(value: string, allowedValues: readonly string[], fallback: string) {
  return allowedValues.includes(value) ? value : fallback;
}

export function getOemRfqReadiness(input: OemRfqBuilderInput) {
  const checks = [
    { key: "product_scope", complete: input.productScopes.length > 0 },
    { key: "oem_service", complete: input.services.length > 0 },
    { key: "evidence", complete: input.evidence.length > 0 },
    {
      key: "quantity",
      complete: Boolean(input.quantity.trim()) && input.quantity !== oemQuantityPlanOptions[0],
    },
    {
      key: "destination",
      complete:
        Boolean(input.destinationMarket.trim()) &&
        input.destinationMarket !== oemDestinationRegionOptions[0],
    },
  ] as const;
  const completeCount = checks.filter((check) => check.complete).length;

  return {
    completeCount,
    totalCount: checks.length,
    isComplete: completeCount === checks.length,
    missingKeys: checks.filter((check) => !check.complete).map((check) => check.key),
  };
}

export function buildOemRfqPrompt(input: OemRfqBuilderInput) {
  const productScopes = normalizeAllowedSelections(input.productScopes, oemProductScopeOptions);
  const services = normalizeAllowedSelections(input.services, oemServiceOptions);
  const evidence = normalizeAllowedSelections(input.evidence, oemEvidenceOptions);
  const projectStage = normalizeAllowedValue(
    input.projectStage,
    oemProjectStageOptions,
    oemProjectStageOptions[0],
  );
  const quantity = normalizeAllowedValue(
    input.quantity,
    oemQuantityPlanOptions,
    oemQuantityPlanOptions[0],
  );
  const destinationMarket = normalizeAllowedValue(
    input.destinationMarket,
    oemDestinationRegionOptions,
    oemDestinationRegionOptions[0],
  );
  const packing = normalizeAllowedValue(input.packing, oemPackingOptions, oemPackingOptions[0]);

  return [
    "OEM welding products and private label RFQ",
    `Product scope: ${productScopes.length > 0 ? productScopes.join(", ") : "Please help define the product range"}`,
    `OEM services requested: ${services.length > 0 ? services.join(", ") : "Please advise available OEM options"}`,
    `Project stage: ${projectStage}`,
    `Buyer evidence available: ${evidence.length > 0 ? evidence.join(", ") : "Evidence will be prepared after supplier guidance"}`,
    `Quantity / trial-order plan: ${quantity}`,
    `Destination region: ${destinationMarket}`,
    `Packing approach: ${packing}`,
    "Files to review: product list, drawings, sample photos, logo artwork and packaging references will be uploaded on the RFQ form as applicable.",
    "Please review product feasibility, required technical confirmations, OEM MOQ, sample or artwork approval steps, lead time and delivery options before quotation.",
  ].join("\n");
}

export function buildOemRfqHref(input: OemRfqBuilderInput) {
  const params = new URLSearchParams({ product: buildOemRfqPrompt(input) });
  const quantity = normalizeAllowedValue(
    input.quantity,
    oemQuantityPlanOptions,
    oemQuantityPlanOptions[0],
  );

  if (quantity !== oemQuantityPlanOptions[0]) {
    params.set("quantity", quantity);
  }

  return `/rfq?${params.toString()}`;
}
