import { TO_BE_CONFIRMED, type Product, type SpecRow } from "@/lib/content/schemas";

const coreMissingFields = [
  "SKU",
  "Material",
  "Size",
  "Thread",
  "Compatible Brand",
  "OEM Number",
  "Package",
  "MOQ",
  "Lead Time",
];

const equipmentMissingFields = [
  "SKU",
  "Input Voltage",
  "Output Current",
  "Duty Cycle",
  "Cooling",
  "Compatible Accessories",
  "Package",
  "MOQ",
  "Lead Time",
];

function createCoreSpecifications(): SpecRow[] {
  return [
    { label: "Material", value: TO_BE_CONFIRMED },
    { label: "Size", value: TO_BE_CONFIRMED },
    { label: "Thread", value: TO_BE_CONFIRMED },
    { label: "Compatible Brand", value: TO_BE_CONFIRMED },
    { label: "OEM Number", value: TO_BE_CONFIRMED },
    { label: "Package", value: TO_BE_CONFIRMED },
    { label: "MOQ", value: TO_BE_CONFIRMED },
    { label: "Lead Time", value: TO_BE_CONFIRMED },
  ];
}

function createEquipmentSpecifications(): SpecRow[] {
  return [
    { label: "Input Voltage", value: TO_BE_CONFIRMED },
    { label: "Output Current", value: TO_BE_CONFIRMED },
    { label: "Duty Cycle", value: TO_BE_CONFIRMED },
    { label: "Cooling", value: TO_BE_CONFIRMED },
    { label: "Compatible Accessories", value: TO_BE_CONFIRMED },
    { label: "Package", value: TO_BE_CONFIRMED },
    { label: "MOQ", value: TO_BE_CONFIRMED },
    { label: "Lead Time", value: TO_BE_CONFIRMED },
  ];
}

export const products: Product[] = [
  {
    slug: "mig-contact-tip",
    title: "MIG Contact Tip",
    sku: TO_BE_CONFIRMED,
    categorySlug: "mig-mag-torch-parts",
    kind: "welding-consumable",
    process: "MIG/MAG",
    consumableFamily: "Contact tip",
    shortDescription:
      "MIG/MAG contact tip for welding torch consumable sourcing and distributor RFQ programs.",
    description:
      "This MIG/MAG contact tip page is prepared as a scalable product template for industrial buyers. Exact material, size, thread and compatible torch information should be confirmed by drawing, sample, reference number or target torch model.",
    imageLabel: "MIG",
    keywords: ["MIG contact tip", "MIG/MAG contact tip", "welding contact tip"],
    specifications: createCoreSpecifications(),
    compatibility: [
      { label: "Torch Series", value: TO_BE_CONFIRMED },
      { label: "Compatible Brand", value: TO_BE_CONFIRMED },
      { label: "Reference Number", value: TO_BE_CONFIRMED },
    ],
    applications: ["Metal fabrication", "Automotive repair", "Industrial maintenance"],
    features: [
      "Structured for repeat RFQ and SKU expansion",
      "Suitable for distributor product list organization",
      "Technical fit should be confirmed before quotation",
    ],
    packaging: TO_BE_CONFIRMED,
    moq: TO_BE_CONFIRMED,
    leadTime: TO_BE_CONFIRMED,
    faq: [
      {
        question: "How should I confirm the correct MIG contact tip?",
        answer:
          "Send the wire size, thread, torch model, reference number, drawing or sample details so ARCFORT can confirm the requested item.",
      },
      {
        question: "Can this product be added to an RFQ list?",
        answer:
          "Yes. Add the product name and required quantity to the RFQ form, then attach drawings or product lists if available.",
      },
    ],
    relatedProductSlugs: ["mig-gas-nozzle", "tig-ceramic-cup", "plasma-electrode"],
    missingFields: coreMissingFields,
  },
  {
    slug: "mig-gas-nozzle",
    title: "MIG Gas Nozzle",
    sku: TO_BE_CONFIRMED,
    categorySlug: "mig-mag-torch-parts",
    kind: "welding-consumable",
    process: "MIG/MAG",
    consumableFamily: "Gas nozzle",
    shortDescription:
      "MIG/MAG gas nozzle for welding torch replacement part programs and industrial supply channels.",
    description:
      "This MIG/MAG gas nozzle entry provides a buyer-friendly structure for sourcing, comparison and RFQ preparation. Dimensions, material, compatible torch series and package details should be confirmed before quotation.",
    imageLabel: "NOZ",
    keywords: ["MIG gas nozzle", "MIG/MAG nozzle", "welding torch nozzle"],
    specifications: createCoreSpecifications(),
    compatibility: [
      { label: "Torch Series", value: TO_BE_CONFIRMED },
      { label: "Compatible Brand", value: TO_BE_CONFIRMED },
      { label: "Reference Number", value: TO_BE_CONFIRMED },
    ],
    applications: ["Metal fabrication", "Repair workshops", "Welding distributor supply"],
    features: [
      "Prepared for product grid and catalog expansion",
      "Useful for distributor and repair channel RFQs",
      "Specific fit information remains To be confirmed",
    ],
    packaging: TO_BE_CONFIRMED,
    moq: TO_BE_CONFIRMED,
    leadTime: TO_BE_CONFIRMED,
    faq: [
      {
        question: "What information is needed for MIG gas nozzle quotation?",
        answer:
          "Please provide torch model, nozzle shape, size, reference number, quantity and packaging requirement.",
      },
      {
        question: "Can ARCFORT quote by product photo?",
        answer:
          "A product photo can help initial checking, but drawings, samples or confirmed reference numbers are recommended for accurate quotation.",
      },
    ],
    relatedProductSlugs: ["mig-contact-tip", "tig-ceramic-cup", "plasma-nozzle"],
    missingFields: coreMissingFields,
  },
  {
    slug: "tig-ceramic-cup",
    title: "TIG Ceramic Cup",
    sku: TO_BE_CONFIRMED,
    categorySlug: "tig-torch-parts",
    kind: "welding-consumable",
    process: "TIG",
    consumableFamily: "Ceramic cup",
    shortDescription:
      "TIG ceramic cup for TIG torch consumable sourcing, replacement programs and repair workshops.",
    description:
      "This TIG ceramic cup product template is designed for scalable B2B content. Cup size, torch series, package quantity and compatible references should be confirmed by product list, sample or drawing before quotation.",
    imageLabel: "TIG",
    keywords: ["TIG ceramic cup", "TIG torch cup", "ceramic nozzle"],
    specifications: createCoreSpecifications(),
    compatibility: [
      { label: "Torch Series", value: TO_BE_CONFIRMED },
      { label: "Tungsten Size", value: TO_BE_CONFIRMED },
      { label: "Reference Number", value: TO_BE_CONFIRMED },
    ],
    applications: ["Precision TIG welding", "Repair workshops", "Fabrication shops"],
    features: [
      "Fits structured TIG parts category pages",
      "Ready for specification and compatibility expansion",
      "Supports RFQ workflows with drawings or samples",
    ],
    packaging: TO_BE_CONFIRMED,
    moq: TO_BE_CONFIRMED,
    leadTime: TO_BE_CONFIRMED,
    faq: [
      {
        question: "Which TIG ceramic cup size should I request?",
        answer:
          "Please send the required cup size, torch series, tungsten size or reference number for confirmation.",
      },
      {
        question: "Can packaging be customized?",
        answer:
          "Packaging can be discussed after item details, quantity and branding requirements are confirmed.",
      },
    ],
    relatedProductSlugs: ["mig-contact-tip", "plasma-electrode", "plasma-nozzle"],
    missingFields: coreMissingFields,
  },
  {
    slug: "plasma-electrode",
    title: "Plasma Electrode",
    sku: TO_BE_CONFIRMED,
    categorySlug: "plasma-cutting-consumables",
    kind: "welding-consumable",
    process: "Plasma Cutting",
    consumableFamily: "Electrode",
    shortDescription:
      "Plasma cutting electrode for industrial consumable sourcing and RFQ list preparation.",
    description:
      "This plasma electrode page supports structured product data for future SKU expansion. Torch model, amperage range, compatible references and material details should be confirmed before quotation.",
    imageLabel: "CUT",
    keywords: ["plasma electrode", "plasma cutting electrode", "cutting consumable"],
    specifications: createCoreSpecifications(),
    compatibility: [
      { label: "Torch Model", value: TO_BE_CONFIRMED },
      { label: "Compatible Brand", value: TO_BE_CONFIRMED },
      { label: "Reference Number", value: TO_BE_CONFIRMED },
    ],
    applications: ["Metal fabrication", "Construction steelwork", "Maintenance cutting"],
    features: [
      "Organized for consumable kit planning",
      "Compatible data can be expanded after confirmation",
      "Designed for distributor and industrial user RFQs",
    ],
    packaging: TO_BE_CONFIRMED,
    moq: TO_BE_CONFIRMED,
    leadTime: TO_BE_CONFIRMED,
    faq: [
      {
        question: "How do I confirm the plasma electrode model?",
        answer:
          "Please provide the torch model, reference number, photo, drawing or sample information.",
      },
      {
        question: "Can electrodes and nozzles be quoted together?",
        answer:
          "Yes. Buyers can send a complete consumable list and request quotation by item or kit.",
      },
    ],
    relatedProductSlugs: ["plasma-nozzle", "mig-contact-tip", "tig-ceramic-cup"],
    missingFields: coreMissingFields,
  },
  {
    slug: "plasma-nozzle",
    title: "Plasma Nozzle",
    sku: TO_BE_CONFIRMED,
    categorySlug: "plasma-cutting-consumables",
    kind: "welding-consumable",
    process: "Plasma Cutting",
    consumableFamily: "Nozzle",
    shortDescription:
      "Plasma cutting nozzle for cutting torch consumable replacement and B2B sourcing programs.",
    description:
      "This plasma nozzle entry is built for scalable product detail pages. Exact nozzle size, compatible torch series, reference number and package requirements should be confirmed during RFQ.",
    imageLabel: "NOZ",
    keywords: ["plasma nozzle", "plasma cutting nozzle", "plasma torch nozzle"],
    specifications: createCoreSpecifications(),
    compatibility: [
      { label: "Torch Model", value: TO_BE_CONFIRMED },
      { label: "Compatible Brand", value: TO_BE_CONFIRMED },
      { label: "Reference Number", value: TO_BE_CONFIRMED },
    ],
    applications: ["Metal fabrication", "Repair workshops", "Industrial cutting"],
    features: [
      "Prepared for individual item and kit RFQs",
      "Supports future compatibility table expansion",
      "Suitable for industrial consumable catalogs",
    ],
    packaging: TO_BE_CONFIRMED,
    moq: TO_BE_CONFIRMED,
    leadTime: TO_BE_CONFIRMED,
    faq: [
      {
        question: "What should be included in a plasma nozzle RFQ?",
        answer:
          "Please include torch model, nozzle size, reference number, quantity, package requirement and destination country.",
      },
      {
        question: "Is compatible brand information confirmed?",
        answer:
          "Compatible brand information is shown only when confirmed. Otherwise the field remains To be confirmed.",
      },
    ],
    relatedProductSlugs: ["plasma-electrode", "mig-gas-nozzle", "tig-ceramic-cup"],
    missingFields: coreMissingFields,
  },
  {
    slug: "welding-wire",
    title: "Welding Wire",
    sku: TO_BE_CONFIRMED,
    categorySlug: "welding-consumables",
    kind: "welding-consumable",
    process: "MIG/MAG",
    consumableFamily: "Welding wire",
    shortDescription:
      "Welding wire product page template for distributor consumable lists and industrial RFQ programs.",
    description:
      "This welding wire entry is prepared for scalable B2B content and future SKU expansion. Wire material, diameter, spool package, application and delivery details must be confirmed before quotation.",
    imageLabel: "CON",
    keywords: ["welding wire", "MIG wire", "welding consumables"],
    specifications: createCoreSpecifications(),
    compatibility: [
      { label: "Welding Process", value: TO_BE_CONFIRMED },
      { label: "Material Grade", value: TO_BE_CONFIRMED },
      { label: "Package Type", value: TO_BE_CONFIRMED },
    ],
    applications: ["Fabrication shops", "Repair workshops", "Industrial welding supply"],
    features: [
      "Prepared for consumable category expansion",
      "Suitable for mixed distributor RFQ lists",
      "Material and package details must be confirmed",
    ],
    packaging: TO_BE_CONFIRMED,
    moq: TO_BE_CONFIRMED,
    leadTime: TO_BE_CONFIRMED,
    faq: [
      {
        question: "What details are needed for welding wire quotation?",
        answer:
          "Please provide material, diameter, package type, quantity, destination country and any existing reference.",
      },
      {
        question: "Can welding wire be quoted with torch consumables?",
        answer:
          "Yes. Buyers can send a combined RFQ list for welding wire, torch parts and accessories.",
      },
    ],
    relatedProductSlugs: ["mig-contact-tip", "mig-gas-nozzle", "ground-clamp"],
    missingFields: coreMissingFields,
  },
  {
    slug: "mig-welding-machine",
    title: "MIG Welding Machine",
    sku: TO_BE_CONFIRMED,
    categorySlug: "welding-machines",
    kind: "welding-equipment",
    equipmentFamily: "MIG welding machine",
    supportedProcesses: ["MIG/MAG"],
    shortDescription:
      "MIG welding machine template for industrial equipment sourcing and distributor RFQ discussions.",
    description:
      "This MIG welding machine page provides the structure for future equipment content. Electrical parameters, duty cycle, accessory configuration, packaging and compliance information must be confirmed from official documents before quotation.",
    imageLabel: "MAC",
    keywords: ["MIG welding machine", "welding equipment", "industrial welding machine"],
    specifications: createEquipmentSpecifications(),
    compatibility: [
      { label: "Supported Process", value: TO_BE_CONFIRMED },
      { label: "Compatible Accessories", value: TO_BE_CONFIRMED },
      { label: "Target Application", value: TO_BE_CONFIRMED },
    ],
    applications: ["Metal fabrication", "Repair workshops", "Industrial production"],
    features: [
      "Equipment template prepared for confirmed specifications",
      "Supports distributor machine RFQ discussions",
      "No performance data is listed until confirmed",
    ],
    packaging: TO_BE_CONFIRMED,
    moq: TO_BE_CONFIRMED,
    leadTime: TO_BE_CONFIRMED,
    faq: [
      {
        question: "Are welding machine specifications confirmed?",
        answer:
          "No. Machine parameters remain To be confirmed until official specification documents are available.",
      },
      {
        question: "Can accessories be included with a machine RFQ?",
        answer:
          "Yes. Buyers can include torch, cable, clamp, holder and spare part requirements in the RFQ.",
      },
    ],
    relatedProductSlugs: ["welding-wire", "ground-clamp", "mig-contact-tip"],
    missingFields: equipmentMissingFields,
  },
  {
    slug: "ground-clamp",
    title: "Ground Clamp",
    sku: TO_BE_CONFIRMED,
    categorySlug: "welding-accessories",
    kind: "welding-consumable",
    process: "MMA",
    consumableFamily: "Welding accessory",
    shortDescription:
      "Ground clamp template for workshop accessory sourcing, welding supply lists and RFQ programs.",
    description:
      "This ground clamp page is designed for welding accessory sourcing. Material, current requirement, cable connection, package and MOQ should be confirmed by drawing, sample, photo or product list.",
    imageLabel: "ACC",
    keywords: ["ground clamp", "welding clamp", "welding accessories"],
    specifications: createCoreSpecifications(),
    compatibility: [
      { label: "Cable Connection", value: TO_BE_CONFIRMED },
      { label: "Machine Compatibility", value: TO_BE_CONFIRMED },
      { label: "Reference Number", value: TO_BE_CONFIRMED },
    ],
    applications: ["Repair workshops", "Construction welding", "Fabrication shops"],
    features: [
      "Useful for accessory and workshop supply programs",
      "Prepared for mixed RFQ lists",
      "Connection and current requirements must be confirmed",
    ],
    packaging: TO_BE_CONFIRMED,
    moq: TO_BE_CONFIRMED,
    leadTime: TO_BE_CONFIRMED,
    faq: [
      {
        question: "What information is needed for ground clamp quotation?",
        answer:
          "Please provide clamp type, cable connection, quantity, package requirement, photo or drawing when available.",
      },
      {
        question: "Can ground clamps be quoted with welding machines?",
        answer:
          "Yes. Ground clamps can be included in machine or accessory RFQ lists.",
      },
    ],
    relatedProductSlugs: ["mig-welding-machine", "welding-wire", "mig-contact-tip"],
    missingFields: coreMissingFields,
  },
];
