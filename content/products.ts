import { arcfortProducts, type ArcfortProductData } from "@/lib/data/products";
import {
  type Product,
  type ProductTechnicalSourceField,
  type SpecRow,
  type WeldingProcess,
} from "@/lib/content/schemas";
import { isUnconfirmedValue } from "@/lib/content/display";
import { getProductBuyingProfile } from "@/lib/content/product-buying-profiles";
import { isLegacyProductPath } from "@/lib/content/product-redirects";
import { getProductTechnicalSpecificationProjection } from "@/lib/content/product-technical-facts";
import { siteConfig } from "@/lib/content/site";

const processByCategorySlug: Record<string, WeldingProcess> = {
  "mig-mag-torch-parts": "MIG/MAG",
  "tig-torch-parts": "TIG",
  "plasma-cutting-consumables": "Plasma Cutting",
  "welding-consumables": "MMA",
  "welding-accessories": "General Welding",
};

const companyCatalogPath = "/downloads/renqiu-ailesen-welding-catalog.pdf";

const activeArcfortProducts = arcfortProducts.filter(
  (product) =>
    (product.status ?? "active") === "active" &&
    !isLegacyProductPath(product.categorySlug, product.slug),
);

function getImageLabel(product: ArcfortProductData) {
  return product.sku.split("-")[1] ?? "RFQ";
}

function hasMissingProductValue(field: [string, string | undefined]): field is [string, string] {
  const value = field[1];

  return typeof value === "string" && value.length > 0 && isUnconfirmedValue(value);
}

function createSpecifications(product: ArcfortProductData): SpecRow[] {
  const technicalProjection = getProductTechnicalSpecificationProjection(product.slug);
  const managedSourceFields = new Set(technicalProjection.managedSourceFields);
  const fallbackTechnicalRows: SpecRow[] = [];
  const addFallbackTechnicalRow = (
    sourceField: ProductTechnicalSourceField,
    label: string,
    value: string | undefined,
  ) => {
    if (!managedSourceFields.has(sourceField) && value) {
      fallbackTechnicalRows.push({ label, value });
    }
  };

  addFallbackTechnicalRow("material", "Material", product.material);
  addFallbackTechnicalRow("size", "Size", product.size);
  addFallbackTechnicalRow("thread", "Thread", product.thread);
  addFallbackTechnicalRow("weight", "Weight", product.weight);
  addFallbackTechnicalRow("surfaceTreatment", "Surface Treatment", product.surfaceTreatment);
  const rows = [
    { label: "Product Name", value: product.name },
    { label: "SKU", value: product.sku },
    { label: "Category", value: product.category },
    ...technicalProjection.rows,
    ...fallbackTechnicalRows,
    { label: "Compatible Brand", value: product.compatibleBrand },
    { label: "Compatible Model", value: product.compatibleModel },
    { label: "OEM Number", value: product.oemNumber },
    { label: "Application", value: product.application },
    { label: "Package", value: product.package },
    { label: "MOQ", value: product.moq },
    { label: "Lead Time", value: product.leadTime },
    { label: "Custom Available", value: product.customAvailable },
    { label: "Reference Part Review", value: product.sampleAvailable },
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
  const technicalProjection = getProductTechnicalSpecificationProjection(product.slug);
  const managedSourceFields = new Set(technicalProjection.managedSourceFields);
  const fields: Array<{
    label: string;
    value: string | undefined;
    sourceField?: ProductTechnicalSourceField;
  }> = [
    { label: "Material", value: product.material, sourceField: "material" },
    { label: "Size", value: product.size, sourceField: "size" },
    { label: "Thread", value: product.thread, sourceField: "thread" },
    { label: "Compatible Brand", value: product.compatibleBrand },
    { label: "Compatible Model", value: product.compatibleModel },
    { label: "OEM Number", value: product.oemNumber },
    { label: "Weight", value: product.weight, sourceField: "weight" },
    {
      label: "Surface Treatment",
      value: product.surfaceTreatment,
      sourceField: "surfaceTreatment",
    },
    { label: "Package", value: product.package },
  ];

  const legacyMissingFields = fields
    .filter(({ sourceField }) => !sourceField || !managedSourceFields.has(sourceField))
    .map(({ label, value }) => [label, value] as [string, string | undefined])
    .filter(hasMissingProductValue)
    .map(([label]) => label);

  return Array.from(new Set([...technicalProjection.confirmationLabels, ...legacyMissingFields]));
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
  const buyingProfile = getProductBuyingProfile(product.slug);

  if (buyingProfile?.faq?.length) {
    return buyingProfile.faq;
  }

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
  const buyingProfile = getProductBuyingProfile(product.slug);

  if (buyingProfile?.features?.length) {
    return buyingProfile.features;
  }

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

function getConsumableProcess(product: ArcfortProductData) {
  if (product.slug === "robot-welding-torch") {
    return "MIG/MAG";
  }

  return processByCategorySlug[product.categorySlug] ?? "General Welding";
}

function getProductModifiedDate(product: ArcfortProductData) {
  return [siteConfig.productTemplateLastModified, product.verifiedDate]
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1)!;
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
    modifiedDate: getProductModifiedDate(product),
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
    sourceType: product.sourceType,
    referenceReviewedDate: product.verifiedDate,
    catalogUrl:
      product.pdfUrl ??
      (product.sourceType === "official_catalog" ? companyCatalogPath : undefined),
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
    process: getConsumableProcess(product),
    consumableFamily: product.name,
  };
}

export const products: Product[] = activeArcfortProducts.map(toProduct);
