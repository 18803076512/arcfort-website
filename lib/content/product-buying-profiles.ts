import type { ProductBuyingProfile } from "./schemas.ts";

export const productBuyingProfiles: ProductBuyingProfile[] = [
  {
    productSlug: "robot-welding-torch",
    eyebrow: "Robotic Torch Replacement Review",
    title: "Confirm the installed robotic MIG/MAG torch front end before replacement.",
    description:
      "A robotic torch front end affects physical fit, torch position, cable routing and the consumable system used by an automated welding cell. The catalog image confirms a torch-neck and front-end product family, not a universal robot interface or complete cable package. Keep buyer evidence and supplier-confirmed replacement details separate before trial installation or repeat purchasing.",
    selectionVariables: [
      {
        label: "Installed torch and cell reference",
        whyItMatters:
          "Robot model, welding equipment and installed torch references narrow the review, but one reference alone may not describe every mounting and connection detail.",
        confirmationMethod:
          "Robot or cell asset record, welding power-source model, torch label, existing parts list and clear installation photos.",
      },
      {
        label: "Mechanical interface and torch-neck geometry",
        whyItMatters:
          "The connection interface and neck geometry affect physical installation and the established torch position within the cell.",
        confirmationMethod:
          "Interface drawing, photos of both ends, verified dimensions and approved tool-center-point or fixture records when available.",
      },
      {
        label: "Cooling and cable arrangement",
        whyItMatters:
          "Cooling method, hose and cable routing, connector layout and package length belong to the installed system and cannot be confirmed from the front-end photo.",
        confirmationMethod:
          "Existing cable-package label, connector photos, cooling-line record, routing drawing and the supplier data for the exact proposed item.",
      },
      {
        label: "Consumable stack and wire requirement",
        whyItMatters:
          "Contact tip, holder or diffuser, gas nozzle and related front-end parts must form a matched system for the installed torch and documented wire requirement.",
        confirmationMethod:
          "Parts list, components arranged in assembly order, wire specification, verified markings, photos, drawing or physical sample.",
      },
      {
        label: "Replacement scope",
        whyItMatters:
          "A quotation may cover a front end, torch neck, loose consumables or a wider assembly. Comparing prices without separating that scope can create an incomplete replacement order.",
        confirmationMethod:
          "Line-item list that distinguishes the torch neck, front-end assembly, cable package, mount, connectors and repeat-order consumables.",
      },
      {
        label: "Trial approval and repeat-order control",
        whyItMatters:
          "Automated-cell replacements should be reviewed and approved against the documented cell requirement before a larger spare-parts program is released.",
        confirmationMethod:
          "Buyer approval record for the proposed item, interface evidence, installed trial result, approved labels and retained repeat-order reference.",
      },
    ],
    confirmationChecklist: [
      "Send the robot or cell reference, welding equipment model and installed torch label when available.",
      "Photograph the complete installed arrangement and both ends of the removed torch front end without hiding connectors or markings.",
      "Provide an approved interface or neck drawing and verified dimensions instead of estimating geometry from the catalog image.",
      "State the cooling and cable-package arrangement from existing records, including connectors and routing requirements.",
      "Arrange the contact tip, holder or diffuser, nozzle and related components in installation order with wire and part references.",
      "Separate trial quantity, repeat spare quantity, packaging, destination and OEM label requirements by line item.",
    ],
    rfqFields: [
      "Robot / welding-cell reference and application:",
      "Installed welding equipment and torch manufacturer / model:",
      "Required scope: torch front end, neck, consumables or wider assembly:",
      "Mechanical interface and verified neck geometry / drawing:",
      "Cooling arrangement, cable-package length and connector references:",
      "Contact tip, holder / diffuser, nozzle and documented wire requirement:",
      "Photos, drawing, existing parts list or sample reference:",
      "Trial quantity, repeat quantity, destination, packing and OEM scope:",
    ],
    buyerTool: {
      href: "/downloads/arcfort-distributor-rfq-workbook.xlsx",
      title: "Distributor and Automation Spare-Parts RFQ Workbook",
      description:
        "Use separate product lines and evidence references for torch front ends, consumables, cable-package items and repeat-order spares. Leave compatibility and interface status for supplier review.",
      buttonLabel: "Download Mixed-Product RFQ Workbook",
    },
    features: [
      "Structured for robotic MIG/MAG torch front-end replacement inquiries",
      "Installed torch, interface, cooling and consumable evidence reviewed before quotation",
      "Trial replacement and repeat spare-part quantities separated for purchasing control",
      "Private-label packing reviewed only after the exact replacement scope is approved",
    ],
    faq: [
      {
        question: "Can a robotic MIG/MAG torch front end be selected from a photo alone?",
        answer:
          "No. A photo helps identify the product family, but interface, torch-neck geometry, cooling, cable connections, consumable stack and installed-system references should be reviewed before a replacement is quoted.",
      },
      {
        question: "What should be included in a robotic welding torch replacement RFQ?",
        answer:
          "Send the robot or cell reference, welding equipment and installed torch model, photos of both ends, interface or neck drawing, cooling and cable references, consumable stack, quantities and destination country.",
      },
      {
        question: "Does this page confirm compatibility with a specific robot brand?",
        answer:
          "No. The page covers a robotic MIG/MAG torch front-end product family. Compatibility must be confirmed for the requested installation using documented interfaces, existing-part evidence and the exact proposed item.",
      },
      {
        question: "Can loose front-end consumables be quoted with the torch neck?",
        answer:
          "Yes. List the torch neck, contact tip, holder or diffuser, gas nozzle and other requested parts as separate line items with their own quantities and evidence references.",
      },
      {
        question: "Can private-label packaging be discussed for robotic torch spare parts?",
        answer:
          "Logo, labels, barcodes and carton requirements can be reviewed after the exact products, interfaces, quantities and artwork are confirmed. OEM MOQ depends on the approved product and packaging scope.",
      },
    ],
  },
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
