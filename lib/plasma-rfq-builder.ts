export const plasmaConsumableOptions = [
  "Electrode",
  "Nozzle or cutting tip",
  "Swirl ring",
  "Retaining cap",
  "Shield",
  "Spacer or stand-off guide",
  "Complete torch",
] as const;

export const plasmaPackingOptions = [
  "Standard export packing",
  "Individual labeled packing",
  "Matched consumable kits",
  "OEM or private label packing",
] as const;

export type PlasmaRfqBuilderInput = {
  torchFamily: string;
  components: string[];
  existingReference: string;
  quantity: string;
  packing: string;
};

function normalizeBuyerValue(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function buildPlasmaRfqPrompt(input: PlasmaRfqBuilderInput) {
  const torchFamily = normalizeBuyerValue(input.torchFamily, 80) || "Unknown / other";
  const components = [...new Set(input.components)]
    .map((component) => normalizeBuyerValue(component, 60))
    .filter(Boolean)
    .slice(0, plasmaConsumableOptions.length);
  const existingReference = normalizeBuyerValue(input.existingReference, 160);
  const quantity = normalizeBuyerValue(input.quantity, 120);
  const packing = normalizeBuyerValue(input.packing, 80);

  return [
    "Plasma cutting consumables RFQ",
    `Torch family / model: ${torchFamily}`,
    `Requested components: ${components.length > 0 ? components.join(", ") : "Please help identify from photos or sample"}`,
    `Existing part reference: ${existingReference || "Not available - photos or sample will be provided"}`,
    `Quantity: ${quantity || "Please advise suitable trial-order quantity"}`,
    `Packing requirement: ${packing || "Standard export packing"}`,
    "Compatibility evidence: I can provide the torch label, assembled front-end photo, loose-part photos, drawing or sample for review.",
    "Please confirm the matched consumable stack, MOQ, lead time and delivery options before quotation.",
  ].join("\n");
}

export function buildPlasmaRfqHref(input: PlasmaRfqBuilderInput) {
  const params = new URLSearchParams({ product: buildPlasmaRfqPrompt(input) });
  const quantity = normalizeBuyerValue(input.quantity, 120);

  if (quantity) {
    params.set("quantity", quantity);
  }

  return `/rfq?${params.toString()}`;
}
