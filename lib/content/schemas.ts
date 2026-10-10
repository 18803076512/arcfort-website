export const TO_BE_CONFIRMED = "To be confirmed" as const;

export type MissingValue = typeof TO_BE_CONFIRMED;

export type WeldingProcess = "MIG/MAG" | "TIG" | "MMA" | "Plasma Cutting" | "General Welding";

export type ProductKind = "welding-consumable" | "welding-equipment";

export type ProductDataStatus = "confirmed" | "pending" | "needs_review";

export type ProductImageStatus = "own_photo" | "supplier_photo" | "placeholder" | "needs_photo";

export type ProductImageAssetRole =
  "main" | "gallery" | "technical" | "dimension" | "packaging" | "bulk";

export type ProductImageSourceKind =
  | "company_owned_photo"
  | "local_supplier_archive"
  | "company_catalog_crop"
  | "buyer_provided_reference"
  | "unknown";

export type ProductImageOwnershipStatus =
  "company_owned" | "company_document" | "supplier_or_third_party" | "unknown";

export type ProductImageUsageRightsStatus = "approved" | "needs_confirmation" | "restricted";

export type ProductImageContentMatchStatus =
  "exact_product" | "product_family_reference" | "needs_review" | "rejected";

export type ProductImagePublicationStatus =
  "search_eligible" | "legacy_reference" | "display_only" | "blocked";

export type ProductImageAsset = {
  assetId: string;
  sku: string;
  productSlug: string;
  role: ProductImageAssetRole;
  publicPath: string;
  altText: string;
  sourceKind: ProductImageSourceKind;
  sourceReference: string;
  sourceFile?: string;
  sourceOwner?: string;
  ownershipStatus: ProductImageOwnershipStatus;
  usageRightsStatus: ProductImageUsageRightsStatus;
  contentMatchStatus: ProductImageContentMatchStatus;
  publicationStatus: ProductImagePublicationStatus;
  reviewedBy?: string;
  reviewedDate?: string;
  notesInternal?: string;
};

export type ProductCompatibilityStatus = "confirmed" | "reference_only" | "unverified";

export type ProductOemStatus = "confirmed" | "unknown" | "not_applicable";

export type ProductSourceType =
  "factory" | "supplier_catalog" | "official_catalog" | "customer_sample" | "unknown";

export type TechnicalEvidenceLevel = "A" | "B" | "C" | "D";

export type TechnicalVerificationStatus =
  | "CONFIRMED"
  | "OEM_REFERENCE"
  | "STANDARD_REFERENCE"
  | "NEEDS_FACTORY_CONFIRMATION"
  | "DATA_CONFLICT";

export type ProductSeriesComponentEvidenceScope = "series" | "family" | "variant";

export type ProductSeriesComponentField =
  | "component_presence"
  | "series_designation"
  | "compatibility_statement"
  | "cooling_method"
  | "cable_length"
  | "rating"
  | "duty_cycle"
  | "wire_size"
  | "profile"
  | "opening"
  | "outside_diameter"
  | "wall_thickness"
  | "overall_length"
  | "material"
  | "thread"
  | "connection"
  | "variant"
  | "other";

export type ProductSeriesComponentLifecycleStatus =
  "evidence_only" | "ready_for_sku" | "mapped_to_sku" | "blocked";

export type ProductSeriesComponentComparisonSourceType =
  "company_catalog" | "official_oem_catalog" | "standard_reference";

export type ProductSeriesComponentFact = {
  factId: string;
  seriesEvidenceId: string;
  scope: ProductSeriesComponentEvidenceScope;
  componentKey: string;
  componentName: string;
  catalogPosition?: string;
  variantKey: string;
  variantLabel: string;
  field: ProductSeriesComponentField;
  label: string;
  referenceValue: string;
  referenceUnit?: string;
  sourceReference: string;
  sourceLevel: TechnicalEvidenceLevel;
  verificationStatus: TechnicalVerificationStatus;
  comparisonSourceType?: ProductSeriesComponentComparisonSourceType;
  comparisonSourceReference?: string;
  comparisonValue?: string;
  conflictNote?: string;
  lifecycleStatus: ProductSeriesComponentLifecycleStatus;
  targetSku?: string;
  reviewedBy: string;
  reviewedDate: string;
  notesInternal?: string;
};

export type ProductTechnicalField =
  | "material"
  | "wire_size"
  | "overall_length"
  | "thread"
  | "connection"
  | "nozzle_profile"
  | "nozzle_opening"
  | "weight"
  | "surface_treatment"
  | "electrical_rating"
  | "other";

export type ProductTechnicalSourceField =
  "material" | "size" | "thread" | "weight" | "surfaceTreatment";

export type ProductTechnicalEvidenceBasis =
  | "company_catalog"
  | "factory_confirmation"
  | "factory_specification"
  | "drawing"
  | "approved_sample"
  | "verified_reference_number"
  | "confirmed_dimensions"
  | "measurement_record"
  | "packaging_record";

export type ProductTechnicalFact = {
  id: string;
  productSlug: string;
  field: ProductTechnicalField;
  sourceField: ProductTechnicalSourceField;
  label: string;
  fieldValue: string;
  unit?: string;
  variant?: string;
  displayOrder: number;
  sourceType: ProductSourceType;
  sourceLevel: TechnicalEvidenceLevel;
  verificationStatus: TechnicalVerificationStatus;
  evidenceBasis: ProductTechnicalEvidenceBasis[];
  sourceReference: string;
  publicNote: string;
  confirmationRequirements: string[];
  reviewedBy: string;
  lastVerifiedDate: string;
  notesInternal?: string;
};

export type CompatibilityEntityType = "product" | "series" | "torch" | "machine" | "oem_reference";

export type CompatibilityRelationshipType =
  | "product_to_series"
  | "product_to_torch"
  | "product_to_machine"
  | "product_to_oem_reference"
  | "series_to_torch"
  | "torch_to_machine";

export type CompatibilityEvidenceBasis =
  | "company_catalog"
  | "factory_confirmation"
  | "drawing"
  | "approved_sample"
  | "verified_reference_number"
  | "confirmed_dimensions";

export type CompatibilityEntityReference = {
  type: CompatibilityEntityType;
  id: string;
};

export type CompatibilityRelationship = {
  id: string;
  relationshipType: CompatibilityRelationshipType;
  subject: CompatibilityEntityReference;
  target: CompatibilityEntityReference;
  role: string;
  relationshipStatus: ProductCompatibilityStatus;
  sourceType: ProductSourceType;
  sourceLevel: TechnicalEvidenceLevel;
  verificationStatus: TechnicalVerificationStatus;
  evidenceBasis: CompatibilityEvidenceBasis[];
  sourceReference: string;
  buyerConfirmationRequired: boolean;
  confirmationRequirements: string[];
  reviewedBy: string;
  reviewedDate: string;
  notesInternal?: string;
};

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
  evidenceId?: string;
  name: string;
  documentedComponents: string[];
  buyerCheck: string;
  seriesSlug?: string;
};

export type BuyerDownloadTool = {
  href: string;
  title: string;
  description: string;
  buttonLabel: string;
};

export type BuyerResourceLink = {
  href: string;
  label: string;
  title: string;
  description: string;
  actionLabel: string;
};

export type BuyerResourceSection = {
  eyebrow: string;
  title: string;
  description: string;
  links: BuyerResourceLink[];
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

export type ProductSeriesReference = {
  productSlug: string;
  role: string;
  relationshipStatus: ProductCompatibilityStatus;
};

export type ProductSeriesAssemblyReference = {
  id: string;
  name: string;
  sourceLabel: string;
  description: string;
  componentGroups: string[];
  buyerCheck: string;
};

export type ProductSeries = {
  evidenceId: string;
  slug: string;
  name: string;
  shortName: string;
  categorySlug: string;
  process: WeldingProcess;
  description: string;
  overview: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  referenceFamilyName: string;
  documentedComponents: string[];
  assemblyReferences?: ProductSeriesAssemblyReference[];
  buyerCheck: string;
  compatibilityStatement: string;
  productReferences: ProductSeriesReference[];
  heroProductSlug: string;
  selectionVariables: CategorySelectionVariable[];
  confirmationChecklist: string[];
  rfqFields: string[];
  applications: string[];
  relatedGuideSlugs: string[];
  faq: FaqItem[];
  catalogUrl: string;
  sourceType: ProductSourceType;
  sourceReference: string;
  sourceLevel: TechnicalEvidenceLevel;
  verificationStatus: TechnicalVerificationStatus;
  reviewedBy: string;
  reviewedDate: string;
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
  buyerResourceSection?: BuyerResourceSection;
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
  sourceType?: ProductSourceType;
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
  operatingContext: string[];
  selectionConsiderations: Array<{
    label: string;
    guidance: string;
  }>;
  rfqFields: string[];
  relatedCategorySlugs: string[];
  relatedProductSlugs: string[];
  buyerResourceSection?: BuyerResourceSection;
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
