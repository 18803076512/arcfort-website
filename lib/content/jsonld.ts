import {
  TO_BE_CONFIRMED,
  type FaqItem,
  type GuideArticle,
  type Product,
  type ProductCategory,
} from "@/lib/content/schemas";
import { absoluteUrl, siteConfig } from "@/lib/content/site";

type BreadcrumbItem = {
  name: string;
  path: string;
};

function confirmedRows(rows: { label: string; value: string }[]) {
  return rows.filter((row) => row.value && row.value !== TO_BE_CONFIRMED);
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    description: siteConfig.description,
    brand: {
      "@type": "Brand",
      name: siteConfig.shortName,
    },
    sameAs: siteConfig.sameAs,
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function productJsonLd(product: Product, category: ProductCategory) {
  const additionalProperty = confirmedRows(product.specifications).map((row) => ({
    "@type": "PropertyValue",
    name: row.label,
    value: row.value,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    category: category.title,
    url: absoluteUrl(`/products/${category.slug}/${product.slug}`),
    ...(product.sku !== TO_BE_CONFIRMED ? { sku: product.sku } : {}),
    brand: {
      "@type": "Brand",
      name: siteConfig.shortName,
    },
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
  };
}

export function articleJsonLd(article: GuideArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: absoluteUrl(`/guides/${article.slug}`),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}
