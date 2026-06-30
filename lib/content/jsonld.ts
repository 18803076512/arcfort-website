import {
  TO_BE_CONFIRMED,
  type ApplicationPage,
  type FaqItem,
  type GuideArticle,
  type Product,
  type ProductCategory,
} from "@/lib/content/schemas";
import { isLowSignalSpecificationValue } from "@/lib/content/display";
import { hasPublicProductImage } from "@/lib/content/product-images";
import { absoluteUrl, siteConfig } from "@/lib/content/site";

type BreadcrumbItem = {
  name: string;
  path: string;
};

function confirmedRows(rows: { label: string; value: string }[]) {
  return rows.filter(
    (row) => row.label !== "Image Name" && !isLowSignalSpecificationValue(row.value),
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    alternateName: [siteConfig.shortName, siteConfig.chineseName],
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.whatsapp,
    description: siteConfig.description,
    logo: absoluteUrl(siteConfig.logo),
    image: absoluteUrl(siteConfig.defaultSeoImage),
    slogan: siteConfig.tagline,
    areaServed: ["Global", "North America", "Europe", "Asia", "South America", "Africa", "Oceania"],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: "Renqiu City",
      addressRegion: "Hebei Province",
      addressCountry: "CN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: siteConfig.email,
        telephone: siteConfig.whatsapp,
        url: absoluteUrl("/contact"),
        availableLanguage: ["English", "Chinese"],
      },
    ],
    brand: {
      "@type": "Brand",
      name: siteConfig.shortName,
    },
    sameAs: siteConfig.sameAs,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: [siteConfig.shortName, siteConfig.legalName],
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: siteConfig.legalName,
    },
  };
}

export function webPageJsonLd({
  name,
  description,
  path,
  pageType = "WebPage",
}: {
  name: string;
  description: string;
  path: string;
  pageType?: "WebPage" | "AboutPage" | "ContactPage";
}) {
  return {
    "@context": "https://schema.org",
    "@type": pageType,
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.legalName,
    },
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

export function collectionPageJsonLd({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: Array<{
    name: string;
    path: string;
  }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
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

export function productWebPageJsonLd(product: Product, category: ProductCategory) {
  return {
    ...webPageJsonLd({
      name: product.title,
      description: product.metaDescription,
      path: `/products/${category.slug}/${product.slug}`,
    }),
    about: {
      "@type": "Thing",
      name: product.title,
      description: product.shortDescription,
    },
  };
}

export function applicationWebPageJsonLd(application: ApplicationPage) {
  return {
    ...webPageJsonLd({
      name: application.title,
      description: application.seoDescription,
      path: `/applications/${application.slug}`,
    }),
    about: application.industries.map((industry) => ({
      "@type": "Thing",
      name: industry,
    })),
  };
}

export function productJsonLd(product: Product, category: ProductCategory) {
  const additionalProperty = confirmedRows(product.specifications).map((row) => ({
    "@type": "PropertyValue",
    name: row.label,
    value: row.value,
  }));
  const productImages = [product.mainImage, ...product.galleryImages]
    .filter(hasPublicProductImage)
    .map((imagePath) => absoluteUrl(imagePath));

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
    ...(productImages.length > 0 ? { image: productImages } : {}),
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
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.logo),
      },
    },
    image: absoluteUrl(siteConfig.defaultSeoImage),
    inLanguage: "en",
  };
}
