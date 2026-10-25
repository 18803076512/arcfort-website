#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  auditBuyerJourneys,
  extractJourneyLinks,
  type JourneyPage,
} from "./buyer-journey-audit.ts";

const site = {
  url: "https://example.test",
  emailHref: "mailto:sales@example.test",
  whatsappHref: "https://wa.me/123456789",
};
const product = { sku: "AF-TEST-1", categorySlug: "parts", slug: "tip" };
const categoryPath = "/products/parts";
const productPath = `${categoryPath}/tip`;
const context = encodeURIComponent("Product: Tip\r\nSKU: AF-TEST-1\r\nQuantity:");
const productMarkup = `<main>
  <a href="${categoryPath}">Category</a>
  <a href="/rfq?utm_source=product&amp;product=${context}">RFQ</a>
  <a href="${site.emailHref}?subject=Inquiry&amp;body=${context}">Email</a>
  <a href="${site.whatsappHref}?text=${context}">WhatsApp</a>
</main>`;
function page(path: string, html: string, eligible = true): JourneyPage {
  const url = new URL(path, site.url).href;
  return { url, eligible, links: extractJourneyLinks(html, url) };
}
function fixture(productHtml = productMarkup) {
  return [
    page("/", `<main><a href="${categoryPath}">Parts</a><a href="/rfq">RFQ</a></main>`),
    page(categoryPath, `<main><a href="${productPath}">Tip</a></main>`),
    page(productPath, productHtml),
    page("/rfq", '<main><a href="/">Home</a></main>'),
  ];
}
function audit(pages: JourneyPage[]) {
  return auditBuyerJourneys(pages, [product], site);
}

const healthy = audit(fixture());
assert.deepEqual(healthy.errors, []);
assert.equal(healthy.reachablePages, 4);
assert.equal(healthy.maxDepth, 2);
assert.equal(healthy.productsPassed, 1);

// Existing union-of-links checks cannot detect a mutually linked disconnected island.
const island = fixture();
island.push(page("/island-a", '<main><a href="/island-b">B</a></main>'));
island.push(page("/island-b", '<main><a href="/island-a">A</a></main>'));
const disconnected = audit(island);
assert.equal(disconnected.orphanUrls.length, 0);
assert.equal(disconnected.unreachableUrls.length, 2);
assert.match(disconnected.errors.join("\n"), /Not reachable/);

const selfOnly = fixture();
selfOnly.push(page("/self", '<main><a href="/self">Self</a></main>'));
assert(audit(selfOnly).orphanUrls.includes(`${site.url}/self`));

for (const invalidHome of [
  `<main><a href="${categoryPath}" rel="nofollow">Parts</a><a href="/rfq">RFQ</a></main>`,
  `<main><a href="${categoryPath}?filter=tip">Parts</a><a href="/rfq">RFQ</a></main>`,
  `<main><a href="https://other.test${categoryPath}">Parts</a><a href="/rfq">RFQ</a></main>`,
  `<main><a data-href="${categoryPath}">Parts</a><a href="/rfq">RFQ</a></main>`,
]) {
  const pages = fixture();
  pages[0] = page("/", invalidHome);
  assert(audit(pages).unreachableUrls.includes(`${site.url}${productPath}`));
}

const noindexBridge = fixture();
noindexBridge[1].eligible = false;
assert(audit(noindexBridge).unreachableUrls.includes(`${site.url}${productPath}`));
const nofollowBridge = fixture();
nofollowBridge[1].followLinks = false;
assert(audit(nofollowBridge).unreachableUrls.includes(`${site.url}${productPath}`));
const missingProduct = fixture().filter((entry) => entry.url !== `${site.url}${productPath}`);
assert.match(audit(missingProduct).errors.join("\n"), /product page is missing/);
const missingRfq = fixture().filter((entry) => entry.url !== `${site.url}/rfq`);
assert.match(audit(missingRfq).errors.join("\n"), /Canonical RFQ page/);

const noCategoryBacklink = productMarkup.replace(`href="${categoryPath}"`, 'href="/products"');
assert.match(audit(fixture(noCategoryBacklink)).errors.join("\n"), /link back/);
for (const wrongContext of ["SKU: AF-TEST-10", "SKU: OTHER", "SKU: AF-TEST-1\nSKU: OTHER"]) {
  const wrong = productMarkup.replaceAll(context, encodeURIComponent(wrongContext));
  const result = audit(fixture(wrong));
  assert.equal(result.productsPassed, 0);
  assert.match(result.errors.join("\n"), /RFQ link.*exact SKU/);
  assert.match(result.errors.join("\n"), /email fallback.*exact SKU/);
  assert.match(result.errors.join("\n"), /WhatsApp fallback.*exact SKU/);
}
const wrongDestinations = productMarkup
  .replace(site.emailHref, "mailto:other@example.test")
  .replace(site.whatsappHref, "https://wa.me/987654321")
  .replace("/rfq?", "https://other.test/rfq?");
assert.equal(audit(fixture(wrongDestinations)).productsPassed, 0);

// Header/global links and inert markup cannot stand in for a product-specific body CTA.
assert.equal(audit(fixture(productMarkup.replaceAll("main>", "header>"))).productsPassed, 0);
for (const wrapper of [
  (s: string) => `<!-- ${s} -->`,
  (s: string) => `<script type="application/json">${s}</script>`,
  (s: string) => `<template>${s}</template>`,
])
  assert.equal(extractJourneyLinks(wrapper(productMarkup), site.url).length, 0);

const decoded = extractJourneyLinks(
  '<main><a href=./tip>Relative</a><a href="/rfq?product=SKU%3A%20AF-TEST-1&#38;x=1">Encoded</a></main>',
  `${site.url}/products/parts/`,
);
assert.equal(decoded[0].url, `${site.url}${productPath}`);
assert.equal(new URL(decoded[1].url).searchParams.get("x"), "1");
assert.deepEqual(auditBuyerJourneys([], [], site).reachablePages, 0);

console.log(
  "Buyer journey audit passed: reachable graph, disconnected islands, self links, nofollow, query variants, noindex bridges, missing endpoints, SKU context, approved contact destinations and inert markup negative controls.",
);
