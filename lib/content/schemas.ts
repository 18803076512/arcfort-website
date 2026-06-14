export const TO_BE_CONFIRMED = "To be confirmed" as const;

export type MissingValue = typeof TO_BE_CONFIRMED;

export type WeldingProcess = "MIG/MAG" | "TIG" | "MMA" | "Plasma Cutting" | "General Welding";

export type ProductKind = "welding-consumable" | "welding-equipment";

export type FaqItem = {
  question: string;
  answer: string;
};

export type SpecRow = {
  label: string;
  value: string;
  note?: string;
};

export type CompatibilityRow = {
  label: string;
  value: string;
  note?: string;
};

export type ProductCategory = {
  slug: string;
  code: string;
  title: string;
  shortTitle: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoIntro: string;
  productRange: string[];
  commonSpecifications: string[];
  applications: string[];
  buyerGuide: string[];
  features: string[];
  relatedCategorySlugs: string[];
  faq: FaqItem[];
  keywords: string[];
};

export type BaseProduct = {
  slug: string;
  title: string;
  sku: string;
  categorySlug: string;
  kind: ProductKind;
  shortDescription: string;
  description: string;
  imageLabel: string;
  mainImage: string;
  galleryImages: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  specifications: SpecRow[];
  compatibility: CompatibilityRow[];
  applications: string[];
  features: string[];
  packaging: string;
  moq: string;
  leadTime: string;
  faq: FaqItem[];
  relatedProductSlugs: string[];
  missingFields: string[];
};

export type WeldingConsumableProduct = BaseProduct & {
  kind: "welding-consumable";
  process: WeldingProcess;
  consumableFamily: string;
};

export type WeldingEquipmentProduct = BaseProduct & {
  kind: "welding-equipment";
  equipmentFamily: string;
  supportedProcesses: WeldingProcess[];
};

export type Product = WeldingConsumableProduct | WeldingEquipmentProduct;

export type ApplicationPage = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  seoDescription: string;
  overview: string;
  industries: string[];
  buyerNeeds: string[];
  relatedCategorySlugs: string[];
  relatedProductSlugs: string[];
  faq: FaqItem[];
  keywords: string[];
};

export type GuideArticle = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  seoDescription: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  categorySlugs: string[];
  productSlugs: string[];
  faq: FaqItem[];
  keywords: string[];
};
