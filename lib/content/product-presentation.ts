import { isLowSignalSpecificationValue } from "@/lib/content/display";
import type { Product, SpecRow } from "@/lib/content/schemas";

const identitySpecificationLabels = new Set(["product name", "sku", "category", "image name"]);

const fallbackFamilyByCategory: Record<string, string> = {
  "mig-mag-torch-parts": "Torch Parts",
  "tig-torch-parts": "Torch Parts",
  "plasma-cutting-consumables": "Cutting Consumables",
  "welding-consumables": "Welding Consumables",
  "welding-machines": "Welding Equipment",
  "welding-accessories": "Welding Accessories",
};

export function getProductFamilyLabel(product: Product) {
  const productFamily =
    product.kind === "welding-consumable" ? product.consumableFamily : product.equipmentFamily;

  if (productFamily.trim().toLowerCase() !== product.title.trim().toLowerCase()) {
    return productFamily;
  }

  return fallbackFamilyByCategory[product.categorySlug] ?? "Industrial Products";
}

export function getProductProcessLabel(product: Product) {
  return product.kind === "welding-consumable"
    ? product.process
    : product.supportedProcesses.join(", ");
}

export function getPublicSpecificationRows(product: Product) {
  return product.specifications.filter(
    (row) =>
      !identitySpecificationLabels.has(row.label.trim().toLowerCase()) &&
      !isLowSignalSpecificationValue(row.value),
  );
}

export function getProductCardSpecificationRows(product: Product): SpecRow[] {
  return getPublicSpecificationRows(product).slice(0, 2);
}

export function getProductOverviewSpecificationRows(product: Product): SpecRow[] {
  return getPublicSpecificationRows(product).slice(0, 4);
}
