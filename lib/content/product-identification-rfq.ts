// Identification questions only: these do not supply a specification or establish fit.
// CT0006 shares contact-tip questions, not 15AK membership or catalog dimensions.
const contactTipQuestions = [
  "Quantity per item and destination country:",
  "Installed torch model and current contact-tip / mating-holder reference:",
  "Existing tip: wire size, overall length, thread and pitch from drawing / sample:",
  "Drawing / sample reference, photos and material requirement:",
  "Standard packing or OEM requirements:",
] as const;

const questionsBySku = new Map<string, readonly string[]>([
  ["AF-MIG-CT-0004", contactTipQuestions],
  ["AF-MIG-CT-0005", contactTipQuestions],
  ["AF-MIG-CT-0006", contactTipQuestions],
  [
    "AF-MIG-TH-0007",
    [
      "Quantity per item and destination country:",
      "Installed torch model and current holder / contact-tip reference:",
      "Both connection ends: thread / pitch, handedness and seating geometry:",
      "Overall length, drawing / sample reference and photos of both ends:",
      "Standard packing or OEM requirements:",
    ],
  ],
  [
    "AF-MIG-GN-0008",
    [
      "Quantity per item and destination country:",
      "Installed torch model and current nozzle reference:",
      "Existing nozzle profile, opening and attachment interface:",
      "Overall length, drawing / sample reference and same-variant photos:",
      "Standard packing or OEM requirements:",
    ],
  ],
]);

export function getProductIdentificationRfqFields(sku: string) {
  return questionsBySku.get(sku);
}
