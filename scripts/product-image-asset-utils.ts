import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import type {
  ProductImageAsset,
  ProductImageContentMatchStatus,
  ProductImageOwnershipStatus,
  ProductImagePublicationStatus,
  ProductImageSourceKind,
  ProductImageUsageRightsStatus,
} from "../lib/content/schemas.ts";
import {
  parseCsv,
  resolveValidationInputPath,
  splitImageList,
  validateCsvFile,
  type ProductImportRow,
} from "./product-import-utils.ts";

export const imageAssetRegistryPath = path.join(
  process.cwd(),
  "data",
  "assets",
  "product-image-assets.csv",
);

export const generatedImageAssetPath = path.join(
  process.cwd(),
  "lib",
  "data",
  "product-image-assets.ts",
);

export const imageAssetHeaders = [
  "asset_id",
  "sku",
  "product_slug",
  "role",
  "public_path",
  "alt_text",
  "source_kind",
  "source_reference",
  "source_file",
  "source_owner",
  "ownership_status",
  "usage_rights_status",
  "content_match_status",
  "publication_status",
  "reviewed_by",
  "reviewed_date",
  "notes_internal",
] as const;

export type ProductImageAssetCsvRow = Record<(typeof imageAssetHeaders)[number], string>;

export type ProductImageAssetIssue = {
  level: "error" | "warning";
  assetId?: string;
  message: string;
};

export type ImageFileInspection = {
  publicPath: string;
  exists: boolean;
  detectedFormat?: "jpeg" | "png";
  width?: number;
  height?: number;
  bytes?: number;
  sha256?: string;
};

export type ProductImageAssetValidation = {
  rows: ProductImageAssetCsvRow[];
  products: ProductImportRow[];
  inspections: Map<string, ImageFileInspection>;
  errors: ProductImageAssetIssue[];
  warnings: ProductImageAssetIssue[];
};

export type ProductImageAssetValidationOptions = {
  productInputPath?: string;
  registryPath?: string;
};

type SourceEvidence = {
  sourceKind: ProductImageSourceKind;
  sourceReference: string;
  sourceFile: string;
  ownershipStatus: ProductImageOwnershipStatus;
};

const localSupplierSource = (sourceFile: string): SourceEvidence => ({
  sourceKind: "local_supplier_archive",
  sourceReference:
    "Local supplier image archive visual match. Exact variant and public usage rights require confirmation.",
  sourceFile,
  ownershipStatus: "supplier_or_third_party",
});

const companyCatalogSource = (pdfPages: string): SourceEvidence => ({
  sourceKind: "company_catalog_crop",
  sourceReference: `Renqiu Ailesen welding catalog PDF ${pdfPages}. Image is retained as a product-family reference.`,
  sourceFile: "renqiu-ailesen-welding-catalog.pdf",
  ownershipStatus: "company_document",
});

const sourceEvidenceByProductSlug: Record<string, SourceEvidence> = {
  "mig-diffuser": localSupplierSource("微信图片_202404111901304.jpg"),
  "mig-swan-neck": localSupplierSource("欧式弯管1.jpg"),
  "tig-ceramic-cup-5": localSupplierSource("瓷嘴0.jpg"),
  "tig-ceramic-cup-6": localSupplierSource("瓷嘴0.jpg"),
  "tig-collet": localSupplierSource("钨极夹.jpg"),
  "tig-collet-body": localSupplierSource("氩弧焊配件.jpg"),
  "tig-back-cap": localSupplierSource("微信图片_20240411190132.jpg"),
  "tig-tungsten-electrode": localSupplierSource("微信图片_20240411190131.jpg"),
  "plasma-electrode": localSupplierSource("微信图片_202404111901331.jpg"),
  "plasma-nozzle": localSupplierSource("微信图片_202404111901308.jpg"),
  "plasma-shield": localSupplierSource("微信图片_202404111901303.jpg"),
  "plasma-cutting-tip": localSupplierSource("温州40.jpg"),
  "electrode-holder": localSupplierSource("微信图片_202404111901314.jpg"),
  "welding-electrode": localSupplierSource("大桥电焊条.jpg"),
  "welding-wire": localSupplierSource("大桥牌气体保护实心焊丝.jpg"),
  "ground-clamp": localSupplierSource("地线夹3.jpg"),
  "welding-cable-connector": localSupplierSource("QQ截图20211203091759.jpg"),
  "welding-cable": localSupplierSource("微信图片_202404111901332.jpg"),
  "dinse-connector": localSupplierSource("微信图片_202404111901332.jpg"),
  "mig-mag-welding-torch": localSupplierSource("焊枪1.jpg"),
  "plasma-cutting-torch": localSupplierSource("P809.jpg"),
  "spot-welding-electrode": localSupplierSource("微信图片_202404111901308.jpg"),
  "wire-feeder-accessories": localSupplierSource("送丝机.jpg"),
  "mig-tip-holder-for-mb15": companyCatalogSource("page 8 (catalog page 10)"),
  "mig-torch-liner": companyCatalogSource("page 45 (catalog pages 83-84)"),
  "tig-gas-lens-1-6mm": companyCatalogSource("page 35 (catalog pages 63-64)"),
  "plasma-swirl-ring": companyCatalogSource("page 22 (catalog pages 37-38)"),
  "plasma-torch-spacer": companyCatalogSource("page 22 (catalog page 38)"),
  "mig-torch-switch": companyCatalogSource("page 19"),
  "wire-feeder": companyCatalogSource("page 39"),
  "tig-welding-torch": companyCatalogSource("page 25"),
  "tig-torch-switch": companyCatalogSource("page 36"),
  "stud-welding-gun": companyCatalogSource("page 37"),
  "stud-welding-accessories": companyCatalogSource("page 37"),
  "robot-welding-torch": companyCatalogSource("page 48"),
  "welding-protective-cover": companyCatalogSource("page 58"),
  "co2-flowmeter": companyCatalogSource("page 58"),
};

const allowedRoles = ["main", "gallery", "technical", "dimension", "packaging", "bulk"] as const;
const allowedSourceKinds: ProductImageSourceKind[] = [
  "company_owned_photo",
  "local_supplier_archive",
  "company_catalog_crop",
  "buyer_provided_reference",
  "unknown",
];
const allowedOwnershipStatuses: ProductImageOwnershipStatus[] = [
  "company_owned",
  "company_document",
  "supplier_or_third_party",
  "unknown",
];
const allowedUsageRightsStatuses: ProductImageUsageRightsStatus[] = [
  "approved",
  "needs_confirmation",
  "restricted",
];
const allowedContentMatchStatuses: ProductImageContentMatchStatus[] = [
  "exact_product",
  "product_family_reference",
  "needs_review",
  "rejected",
];
const allowedPublicationStatuses: ProductImagePublicationStatus[] = [
  "search_eligible",
  "legacy_reference",
  "display_only",
  "blocked",
];
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function csvEscape(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function serializeImageAssetCsv(rows: ProductImageAssetCsvRow[]) {
  return [
    imageAssetHeaders.join(","),
    ...rows.map((row) => imageAssetHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

function unknownSourceEvidence(): SourceEvidence {
  return {
    sourceKind: "unknown",
    sourceReference:
      "Current public asset. Original source owner and source file require confirmation.",
    sourceFile: "",
    ownershipStatus: "unknown",
  };
}

function createAssetId(sku: string, role: string, index: number) {
  return `img-${sku.toLowerCase()}-${role}-${String(index).padStart(2, "0")}`;
}

export function createInitialImageAssetRows(products: ProductImportRow[]) {
  return products.flatMap((product) => {
    const sourceEvidence = sourceEvidenceByProductSlug[product.slug] ?? unknownSourceEvidence();
    const blocked =
      product.status !== "active" ||
      product.image_status === "needs_photo" ||
      product.image_status === "placeholder";
    const imagePaths = [product.main_image, ...splitImageList(product.gallery_images)];

    return imagePaths.map((publicPath, index): ProductImageAssetCsvRow => {
      const role = index === 0 ? "main" : "gallery";
      const hasKnownSource = sourceEvidence.sourceKind !== "unknown" && role === "main";

      return {
        asset_id: createAssetId(product.sku, role, index + 1),
        sku: product.sku,
        product_slug: product.slug,
        role,
        public_path: publicPath,
        alt_text:
          role === "main"
            ? `${product.name}, ${product.category} product reference image`
            : `${product.name} product reference view ${index}`,
        source_kind: hasKnownSource ? sourceEvidence.sourceKind : "unknown",
        source_reference: hasKnownSource
          ? sourceEvidence.sourceReference
          : unknownSourceEvidence().sourceReference,
        source_file: hasKnownSource ? sourceEvidence.sourceFile : "",
        source_owner: "",
        ownership_status: hasKnownSource ? sourceEvidence.ownershipStatus : "unknown",
        usage_rights_status: "needs_confirmation",
        content_match_status: blocked ? "needs_review" : "product_family_reference",
        publication_status: blocked ? "blocked" : "legacy_reference",
        reviewed_by: hasKnownSource ? product.verified_by : "",
        reviewed_date: hasKnownSource ? product.verified_date : "",
        notes_internal: blocked
          ? "Do not publish until a dedicated exact-product image and source record are approved."
          : "Migration record for an existing public reference image. Confirm exact-product match and usage rights before upgrading publication status.",
      };
    });
  });
}

export function readImageAssetRows(filePath = imageAssetRegistryPath) {
  const content = readFileSync(filePath, "utf8");
  const parsed = parseCsv(content);
  const headers = parsed[0]?.map((header) => header.trim()) ?? [];
  const issues: ProductImageAssetIssue[] = [];

  for (const header of imageAssetHeaders) {
    if (!headers.includes(header)) {
      issues.push({ level: "error", message: `Missing CSV header: ${header}` });
    }
  }

  for (const header of headers) {
    if (!imageAssetHeaders.includes(header as (typeof imageAssetHeaders)[number])) {
      issues.push({ level: "warning", message: `Unexpected CSV header: ${header}` });
    }
  }

  const rows = parsed
    .slice(1)
    .map((cells) =>
      Object.fromEntries(
        imageAssetHeaders.map((header) => [header, cells[headers.indexOf(header)]?.trim() ?? ""]),
      ),
    ) as ProductImageAssetCsvRow[];

  return { rows, issues };
}

function readJpegDimensions(buffer: Buffer) {
  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (startOfFrameMarkers.has(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength < 2) {
      break;
    }
    offset += segmentLength + 2;
  }

  return undefined;
}

function getImageDimensions(buffer: Buffer) {
  const isPng =
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  if (isPng) {
    return {
      detectedFormat: "png" as const,
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  const isJpeg = buffer.length >= 10 && buffer[0] === 0xff && buffer[1] === 0xd8;

  if (isJpeg) {
    const dimensions = readJpegDimensions(buffer);
    return dimensions ? { detectedFormat: "jpeg" as const, ...dimensions } : undefined;
  }

  return undefined;
}

export function inspectPublicImage(publicPath: string): ImageFileInspection {
  const localPath = path.join(process.cwd(), "public", publicPath.replace(/^\/+/, ""));

  if (!existsSync(localPath)) {
    return { publicPath, exists: false };
  }

  const buffer = readFileSync(localPath);
  const dimensions = getImageDimensions(buffer);

  return {
    publicPath,
    exists: true,
    ...dimensions,
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
  };
}

function addIssue(
  issues: ProductImageAssetIssue[],
  level: ProductImageAssetIssue["level"],
  message: string,
  assetId?: string,
) {
  issues.push({ level, message, assetId });
}

function isBlockedProduct(product: ProductImportRow) {
  return (
    product.status !== "active" ||
    product.image_status === "needs_photo" ||
    product.image_status === "placeholder"
  );
}

export function validateProductImageAssets(
  options: ProductImageAssetValidationOptions = {},
): ProductImageAssetValidation {
  const issues: ProductImageAssetIssue[] = [];
  const productValidation = validateCsvFile(
    options.productInputPath ?? resolveValidationInputPath(),
  );
  issues.push(
    ...productValidation.errors.map((issue) => ({
      level: "error" as const,
      message: `Product CSV: ${issue.message}`,
    })),
  );
  const products = productValidation.rows;
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const registry = readImageAssetRows(options.registryPath ?? imageAssetRegistryPath);
  issues.push(...registry.issues);
  const rows = registry.rows;
  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();
  const inspections = new Map<string, ImageFileInspection>();

  for (const row of rows) {
    const product = productBySlug.get(row.product_slug);

    if (!row.asset_id || seenIds.has(row.asset_id)) {
      addIssue(issues, "error", "Missing or duplicate asset_id.", row.asset_id);
    }
    seenIds.add(row.asset_id);

    if (!row.public_path || seenPaths.has(row.public_path)) {
      addIssue(issues, "error", "Missing or duplicate public_path.", row.asset_id);
    }
    seenPaths.add(row.public_path);

    if (!product || product.sku !== row.sku) {
      addIssue(
        issues,
        "error",
        "Product slug or SKU does not match canonical product data.",
        row.asset_id,
      );
      continue;
    }

    if (!allowedRoles.includes(row.role as (typeof allowedRoles)[number])) {
      addIssue(issues, "error", `Invalid asset role: ${row.role}`, row.asset_id);
    }
    if (!allowedSourceKinds.includes(row.source_kind as ProductImageSourceKind)) {
      addIssue(issues, "error", `Invalid source kind: ${row.source_kind}`, row.asset_id);
    }
    if (!allowedOwnershipStatuses.includes(row.ownership_status as ProductImageOwnershipStatus)) {
      addIssue(issues, "error", `Invalid ownership status: ${row.ownership_status}`, row.asset_id);
    }
    if (
      !allowedUsageRightsStatuses.includes(row.usage_rights_status as ProductImageUsageRightsStatus)
    ) {
      addIssue(
        issues,
        "error",
        `Invalid usage-rights status: ${row.usage_rights_status}`,
        row.asset_id,
      );
    }
    if (
      !allowedContentMatchStatuses.includes(
        row.content_match_status as ProductImageContentMatchStatus,
      )
    ) {
      addIssue(
        issues,
        "error",
        `Invalid content-match status: ${row.content_match_status}`,
        row.asset_id,
      );
    }
    if (
      !allowedPublicationStatuses.includes(row.publication_status as ProductImagePublicationStatus)
    ) {
      addIssue(
        issues,
        "error",
        `Invalid publication status: ${row.publication_status}`,
        row.asset_id,
      );
    }

    if (!row.public_path.startsWith("/images/products/")) {
      addIssue(issues, "error", "public_path must begin with /images/products/.", row.asset_id);
    }
    if (!row.alt_text || row.alt_text.length > 160) {
      addIssue(
        issues,
        "error",
        "alt_text is required and must not exceed 160 characters.",
        row.asset_id,
      );
    }
    if (!row.source_reference) {
      addIssue(
        issues,
        "error",
        "source_reference is required even when the source is unknown.",
        row.asset_id,
      );
    }
    if (row.reviewed_date && !isoDatePattern.test(row.reviewed_date)) {
      addIssue(issues, "error", "reviewed_date must use YYYY-MM-DD.", row.asset_id);
    }
    if (Boolean(row.reviewed_by) !== Boolean(row.reviewed_date)) {
      addIssue(
        issues,
        "error",
        "Reviewer and review date must be recorded together.",
        row.asset_id,
      );
    }

    if (row.source_kind === "company_owned_photo" && row.ownership_status !== "company_owned") {
      addIssue(
        issues,
        "error",
        "Company-owned source requires company_owned ownership status.",
        row.asset_id,
      );
    }

    if (
      row.usage_rights_status === "approved" &&
      (!row.source_owner || !row.source_file || !row.reviewed_by || !row.reviewed_date)
    ) {
      addIssue(
        issues,
        "error",
        "Approved usage rights require source owner, original source file, reviewer and review date.",
        row.asset_id,
      );
    }

    if (row.content_match_status === "exact_product" && (!row.reviewed_by || !row.reviewed_date)) {
      addIssue(
        issues,
        "error",
        "Exact-product match requires reviewer and review date.",
        row.asset_id,
      );
    }

    if (row.publication_status === "search_eligible") {
      if (
        row.usage_rights_status !== "approved" ||
        row.ownership_status === "unknown" ||
        row.source_kind === "unknown" ||
        !row.source_owner ||
        !row.source_file ||
        row.content_match_status !== "exact_product" ||
        !row.reviewed_by ||
        !row.reviewed_date
      ) {
        addIssue(
          issues,
          "error",
          "Search-eligible asset requires approved rights, known ownership/source, exact-product match and review evidence.",
          row.asset_id,
        );
      }
    }

    if (
      row.usage_rights_status === "restricted" &&
      row.publication_status !== "blocked" &&
      row.publication_status !== "display_only"
    ) {
      addIssue(
        issues,
        "error",
        "Restricted asset cannot be a search or legacy reference.",
        row.asset_id,
      );
    }

    if (
      (row.content_match_status === "needs_review" || row.content_match_status === "rejected") &&
      row.publication_status !== "blocked"
    ) {
      addIssue(
        issues,
        "error",
        "Unreviewed or rejected content must remain blocked.",
        row.asset_id,
      );
    }

    if (isBlockedProduct(product) && row.publication_status !== "blocked") {
      addIssue(
        issues,
        "error",
        "Draft or needs-photo product asset must remain blocked.",
        row.asset_id,
      );
    }

    if (
      !isBlockedProduct(product) &&
      row.role === "main" &&
      row.publication_status !== "search_eligible" &&
      row.publication_status !== "legacy_reference"
    ) {
      addIssue(
        issues,
        "error",
        "Active product main image must be search eligible or an explicitly retained legacy reference.",
        row.asset_id,
      );
    }

    const inspection = inspectPublicImage(row.public_path);
    inspections.set(row.public_path, inspection);
    if (!inspection.exists && row.publication_status !== "blocked") {
      addIssue(issues, "error", "Published image asset file does not exist.", row.asset_id);
    } else if (!inspection.exists) {
      addIssue(issues, "warning", "Blocked image asset file does not exist.", row.asset_id);
    }

    const extension = path.extname(row.public_path).toLowerCase();
    const extensionFormat =
      extension === ".png" ? "png" : [".jpg", ".jpeg"].includes(extension) ? "jpeg" : undefined;
    if (
      inspection.exists &&
      inspection.detectedFormat &&
      extensionFormat &&
      inspection.detectedFormat !== extensionFormat
    ) {
      addIssue(
        issues,
        "warning",
        `File extension ${extension} does not match detected ${inspection.detectedFormat.toUpperCase()} content. Re-export or rename the asset through the reviewed image workflow.`,
        row.asset_id,
      );
    }
  }

  const expectedAssets = products.flatMap((product) => [
    { product, role: "main", publicPath: product.main_image },
    ...splitImageList(product.gallery_images).map((publicPath) => ({
      product,
      role: "gallery",
      publicPath,
    })),
  ]);

  for (const expected of expectedAssets) {
    const row = rows.find((candidate) => candidate.public_path === expected.publicPath);
    if (!row) {
      addIssue(
        issues,
        "error",
        `Product image path is missing from the asset registry: ${expected.publicPath}`,
      );
      continue;
    }

    if (
      row.product_slug !== expected.product.slug ||
      row.sku !== expected.product.sku ||
      row.role !== expected.role
    ) {
      addIssue(
        issues,
        "error",
        "Registry assignment does not match the product image field.",
        row.asset_id,
      );
    }
  }

  for (const row of rows) {
    if (!expectedAssets.some((expected) => expected.publicPath === row.public_path)) {
      addIssue(
        issues,
        "error",
        "Registry row is not referenced by canonical product data.",
        row.asset_id,
      );
    }
  }

  const legacyRightsRows = rows.filter(
    (row) =>
      row.publication_status === "legacy_reference" && row.usage_rights_status !== "approved",
  );
  if (legacyRightsRows.length > 0) {
    addIssue(
      issues,
      "warning",
      `${legacyRightsRows.length} legacy public reference assets still need explicit usage-rights confirmation.`,
    );
  }

  const rowsByHash = new Map<string, ProductImageAssetCsvRow[]>();
  for (const row of rows) {
    const sha256 = inspections.get(row.public_path)?.sha256;
    if (!sha256) continue;

    const group = rowsByHash.get(sha256) ?? [];
    group.push(row);
    rowsByHash.set(sha256, group);
  }

  const duplicateHashGroups = Array.from(rowsByHash.values()).filter((group) => group.length > 1);
  if (duplicateHashGroups.length > 0) {
    addIssue(
      issues,
      "warning",
      `${duplicateHashGroups.length} groups reuse identical image content and require variant-specific replacements over time.`,
    );
  }

  return {
    rows,
    products,
    inspections,
    errors: issues.filter((issue) => issue.level === "error"),
    warnings: issues.filter((issue) => issue.level === "warning"),
  };
}

function optional(value: string) {
  return value || undefined;
}

export function toProductImageAsset(row: ProductImageAssetCsvRow): ProductImageAsset {
  return {
    assetId: row.asset_id,
    sku: row.sku,
    productSlug: row.product_slug,
    role: row.role as ProductImageAsset["role"],
    publicPath: row.public_path,
    altText: row.alt_text,
    sourceKind: row.source_kind as ProductImageSourceKind,
    sourceReference: row.source_reference,
    sourceFile: optional(row.source_file),
    sourceOwner: optional(row.source_owner),
    ownershipStatus: row.ownership_status as ProductImageOwnershipStatus,
    usageRightsStatus: row.usage_rights_status as ProductImageUsageRightsStatus,
    contentMatchStatus: row.content_match_status as ProductImageContentMatchStatus,
    publicationStatus: row.publication_status as ProductImagePublicationStatus,
    reviewedBy: optional(row.reviewed_by),
    reviewedDate: optional(row.reviewed_date),
    notesInternal: optional(row.notes_internal),
  };
}

export async function renderProductImageAssetData(rows: ProductImageAssetCsvRow[]) {
  const data = rows.map(toProductImageAsset);
  const source = [
    'import type { ProductImageAsset } from "../content/schemas";',
    "",
    "// Generated from data/assets/product-image-assets.csv. Do not edit manually.",
    `export const productImageAssets: ProductImageAsset[] = ${JSON.stringify(data, null, 2)};`,
    "",
  ].join("\n");

  return format(source, { parser: "typescript", printWidth: 100 });
}

export function printProductImageAssetIssues(title: string, issues: ProductImageAssetIssue[]) {
  if (issues.length === 0) {
    console.log(`${title}: none`);
    return;
  }

  console.log(`${title}:`);
  for (const issue of issues) {
    console.log(`- ${issue.assetId ? `${issue.assetId}: ` : ""}${issue.message}`);
  }
}
