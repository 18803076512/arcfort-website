#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { validateProductImageAssets } from "./product-image-asset-utils.ts";
import type { ProductImportRow } from "./product-import-utils.ts";

const outputPath = path.join(process.cwd(), "docs", "product-image-tasks.csv");
const coreImageCategories = new Set([
  "mig-mag-torch-parts",
  "tig-torch-parts",
  "plasma-cutting-consumables",
]);
const priorityOrder = new Map([
  ["P0", 0],
  ["P1", 1],
  ["P2", 2],
  ["P3", 3],
]);

type ImageValidation = ReturnType<typeof validateProductImageAssets>;
type ImageAssetRow = ImageValidation["rows"][number];
type ImageInspection = ImageValidation["inspections"] extends Map<string, infer T> ? T : never;

function csvEscape(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function getPriority(product: ProductImportRow, asset: ImageAssetRow) {
  if (product.status === "active" && asset.role === "main" && asset.source_kind === "unknown") {
    return "P0";
  }

  if (
    coreImageCategories.has(product.category_slug) &&
    (asset.role === "main" || asset.publication_status === "blocked")
  ) {
    return "P1";
  }

  if (product.status === "active" || asset.role === "main") {
    return "P2";
  }

  return "P3";
}

function getRequiredActions(asset: ImageAssetRow, inspection: ImageInspection | undefined) {
  const actions: string[] = [];

  if (asset.publication_status === "blocked") {
    actions.push("Capture and approve a dedicated exact-product image before publication");
  }
  if (asset.source_kind === "unknown" || asset.ownership_status === "unknown") {
    actions.push("Identify the original source and owner or replace the asset");
  }
  if (asset.usage_rights_status !== "approved") {
    actions.push("Record the permitted website-usage basis");
  }
  if (asset.content_match_status !== "exact_product") {
    actions.push("Match the image to the exact physical SKU using a label, sample or drawing");
  }
  if (!asset.source_file) {
    actions.push("Record the original source file");
  }
  if (!asset.reviewed_by || !asset.reviewed_date) {
    actions.push("Record the reviewer and ISO review date after evidence review");
  }
  if (
    inspection?.exists &&
    inspection.width &&
    inspection.height &&
    (inspection.width < 1000 || inspection.height < 1000)
  ) {
    actions.push(
      `Replace the low-resolution ${inspection.width} x ${inspection.height} source with a sharper exact-product view`,
    );
  }
  const extension = path.extname(asset.public_path).toLowerCase();
  const extensionFormat =
    extension === ".png" ? "png" : [".jpg", ".jpeg"].includes(extension) ? "jpeg" : undefined;
  if (
    inspection?.detectedFormat &&
    extensionFormat &&
    inspection.detectedFormat !== extensionFormat
  ) {
    actions.push(
      `Re-export or rename the asset so the ${extension} extension matches its ${inspection.detectedFormat.toUpperCase()} content`,
    );
  }

  return actions;
}

function getTaskType(asset: ImageAssetRow) {
  if (asset.publication_status === "blocked") return "capture_and_approve";
  if (asset.source_kind === "unknown" || asset.ownership_status === "unknown") {
    return "provenance_review";
  }
  if (asset.content_match_status !== "exact_product") return "exact_product_replacement";
  if (asset.usage_rights_status !== "approved") return "rights_review";
  return "evidence_review";
}

function getCaptureGuidance(product: ProductImportRow, role: string) {
  const name = product.name.toLowerCase();

  if (role === "packaging") {
    return "Photograph the actual packing and label without unsupported certification or quantity claims.";
  }
  if (role === "dimension") {
    return "Use a controlled drawing or photograph the exact SKU square to a calibrated measuring reference.";
  }
  if (role === "technical") {
    return "Capture the genuine connection, thread, opening or surface detail without changing product geometry.";
  }
  if (name.includes("liner") || name.includes("cable")) {
    return "Show the complete product arrangement plus clear end or connector details.";
  }
  if (name.includes("connector") || name.includes("holder") || name.includes("clamp")) {
    return "Show the complete product at a three-quarter angle plus the genuine contact or connection area.";
  }
  if (
    name.includes("nozzle") ||
    name.includes("electrode") ||
    name.includes("tip") ||
    name.includes("cup") ||
    name.includes("collet") ||
    name.includes("gas lens")
  ) {
    return "Show the complete product, side profile and opening or thread detail for the same physical SKU.";
  }

  return "Show the exact product on a clean neutral background with complete geometry visible and in focus.";
}

const validation = validateProductImageAssets();

if (validation.errors.length > 0) {
  console.error("Product image task generation stopped because the asset registry has errors.");
  for (const issue of validation.errors) {
    console.error(`- ${issue.assetId ? `${issue.assetId}: ` : ""}${issue.message}`);
  }
  process.exit(1);
}

const productBySlug = new Map(validation.products.map((product) => [product.slug, product]));
const tasks = validation.rows
  .map((asset) => {
    const product = productBySlug.get(asset.product_slug);
    if (!product) return null;

    const inspection = validation.inspections.get(asset.public_path);
    const requiredActions = getRequiredActions(asset, inspection);
    if (requiredActions.length === 0) return null;

    return {
      assetId: asset.asset_id,
      sku: product.sku,
      product: product.name,
      category: product.category,
      role: asset.role,
      publicPath: asset.public_path,
      priority: getPriority(product, asset),
      taskType: getTaskType(asset),
      productStatus: product.status,
      publicationStatus: asset.publication_status,
      sourceKind: asset.source_kind,
      sourceReference: asset.source_reference,
      sourceOwner: asset.source_owner,
      usageRightsStatus: asset.usage_rights_status,
      contentMatchStatus: asset.content_match_status,
      dimensions:
        inspection?.width && inspection.height
          ? `${inspection.width} x ${inspection.height}`
          : "Not available",
      requiredActions: requiredActions.join("; "),
      captureGuidance: getCaptureGuidance(product, asset.role),
      approvalRequirements:
        "Record source owner, original file, usage basis, exact-SKU evidence, reviewer and ISO review date. Do not alter threads, holes, dimensions, connections or product shape.",
    };
  })
  .filter((task): task is NonNullable<typeof task> => Boolean(task))
  .sort(
    (left, right) =>
      (priorityOrder.get(left.priority) ?? 99) - (priorityOrder.get(right.priority) ?? 99) ||
      left.category.localeCompare(right.category) ||
      left.sku.localeCompare(right.sku) ||
      left.role.localeCompare(right.role),
  );

const headers = [
  "asset_id",
  "sku",
  "product",
  "category",
  "role",
  "public_path",
  "priority",
  "task_type",
  "product_status",
  "publication_status",
  "source_kind",
  "source_reference",
  "source_owner",
  "usage_rights_status",
  "content_match_status",
  "dimensions",
  "required_actions",
  "capture_guidance",
  "approval_requirements",
];
const lines = [
  headers.join(","),
  ...tasks.map((task) =>
    [
      task.assetId,
      task.sku,
      task.product,
      task.category,
      task.role,
      task.publicPath,
      task.priority,
      task.taskType,
      task.productStatus,
      task.publicationStatus,
      task.sourceKind,
      task.sourceReference,
      task.sourceOwner,
      task.usageRightsStatus,
      task.contentMatchStatus,
      task.dimensions,
      task.requiredActions,
      task.captureGuidance,
      task.approvalRequirements,
    ]
      .map(csvEscape)
      .join(","),
  ),
];

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${lines.join("\n")}\n`);

const priorityCounts = ["P0", "P1", "P2", "P3"].map(
  (priority) => `${priority}=${tasks.filter((task) => task.priority === priority).length}`,
);

console.log(`Product image evidence tasks written to ${path.relative(process.cwd(), outputPath)}`);
console.log(`Assets requiring action: ${tasks.length} of ${validation.rows.length}`);
console.log(`Priority queue: ${priorityCounts.join(", ")}`);
console.log(
  "No asset status was changed. Evidence must be reviewed in data/assets/product-image-assets.csv before publication status can be upgraded.",
);
