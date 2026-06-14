export type ProductStatus = "active" | "draft" | "archived";
export type ProductDataStatus = "confirmed" | "pending" | "needs_review";
export type ProductSourceType =
  | "factory"
  | "supplier_catalog"
  | "official_catalog"
  | "customer_sample"
  | "unknown";
export type ProductImageStatus = "own_photo" | "supplier_photo" | "placeholder" | "needs_photo";
export type ProductCompatibilityStatus = "confirmed" | "reference_only" | "unverified";
export type ProductOemStatus = "confirmed" | "unknown" | "not_applicable";

export type ArcfortProductData = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  galleryImages: string[];
  material: string;
  size: string;
  thread: string;
  compatibleBrand: string;
  compatibleModel?: string;
  oemNumber: string;
  weight?: string;
  surfaceTreatment?: string;
  package: string;
  moq: string;
  leadTime: string;
  application: string;
  customAvailable?: string;
  sampleAvailable?: string;
  pdfUrl?: string;
  metaTitle: string;
  metaDescription: string;
  status?: ProductStatus;
  dataStatus?: ProductDataStatus;
  sourceType?: ProductSourceType;
  sourceReference?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  imageStatus?: ProductImageStatus;
  compatibilityStatus?: ProductCompatibilityStatus;
  oemStatus?: ProductOemStatus;
};

const materialFallback = "Specific material grade to be confirmed by sample or drawing";
const copperMaterialFallback = "Copper material, specific grade to be confirmed";
const dimensionFallback = "Available upon request";
const compatibilityFallback = "Compatibility can be confirmed by sample or drawing";
const packageFallback = "Standard export packing or customized packaging";
const moqFallback = "Small trial orders accepted";
const leadTimeFallback = "7-20 working days after deposit confirmation";

export const arcfortProducts: ArcfortProductData[] = [
  {
    id: "af-mig-ct-0001",
    sku: "AF-MIG-CT-0001",
    name: "MIG Contact Tip",
    slug: "mig-contact-tip",
    category: "MIG Torch Parts",
    categorySlug: "mig-mag-torch-parts",
    shortDescription:
      "MIG contact tip for wire feeding and current transfer in MIG/MAG welding torch applications.",
    description:
      "MIG Contact Tip is prepared for distributors, repair workshops and industrial users sourcing MIG/MAG torch consumables. Exact size, thread, material grade and compatibility should be confirmed by drawing, sample, torch model or product list before quotation.",
    mainImage: "/images/products/mig-contact-tip.jpg",
    galleryImages: [],
    material: copperMaterialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "MIG/MAG welding torch consumables",
    metaTitle: "MIG Contact Tip for MIG/MAG Torch Parts",
    metaDescription:
      "Source MIG contact tips for MIG/MAG welding torch consumable programs. Send size, thread, drawing or sample details for ArcFort Weld RFQ confirmation.",
  },
  {
    id: "af-mig-gn-0002",
    sku: "AF-MIG-GN-0002",
    name: "MIG Gas Nozzle",
    slug: "mig-gas-nozzle",
    category: "MIG Torch Parts",
    categorySlug: "mig-mag-torch-parts",
    shortDescription:
      "MIG gas nozzle for shielding gas coverage and welding torch consumable replacement.",
    description:
      "MIG Gas Nozzle is used in MIG/MAG torch consumable replacement and distributor sourcing lists. Buyers should confirm nozzle shape, size, material grade, torch model and packaging requirements before quotation.",
    mainImage: "/images/products/mig-gas-nozzle.jpg",
    galleryImages: [],
    material: copperMaterialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "MIG/MAG welding torch consumables",
    metaTitle: "MIG Gas Nozzle for Welding Torch Consumables",
    metaDescription:
      "ArcFort Weld supplies MIG gas nozzle sourcing pages for global B2B buyers. Confirm torch model, nozzle size, package and quantity by RFQ.",
  },
  {
    id: "af-mig-df-0003",
    sku: "AF-MIG-DF-0003",
    name: "MIG Diffuser",
    slug: "mig-diffuser",
    category: "MIG Torch Parts",
    categorySlug: "mig-mag-torch-parts",
    shortDescription:
      "MIG diffuser for gas distribution and torch consumable assemblies in MIG/MAG welding.",
    description:
      "MIG Diffuser is prepared for buyers sourcing MIG/MAG torch consumable assemblies. Confirm material grade, thread, torch series, reference number and packaging details before final quotation.",
    mainImage: "/images/products/mig-diffuser.jpg",
    galleryImages: [],
    material: copperMaterialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "MIG/MAG welding torch consumables",
    metaTitle: "MIG Diffuser for MIG/MAG Torch Parts",
    metaDescription:
      "Request quotation for MIG diffusers used in MIG/MAG torch consumable assemblies. Compatibility can be confirmed by drawing, sample or reference number.",
  },
  {
    id: "af-tig-cc-0004",
    sku: "AF-TIG-CC-0004",
    name: "TIG Ceramic Cup",
    slug: "tig-ceramic-cup",
    category: "TIG Torch Parts",
    categorySlug: "tig-torch-parts",
    shortDescription:
      "TIG ceramic cup for shielding gas direction and TIG torch consumable replacement.",
    description:
      "TIG Ceramic Cup is prepared for TIG torch parts sourcing, replacement and repair workshop RFQs. Cup size, torch series, package quantity and reference number should be confirmed before quotation.",
    mainImage: "/images/products/tig-ceramic-cup.jpg",
    galleryImages: [],
    material: "Ceramic",
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "TIG welding torch consumables",
    metaTitle: "TIG Ceramic Cup for TIG Torch Parts",
    metaDescription:
      "Source TIG ceramic cups for TIG torch part programs. Send cup size, torch series, quantity and packaging details for quotation.",
  },
  {
    id: "af-tig-cb-0005",
    sku: "AF-TIG-CB-0005",
    name: "TIG Collet Body",
    slug: "tig-collet-body",
    category: "TIG Torch Parts",
    categorySlug: "tig-torch-parts",
    shortDescription:
      "TIG collet body for tungsten holding and TIG torch consumable assemblies.",
    description:
      "TIG Collet Body is used in TIG torch consumable assemblies and repair sourcing programs. Tungsten size, torch series, material grade, reference number and packaging should be confirmed by RFQ.",
    mainImage: "/images/products/tig-collet-body.jpg",
    galleryImages: [],
    material: copperMaterialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "TIG welding torch consumables",
    metaTitle: "TIG Collet Body for TIG Torch Consumables",
    metaDescription:
      "ArcFort Weld prepares TIG collet body sourcing content for B2B buyers. Confirm tungsten size, torch model and package by RFQ.",
  },
  {
    id: "af-tig-gl-0006",
    sku: "AF-TIG-GL-0006",
    name: "TIG Gas Lens",
    slug: "tig-gas-lens",
    category: "TIG Torch Parts",
    categorySlug: "tig-torch-parts",
    shortDescription:
      "TIG gas lens for stable shielding gas flow in TIG torch consumable setups.",
    description:
      "TIG Gas Lens supports TIG torch consumable sourcing for distributors and repair workshops. Torch series, tungsten size, material grade, compatible reference and packaging should be confirmed before quotation.",
    mainImage: "/images/products/tig-gas-lens.jpg",
    galleryImages: [],
    material: materialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "TIG welding torch consumables",
    metaTitle: "TIG Gas Lens for TIG Torch Parts",
    metaDescription:
      "Request TIG gas lens quotation for TIG torch consumable sourcing. Compatibility can be reviewed by torch model, sample or drawing.",
  },
  {
    id: "af-pla-el-0007",
    sku: "AF-PLA-EL-0007",
    name: "Plasma Electrode",
    slug: "plasma-electrode",
    category: "Plasma Cutting Parts",
    categorySlug: "plasma-cutting-consumables",
    shortDescription:
      "Plasma electrode for plasma cutting torch consumable replacement and distributor RFQs.",
    description:
      "Plasma Electrode is prepared for plasma cutting consumable sourcing by torch model, sample or reference number. Material grade, size, compatible brand, OEM number and package should be confirmed before quotation.",
    mainImage: "/images/products/plasma-electrode.jpg",
    galleryImages: [],
    material: materialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "Plasma cutting torch consumables",
    metaTitle: "Plasma Electrode for Plasma Cutting Consumables",
    metaDescription:
      "Source plasma electrodes for cutting torch consumable programs. Send torch model, reference number, quantity and packaging request.",
  },
  {
    id: "af-pla-nz-0008",
    sku: "AF-PLA-NZ-0008",
    name: "Plasma Nozzle",
    slug: "plasma-nozzle",
    category: "Plasma Cutting Parts",
    categorySlug: "plasma-cutting-consumables",
    shortDescription:
      "Plasma nozzle for cutting torch consumable replacement and plasma cutting supply programs.",
    description:
      "Plasma Nozzle is prepared for buyers sourcing plasma cutting consumables as individual items or kits. Nozzle size, torch model, amperage reference, material and packaging should be confirmed by RFQ.",
    mainImage: "/images/products/plasma-nozzle.jpg",
    galleryImages: [],
    material: materialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "Plasma cutting torch consumables",
    metaTitle: "Plasma Nozzle for Plasma Cutting Parts",
    metaDescription:
      "Request quotation for plasma nozzles used in cutting torch consumable programs. Confirm torch model, size and reference details by RFQ.",
  },
  {
    id: "af-pla-sr-0009",
    sku: "AF-PLA-SR-0009",
    name: "Plasma Swirl Ring",
    slug: "plasma-swirl-ring",
    category: "Plasma Cutting Parts",
    categorySlug: "plasma-cutting-consumables",
    shortDescription:
      "Plasma swirl ring for plasma cutting torch consumable stacks and repair sourcing.",
    description:
      "Plasma Swirl Ring is used in plasma cutting consumable stacks and should be matched with the correct torch model. Material, size, compatible brand, OEM reference and package quantity should be confirmed before quotation.",
    mainImage: "/images/products/plasma-swirl-ring.jpg",
    galleryImages: [],
    material: materialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "Plasma cutting torch consumables",
    metaTitle: "Plasma Swirl Ring for Cutting Torch Consumables",
    metaDescription:
      "ArcFort Weld supports plasma swirl ring RFQs for plasma cutting consumable stacks. Compatibility is confirmed by torch model or sample.",
  },
  {
    id: "af-con-eh-0010",
    sku: "AF-CON-EH-0010",
    name: "Electrode Holder",
    slug: "electrode-holder",
    category: "Welding Consumables",
    categorySlug: "welding-consumables",
    shortDescription:
      "Electrode holder for MMA welding and general welding consumable supply programs.",
    description:
      "Electrode Holder is prepared for welding consumable sourcing, repair workshops and distributor product lists. Current rating, cable connection, material, packaging and quantity should be confirmed before quotation.",
    mainImage: "/images/products/electrode-holder.jpg",
    galleryImages: [],
    material: materialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "MMA welding consumables and workshop supply",
    metaTitle: "Electrode Holder for Welding Consumables",
    metaDescription:
      "Source electrode holders for MMA welding and workshop supply. Send current rating, connection type, quantity and package requirements.",
  },
  {
    id: "af-acc-gc-0011",
    sku: "AF-ACC-GC-0011",
    name: "Ground Clamp",
    slug: "ground-clamp",
    category: "Welding Accessories",
    categorySlug: "welding-accessories",
    shortDescription:
      "Ground clamp for welding machine accessory lists and workshop replacement programs.",
    description:
      "Ground Clamp is prepared for welding accessory sourcing and mixed distributor RFQs. Clamp type, current rating, cable connection, material and packaging should be confirmed by sample, drawing or product list.",
    mainImage: "/images/products/ground-clamp.jpg",
    galleryImages: [],
    material: materialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "Welding machine accessories and repair workshop supply",
    metaTitle: "Ground Clamp for Welding Accessories",
    metaDescription:
      "Request ground clamp quotation for welding accessory programs. Confirm current rating, connection type, package and quantity by RFQ.",
  },
  {
    id: "af-acc-cc-0012",
    sku: "AF-ACC-CC-0012",
    name: "Welding Cable Connector",
    slug: "welding-cable-connector",
    category: "Welding Accessories",
    categorySlug: "welding-accessories",
    shortDescription:
      "Welding cable connector for welding machine accessories and workshop replacement sourcing.",
    description:
      "Welding Cable Connector is prepared for buyers sourcing welding accessories, connector replacements and mixed workshop supply lists. Connector size, current rating, cable compatibility and package details should be confirmed before quotation.",
    mainImage: "/images/products/welding-cable-connector.jpg",
    galleryImages: [],
    material: materialFallback,
    size: dimensionFallback,
    thread: dimensionFallback,
    compatibleBrand: compatibilityFallback,
    oemNumber: dimensionFallback,
    package: packageFallback,
    moq: moqFallback,
    leadTime: leadTimeFallback,
    application: "Welding cable connection and workshop accessory supply",
    metaTitle: "Welding Cable Connector for Welding Accessories",
    metaDescription:
      "Source welding cable connectors for welding machine accessory programs. Confirm connector size, current rating and package by RFQ.",
  },
];
