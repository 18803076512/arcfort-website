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
];
