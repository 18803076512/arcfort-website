import {
  TO_BE_CONFIRMED,
  type ApplicationPage,
  type FaqItem,
  type GuideArticle,
  type Product,
  type ProductCategory,
} from "@/lib/content/schemas";
import { isLowSignalSpecificationValue } from "@/lib/content/display";
import { getSearchEligibleProductImages } from "@/lib/content/product-images";
import { absoluteUrl, organizationIdentity, siteConfig } from "@/lib/content/site";

type BreadcrumbItem = {
  name: string;
  path: string;
};

const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");

function webPageId(path: string) {
  return `${absoluteUrl(path)}#webpage`;
}

function confirmedRows(rows: { label: string; value: string }[]) {
  return rows.filter(
    (row) => row.label !== "Image Name" && !isLowSignalSpecificationValue(row.value),
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: organizationIdentity.name,
    legalName: organizationIdentity.legalName,
    alternateName: organizationIdentity.alternateNames,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.whatsapp,
    description: siteConfig.description,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.logo),
      contentUrl: absoluteUrl(siteConfig.logo),
      caption: `${siteConfig.name} logo`,
    },
    image: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.defaultSeoImage),
      contentUrl: absoluteUrl(siteConfig.defaultSeoImage),
      caption: `${siteConfig.name} industrial welding and cutting solutions`,
    },
    slogan: siteConfig.tagline,
    areaServed: "Worldwide",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Renqiu",
      addressRegion: "Hebei",
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
        areaServed: "Worldwide",
      },
    ],
    brand: {
      "@type": "Brand",
      "@id": absoluteUrl("/#brand"),
      name: organizationIdentity.brandName,
      url: siteConfig.url,
      logo: absoluteUrl(siteConfig.logo),
    },
    knowsAbout: [
      "MIG/MAG torch parts",
      "TIG torch parts",
      "Plasma cutting consumables",
      "Welding consumables",
      "Welding machines",
      "Welding accessories",
      "OEM welding products",
    ],
    ...(siteConfig.sameAs.length > 0 ? { sameAs: siteConfig.sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: siteConfig.name,
    alternateName: [`${siteConfig.name} by ${siteConfig.legalName}`, siteConfig.legalName],
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.legalName,
    },
  };
}

export function webPageJsonLd({
  name,
  description,
  path,
  pageType = "WebPage",
  image,
  dateModified,
}: {
  name: string;
  description: string;
  path: string;
  pageType?: "WebPage" | "AboutPage" | "ContactPage";
  image?: string;
  dateModified?: string;
}) {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": pageType,
    "@id": webPageId(path),
    name,
    description,
    url,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.legalName,
    },
    ...(image
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: absoluteUrl(image),
            contentUrl: absoluteUrl(image),
            caption: name,
          },
        }
      : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  const currentPath = items.at(-1)?.path ?? "/";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(currentPath)}#breadcrumb`,
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
  image,
  dateModified,
}: {
  name: string;
  description: string;
  path: string;
  items: Array<{
    name: string;
    path: string;
  }>;
  image?: string;
  dateModified?: string;
}) {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": webPageId(path),
    name,
    description,
    url,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.legalName,
    },
    ...(image
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: absoluteUrl(image),
            contentUrl: absoluteUrl(image),
            caption: name,
          },
        }
      : {}),
    ...(dateModified ? { dateModified } : {}),
    mainEntity: {
      "@type": "ItemList",
      "@id": `${url}#item-list`,
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
  const [primaryImage] = getSearchEligibleProductImages(product);

  return {
    ...webPageJsonLd({
      name: product.title,
      description: product.metaDescription,
      path: `/products/${category.slug}/${product.slug}`,
      image: primaryImage,
      dateModified: product.modifiedDate,
    }),
    about: {
      "@type": "Thing",
      name: product.title,
      description: product.shortDescription,
    },
  };
}

export function applicationWebPageJsonLd(application: ApplicationPage, image?: string) {
  return {
    ...webPageJsonLd({
      name: application.title,
      description: application.seoDescription,
      path: `/applications/${application.slug}`,
      image,
      dateModified: siteConfig.contentLastModified,
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
  const productImages = getSearchEligibleProductImages(product).map((imagePath) =>
    absoluteUrl(imagePath),
  );

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

export function articleJsonLd(article: GuideArticle, image = siteConfig.defaultSeoImage) {
  const path = `/guides/${article.slug}`;
  const url = absoluteUrl(path);
  const wordCount = article.sections
    .map((section) => `${section.title} ${section.body}`)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": webPageId(path),
      url,
    },
    isPartOf: {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    author: {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.legalName,
      url: absoluteUrl("/about"),
    },
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.legalName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.logo),
      },
    },
    image: {
      "@type": "ImageObject",
      url: absoluteUrl(image),
      contentUrl: absoluteUrl(image),
      caption: article.title,
    },
    articleSection: "Welding and cutting buyer guides",
    keywords: article.keywords.join(", "),
    wordCount,
    isAccessibleForFree: true,
    about: article.keywords.map((keyword) => ({
      "@type": "Thing",
      name: keyword,
    })),
    inLanguage: "en",
  };
}
