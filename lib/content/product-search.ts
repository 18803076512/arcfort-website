import type { Product, ProductCategory } from "@/lib/content/schemas";

export type ProductCatalogSearchParams = Record<string, string | string[] | undefined>;

export const PRODUCT_CATALOG_PAGE_SIZE = 12;

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.#+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCompactText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function parsePage(value: string | undefined) {
  const parsedPage = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function scoreProduct(product: Product, category: ProductCategory, query: string, terms: string[]) {
  const title = normalizeSearchText(product.title);
  const sku = normalizeSearchText(product.sku);
  const categoryTitle = normalizeSearchText(category.title);
  const searchableText = normalizeSearchText(
    [
      product.title,
      product.sku,
      category.title,
      product.shortDescription,
      product.description,
      product.applications.join(" "),
    ].join(" "),
  );

  if (!terms.every((term) => searchableText.includes(term))) {
    return null;
  }

  const normalizedQuery = normalizeSearchText(query);
  const compactQuery = normalizeCompactText(query);
  let score = 100;

  if (compactQuery === normalizeCompactText(product.sku)) {
    score += 1000;
  }

  if (normalizedQuery === title) {
    score += 900;
  } else if (title.startsWith(normalizedQuery)) {
    score += 500;
  } else if (title.includes(normalizedQuery)) {
    score += 300;
  }

  for (const term of terms) {
    if (sku.includes(term)) {
      score += 60;
    }
    if (title.includes(term)) {
      score += 40;
    }
    if (categoryTitle.includes(term)) {
      score += 10;
    }
  }

  return score;
}

export function hasProductCatalogParameters(searchParams: ProductCatalogSearchParams) {
  return ["q", "category", "page"].some((key) => {
    const value = getFirstValue(searchParams[key]);
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function getProductCatalogPage({
  products,
  categories,
  searchParams,
  pageSize = PRODUCT_CATALOG_PAGE_SIZE,
}: {
  products: Product[];
  categories: ProductCategory[];
  searchParams: ProductCatalogSearchParams;
  pageSize?: number;
}) {
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const categoryOrder = new Map(categories.map((category, index) => [category.slug, index]));
  const rawQuery = getFirstValue(searchParams.q) ?? "";
  const query = rawQuery.trim().replace(/\s+/g, " ").slice(0, 100);
  const requestedCategorySlug = getFirstValue(searchParams.category) ?? "";
  const categorySlug = categoryMap.has(requestedCategorySlug) ? requestedCategorySlug : "";
  const terms = normalizeSearchText(query).split(" ").filter(Boolean);

  const matchingProducts = products
    .filter((product) => !categorySlug || product.categorySlug === categorySlug)
    .map((product) => {
      const category = categoryMap.get(product.categorySlug);

      if (!category) {
        return null;
      }

      const score = terms.length > 0 ? scoreProduct(product, category, query, terms) : 0;

      if (score === null) {
        return null;
      }

      return { product, category, score };
    })
    .filter(
      (
        item,
      ): item is {
        product: Product;
        category: ProductCategory;
        score: number;
      } => Boolean(item),
    )
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      const categoryDifference =
        (categoryOrder.get(left.product.categorySlug) ?? Number.MAX_SAFE_INTEGER) -
        (categoryOrder.get(right.product.categorySlug) ?? Number.MAX_SAFE_INTEGER);

      if (categoryDifference !== 0) {
        return categoryDifference;
      }

      return left.product.title.localeCompare(right.product.title);
    });

  const safePageSize = Math.max(1, Math.min(pageSize, 48));
  const totalMatches = matchingProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalMatches / safePageSize));
  const currentPage = Math.min(parsePage(getFirstValue(searchParams.page)), totalPages);
  const offset = (currentPage - 1) * safePageSize;
  const items = matchingProducts.slice(offset, offset + safePageSize);

  return {
    query,
    categorySlug,
    selectedCategory: categorySlug ? categoryMap.get(categorySlug) : undefined,
    currentPage,
    totalPages,
    totalMatches,
    startIndex: totalMatches === 0 ? 0 : offset + 1,
    endIndex: offset + items.length,
    items,
  };
}
