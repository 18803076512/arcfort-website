import type { ProductBuyingProfile } from "./schemas.ts";

export const productBuyingProfiles: ProductBuyingProfile[] = [
  {
    productSlug: "wire-feeder",
    eyebrow: "Wire Feeding System Review",
    title: "Confirm the wire feeder configuration before quotation.",
    description:
      "A wire feeder must be reviewed as part of the MIG/MAG system rather than selected from appearance alone. Record the buyer requirement first, then ask the supplier to confirm the proposed feeder, interfaces and included equipment against documented references.",
    selectionVariables: [
      {
        label: "Welding process and wire requirement",
        whyItMatters:
          "The process, wire type and documented wire range establish the feeding task the proposed equipment must support.",
        confirmationMethod:
          "Buyer welding procedure, approved wire specification or existing equipment record.",
      },
      {
        label: "Power-source relationship",
        whyItMatters:
          "A separate or integrated feeder may use different power, communication and control arrangements.",
        confirmationMethod:
          "Power-source manufacturer and model, nameplate photo, system diagram and supplier interface review.",
      },
      {
        label: "Drive arrangement",
        whyItMatters:
          "Drive-roll quantity, groove profile and pressure arrangement affect how the specified wire is handled, but must not be inferred from the enclosure.",
        confirmationMethod:
          "Approved feeder data, internal mechanism photo, drive-roll reference or buyer requirement.",
      },
      {
        label: "Torch and cable interface",
        whyItMatters:
          "The torch connection, interconnection cable and control interface must match the proposed welding system.",
        confirmationMethod:
          "Connector photos, interface drawing, torch reference, cable requirement and supplier confirmation.",
      },
      {
        label: "Controls and operating arrangement",
        whyItMatters:
          "Required controls, display functions and remote adjustments vary by equipment program and market.",
        confirmationMethod:
          "Buyer function list and the supplier data sheet or panel drawing for the exact proposed configuration.",
      },
      {
        label: "Included equipment and spares",
        whyItMatters:
          "Commercial comparisons are unreliable when one quotation includes cables, rolls or accessories that another lists separately.",
        confirmationMethod:
          "Line-item packing list covering feeder, cable set, drive rolls, connectors, accessories and requested spares.",
      },
    ],
    confirmationChecklist: [
      "State the MIG/MAG process, wire specification and documented wire range.",
      "Provide the power-source manufacturer, model and nameplate or interface reference when available.",
      "Identify separate or integrated feeder arrangement and the required interconnection cable scope.",
      "List torch connection, control interface and required operating functions from approved references.",
      "Separate included equipment, optional accessories, drive rolls and repeat-order spare parts.",
      "Confirm destination country, labeling, manual, packing, quantity and OEM scope before order approval.",
    ],
    rfqFields: [
      "MIG/MAG process and target application:",
      "Wire type and documented wire range:",
      "Power-source manufacturer / model / nameplate reference:",
      "Separate or integrated feeder arrangement:",
      "Torch, cable and control interface references:",
      "Required controls or operating functions:",
      "Included accessories, drive rolls and spare parts:",
      "Quantity, destination country, packing and OEM scope:",
    ],
    buyerTool: {
      href: "/downloads/arcfort-welding-machine-rfq.xlsx",
      title: "Welding Machine and Wire Feeder RFQ Workbook",
      description:
        "Use the four-tab XLSX to keep buyer requirements, supplier-confirmed equipment, accessories, documents and approval checkpoints separate.",
      buttonLabel: "Download Equipment RFQ Workbook",
    },
    features: [
      "Organized for MIG/MAG equipment and distributor sourcing programs",
      "Configuration reviewed against the proposed power source, torch and control interfaces",
      "Included accessories and spare parts separated for commercial comparison",
      "Private label, panel label and export packing requests reviewed after configuration approval",
    ],
    faq: [
      {
        question: "What information is needed for a MIG/MAG wire feeder quotation?",
        answer:
          "Send the welding process, wire specification and documented wire range, power-source manufacturer and model, feeder arrangement, torch and control interface references, required accessories, quantity and destination country.",
      },
      {
        question: "Can a wire feeder be selected from the power-source model alone?",
        answer:
          "The model is a useful starting reference, but the supplier should also review the control connection, power or communication arrangement, interconnection cable, torch interface and required operating functions.",
      },
      {
        question: "Should drive-roll details be included in the RFQ?",
        answer:
          "Yes. Provide the wire type, documented wire range and any approved drive-roll reference. The proposed groove, quantity and arrangement should be confirmed for the quoted feeder rather than assumed from a photo.",
      },
      {
        question: "Can wire feeders be supplied with OEM branding and packaging?",
        answer:
          "Logo, panel label, manual language and carton design can be discussed after the exact feeder configuration, artwork, quantity and destination requirements are reviewed.",
      },
    ],
  },
];

export function getProductBuyingProfile(productSlug: string) {
  return productBuyingProfiles.find((profile) => profile.productSlug === productSlug);
}
