import { TO_BE_CONFIRMED, type Product, type SpecRow } from "@/lib/content/schemas";

const packagePolicy = "Standard export packing or customized packaging";
const moqPolicy = "Small trial orders accepted";
const leadTimePolicy = "7-15 working days";
const lengthFallback = "Available upon request";
const compatibilityFallback = "Compatibility can be confirmed by sample or drawing";
const copperGradeFallback = "Copper material, specific grade to be confirmed";
const materialGradeFallback = "Specific material grade to be confirmed by sample or drawing";
const oemPolicy = "Available";

const packagingMissingFields = ["SKU", "Length", "Compatible Brand", "OEM Number", "Exact Package"];
const fullMissingFields = [
  "SKU",
  "Material Grade",
  "Length",
  "Compatible Brand",
  "OEM Number",
  "Exact Package",
];

function createConsumableSpecifications({
  productName,
  category,
  material,
  size = TO_BE_CONFIRMED,
  thread = TO_BE_CONFIRMED,
  length = lengthFallback,
  compatibleModel = compatibilityFallback,
  application,
  packageValue = packagePolicy,
  imageName,
  oem = oemPolicy,
}: {
  productName: string;
  category: string;
  material: string;
  size?: string;
  thread?: string;
  length?: string;
  compatibleModel?: string;
  application: string;
  packageValue?: string;
  imageName: string;
  oem?: string;
}): SpecRow[] {
  return [
    { label: "Product Name", value: productName },
    { label: "Category", value: category },
    { label: "Material", value: material },
    { label: "Thread", value: thread },
    { label: "Size", value: size },
    { label: "Length", value: length },
    { label: "Compatible Model", value: compatibleModel },
    { label: "Application", value: application },
    { label: "Package", value: packageValue },
    { label: "MOQ", value: moqPolicy },
    { label: "Lead Time", value: leadTimePolicy },
    { label: "Image Name", value: imageName },
    { label: "OEM", value: oem },
  ];
}

export const products: Product[] = [
  {
    slug: "mig-contact-tip-m6-08mm",
    title: "MIG Contact Tip M6 0.8mm",
    sku: TO_BE_CONFIRMED,
    categorySlug: "mig-mag-torch-parts",
    kind: "welding-consumable",
    process: "MIG/MAG",
    consumableFamily: "MIG contact tip",
    shortDescription:
      "MIG contact tip with M6 thread and 0.8mm size for distributor and workshop RFQ programs.",
    description:
      "MIG Contact Tip M6 0.8mm is prepared for buyers sourcing MIG/MAG torch consumables by thread and wire size. Material, compatible brand, OEM number, packaging and exact order terms should be confirmed by product list, drawing, sample or torch model before quotation.",
    imageLabel: "M6 0.8",
    keywords: ["MIG Contact Tip M6 0.8mm", "MIG contact tip 0.8mm", "M6 welding contact tip"],
    specifications: createConsumableSpecifications({
      productName: "MIG Contact Tip M6 0.8mm",
      category: "MIG/MAG Torch Parts",
      material: "Copper / CuCrZr",
      thread: "M6",
      size: "0.8mm",
      compatibleModel: "MB15 / MB24",
      application: "MIG/MAG welding torch consumables",
      packageValue: "100 pcs/bag",
      imageName: "mig-contact-tip-m6-08.jpg",
    }),
    compatibility: [
      { label: "Process", value: "MIG/MAG" },
      { label: "Wire Size", value: "0.8mm" },
      { label: "Thread", value: "M6" },
      { label: "Compatible Model", value: "MB15 / MB24" },
    ],
    applications: ["Metal fabrication", "Automotive repair", "Repair workshop"],
    features: [
      "Confirmed M6 thread and 0.8mm size",
      "Suitable for MIG/MAG torch consumable RFQ lists",
      "Compatible torch information should be confirmed before quotation",
    ],
    packaging: "100 pcs/bag",
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "What should buyers send for MIG Contact Tip M6 0.8mm quotation?",
        answer:
          "Send required quantity, torch model, compatible reference number, package request and destination country.",
      },
      {
        question: "Is the material confirmed for this contact tip?",
        answer:
          "Material is not listed until confirmed by product specification, drawing or sample.",
      },
    ],
    relatedProductSlugs: [
      "mig-contact-tip-m6-10mm",
      "mig-contact-tip-m6-12mm",
      "mig-tip-holder-mb15",
    ],
    missingFields: packagingMissingFields,
  },
  {
    slug: "mig-contact-tip-m6-10mm",
    title: "MIG Contact Tip M6 1.0mm",
    sku: TO_BE_CONFIRMED,
    categorySlug: "mig-mag-torch-parts",
    kind: "welding-consumable",
    process: "MIG/MAG",
    consumableFamily: "MIG contact tip",
    shortDescription:
      "MIG contact tip with M6 thread and 1.0mm size for industrial welding consumable sourcing.",
    description:
      "MIG Contact Tip M6 1.0mm helps buyers prepare a clear RFQ by identifying the known thread and size in the product title. Material, compatible torch series, OEM number and packaging should be confirmed before final quotation.",
    imageLabel: "M6 1.0",
    keywords: ["MIG Contact Tip M6 1.0mm", "MIG contact tip 1.0mm", "M6 contact tip"],
    specifications: createConsumableSpecifications({
      productName: "MIG Contact Tip M6 1.0mm",
      category: "MIG/MAG Torch Parts",
      material: "Copper / CuCrZr",
      thread: "M6",
      size: "1.0mm",
      compatibleModel: "MB15 / MB24",
      application: "MIG/MAG welding torch consumables",
      packageValue: "100 pcs/bag",
      imageName: "mig-contact-tip-m6-10.jpg",
    }),
    compatibility: [
      { label: "Process", value: "MIG/MAG" },
      { label: "Wire Size", value: "1.0mm" },
      { label: "Thread", value: "M6" },
      { label: "Compatible Model", value: "MB15 / MB24" },
    ],
    applications: ["Metal fabrication", "Automotive repair", "Industrial maintenance"],
    features: [
      "Confirmed M6 thread and 1.0mm size",
      "Prepared for distributor SKU expansion",
      "Works well in mixed MIG/MAG consumable inquiry lists",
    ],
    packaging: "100 pcs/bag",
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "Can this M6 1.0mm contact tip be quoted with other sizes?",
        answer:
          "Yes. Buyers can include 0.8mm, 1.0mm and 1.2mm contact tips in one RFQ list with quantities.",
      },
      {
        question: "What compatibility details are needed?",
        answer:
          "Torch model, sample photo, drawing or reference number helps confirm compatibility before quotation.",
      },
    ],
    relatedProductSlugs: [
      "mig-contact-tip-m6-08mm",
      "mig-contact-tip-m6-12mm",
      "mig-gas-nozzle-mb15",
    ],
    missingFields: packagingMissingFields,
  },
  {
    slug: "mig-contact-tip-m6-12mm",
    title: "MIG Contact Tip M6 1.2mm",
    sku: TO_BE_CONFIRMED,
    categorySlug: "mig-mag-torch-parts",
    kind: "welding-consumable",
    process: "MIG/MAG",
    consumableFamily: "MIG contact tip",
    shortDescription:
      "MIG contact tip with M6 thread and 1.2mm size for MIG/MAG torch consumable purchasing.",
    description:
      "MIG Contact Tip M6 1.2mm is part of the first ArcFort Weld welding consumable SKU set. Buyers should confirm material, compatible torch series, OEM number, packaging and quantity before final offer.",
    imageLabel: "M6 1.2",
    keywords: ["MIG Contact Tip M6 1.2mm", "MIG contact tip 1.2mm", "MIG welding tip M6"],
    specifications: createConsumableSpecifications({
      productName: "MIG Contact Tip M6 1.2mm",
      category: "MIG/MAG Torch Parts",
      material: "Copper / CuCrZr",
      thread: "M6",
      size: "1.2mm",
      compatibleModel: "MB15 / MB24",
      application: "MIG/MAG welding torch consumables",
      packageValue: "100 pcs/bag",
      imageName: "mig-contact-tip-m6-12.jpg",
    }),
    compatibility: [
      { label: "Process", value: "MIG/MAG" },
      { label: "Wire Size", value: "1.2mm" },
      { label: "Thread", value: "M6" },
      { label: "Compatible Model", value: "MB15 / MB24" },
    ],
    applications: ["Metal fabrication", "Construction", "Repair workshop"],
    features: [
      "Confirmed M6 thread and 1.2mm size",
      "Useful for distributor consumable assortments",
      "RFQ-ready page structure for future SKU expansion",
    ],
    packaging: "100 pcs/bag",
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "Is this contact tip suitable for all MIG torches?",
        answer:
          "No. Compatibility should be confirmed by torch model, reference number, drawing or sample.",
      },
      {
        question: "Can ArcFort Weld quote private label packaging?",
        answer:
          "Yes. Logo printing, private label packaging and carton design can be discussed during RFQ.",
      },
    ],
    relatedProductSlugs: [
      "mig-contact-tip-m6-08mm",
      "mig-contact-tip-m6-10mm",
      "mig-tip-holder-mb15",
    ],
    missingFields: packagingMissingFields,
  },
  {
    slug: "mig-tip-holder-mb15",
    title: "MIG Tip Holder for MB15",
    sku: TO_BE_CONFIRMED,
    categorySlug: "mig-mag-torch-parts",
    kind: "welding-consumable",
    process: "MIG/MAG",
    consumableFamily: "MIG tip holder",
    shortDescription:
      "MIG tip holder for MB15 torch consumable sourcing, repair and distributor RFQ lists.",
    description:
      "MIG Tip Holder for MB15 is prepared for buyers sourcing MB15-related MIG/MAG torch parts. Exact material, thread, compatible brand, OEM number and packaging should be confirmed by sample, drawing or reference number.",
    imageLabel: "MB15",
    keywords: ["MIG Tip Holder for MB15", "MB15 tip holder", "MIG contact tip holder"],
    specifications: createConsumableSpecifications({
      productName: "MIG Tip Holder for MB15",
      category: "MIG/MAG Torch Parts",
      material: copperGradeFallback,
      thread: "Available upon request",
      size: "For MB15",
      compatibleModel: "MB15",
      application: "MIG/MAG welding torch consumables",
      imageName: "mig-tip-holder-mb15.jpg",
    }),
    compatibility: [
      { label: "Process", value: "MIG/MAG" },
      { label: "Torch Series", value: "MB15" },
      { label: "Compatible Model", value: "MB15" },
      { label: "Compatible Brand", value: compatibilityFallback },
      { label: "Reference Number", value: TO_BE_CONFIRMED },
    ],
    applications: ["Repair workshop", "Metal fabrication", "Welding distributor supply"],
    features: [
      "Prepared for MB15 torch consumable inquiries",
      "Can be quoted together with contact tips and gas nozzles",
      "Sample or drawing confirmation recommended for accurate matching",
    ],
    packaging: packagePolicy,
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "What details are needed for MIG Tip Holder for MB15?",
        answer:
          "Send quantity, sample photo, drawing, reference number and packaging requirements when available.",
      },
      {
        question: "Can this be included in an MB15 consumable set?",
        answer:
          "Yes. Buyers can request contact tips, tip holders and gas nozzles together in one RFQ.",
      },
    ],
    relatedProductSlugs: [
      "mig-contact-tip-m6-08mm",
      "mig-contact-tip-m6-10mm",
      "mig-gas-nozzle-mb15",
    ],
    missingFields: ["SKU", "Material", "Thread", "Compatible Brand", "OEM Number", "Package"],
  },
  {
    slug: "mig-gas-nozzle-mb15",
    title: "MIG Gas Nozzle for MB15",
    sku: TO_BE_CONFIRMED,
    categorySlug: "mig-mag-torch-parts",
    kind: "welding-consumable",
    process: "MIG/MAG",
    consumableFamily: "MIG gas nozzle",
    shortDescription:
      "MIG gas nozzle for MB15 torch replacement, welding repair and distributor sourcing programs.",
    description:
      "MIG Gas Nozzle for MB15 is a key MIG/MAG torch consumable for replacement and distributor programs. Nozzle material, shape, compatible brand, OEM number and packaging should be confirmed before quotation.",
    imageLabel: "MB15",
    keywords: ["MIG Gas Nozzle for MB15", "MB15 gas nozzle", "MIG welding nozzle"],
    specifications: createConsumableSpecifications({
      productName: "MIG Gas Nozzle for MB15",
      category: "MIG/MAG Torch Parts",
      material: copperGradeFallback,
      thread: "Available upon request",
      size: "For MB15",
      compatibleModel: "MB15",
      application: "MIG/MAG welding torch consumables",
      imageName: "mig-gas-nozzle-mb15.jpg",
    }),
    compatibility: [
      { label: "Process", value: "MIG/MAG" },
      { label: "Torch Series", value: "MB15" },
      { label: "Compatible Model", value: "MB15" },
      { label: "Compatible Brand", value: compatibilityFallback },
      { label: "Reference Number", value: TO_BE_CONFIRMED },
    ],
    applications: ["Metal fabrication", "Automotive repair", "Repair workshop"],
    features: [
      "Prepared for MB15 torch consumable sourcing",
      "Suitable for mixed distributor RFQ lists",
      "Nozzle shape and dimensions should be confirmed before quotation",
    ],
    packaging: packagePolicy,
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "What information helps confirm an MB15 gas nozzle?",
        answer:
          "Send torch series, nozzle photo, sample, drawing, reference number, quantity and packaging request.",
      },
      {
        question: "Can MB15 gas nozzles be quoted with contact tips?",
        answer:
          "Yes. Contact tips, tip holders and gas nozzles can be quoted together as a MIG/MAG torch parts list.",
      },
    ],
    relatedProductSlugs: [
      "mig-tip-holder-mb15",
      "mig-contact-tip-m6-08mm",
      "mig-contact-tip-m6-10mm",
    ],
    missingFields: ["SKU", "Material", "Thread", "Compatible Brand", "OEM Number", "Package"],
  },
  {
    slug: "tig-ceramic-cup-5",
    title: "TIG Ceramic Cup #5",
    sku: TO_BE_CONFIRMED,
    categorySlug: "tig-torch-parts",
    kind: "welding-consumable",
    process: "TIG",
    consumableFamily: "TIG ceramic cup",
    shortDescription:
      "TIG ceramic cup #5 for TIG torch consumable sourcing, replacement and repair workshop RFQs.",
    description:
      "TIG Ceramic Cup #5 is prepared for TIG torch parts buyers who source ceramic cups by cup size. Torch series, material details, OEM number, package and quantity should be confirmed before quotation.",
    imageLabel: "TIG #5",
    keywords: ["TIG Ceramic Cup #5", "TIG cup number 5", "TIG ceramic nozzle #5"],
    specifications: createConsumableSpecifications({
      productName: "TIG Ceramic Cup #5",
      category: "TIG Torch Parts",
      material: "Ceramic",
      thread: "Available upon request",
      size: "#5",
      compatibleModel: compatibilityFallback,
      application: "TIG welding torch consumables",
      imageName: "tig-ceramic-cup-5.jpg",
    }),
    compatibility: [
      { label: "Process", value: "TIG" },
      { label: "Cup Size", value: "#5" },
      { label: "Compatible Model", value: compatibilityFallback },
      { label: "Tungsten Size", value: compatibilityFallback },
    ],
    applications: ["Precision TIG welding", "Metal fabrication", "Repair workshop"],
    features: [
      "Confirmed TIG ceramic cup size #5",
      "Prepared for TIG torch part SKU expansion",
      "Torch series should be confirmed before quotation",
    ],
    packaging: packagePolicy,
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "What should buyers send for TIG Ceramic Cup #5?",
        answer:
          "Send torch series, quantity, package request, reference number or sample photo when available.",
      },
      {
        question: "Can TIG ceramic cups be customized for packaging?",
        answer:
          "Private label packaging and carton design can be discussed after quantity and product details are confirmed.",
      },
    ],
    relatedProductSlugs: ["tig-ceramic-cup-6", "tig-gas-lens-16mm", "mig-contact-tip-m6-08mm"],
    missingFields: ["SKU", "Material", "Thread", "Compatible Brand", "OEM Number", "Package"],
  },
  {
    slug: "tig-ceramic-cup-6",
    title: "TIG Ceramic Cup #6",
    sku: TO_BE_CONFIRMED,
    categorySlug: "tig-torch-parts",
    kind: "welding-consumable",
    process: "TIG",
    consumableFamily: "TIG ceramic cup",
    shortDescription:
      "TIG ceramic cup #6 for TIG torch consumable replacement, distributor lists and RFQ programs.",
    description:
      "TIG Ceramic Cup #6 is included in the first ArcFort Weld TIG torch part SKU set. Buyers should confirm torch series, OEM reference, packaging, quantity and destination before quotation.",
    imageLabel: "TIG #6",
    keywords: ["TIG Ceramic Cup #6", "TIG cup number 6", "TIG ceramic nozzle #6"],
    specifications: createConsumableSpecifications({
      productName: "TIG Ceramic Cup #6",
      category: "TIG Torch Parts",
      material: "Ceramic",
      thread: "Available upon request",
      size: "#6",
      compatibleModel: compatibilityFallback,
      application: "TIG welding torch consumables",
      imageName: "tig-ceramic-cup-6.jpg",
    }),
    compatibility: [
      { label: "Process", value: "TIG" },
      { label: "Cup Size", value: "#6" },
      { label: "Compatible Model", value: compatibilityFallback },
      { label: "Tungsten Size", value: compatibilityFallback },
    ],
    applications: ["Precision TIG welding", "Pipeline work", "Repair workshop"],
    features: [
      "Confirmed TIG ceramic cup size #6",
      "Useful for TIG torch repair and distributor RFQs",
      "Can be quoted with gas lens and other TIG torch parts",
    ],
    packaging: packagePolicy,
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "Can TIG Ceramic Cup #6 be quoted together with #5?",
        answer:
          "Yes. Buyers can send one TIG ceramic cup list with separate sizes and quantities.",
      },
      {
        question: "Is torch compatibility confirmed by cup number only?",
        answer:
          "No. Torch series, sample, drawing or reference number should be confirmed before final quotation.",
      },
    ],
    relatedProductSlugs: ["tig-ceramic-cup-5", "tig-gas-lens-16mm", "mig-gas-nozzle-mb15"],
    missingFields: ["SKU", "Material", "Thread", "Compatible Brand", "OEM Number", "Package"],
  },
  {
    slug: "tig-gas-lens-16mm",
    title: "TIG Gas Lens 1.6mm",
    sku: TO_BE_CONFIRMED,
    categorySlug: "tig-torch-parts",
    kind: "welding-consumable",
    process: "TIG",
    consumableFamily: "TIG gas lens",
    shortDescription:
      "TIG gas lens 1.6mm for TIG torch sourcing, shielding gas control and repair workshop RFQs.",
    description:
      "TIG Gas Lens 1.6mm helps buyers identify the required size in TIG torch parts inquiries. Torch series, material, compatible reference, packaging and quantity should be confirmed before final quotation.",
    imageLabel: "1.6",
    keywords: ["TIG Gas Lens 1.6mm", "TIG gas lens", "1.6mm TIG gas lens"],
    specifications: createConsumableSpecifications({
      productName: "TIG Gas Lens 1.6mm",
      category: "TIG Torch Parts",
      material: materialGradeFallback,
      thread: "Available upon request",
      size: "1.6mm",
      compatibleModel: compatibilityFallback,
      application: "TIG welding torch consumables",
      imageName: "tig-gas-lens-16.jpg",
    }),
    compatibility: [
      { label: "Process", value: "TIG" },
      { label: "Size", value: "1.6mm" },
      { label: "Compatible Model", value: compatibilityFallback },
      { label: "Reference Number", value: compatibilityFallback },
    ],
    applications: ["Precision TIG welding", "Metal fabrication", "Repair workshop"],
    features: [
      "Confirmed 1.6mm TIG gas lens size",
      "Supports TIG torch consumable RFQ programs",
      "Compatibility should be confirmed by torch model or sample",
    ],
    packaging: packagePolicy,
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "What details are needed for TIG Gas Lens 1.6mm?",
        answer:
          "Send torch series, sample photo, reference number, quantity and packaging requirement.",
      },
      {
        question: "Can TIG gas lenses be included in a TIG torch parts set?",
        answer:
          "Yes. Buyers can request gas lenses, ceramic cups, collets and collet bodies in one RFQ.",
      },
    ],
    relatedProductSlugs: ["tig-ceramic-cup-5", "tig-ceramic-cup-6", "mig-contact-tip-m6-10mm"],
    missingFields: ["SKU", "Material", "Thread", "Compatible Brand", "OEM Number", "Package"],
  },
  {
    slug: "plasma-electrode",
    title: "Plasma Electrode",
    sku: TO_BE_CONFIRMED,
    categorySlug: "plasma-cutting-consumables",
    kind: "welding-consumable",
    process: "Plasma Cutting",
    consumableFamily: "Plasma electrode",
    shortDescription:
      "Plasma electrode for plasma cutting consumable sourcing, repair channels and distributor RFQs.",
    description:
      "Plasma Electrode is prepared for buyers sourcing plasma cutting consumables by torch model or reference number. Exact material, size, compatible brand, OEM number and package details should be confirmed before quotation.",
    imageLabel: "CUT",
    keywords: ["Plasma Electrode", "plasma cutting electrode", "plasma consumable electrode"],
    specifications: createConsumableSpecifications({
      productName: "Plasma Electrode",
      category: "Plasma Cutting Consumables",
      material: materialGradeFallback,
      thread: "Available upon request",
      size: "Available upon request",
      compatibleModel: compatibilityFallback,
      application: "Plasma cutting torch consumables",
      imageName: "plasma-electrode.jpg",
    }),
    compatibility: [
      { label: "Process", value: "Plasma Cutting" },
      { label: "Compatible Model", value: compatibilityFallback },
      { label: "Compatible Brand", value: compatibilityFallback },
      { label: "Reference Number", value: compatibilityFallback },
    ],
    applications: ["Metal fabrication", "Construction steelwork", "Repair workshop"],
    features: [
      "Prepared for plasma cutting consumable RFQ lists",
      "Can be quoted together with plasma nozzles",
      "Torch model and reference number should be confirmed before quotation",
    ],
    packaging: packagePolicy,
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "What should buyers send for plasma electrode quotation?",
        answer:
          "Send torch model, reference number, photos, samples, quantity and packaging requirements.",
      },
      {
        question: "Can plasma electrodes and nozzles be quoted together?",
        answer:
          "Yes. Buyers can submit a plasma consumable list and request quotation by item or kit.",
      },
    ],
    relatedProductSlugs: ["plasma-nozzle", "mig-contact-tip-m6-08mm", "tig-gas-lens-16mm"],
    missingFields: fullMissingFields,
  },
  {
    slug: "plasma-nozzle",
    title: "Plasma Nozzle",
    sku: TO_BE_CONFIRMED,
    categorySlug: "plasma-cutting-consumables",
    kind: "welding-consumable",
    process: "Plasma Cutting",
    consumableFamily: "Plasma nozzle",
    shortDescription:
      "Plasma nozzle for cutting torch consumable replacement, distributor sourcing and RFQ programs.",
    description:
      "Plasma Nozzle is part of the first plasma cutting consumable set for ArcFort Weld. Buyers should confirm torch model, amperage or reference number, material, package and quantity before quotation.",
    imageLabel: "NOZ",
    keywords: ["Plasma Nozzle", "plasma cutting nozzle", "plasma torch nozzle"],
    specifications: createConsumableSpecifications({
      productName: "Plasma Nozzle",
      category: "Plasma Cutting Consumables",
      material: materialGradeFallback,
      thread: "Available upon request",
      size: "Available upon request",
      compatibleModel: compatibilityFallback,
      application: "Plasma cutting torch consumables",
      imageName: "plasma-nozzle.jpg",
    }),
    compatibility: [
      { label: "Process", value: "Plasma Cutting" },
      { label: "Compatible Model", value: compatibilityFallback },
      { label: "Compatible Brand", value: compatibilityFallback },
      { label: "Reference Number", value: compatibilityFallback },
    ],
    applications: ["Metal fabrication", "Industrial cutting", "Repair workshop"],
    features: [
      "Prepared for plasma cutting consumable RFQs",
      "Suitable for individual item or kit quotation",
      "Torch model and reference number should be confirmed before quotation",
    ],
    packaging: packagePolicy,
    moq: moqPolicy,
    leadTime: leadTimePolicy,
    faq: [
      {
        question: "What information is required for plasma nozzle quotation?",
        answer:
          "Send torch model, reference number, nozzle size if available, quantity, packaging requirement and destination country.",
      },
      {
        question: "Can plasma nozzles be supplied as part of a consumable kit?",
        answer:
          "Kit contents, packaging and quantity can be discussed after the item list is confirmed.",
      },
    ],
    relatedProductSlugs: ["plasma-electrode", "mig-gas-nozzle-mb15", "tig-ceramic-cup-6"],
    missingFields: fullMissingFields,
  },
];
