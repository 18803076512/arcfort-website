export const productSpecFields = [
  "Material",
  "Size",
  "Thread",
  "Compatible Brand",
  "OEM Number",
  "Package",
  "MOQ",
  "Lead Time",
] as const;

export type ProductSpecField = (typeof productSpecFields)[number];

export type MockProduct = {
  slug: string;
  name: string;
  sku: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  specs: Record<ProductSpecField, string>;
  productDescription: string;
  compatibilityInformation: string;
  packagingDelivery: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export const mockProducts: MockProduct[] = [
  {
    slug: "mig-contact-tip-m6",
    name: "MIG Contact Tip M6",
    sku: "AF-MIG-CT-M6",
    category: "MIG Torch Parts",
    categorySlug: "mig-torch-parts",
    shortDescription:
      "Copper alloy contact tip for stable wire feeding and common MIG torch replacement programs.",
    specs: {
      Material: "Copper alloy",
      Size: "0.8 mm / 1.0 mm / 1.2 mm",
      Thread: "M6",
      "Compatible Brand": "Common MIG torch systems",
      "OEM Number": "OEM available",
      Package: "50 pcs / plastic box",
      MOQ: "500 pcs",
      "Lead Time": "15-30 days",
    },
    productDescription:
      "This MIG contact tip is designed for distributors and repair workshops that need repeatable consumable supply for industrial MIG welding applications.",
    compatibilityInformation:
      "Suitable for common M6 MIG torch configurations. Final compatibility should be confirmed by torch model, wire size, and sample reference.",
    packagingDelivery:
      "Standard export packing is available with inner boxes and cartons. Private label packing can be discussed for OEM orders.",
    faqs: [
      {
        question: "Can ARCFORT supply different wire sizes?",
        answer: "Yes. Common wire sizes can be prepared according to buyer requirements.",
      },
      {
        question: "Is OEM packaging available?",
        answer: "OEM labels and packing can be reviewed based on order quantity and artwork.",
      },
    ],
  },
  {
    slug: "mig-gas-nozzle-15ak",
    name: "MIG Gas Nozzle 15AK",
    sku: "AF-MIG-NZ-15AK",
    category: "MIG Torch Parts",
    categorySlug: "mig-torch-parts",
    shortDescription:
      "Durable MIG gas nozzle for distributor stock, torch service kits, and workshop replacement use.",
    specs: {
      Material: "Copper plated steel",
      Size: "15AK standard",
      Thread: "Push-on",
      "Compatible Brand": "15AK style MIG torches",
      "OEM Number": "Reference by sample",
      Package: "10 pcs / bag",
      MOQ: "300 pcs",
      "Lead Time": "20-30 days",
    },
    productDescription:
      "The 15AK style MIG gas nozzle supports stable gas coverage and routine replacement for industrial welding users.",
    compatibilityInformation:
      "Designed for 15AK style MIG torch systems. Buyers should confirm torch neck and nozzle dimensions before bulk orders.",
    packagingDelivery:
      "Bulk, boxed, or buyer-label packing can be arranged for distributor and OEM supply programs.",
    faqs: [
      {
        question: "Can the surface finish be customized?",
        answer: "Surface finish options can be discussed after confirming samples and target quantity.",
      },
      {
        question: "Can I order mixed MIG consumables?",
        answer: "Mixed MIG torch consumable orders can be arranged for qualified RFQs.",
      },
    ],
  },
  {
    slug: "tig-ceramic-cup-no-6",
    name: "TIG Ceramic Cup No. 6",
    sku: "AF-TIG-CUP-06",
    category: "TIG Torch Parts",
    categorySlug: "tig-torch-parts",
    shortDescription:
      "Ceramic TIG cup for stable shielding gas coverage in fabrication and repair welding.",
    specs: {
      Material: "Alumina ceramic",
      Size: "No. 6",
      Thread: "Torch dependent",
      "Compatible Brand": "Common TIG torch systems",
      "OEM Number": "OEM available",
      Package: "10 pcs / box",
      MOQ: "200 pcs",
      "Lead Time": "15-25 days",
    },
    productDescription:
      "This TIG ceramic cup is a common consumable for industrial TIG welding applications and repair workshop replacement demand.",
    compatibilityInformation:
      "Compatibility depends on TIG torch series, collet body, and gas lens setup. Samples or part references are recommended.",
    packagingDelivery:
      "Ceramic parts are packed with protective inner packing and export cartons to reduce transport damage.",
    faqs: [
      {
        question: "Can you supply different cup sizes?",
        answer: "Yes. ARCFORT can support common TIG ceramic cup sizes based on RFQ requirements.",
      },
      {
        question: "Are gas lens cups available?",
        answer: "Gas lens related TIG consumables can be quoted with model references.",
      },
    ],
  },
  {
    slug: "tig-collet-body-24",
    name: "TIG Collet Body 2.4 mm",
    sku: "AF-TIG-CB-24",
    category: "TIG Torch Parts",
    categorySlug: "tig-torch-parts",
    shortDescription:
      "Precision TIG collet body for stable tungsten holding and repeatable welding performance.",
    specs: {
      Material: "Copper alloy",
      Size: "2.4 mm",
      Thread: "Torch dependent",
      "Compatible Brand": "Common TIG torch systems",
      "OEM Number": "Reference by model",
      Package: "20 pcs / box",
      MOQ: "300 pcs",
      "Lead Time": "20-30 days",
    },
    productDescription:
      "The TIG collet body is built for reliable consumable replacement in TIG torch maintenance and distributor product ranges.",
    compatibilityInformation:
      "Confirm torch model, tungsten size, and cup system before final quotation.",
    packagingDelivery:
      "Standard neutral packing is available, with OEM packaging review for repeat programs.",
    faqs: [
      {
        question: "Can collets and collet bodies ship together?",
        answer: "Yes. Matched TIG consumable sets can be arranged for distributor orders.",
      },
      {
        question: "Do you support sample confirmation?",
        answer: "Samples can be discussed before mass production for qualified buyers.",
      },
    ],
  },
  {
    slug: "plasma-electrode",
    name: "Plasma Electrode",
    sku: "AF-PLA-EL-100",
    category: "Plasma Cutting Parts",
    categorySlug: "plasma-cutting-parts",
    shortDescription:
      "Plasma cutting electrode for regular maintenance, replacement, and industrial cutting supply.",
    specs: {
      Material: "Copper alloy with insert",
      Size: "Standard",
      Thread: "System dependent",
      "Compatible Brand": "Common plasma torch systems",
      "OEM Number": "By reference",
      Package: "10 pcs / box",
      MOQ: "200 pcs",
      "Lead Time": "20-35 days",
    },
    productDescription:
      "This plasma electrode supports distributors and industrial users that need dependable consumable replenishment for cutting systems.",
    compatibilityInformation:
      "Compatibility depends on torch model, amperage, and consumable series. Send OEM number or sample for matching.",
    packagingDelivery:
      "Packed in protective boxes and export cartons. Bulk and buyer-label options can be reviewed.",
    faqs: [
      {
        question: "Can ARCFORT match OEM numbers?",
        answer: "Yes. Send OEM numbers, drawings, or samples for matching and quotation.",
      },
      {
        question: "Can electrodes and nozzles be supplied as kits?",
        answer: "Kit packing can be discussed for distributor and repair workshop programs.",
      },
    ],
  },
  {
    slug: "plasma-nozzle-11",
    name: "Plasma Nozzle 1.1 mm",
    sku: "AF-PLA-NZ-11",
    category: "Plasma Cutting Parts",
    categorySlug: "plasma-cutting-parts",
    shortDescription:
      "Plasma nozzle for clean cutting performance and routine replacement in cutting workshops.",
    specs: {
      Material: "Copper alloy",
      Size: "1.1 mm",
      Thread: "System dependent",
      "Compatible Brand": "Common plasma torch systems",
      "OEM Number": "By reference",
      Package: "10 pcs / box",
      MOQ: "200 pcs",
      "Lead Time": "20-35 days",
    },
    productDescription:
      "The plasma nozzle is a high-demand consumable for maintenance channels and cutting system users.",
    compatibilityInformation:
      "Confirm amperage, torch series, and matching electrode before bulk purchase.",
    packagingDelivery:
      "Export cartons, inner boxes, and mixed consumable packing are available according to RFQ details.",
    faqs: [
      {
        question: "Can nozzle orifice sizes be selected?",
        answer: "Common orifice sizes can be quoted after confirming the cutting system.",
      },
      {
        question: "Do you provide distributor packing?",
        answer: "Distributor packing can be evaluated based on order volume and packaging design.",
      },
    ],
  },
] as const;

export function getProductByRoute(categorySlug: string, productSlug: string) {
  return mockProducts.find(
    (product) => product.categorySlug === categorySlug && product.slug === productSlug,
  );
}

export function getRelatedProducts(product: MockProduct) {
  return mockProducts
    .filter((item) => item.categorySlug === product.categorySlug && item.slug !== product.slug)
    .slice(0, 3);
}

export function getProductPath(product: Pick<MockProduct, "categorySlug" | "slug">) {
  return `/products/${product.categorySlug}/${product.slug}`;
}
