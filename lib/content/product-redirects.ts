export const legacyCategoryRedirects = [
  {
    sourceCategorySlug: "mig-torch-parts",
    destinationCategorySlug: "mig-mag-torch-parts",
  },
  {
    sourceCategorySlug: "plasma-cutting-parts",
    destinationCategorySlug: "plasma-cutting-consumables",
  },
] as const;

export const legacyProductRedirects = [
  {
    categorySlug: "mig-mag-torch-parts",
    productSlug: "mig-contact-tip",
    destination: "/products/mig-mag-torch-parts",
  },
  {
    categorySlug: "mig-mag-torch-parts",
    productSlug: "mig-gas-nozzle",
    destination: "/products/mig-mag-torch-parts",
  },
  {
    categorySlug: "tig-torch-parts",
    productSlug: "tig-ceramic-cup",
    destination: "/products/tig-torch-parts",
  },
  {
    categorySlug: "tig-torch-parts",
    productSlug: "tig-gas-lens",
    destination: "/products/tig-torch-parts",
  },
] as const;

const legacyProductPaths = new Set(
  legacyProductRedirects.map(({ categorySlug, productSlug }) => `${categorySlug}/${productSlug}`),
);

export function isLegacyProductPath(categorySlug: string, productSlug: string) {
  return legacyProductPaths.has(`${categorySlug}/${productSlug}`);
}
