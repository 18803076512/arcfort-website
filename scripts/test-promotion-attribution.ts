#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAnalyticsPageLocation } from "../lib/analytics-campaign.ts";
import {
  sanitizeCampaignValue,
  sanitizeReferrerOrigin,
  sanitizeSourceAttribution,
  sanitizeSourcePath,
} from "../lib/source-attribution.ts";

const trackedLocation = buildAnalyticsPageLocation({
  href: "https://www.arcfortweld.com/distributor-supply?utm_source=linkedin&utm_medium=organic_social&utm_campaign=distributor_sourcing_2026&utm_content=company_post&product=Private%20buyer%20reference&email=buyer%40example.com&gclid=private-click-id",
  origin: "https://www.arcfortweld.com",
  pathname: "/distributor-supply",
});

assert.equal(
  trackedLocation,
  "https://www.arcfortweld.com/distributor-supply?utm_source=linkedin&utm_medium=organic_social&utm_campaign=distributor_sourcing_2026&utm_content=company_post",
);

const unsafeCampaignValue = buildAnalyticsPageLocation({
  href: "https://www.arcfortweld.com/downloads?utm_source=buyer%40example.com&utm_medium=email",
  origin: "https://www.arcfortweld.com",
  pathname: "/downloads",
});

assert.equal(unsafeCampaignValue, "https://www.arcfortweld.com/downloads?utm_medium=email");

assert.equal(
  sanitizeSourcePath(
    "/distributor-supply?utm_source=outreach_email&email=buyer@example.com&gclid=private-id",
    "/rfq",
  ),
  "/distributor-supply",
);
assert.equal(sanitizeSourcePath("//example.com/private", "/rfq"), "/rfq");
assert.equal(sanitizeCampaignValue("distributor_sourcing_2026"), "distributor_sourcing_2026");
assert.equal(sanitizeCampaignValue("buyer@example.com"), "");
assert.equal(
  sanitizeReferrerOrigin("https://directory.example/private/path?buyer=reference"),
  "https://directory.example",
);
assert.deepEqual(
  sanitizeSourceAttribution({
    landingPage: "/products/mig-mag-torch-parts?product=private-reference",
    referrer: "https://directory.example/listing?click_id=private-id",
    utmSource: "buyer@example.com",
    utmMedium: "email",
    utmCampaign: "distributor_sourcing_2026",
    utmContent: "introduction",
  }),
  {
    landingPage: "/products/mig-mag-torch-parts",
    referrer: "https://directory.example",
    utmSource: "",
    utmMedium: "email",
    utmCampaign: "distributor_sourcing_2026",
    utmTerm: "",
    utmContent: "introduction",
  },
);

const rfqFormSource = readFileSync(new URL("../app/rfq/RfqForm.tsx", import.meta.url), "utf8");
const analyticsTrackerSource = readFileSync(
  new URL("../components/AnalyticsTracker.tsx", import.meta.url),
  "utf8",
);
const rfqApiSource = readFileSync(new URL("../app/api/rfq/route.ts", import.meta.url), "utf8");
const formStartEvent = rfqFormSource.match(
  /trackAnalyticsEvent\("rfq_form_start",\s*\{([\s\S]*?)\}\);/,
);

assert.ok(formStartEvent, "RFQ form must emit rfq_form_start.");
assert.match(rfqFormSource, /sanitizeSourcePath\(window\.location\.pathname, "\/rfq"\)/);
assert.match(
  rfqApiSource,
  /referrer: sanitizeReferrerOrigin\(request\.headers\.get\("referer"\)\)/,
);

for (const parameter of [
  "interaction_type",
  "form_entry",
  "selected_product_count",
  "form_placement",
]) {
  assert.match(
    formStartEvent[1],
    new RegExp(`\\b${parameter}\\b`),
    `rfq_form_start must include ${parameter}.`,
  );
}

const distributorPageSource = readFileSync(
  new URL("../app/distributor-supply/page.tsx", import.meta.url),
  "utf8",
);
const contactPageSource = readFileSync(new URL("../app/contact/page.tsx", import.meta.url), "utf8");

assert.match(distributorPageSource, /href="#distributor-rfq-form"/);
assert.match(distributorPageSource, /id="distributor-rfq"/);
assert.match(distributorPageSource, /id="distributor-rfq-form"/);
assert.match(distributorPageSource, /formPlacement="distributor_landing"/);
assert.match(
  distributorPageSource,
  /initialProduct="Distributor mixed welding and cutting product inquiry"/,
);
assert.match(analyticsTrackerSource, /"#distributor-rfq-form": "embedded_distributor_rfq"/);
assert.match(analyticsTrackerSource, /embedded_distributor_rfq/);
assert.match(contactPageSource, /href="#contact-inquiry-form"/);
assert.match(contactPageSource, /id="contact-inquiry-form"/);
assert.match(contactPageSource, /formPlacement="contact_page"/);
assert.match(contactPageSource, /initialProduct="General welding and cutting product inquiry"/);
assert.match(analyticsTrackerSource, /"#contact-inquiry-form": "embedded_contact_rfq"/);

for (const eventName of ["rfq_submit_start", "rfq_submit_success", "generate_lead"]) {
  const eventSource = rfqFormSource.match(
    new RegExp(`trackAnalyticsEvent\\("${eventName}",\\s*\\{([\\s\\S]*?)\\}\\);`),
  );

  assert.ok(eventSource, `${eventName} event must exist.`);
  assert.match(eventSource[1], /\bform_placement\b/);
}

for (const forbiddenParameter of [
  "name",
  "company",
  "email",
  "whatsapp",
  "country",
  "productRequirements",
  "message",
]) {
  assert.doesNotMatch(
    formStartEvent[1],
    new RegExp(`\\b${forbiddenParameter}\\b`, "i"),
    `rfq_form_start must not include buyer PII or inquiry content: ${forbiddenParameter}.`,
  );
}

for (const eventName of [
  "contact_email_click",
  "contact_whatsapp_click",
  "buyer_tool_download_click",
]) {
  assert.match(analyticsTrackerSource, new RegExp(`eventName: "${eventName}"`));
}

assert.match(analyticsTrackerSource, /arcfort-oem-project-brief\.xlsx/);
assert.match(analyticsTrackerSource, /assetKey: "oem_project_brief"/);
assert.match(analyticsTrackerSource, /arcfort-plasma-consumables-rfq\.xlsx/);
assert.match(analyticsTrackerSource, /assetKey: "plasma_consumables_rfq_workbook"/);
assert.match(analyticsTrackerSource, /url\.pathname\.split\("\."\)\.at\(-1\)/);

assert.match(analyticsTrackerSource, /link_placement: getLinkPlacement\(anchor\)/);

for (const placement of [
  "sticky_contact",
  "header",
  "footer",
  "sidebar",
  "navigation",
  "page_content",
]) {
  assert.match(
    analyticsTrackerSource,
    new RegExp(`return "${placement}"`),
    `Tracked links must support the ${placement} placement.`,
  );
}

console.log("Promotion attribution and conversion funnel tests passed.");
