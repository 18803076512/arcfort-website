import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { resolveValidationInputPath, validateCsvFile, type ProductImportRow } from "./product-import-utils.ts";

type CsvValue = string | number | null | undefined;

const outputDir = path.resolve("public/downloads");
const productListPath = path.join(outputDir, "arcfort-public-product-list.csv");
const rfqTemplatePath = path.join(outputDir, "arcfort-rfq-template.csv");

const productListHeaders = [
  "sku",
  "name",
  "category",
  "product_url",
  "short_description",
  "material",
  "size",
  "thread",
  "compatible_model",
  "package",
  "moq",
  "lead_time",
  "application",
  "quotation_note",
] as const;

const rfqTemplateRows = [
  [
    "product_name",
    "sku_or_reference",
    "category",
    "model_or_size",
    "material",
    "quantity",
    "packaging_requirement",
    "oem_logo_or_private_label",
    "destination_country",
    "target_port",
    "attachments_available",
    "notes",
  ],
  [
    "MIG Contact Tip M6 1.0mm",
    "AF-MIG-CT-0005 or your reference part",
    "MIG/MAG Torch Parts",
    "M6 1.0mm",
    "Available upon request",
    "500 pcs",
    "Standard export packing or customized packaging",
    "Logo / label / carton design if required",
    "United States",
    "Buyer destination port",
    "Drawing / sample photo / product list",
    "Please confirm material grade, package, MOQ and lead time.",
  ],
] satisfies CsvValue[][];

function escapeCsvValue(value: CsvValue) {
  const text = String(value ?? "");

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function serializeCsv(rows: CsvValue[][]) {
  return `${rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n")}\n`;
}

function productUrl(row: ProductImportRow) {
  return `https://www.arcfortweld.com/products/${row.category_slug}/${row.slug}`;
}

function publicProductRow(row: ProductImportRow) {
  return productListHeaders.map((header) => {
    if (header === "product_url") {
      return productUrl(row);
    }

    if (header === "quotation_note") {
      return "Final quotation depends on confirmed model, quantity, packaging and destination.";
    }

    return row[header];
  });
}

function generateDownloadAssets(inputPath?: string) {
  const csvPath = resolveValidationInputPath(inputPath);
  const result = validateCsvFile(csvPath);

  if (result.errors.length > 0) {
    console.error("Cannot generate public download assets because product CSV has errors.");
    for (const error of result.errors) {
      const rowText = error.rowNumber ? `Row ${error.rowNumber}: ` : "";
      const fieldText = error.field ? `[${error.field}] ` : "";
      console.error(`- ${rowText}${fieldText}${error.message}`);
    }
    process.exit(1);
  }

  const activeRows = result.rows.filter((row) => row.status === "active");
  const productRows = [[...productListHeaders], ...activeRows.map(publicProductRow)];

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(productListPath, serializeCsv(productRows), "utf8");
  writeFileSync(rfqTemplatePath, serializeCsv(rfqTemplateRows), "utf8");

  console.log(`Generated public product list: ${productListPath}`);
  console.log(`Generated RFQ template: ${rfqTemplatePath}`);
  console.log(`Products exported: ${activeRows.length}`);

  if (result.warnings.length > 0) {
    console.log("\nWarnings are allowed for download generation:");
    for (const warning of result.warnings) {
      const rowText = warning.rowNumber ? `Row ${warning.rowNumber}: ` : "";
      const fieldText = warning.field ? `[${warning.field}] ` : "";
      console.log(`- ${rowText}${fieldText}${warning.message}`);
    }
  }
}

generateDownloadAssets(process.argv[2]);
