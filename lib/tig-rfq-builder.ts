export const tigPartOptions = [
  "Ceramic cup or nozzle",
  "Collet",
  "Collet body",
  "Gas lens",
  "Back cap",
  "Tungsten electrode",
  "Torch body or head",
  "Handle or switch",
  "Cable or hose assembly",
  "Complete TIG torch",
] as const;

export const tigAssemblyOptions = [
  "Not sure - identify from photos or sample",
  "Standard collet-body arrangement",
  "Gas-lens arrangement",
  "Complete torch or cable assembly",
] as const;

export const tigPackingOptions = [
  "Standard export packing",
  "Individual labeled packing",
  "Mixed maintenance assortment",
  "OEM or private label packing",
] as const;

export type TigRfqBuilderInput = {
  torchFamily: string;
  assemblyArrangement: string;
  components: string[];
  tungstenReference: string;
  partReference: string;
  quantity: string;
  packing: string;
};

function normalizeBuyerValue(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function buildTigRfqPrompt(input: TigRfqBuilderInput) {
  const torchFamily = normalizeBuyerValue(input.torchFamily, 80) || "Unknown / other";
  const assemblyArrangement =
    normalizeBuyerValue(input.assemblyArrangement, 100) || tigAssemblyOptions[0];
  const components = [...new Set(input.components)]
    .map((component) => normalizeBuyerValue(component, 60))
    .filter(Boolean)
    .slice(0, tigPartOptions.length);
  const tungstenReference = normalizeBuyerValue(input.tungstenReference, 80);
  const partReference = normalizeBuyerValue(input.partReference, 160);
  const quantity = normalizeBuyerValue(input.quantity, 120);
  const packing = normalizeBuyerValue(input.packing, 80);

  return [
    "TIG torch parts RFQ",
    `Torch series / model: ${torchFamily}`,
    `Assembly arrangement: ${assemblyArrangement}`,
    `Requested components: ${components.length > 0 ? components.join(", ") : "Please help identify from photos or sample"}`,
    `Tungsten diameter (if documented): ${tungstenReference || "Not available - please confirm from evidence"}`,
    `Cup number / visible part reference: ${partReference || "Not available - photos or sample will be provided"}`,
    `Quantity: ${quantity || "Please advise suitable trial-order quantity"}`,
    `Packing requirement: ${packing || tigPackingOptions[0]}`,
    "Compatibility evidence: I can provide the complete torch photo, model label, front-end stack in removal order, connection views, drawing or sample for review.",
    "Please confirm the matched TIG parts, compatibility review result, MOQ, lead time and delivery options before quotation.",
  ].join("\n");
}

export function buildTigRfqHref(input: TigRfqBuilderInput) {
  const params = new URLSearchParams({ product: buildTigRfqPrompt(input) });
  const quantity = normalizeBuyerValue(input.quantity, 120);

  if (quantity) {
    params.set("quantity", quantity);
  }

  return `/rfq?${params.toString()}`;
}
