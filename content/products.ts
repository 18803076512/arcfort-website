import { arcfortProducts, type ArcfortProductData } from "@/lib/data/products";
import {
  type Product,
  type SpecRow,
  type WeldingProcess,
} from "@/lib/content/schemas";
import { isUnconfirmedValue } from "@/lib/content/display";

const processByCategorySlug: Record<string, WeldingProcess> = {
  "mig-mag-torch-parts": "MIG/MAG",
  "tig-torch-parts": "TIG",
  "plasma-cutting-consumables": "Plasma Cutting",
  "welding-consumables": "MMA",
  "welding-accessories": "General Welding",
};

const activeArcfortProducts = arcfortProducts.filter(
  (product) => (product.status ?? "active") === "active",
);

function getImageLabel(product: ArcfortProductData) {
  return product.sku.split("-")[1] ?? "RFQ";
}

function hasMissingProductValue(field: [string, string | undefined]): field is [string, string] {
  const value = field[1];

  return typeof value === "string" && value.length > 0 && isUnconfirmedValue(value);
}

function createSpecifications(product: ArcfortProductData): SpecRow[] {
  const rows = [
    { label: "Product Name", value: product.name },
    { label: "SKU", value: product.sku },
    { label: "Category", value: product.category },
    { label: "Material", value: product.material },
    { label: "Size", value: product.size },
    { label: "Thread", value: product.thread },
    { label: "Compatible Brand", value: product.compatibleBrand },
    { label: "Compatible Model", value: product.compatibleModel },
    { label: "OEM Number", value: product.oemNumber },
    { label: "Weight", value: product.weight },
    { label: "Surface Treatment", value: product.surfaceTreatment },
    { label: "Application", value: product.application },
    { label: "Package", value: product.package },
    { label: "MOQ", value: product.moq },
    { label: "Lead Time", value: product.leadTime },
    { label: "Custom Available", value: product.customAvailable },
    { label: "Reference Part Review", value: product.sampleAvailable },
    { label: "PDF Catalog", value: product.pdfUrl },
  ];

  return rows.filter((row): row is SpecRow => Boolean(row.value));
}

function createCompatibility(product: ArcfortProductData) {
  return [
    { label: "Product Category", value: product.category },
    { label: "Compatible Brand", value: product.compatibleBrand },
    { label: "Compatible Model", value: product.compatibleModel },
    { label: "OEM Number", value: product.oemNumber },
    { label: "Application", value: product.application },
  ].filter((row): row is SpecRow => Boolean(row.value));
}

function createMissingFields(product: ArcfortProductData) {
  const fields: Array<[string, string | undefined]> = [
    ["Material", product.material],
    ["Size", product.size],
    ["Thread", product.thread],
    ["Compatible Brand", product.compatibleBrand],
    ["Compatible Model", product.compatibleModel],
    ["OEM Number", product.oemNumber],
    ["Weight", product.weight],
    ["Surface Treatment", product.surfaceTreatment],
    ["Package", product.package],
  ];

  return fields.filter(hasMissingProductValue).map(([label]) => label);
}

function createRelatedProductSlugs(product: ArcfortProductData) {
  const sameCategorySlugs = activeArcfortProducts
    .filter((relatedProduct) => relatedProduct.slug !== product.slug)
    .filter((relatedProduct) => relatedProduct.categorySlug === product.categorySlug)
    .map((relatedProduct) => relatedProduct.slug);
  const fallbackSlugs = activeArcfortProducts
    .filter((relatedProduct) => relatedProduct.slug !== product.slug)
    .filter((relatedProduct) => relatedProduct.categorySlug !== product.categorySlug)
    .map((relatedProduct) => relatedProduct.slug);

  return [...sameCategorySlugs, ...fallbackSlugs].slice(0, 3);
}

function createFaq(product: ArcfortProductData) {
  return [
    {
      question: `What information is needed for ${product.name} quotation?`,
      answer:
        "Please send quantity, drawing, product photo, reference part details, compatible reference number, packaging requirement and destination country when available.",
    },
    {
      question: `Can ${product.name} be supplied with OEM packaging?`,
      answer:
        "OEM packaging, private label and carton design can be discussed after product details, quantity and artwork requirements are confirmed.",
    },
  ];
}

function createFeatures(product: ArcfortProductData) {
  return [
    `Prepared for ${product.category} RFQ programs`,
    "Suitable for distributors, importers, industrial users and repair workshops",
    "Specifications should be confirmed by drawing, reference part or model reference before quotation",
  ];
}

function getSupportedProcesses(product: ArcfortProductData): WeldingProcess[] {
  const name = product.name.toLowerCase();

  if (name.includes("wire feeder")) {
    return ["MIG/MAG"];
  }

  if (name.includes("plasma")) {
    return ["Plasma Cutting"];
  }

  if (name.includes("tig")) {
    return ["TIG"];
  }

  if (name.includes("mig") || name.includes("mag")) {
    return ["MIG/MAG"];
  }

  return ["General Welding"];
}

function toProduct(product: ArcfortProductData): Product {
  const baseProduct = {
    slug: product.slug,
    title: product.name,
    sku: product.sku,
    categorySlug: product.categorySlug,
    shortDescription: product.shortDescription,
    description: product.description,
    imageLabel: getImageLabel(product),
    mainImage: product.mainImage,
    galleryImages: product.galleryImages,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    keywords: [product.name, product.category, product.application, "ArcFort Weld"],
    specifications: createSpecifications(product),
    compatibility: createCompatibility(product),
    applications: [product.application],
    features: createFeatures(product),
    packaging: product.package,
    moq: product.moq,
    leadTime: product.leadTime,
    faq: createFaq(product),
    relatedProductSlugs: createRelatedProductSlugs(product),
    missingFields: createMissingFields(product),
    dataStatus: product.dataStatus,
    imageStatus: product.imageStatus,
    compatibilityStatus: product.compatibilityStatus,
    oemStatus: product.oemStatus,
  };

  if (product.categorySlug === "welding-machines") {
    return {
      ...baseProduct,
      kind: "welding-equipment",
      equipmentFamily: product.name,
      supportedProcesses: getSupportedProcesses(product),
    };
  }

  return {
    ...baseProduct,
    kind: "welding-consumable",
    process: processByCategorySlug[product.categorySlug] ?? "General Welding",
    consumableFamily: product.name,
  };
}

export const products: Product[] = activeArcfortProducts.map(toProduct);
