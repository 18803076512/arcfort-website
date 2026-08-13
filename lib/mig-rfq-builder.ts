export const migPartOptions = [
  "Contact tip",
  "Tip holder or adaptor",
  "Gas diffuser",
  "Gas nozzle",
  "Insulator",
  "Torch liner",
  "Swan neck",
  "Handle or switch",
  "Cable or connector assembly",
  "Complete MIG/MAG torch",
] as const;

export const migTorchArrangementOptions = [
  "Not sure - identify from photos or sample",
  "Air-cooled torch or parts",
  "Water-cooled torch or parts",
  "Automatic or robotic torch arrangement",
  "Complete torch or cable assembly",
] as const;

export const migPackingOptions = [
  "Standard export packing",
  "Individual labeled packing",
  "Mixed maintenance assortment",
  "OEM or private label packing",
] as const;

export type MigRfqBuilderInput = {
  torchFamily: string;
  torchArrangement: string;
  components: string[];
  wireReference: string;
  partReference: string;
  quantity: string;
  packing: string;
};

function normalizeBuyerValue(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function buildMigRfqPrompt(input: MigRfqBuilderInput) {
  const torchFamily = normalizeBuyerValue(input.torchFamily, 100) || "Unknown / other";
  const torchArrangement =
    normalizeBuyerValue(input.torchArrangement, 100) || migTorchArrangementOptions[0];
  const components = [...new Set(input.components)]
    .map((component) => normalizeBuyerValue(component, 60))
    .filter(Boolean)
    .slice(0, migPartOptions.length);
  const wireReference = normalizeBuyerValue(input.wireReference, 100);
  const partReference = normalizeBuyerValue(input.partReference, 180);
  const quantity = normalizeBuyerValue(input.quantity, 120);
  const packing = normalizeBuyerValue(input.packing, 80);

  return [
    "MIG/MAG torch parts RFQ",
    `Catalog series / torch model: ${torchFamily}`,
    `Torch arrangement: ${torchArrangement}`,
    `Requested components: ${components.length > 0 ? components.join(", ") : "Please help identify from photos or sample"}`,
    `Welding wire diameter (if documented): ${wireReference || "Not available - please confirm from evidence"}`,
    `Visible part, drawing or OEM reference: ${partReference || "Not available - photos or sample will be provided"}`,
    `Quantity: ${quantity || "Please advise suitable trial-order quantity"}`,
    `Packing requirement: ${packing || migPackingOptions[0]}`,
    "Compatibility evidence: I can provide the complete torch photo, model label, front-end parts in removal order, connection views, drawing or approved sample for review.",
    "Please confirm the matched MIG/MAG parts, compatibility review result, MOQ, lead time and delivery options before quotation.",
  ].join("\n");
}

export function buildMigRfqHref(input: MigRfqBuilderInput) {
  const params = new URLSearchParams({ product: buildMigRfqPrompt(input) });
  const quantity = normalizeBuyerValue(input.quantity, 120);

  if (quantity) {
    params.set("quantity", quantity);
  }

  return `/rfq?${params.toString()}`;
}
