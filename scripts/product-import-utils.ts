import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const productCsvHeaders = [
  "sku",
  "name",
  "category",
  "category_slug",
  "slug",
  "short_description",
  "description",
  "main_image",
  "gallery_images",
  "material",
  "size",
  "thread",
  "compatible_brand",
  "compatible_model",
  "oem_number",
  "weight",
  "surface_treatment",
  "package",
  "moq",
  "lead_time",
  "application",
  "custom_available",
  "sample_available",
  "pdf_url",
  "meta_title",
  "meta_description",
  "status",
  "data_status",
  "source_type",
  "source_reference",
  "verified_by",
  "verified_date",
  "image_status",
  "compatibility_status",
  "oem_status",
  "notes_internal",
] as const;

export type ProductCsvHeader = (typeof productCsvHeaders)[number];
export type ProductImportRow = Record<ProductCsvHeader, string>;
export type IssueLevel = "error" | "warning";

export type ValidationIssue = {
  level: IssueLevel;
  rowNumber?: number;
  field?: ProductCsvHeader | "headers" | "file" | "import";
  message: string;
};

export type ValidationResult = {
  rows: ProductImportRow[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

const requiredFields: ProductCsvHeader[] = [
  "sku",
  "name",
  "category",
  "category_slug",
  "slug",
  "short_description",
  "description",
  "main_image",
  "material",
  "package",
  "moq",
  "lead_time",
  "meta_title",
  "meta_description",
  "status",
  "data_status",
  "image_status",
  "compatibility_status",
  "oem_status",
];

const allowedCategoryCodes = ["MIG", "TIG", "PLA", "CON", "MAC", "ACC"] as const;
const allowedStatuses = ["active", "draft", "archived"] as const;
const allowedDataStatuses = ["confirmed", "pending", "needs_review"] as const;
const allowedSourceTypes = [
  "factory",
  "supplier_catalog",
  "official_catalog",
  "customer_sample",
  "unknown",
] as const;
const allowedImageStatuses = ["own_photo", "supplier_photo", "placeholder", "needs_photo"] as const;
const allowedCompatibilityStatuses = ["confirmed", "reference_only", "unverified"] as const;
const allowedOemStatuses = ["confirmed", "unknown", "not_applicable"] as const;

const categorySlugByCategory: Record<string, string> = {
  "mig torch parts": "mig-mag-torch-parts",
  "mig/mag torch parts": "mig-mag-torch-parts",
  "tig torch parts": "tig-torch-parts",
  "plasma cutting parts": "plasma-cutting-consumables",
  "plasma cutting consumables": "plasma-cutting-consumables",
  "welding consumables": "welding-consumables",
  "welding machines": "welding-machines",
  "welding accessories": "welding-accessories",
};

const categoryBySlug: Record<string, string> = {
  "mig-mag-torch-parts": "MIG/MAG Torch Parts",
  "tig-torch-parts": "TIG Torch Parts",
  "plasma-cutting-consumables": "Plasma Cutting Consumables",
  "welding-consumables": "Welding Consumables",
  "welding-machines": "Welding Machines",
  "welding-accessories": "Welding Accessories",
};

const categoryCodeBySlug: Record<string, (typeof allowedCategoryCodes)[number]> = {
  "mig-mag-torch-parts": "MIG",
  "tig-torch-parts": "TIG",
  "plasma-cutting-consumables": "PLA",
  "welding-consumables": "CON",
  "welding-machines": "MAC",
  "welding-accessories": "ACC",
};

export const canonicalCategorySlugs = [
  "mig-mag-torch-parts",
  "tig-torch-parts",
  "plasma-cutting-consumables",
  "welding-consumables",
  "welding-machines",
  "welding-accessories",
] as const;

const categorySlugAliases: Record<string, string> = {
  "mig-torch-parts": "mig-mag-torch-parts",
  "mig-mag-torch-parts": "mig-mag-torch-parts",
  "plasma-cutting-parts": "plasma-cutting-consumables",
};

const skuPattern = new RegExp(`^AF-(${allowedCategoryCodes.join("|")})-[A-Z0-9]+-\\d{4}$`);
const unknownValue = "unknown";
const reviewValue = "needs_review";
const requestValue = "Available upon request";
const contactValue = "Contact us for details";
const tbdValue = "TBD";

function createEmptyRow(): ProductImportRow {
  return Object.fromEntries(productCsvHeaders.map((header) => [header, ""])) as ProductImportRow;
}

function createIssue(
  level: IssueLevel,
  message: string,
  rowNumber?: number,
  field?: ValidationIssue["field"],
): ValidationIssue {
  return { level, message, rowNumber, field };
}

function isAllowedValue(value: string, allowedValues: readonly string[]) {
  return allowedValues.includes(value);
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function publicImagePathExists(imagePath: string) {
  if (!imagePath.startsWith("/images/products/")) {
    return false;
  }

  return existsSync(path.join(process.cwd(), "public", imagePath));
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCategorySlug(value: string) {
  const normalizedValue = slugify(value);

  return categorySlugAliases[normalizedValue] ?? normalizedValue;
}

export function splitImageList(value: string) {
  return value
    .split(",")
    .map((imagePath) => imagePath.trim())
    .filter(Boolean);
}

export function parseCsv(content: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

export function readCsvFile(filePath: string) {
  const content = readFileSync(filePath, "utf8");
  const parsedRows = parseCsv(content);
  const headers = parsedRows[0]?.map((header) => header.trim()) ?? [];
  const dataRows = parsedRows.slice(1);

  return { headers, dataRows };
}

export function rowsFromCsv(filePath: string) {
  const { headers, dataRows } = readCsvFile(filePath);
  const issues: ValidationIssue[] = [];

  for (const expectedHeader of productCsvHeaders) {
    if (!headers.includes(expectedHeader)) {
      issues.push(createIssue("error", `Missing required CSV header: ${expectedHeader}`, 1, "headers"));
    }
  }

  for (const header of headers) {
    if (!productCsvHeaders.includes(header as ProductCsvHeader)) {
      issues.push(createIssue("warning", `Unknown CSV header will be ignored: ${header}`, 1, "headers"));
    }
  }

  const rows = dataRows.map((cells) => {
    const row = createEmptyRow();

    for (const [index, header] of headers.entries()) {
      if (productCsvHeaders.includes(header as ProductCsvHeader)) {
        row[header as ProductCsvHeader] = cells[index]?.trim() ?? "";
      }
    }

    return row;
  });

  return { rows, issues };
}

export function prepareRow(row: ProductImportRow, rowNumber: number) {
  const preparedRow = { ...row };
  const warnings: ValidationIssue[] = [];
  const generatedIndex = String(rowNumber - 1).padStart(4, "0");

  if (!preparedRow.category_slug && preparedRow.category) {
    const generatedCategorySlug = categorySlugByCategory[preparedRow.category.trim().toLowerCase()];

    if (generatedCategorySlug) {
      preparedRow.category_slug = generatedCategorySlug;
      warnings.push(
        createIssue(
          "warning",
          `Generated category_slug: ${preparedRow.category_slug}`,
          rowNumber,
          "category_slug",
        ),
      );
    }
  }

  if (preparedRow.category_slug) {
    const normalizedCategorySlug = normalizeCategorySlug(preparedRow.category_slug);

    if (normalizedCategorySlug !== preparedRow.category_slug) {
      warnings.push(
        createIssue(
          "warning",
          `Normalized category_slug from ${preparedRow.category_slug} to ${normalizedCategorySlug}`,
          rowNumber,
          "category_slug",
        ),
      );
      preparedRow.category_slug = normalizedCategorySlug;
    }
  }

  if (!preparedRow.category && preparedRow.category_slug) {
    preparedRow.category = categoryBySlug[preparedRow.category_slug] ?? "Welding Accessories";
    warnings.push(createIssue("warning", `Generated category: ${preparedRow.category}`, rowNumber, "category"));
  }

  if (!preparedRow.category_slug) {
    preparedRow.category_slug = "welding-accessories";
    warnings.push(
      createIssue(
        "warning",
        "Generated fallback category_slug: welding-accessories",
        rowNumber,
        "category_slug",
      ),
    );
  }

  if (!preparedRow.category) {
    preparedRow.category = categoryBySlug[preparedRow.category_slug] ?? "Welding Accessories";
    warnings.push(createIssue("warning", `Generated category: ${preparedRow.category}`, rowNumber, "category"));
  }

  if (!preparedRow.name) {
    preparedRow.name = `Product ${generatedIndex}`;
    warnings.push(createIssue("warning", `Generated placeholder name: ${preparedRow.name}`, rowNumber, "name"));
  }

  if (!preparedRow.slug && preparedRow.name) {
    preparedRow.slug = slugify(preparedRow.name);
    warnings.push(createIssue("warning", `Generated slug: ${preparedRow.slug}`, rowNumber, "slug"));
  }

  if (!preparedRow.slug) {
    preparedRow.slug = `product-${generatedIndex}`;
    warnings.push(createIssue("warning", `Generated fallback slug: ${preparedRow.slug}`, rowNumber, "slug"));
  }

  if (!preparedRow.sku) {
    const categoryCode = categoryCodeBySlug[preparedRow.category_slug] ?? "ACC";
    preparedRow.sku = `AF-${categoryCode}-AUTO-${generatedIndex}`;
    warnings.push(createIssue("warning", `Generated review SKU: ${preparedRow.sku}`, rowNumber, "sku"));
  }

  if (!preparedRow.main_image && preparedRow.slug) {
    preparedRow.main_image = `/images/products/${preparedRow.slug}.jpg`;
    warnings.push(
      createIssue("warning", `Generated main_image: ${preparedRow.main_image}`, rowNumber, "main_image"),
    );
  }

  if (!preparedRow.short_description && preparedRow.name) {
    preparedRow.short_description = `${preparedRow.name} for industrial welding and cutting RFQ programs.`;
    warnings.push(createIssue("warning", "Generated short_description", rowNumber, "short_description"));
  }

  if (!preparedRow.description && preparedRow.name) {
    preparedRow.description = `${preparedRow.name} is prepared for industrial welding and cutting sourcing. Product details should be confirmed by buyer product list, drawing, sample, photo or model reference before quotation.`;
    warnings.push(createIssue("warning", "Generated review description", rowNumber, "description"));
  }

  if (!preparedRow.material) {
    preparedRow.material = requestValue;
    warnings.push(createIssue("warning", `Generated material placeholder: ${requestValue}`, rowNumber, "material"));
  }

  if (!preparedRow.size) {
    preparedRow.size = requestValue;
    warnings.push(createIssue("warning", `Generated size placeholder: ${requestValue}`, rowNumber, "size"));
  }

  if (!preparedRow.thread) {
    preparedRow.thread = requestValue;
    warnings.push(createIssue("warning", `Generated thread placeholder: ${requestValue}`, rowNumber, "thread"));
  }

  if (!preparedRow.compatible_brand) {
    preparedRow.compatible_brand = contactValue;
    warnings.push(
      createIssue(
        "warning",
        `Generated compatible_brand placeholder: ${contactValue}`,
        rowNumber,
        "compatible_brand",
      ),
    );
  }

  if (!preparedRow.compatible_model) {
    preparedRow.compatible_model = contactValue;
    warnings.push(
      createIssue(
        "warning",
        `Generated compatible_model placeholder: ${contactValue}`,
        rowNumber,
        "compatible_model",
      ),
    );
  }

  if (!preparedRow.oem_number) {
    preparedRow.oem_number = tbdValue;
    warnings.push(createIssue("warning", `Generated oem_number placeholder: ${tbdValue}`, rowNumber, "oem_number"));
  }

  if (!preparedRow.package) {
    preparedRow.package = requestValue;
    warnings.push(createIssue("warning", `Generated package placeholder: ${requestValue}`, rowNumber, "package"));
  }

  if (!preparedRow.moq) {
    preparedRow.moq = contactValue;
    warnings.push(createIssue("warning", `Generated moq placeholder: ${contactValue}`, rowNumber, "moq"));
  }

  if (!preparedRow.lead_time) {
    preparedRow.lead_time = requestValue;
    warnings.push(createIssue("warning", `Generated lead_time placeholder: ${requestValue}`, rowNumber, "lead_time"));
  }

  if (!preparedRow.application) {
    preparedRow.application = "Industrial welding and cutting supply";
    warnings.push(createIssue("warning", "Generated application placeholder", rowNumber, "application"));
  }

  if (!preparedRow.meta_title && preparedRow.name) {
    preparedRow.meta_title = `${preparedRow.name} | ArcFort Weld`;
    warnings.push(createIssue("warning", "Generated meta_title", rowNumber, "meta_title"));
  }

  if (!preparedRow.meta_description && preparedRow.name) {
    preparedRow.meta_description = `Request quotation for ${preparedRow.name} from ArcFort Weld. Send drawings samples quantities and packaging requirements for review.`;
    warnings.push(createIssue("warning", "Generated meta_description", rowNumber, "meta_description"));
  }

  if (!preparedRow.status) {
    preparedRow.status = "draft";
    warnings.push(createIssue("warning", "Generated safe default status: draft", rowNumber, "status"));
  }

  if (!preparedRow.data_status) {
    preparedRow.data_status = reviewValue;
    warnings.push(createIssue("warning", `Generated data_status: ${reviewValue}`, rowNumber, "data_status"));
  }

  if (!preparedRow.source_type) {
    preparedRow.source_type = unknownValue;
    warnings.push(createIssue("warning", `Generated source_type: ${unknownValue}`, rowNumber, "source_type"));
  }

  if (!preparedRow.image_status) {
    preparedRow.image_status = "placeholder";
    warnings.push(createIssue("warning", "Generated image_status: placeholder", rowNumber, "image_status"));
  }

  if (!preparedRow.compatibility_status) {
    preparedRow.compatibility_status = "unverified";
    warnings.push(
      createIssue("warning", "Generated compatibility_status: unverified", rowNumber, "compatibility_status"),
    );
  }

  if (!preparedRow.oem_status) {
    preparedRow.oem_status = unknownValue;
    warnings.push(createIssue("warning", `Generated oem_status: ${unknownValue}`, rowNumber, "oem_status"));
  }

  return { preparedRow, warnings };
}

export function validateProductRows(rows: ProductImportRow[], initialIssues: ValidationIssue[] = []) {
  const errors: ValidationIssue[] = initialIssues.filter((issue) => issue.level === "error");
  const warnings: ValidationIssue[] = initialIssues.filter((issue) => issue.level === "warning");
  const preparedRows: ProductImportRow[] = [];
  const seenSkus = new Map<string, number>();
  const seenSlugs = new Map<string, number>();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const { preparedRow, warnings: generatedWarnings } = prepareRow(row, rowNumber);
    preparedRows.push(preparedRow);
    warnings.push(...generatedWarnings);

    for (const field of requiredFields) {
      if (!preparedRow[field]) {
        errors.push(createIssue("error", `${field} is required.`, rowNumber, field));
      }
    }

    if (preparedRow.sku && !skuPattern.test(preparedRow.sku)) {
      errors.push(
        createIssue(
          "error",
          `SKU must match AF-[CATEGORY]-[TYPE]-[0000]. Allowed categories: ${allowedCategoryCodes.join(", ")}`,
          rowNumber,
          "sku",
        ),
      );
    }

    if (preparedRow.sku) {
      const duplicateRow = seenSkus.get(preparedRow.sku);

      if (duplicateRow) {
        errors.push(createIssue("error", `Duplicate SKU also used on row ${duplicateRow}.`, rowNumber, "sku"));
      } else {
        seenSkus.set(preparedRow.sku, rowNumber);
      }
    }

    if (preparedRow.slug) {
      const duplicateRow = seenSlugs.get(preparedRow.slug);

      if (duplicateRow) {
        errors.push(createIssue("error", `Duplicate slug also used on row ${duplicateRow}.`, rowNumber, "slug"));
      } else {
        seenSlugs.set(preparedRow.slug, rowNumber);
      }
    }

    if (
      preparedRow.category_slug &&
      !canonicalCategorySlugs.includes(preparedRow.category_slug as (typeof canonicalCategorySlugs)[number])
    ) {
      errors.push(
        createIssue(
          "error",
          `category_slug must be one of: ${canonicalCategorySlugs.join(", ")}`,
          rowNumber,
          "category_slug",
        ),
      );
    }

    if (preparedRow.status && !isAllowedValue(preparedRow.status, allowedStatuses)) {
      errors.push(createIssue("error", `Invalid status: ${preparedRow.status}`, rowNumber, "status"));
    }

    if (preparedRow.data_status && !isAllowedValue(preparedRow.data_status, allowedDataStatuses)) {
      errors.push(
        createIssue("error", `Invalid data_status: ${preparedRow.data_status}`, rowNumber, "data_status"),
      );
    }

    if (preparedRow.source_type && !isAllowedValue(preparedRow.source_type, allowedSourceTypes)) {
      errors.push(
        createIssue("error", `Invalid source_type: ${preparedRow.source_type}`, rowNumber, "source_type"),
      );
    }

    if (preparedRow.image_status && !isAllowedValue(preparedRow.image_status, allowedImageStatuses)) {
      errors.push(
        createIssue("error", `Invalid image_status: ${preparedRow.image_status}`, rowNumber, "image_status"),
      );
    }

    if (
      preparedRow.compatibility_status &&
      !isAllowedValue(preparedRow.compatibility_status, allowedCompatibilityStatuses)
    ) {
      errors.push(
        createIssue(
          "error",
          `Invalid compatibility_status: ${preparedRow.compatibility_status}`,
          rowNumber,
          "compatibility_status",
        ),
      );
    }

    if (preparedRow.oem_status && !isAllowedValue(preparedRow.oem_status, allowedOemStatuses)) {
      errors.push(createIssue("error", `Invalid oem_status: ${preparedRow.oem_status}`, rowNumber, "oem_status"));
    }

    if (preparedRow.description && countWords(preparedRow.description) < 80) {
      warnings.push(
        createIssue(
          "warning",
          "Description has fewer than 80 English words. Consider adding buyer-focused details.",
          rowNumber,
          "description",
        ),
      );
    }

    if (preparedRow.meta_title.length > 60) {
      warnings.push(createIssue("warning", "meta_title is longer than 60 characters.", rowNumber, "meta_title"));
    }

    if (preparedRow.meta_description.length > 160) {
      warnings.push(
        createIssue("warning", "meta_description is longer than 160 characters.", rowNumber, "meta_description"),
      );
    }

    if (preparedRow.main_image && !preparedRow.main_image.startsWith("/images/products/")) {
      errors.push(
        createIssue("error", "main_image must start with /images/products/", rowNumber, "main_image"),
      );
    }

    if (preparedRow.main_image && preparedRow.main_image.startsWith("/images/products/")) {
      if (!publicImagePathExists(preparedRow.main_image)) {
        warnings.push(createIssue("warning", `Image file missing: ${preparedRow.main_image}`, rowNumber, "main_image"));
      }
    }

    for (const galleryImage of splitImageList(preparedRow.gallery_images)) {
      if (!galleryImage.startsWith("/images/products/")) {
        warnings.push(
          createIssue(
            "warning",
            `Gallery image should start with /images/products/: ${galleryImage}`,
            rowNumber,
            "gallery_images",
          ),
        );
      } else if (!publicImagePathExists(galleryImage)) {
        warnings.push(
          createIssue("warning", `Gallery image file missing: ${galleryImage}`, rowNumber, "gallery_images"),
        );
      }
    }
  });

  return { rows: preparedRows, errors, warnings } satisfies ValidationResult;
}

export function validateCsvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return {
      rows: [],
      errors: [createIssue("error", `CSV file not found: ${filePath}`, undefined, "file")],
      warnings: [],
    } satisfies ValidationResult;
  }

  const { rows, issues } = rowsFromCsv(filePath);

  return validateProductRows(rows, issues);
}

export function resolveValidationInputPath(inputPath?: string) {
  if (inputPath) {
    return path.resolve(inputPath);
  }

  const defaultInputPath = path.resolve("data/import/products.csv");

  if (existsSync(defaultInputPath)) {
    return defaultInputPath;
  }

  return path.resolve("data/import/products-sample.csv");
}

export function printIssues(title: string, issues: ValidationIssue[]) {
  if (issues.length === 0) {
    return;
  }

  console.log(`\n${title}:`);

  for (const issue of issues) {
    const rowText = issue.rowNumber ? `Row ${issue.rowNumber}: ` : "";
    const fieldText = issue.field ? `[${issue.field}] ` : "";
    console.log(`- ${rowText}${fieldText}${issue.message}`);
  }
}
