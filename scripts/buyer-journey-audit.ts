/** Read-only checks for the rendered discovery and inquiry paths of public products. */
export type JourneyLink = {
  url: string;
  follow: boolean;
  inMain: boolean;
};

export type JourneyPage = {
  url: string;
  eligible: boolean;
  followLinks?: boolean;
  links: JourneyLink[];
};

type JourneyProduct = {
  sku: string;
  categorySlug: string;
  slug: string;
};

type JourneySite = {
  url: string;
  emailHref: string;
  whatsappHref: string;
};

function decodeAttribute(value: string) {
  return value
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (entity, code: string) => {
      const point = code.toLowerCase().startsWith("x")
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    })
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#x27;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? decodeAttribute(match[1] ?? match[2] ?? match[3]) : undefined;
}

export function extractJourneyLinks(html: string, pageUrl: string): JourneyLink[] {
  // Script strings, comments and inert templates are not rendered anchor elements.
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  const mainStart = markup.search(/<main\b[^>]*>/i);
  const mainEnd = markup.search(/<\/main\s*>/i);
  const links: JourneyLink[] = [];

  for (const match of markup.matchAll(/<a\b[^>]*>/gi)) {
    const href = attribute(match[0], "href");
    if (!href?.trim()) continue;

    try {
      const url = new URL(href, pageUrl);
      if (!["http:", "https:", "mailto:"].includes(url.protocol)) continue;
      url.hash = "";
      links.push({
        url: url.href,
        follow: !attribute(match[0], "rel")?.toLowerCase().split(/\s+/).includes("nofollow"),
        inMain: mainStart >= 0 && match.index > mainStart && match.index < mainEnd,
      });
    } catch {
      // Invalid URLs cannot satisfy a discovery or inquiry-path requirement.
    }
  }

  return links;
}

function comparableUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  return url.href;
}

function containsExactSku(value: string | null, sku: string) {
  const skuLines = (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^SKU\s*:/i.test(line));
  return skuLines.length === 1 && skuLines[0].replace(/^SKU\s*:\s*/i, "") === sku;
}

function hasUniqueSkuParameter(url: URL, parameter: string, sku: string) {
  const values = url.searchParams.getAll(parameter);
  return values.length === 1 && containsExactSku(values[0], sku);
}

export function auditBuyerJourneys(
  pages: JourneyPage[],
  products: JourneyProduct[],
  site: JourneySite,
) {
  const errors: string[] = [];
  const home = new URL("/", site.url).href;
  const origin = new URL(site.url).origin;
  const nodes = new Map(
    pages
      .filter((page) => page.eligible && new URL(page.url).origin === origin)
      .map((page) => [comparableUrl(page.url), page]),
  );
  const inbound = new Map<string, Set<string>>();
  const contextualInbound = new Map<string, Set<string>>();
  const edges = new Map<string, Set<string>>();

  for (const [source, page] of nodes) {
    const targets = new Set<string>();
    for (const link of page.links) {
      const target = comparableUrl(link.url);
      // Preserve queries: a filtered/noindex variant is not its canonical page.
      if (page.followLinks === false || !link.follow || !nodes.has(target) || target === source)
        continue;
      targets.add(target);
      const sources = inbound.get(target) ?? new Set<string>();
      sources.add(source);
      inbound.set(target, sources);
      if (link.inMain) {
        const mainSources = contextualInbound.get(target) ?? new Set<string>();
        mainSources.add(source);
        contextualInbound.set(target, mainSources);
      }
    }
    edges.set(source, targets);
  }

  const depths = new Map<string, number>();
  if (!nodes.has(home)) errors.push("Homepage is missing from the eligible HTML crawl graph.");
  else depths.set(home, 0);
  const queue = [...depths.keys()];
  for (let index = 0; index < queue.length; index += 1) {
    const source = queue[index];
    for (const target of edges.get(source) ?? []) {
      if (depths.has(target)) continue;
      depths.set(target, depths.get(source)! + 1);
      queue.push(target);
    }
  }

  const orphanUrls = [...nodes.keys()].filter((url) => url !== home && !inbound.get(url)?.size);
  const unreachableUrls = [...nodes.keys()].filter((url) => !depths.has(url));
  for (const url of orphanUrls)
    errors.push(`No inbound link from another eligible HTML page: ${url}.`);
  for (const url of unreachableUrls)
    errors.push(`Not reachable by crawlable links from home: ${url}.`);

  const rfqUrl = new URL("/rfq", site.url);
  const emailUrl = new URL(site.emailHref);
  const whatsappUrl = new URL(site.whatsappHref);
  if (!nodes.has(rfqUrl.href) || !depths.has(rfqUrl.href)) {
    errors.push("Canonical RFQ page must be eligible and reachable from home.");
  }
  let passedProducts = 0;

  for (const product of products) {
    const productUrl = new URL(`/products/${product.categorySlug}/${product.slug}`, site.url).href;
    const categoryUrl = new URL(`/products/${product.categorySlug}`, site.url).href;
    const page = nodes.get(productUrl);
    const category = nodes.get(categoryUrl);
    const failures: string[] = [];
    const mainLinks = (page?.links ?? []).filter((link) => link.inMain);
    const linksTo = (links: JourneyLink[], target: string) =>
      links.some((link) => link.follow && comparableUrl(link.url) === target);

    if (!page || !depths.has(productUrl)) failures.push("product page is missing or unreachable");
    if (!category || !depths.has(categoryUrl)) failures.push("category is missing or unreachable");
    if (
      category?.followLinks === false ||
      !linksTo(
        (category?.links ?? []).filter((link) => link.inMain),
        productUrl,
      )
    ) {
      failures.push("category body does not link directly to the product");
    }
    if (page?.followLinks === false || !linksTo(mainLinks, categoryUrl))
      failures.push("product does not link back to its category");
    if (!contextualInbound.get(productUrl)?.size)
      failures.push("product has no contextual inbound link");

    const inquiryUrls = mainLinks.map((link) => new URL(link.url));
    if (
      !inquiryUrls.some(
        (url) =>
          url.origin === rfqUrl.origin &&
          url.pathname === rfqUrl.pathname &&
          hasUniqueSkuParameter(url, "product", product.sku),
      )
    ) {
      failures.push("RFQ link does not preserve the exact SKU");
    }
    if (
      !inquiryUrls.some(
        (url) =>
          url.protocol === "mailto:" &&
          url.pathname.toLowerCase() === emailUrl.pathname.toLowerCase() &&
          hasUniqueSkuParameter(url, "body", product.sku),
      )
    ) {
      failures.push("sales email fallback does not preserve the exact SKU");
    }
    if (
      !inquiryUrls.some(
        (url) =>
          url.origin === whatsappUrl.origin &&
          url.pathname === whatsappUrl.pathname &&
          hasUniqueSkuParameter(url, "text", product.sku),
      )
    ) {
      failures.push("WhatsApp fallback does not preserve the exact SKU");
    }

    if (failures.length === 0) passedProducts += 1;
    else errors.push(`${product.sku}: ${failures.join("; ")} (${productUrl}).`);
  }

  return {
    errors,
    htmlPages: nodes.size,
    reachablePages: depths.size,
    orphanUrls,
    unreachableUrls,
    maxDepth: depths.size ? Math.max(...depths.values()) : null,
    productsChecked: products.length,
    productsPassed: passedProducts,
  };
}
