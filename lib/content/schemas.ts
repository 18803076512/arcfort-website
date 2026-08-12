export const TO_BE_CONFIRMED = "To be confirmed" as const;

export type MissingValue = typeof TO_BE_CONFIRMED;

export type WeldingProcess = "MIG/MAG" | "TIG" | "MMA" | "Plasma Cutting" | "General Welding";

export type ProductKind = "welding-consumable" | "welding-equipment";

export type ProductDataStatus = "confirmed" | "pending" | "needs_review";

export type ProductImageStatus = "own_photo" | "supplier_photo" | "placeholder" | "needs_photo";

export type ProductCompatibilityStatus = "confirmed" | "reference_only" | "unverified";

export type ProductOemStatus = "confirmed" | "unknown" | "not_applicable";

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

export type CategoryComponent = {
  name: string;
  role: string;
  buyerCheck: string;
  productSlug?: string;
};

export type CategorySelectionVariable = {
  label: string;
  whyItMatters: string;
  confirmationMethod: string;
};

export type CategoryReferenceFamily = {
  name: string;
  documentedComponents: string[];
  buyerCheck: string;
};

export type BuyerDownloadTool = {
  href: string;
  title: string;
  description: string;
  buttonLabel: string;
};

export type ProductBuyingProfile = {
  productSlug: string;
  eyebrow: string;
  title: string;
  description: string;
  selectionVariables: CategorySelectionVariable[];
  confirmationChecklist: string[];
  rfqFields: string[];
  buyerTool?: BuyerDownloadTool;
  features?: string[];
  faq?: FaqItem[];
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
  compatibilityNote: string;
  applications: string[];
  buyerGuide: string[];
  componentGuide?: CategoryComponent[];
  referenceFamilies?: CategoryReferenceFamily[];
  selectionVariables?: CategorySelectionVariable[];
  compatibilityChecklist?: string[];
  buyerTool?: BuyerDownloadTool;
  oemServiceNote: string;
  packagingMoqNote: string;
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
  modifiedDate: string;
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
  dataStatus?: ProductDataStatus;
  imageStatus?: ProductImageStatus;
  compatibilityStatus?: ProductCompatibilityStatus;
  oemStatus?: ProductOemStatus;
  sourceType?: "factory" | "supplier_catalog" | "official_catalog" | "customer_sample" | "unknown";
  referenceReviewedDate?: string;
  catalogUrl?: string;
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
  publishedDate: string;
  modifiedDate: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  componentReference?: {
    title: string;
    description: string;
    rows: Array<{
      name: string;
      assemblyArea: string;
      role: string;
      buyerCheck: string;
      productSlug?: string;
    }>;
  };
  buyerChecklist?: {
    title: string;
    description: string;
    items: string[];
  };
  rfqFields?: string[];
  buyerTool?: BuyerDownloadTool;
  categorySlugs: string[];
  productSlugs: string[];
  faq: FaqItem[];
  keywords: string[];
};
