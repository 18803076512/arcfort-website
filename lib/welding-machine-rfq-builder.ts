export const weldingMachineProcessOptions = [
  "MIG/MAG welding",
  "TIG welding",
  "MMA / stick welding",
  "Plasma cutting",
] as const;

export const weldingMachineArrangementOptions = [
  "Not sure - request recommendation",
  "Compact / integrated equipment",
  "Machine with separate wire feeder",
  "Machine package with torch and accessories",
  "Replacement for existing equipment",
] as const;

export const weldingMachineAccessoryOptions = [
  "Welding torch or cutting torch",
  "Wire feeder",
  "Work lead and ground clamp",
  "Electrode holder",
  "Regulator or flowmeter",
  "Consumable or spare-parts kit",
] as const;

export const weldingMachineDocumentOptions = [
  "Product data sheet",
  "Operation manual",
  "Nameplate and panel-language review",
  "Available compliance documents for review",
  "Packing and inspection records",
] as const;

export const weldingMachinePackingOptions = [
  "Standard export packing",
  "Distributor carton and label review",
  "OEM logo or private label discussion",
  "Packing recommendation requested",
] as const;

export type WeldingMachineRfqBuilderInput = {
  processes: string[];
  application: string;
  electricalInput: string;
  arrangement: string;
  accessories: string[];
  documents: string[];
  destination: string;
  quantity: string;
  packing: string;
};

function normalizeBuyerValue(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeSelection(values: string[], allowedValues: readonly string[]) {
  const allowed = new Set(allowedValues);

  return [...new Set(values)]
    .map((value) => normalizeBuyerValue(value, 100))
    .filter((value) => allowed.has(value));
}

export function buildWeldingMachineRfqPrompt(input: WeldingMachineRfqBuilderInput) {
  const processes = normalizeSelection(input.processes, weldingMachineProcessOptions);
  const accessories = normalizeSelection(input.accessories, weldingMachineAccessoryOptions);
  const documents = normalizeSelection(input.documents, weldingMachineDocumentOptions);
  const application = normalizeBuyerValue(input.application, 240);
  const electricalInput = normalizeBuyerValue(input.electricalInput, 160);
  const arrangement =
    normalizeBuyerValue(input.arrangement, 120) || weldingMachineArrangementOptions[0];
  const destination = normalizeBuyerValue(input.destination, 120);
  const quantity = normalizeBuyerValue(input.quantity, 120);
  const packing = normalizeBuyerValue(input.packing, 100) || weldingMachinePackingOptions[0];

  return [
    "Welding and cutting equipment RFQ",
    `Required process: ${processes.length > 0 ? processes.join(", ") : "Supplier recommendation requested"}`,
    `Application and work requirement: ${application || "To be described by the buyer"}`,
    `Destination electrical input (only if documented): ${electricalInput || "Not confirmed - supplier should request voltage, frequency and phase before quotation"}`,
    `Preferred equipment arrangement: ${arrangement}`,
    `Required accessories: ${accessories.length > 0 ? accessories.join(", ") : "Please propose an itemized standard package"}`,
    `Documents requested for the exact proposed model: ${documents.length > 0 ? documents.join(", ") : "Product data sheet and available documents for review"}`,
    `Destination country: ${destination || "To be provided"}`,
    `Quantity or trial-order plan: ${quantity || "Please advise a suitable trial-order option"}`,
    `Packing / OEM requirement: ${packing}`,
    "Buyer evidence: I can provide the intended process, material and application, site electrical requirement, current-equipment nameplate, accessory list or target-market document requirements.",
    "Please propose a model and itemized accessory package, then confirm technical data, available documents, MOQ, lead time and delivery terms before quotation. No unverified rating or certification should be assumed.",
  ].join("\n");
}

export function buildWeldingMachineRfqHref(input: WeldingMachineRfqBuilderInput) {
  const params = new URLSearchParams({ product: buildWeldingMachineRfqPrompt(input) });
  const quantity = normalizeBuyerValue(input.quantity, 120);

  if (quantity) {
    params.set("quantity", quantity);
  }

  return `/rfq?${params.toString()}`;
}
