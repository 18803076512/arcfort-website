#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAnalyticsPageLocation } from "../lib/analytics-campaign.ts";
import { buildRfqLeadSourceSummary } from "../lib/rfq-lead-source.ts";
import {
  resolveSourceAttributionArrival,
  sanitizeCampaignValue,
  sanitizeReferrerOrigin,
  sanitizeSourceAttribution,
  sanitizeSourcePath,
  type SourceAttribution,
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
for (const referrer of [
  "",
  "not a URL",
  "//directory.example/private",
  "javascript:void(0)",
  "data:,fixture",
]) {
  assert.equal(sanitizeReferrerOrigin(referrer), "");
}
assert.equal(
  sanitizeReferrerOrigin("https://www.arcfortweld.com/products?q=synthetic-marker#fixture"),
  "https://www.arcfortweld.com",
);
assert.equal(
  sanitizeReferrerOrigin("http://127.0.0.1:3986/source?fixture=synthetic-marker"),
  "http://127.0.0.1:3986",
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

const campaignA: SourceAttribution = Object.freeze({
  landingPage: "/privacy",
  referrer: "https://directory-a.example",
  utmSource: "linkedin",
  utmMedium: "organic_social",
  utmCampaign: "synthetic_public_social_a",
  utmTerm: "synthetic_term_a",
  utmContent: "synthetic_creative_a",
});

assert.deepEqual(
  resolveSourceAttributionArrival({
    search:
      "?utm_source=linkedin&utm_medium=organic_social&utm_campaign=synthetic_public_social_a&utm_term=synthetic_term_a&utm_content=synthetic_creative_a",
    pathname: "/privacy?fixture=synthetic-marker#details",
    referrer: "https://directory-a.example/listing?fixture=synthetic-marker#details",
  }),
  { attribution: campaignA, shouldPersist: true },
  "The first tracked arrival captures one complete sanitized snapshot.",
);

const campaignB: SourceAttribution = {
  landingPage: "/about",
  referrer: "",
  utmSource: "outreach_email",
  utmMedium: "email",
  utmCampaign: "synthetic_public_email_b",
  utmTerm: "",
  utmContent: "",
};
const partialArrivalInput = Object.freeze({
  search: "?utm_source=outreach_email&utm_medium=email&utm_campaign=synthetic_public_email_b",
  pathname: "/about?fixture=synthetic-marker#details",
  referrer: "",
  storedAttribution: campaignA,
});
const originalArrivalInput = {
  ...partialArrivalInput,
  storedAttribution: { ...campaignA },
};
const partialArrival = resolveSourceAttributionArrival(partialArrivalInput);

assert.deepEqual(
  partialArrival,
  { attribution: campaignB, shouldPersist: true },
  "A partial new campaign replaces all seven fields, including omitted values and an empty referrer.",
);
assert.deepEqual(
  buildRfqLeadSourceSummary(partialArrival.attribution, "/rfq"),
  {
    label: "Distributor outreach email",
    details: ["Medium: email", "Campaign: synthetic_public_email_b", "Entry: /about"],
  },
  "The RFQ summary must contain only the accepted campaign's details.",
);
assert.deepEqual(
  partialArrivalInput,
  originalArrivalInput,
  "Resolving an arrival must not mutate its input or the stored snapshot.",
);
assert.deepEqual(
  resolveSourceAttributionArrival({
    ...partialArrivalInput,
    storedAttribution: partialArrival.attribution,
  }),
  partialArrival,
  "Repeating the same accepted arrival produces the same snapshot and persistence decision.",
);

assert.deepEqual(
  resolveSourceAttributionArrival({
    ...partialArrivalInput,
    search: `${partialArrivalInput.search}&utm_term=invalid%20term&utm_content=%2Finvalid-content`,
  }),
  { attribution: campaignB, shouldPersist: true },
  "Invalid optional values clear the old campaign's values when another UTM is valid.",
);

assert.deepEqual(
  resolveSourceAttributionArrival({
    ...partialArrivalInput,
    pathname: "//untrusted.example/private",
    referrer: "not a URL",
  }),
  { attribution: { ...campaignB, landingPage: "/" }, shouldPersist: true },
  "An accepted arrival uses the safe path fallback and empty referrer instead of old provenance.",
);

assert.deepEqual(
  resolveSourceAttributionArrival({
    search: "?utm_source=linkedin&utm_medium=organic_social&utm_campaign=synthetic_public_social_a",
    pathname: "/downloads",
    referrer: "https://directory-b.example/listing?fixture=synthetic-marker",
    storedAttribution: campaignA,
  }),
  {
    attribution: {
      ...campaignA,
      landingPage: "/downloads",
      referrer: "https://directory-b.example",
      utmTerm: "",
      utmContent: "",
    },
    shouldPersist: true,
  },
  "A partial arrival for the same campaign also clears omitted fields and replaces provenance.",
);

const allInvalidSearch =
  `?utm_source=invalid!&utm_medium=invalid%20medium&utm_campaign=%2Finvalid-campaign` +
  `&utm_term=${"x".repeat(81)}&utm_content=%09%20`;
const storedSnapshot = Object.freeze({
  ...campaignA,
  landingPage: "/privacy?fixture=synthetic-marker#details",
  referrer: "https://directory-a.example/listing?fixture=synthetic-marker#details",
  utmTerm: " synthetic_term_a ",
  utmContent: "invalid!",
});
const sanitizedStoredSnapshot = { ...campaignA, utmContent: "" };

for (const search of ["", "?fixture=synthetic-marker", allInvalidSearch]) {
  const input = Object.freeze({
    search,
    pathname: "/about",
    referrer: "https://directory-b.example/listing",
    storedAttribution: storedSnapshot,
  });
  const originalInput = { ...input, storedAttribution: { ...storedSnapshot } };

  assert.deepEqual(
    resolveSourceAttributionArrival(input),
    { attribution: sanitizedStoredSnapshot, shouldPersist: false },
    "An arrival without valid UTMs preserves the sanitized stored path, referrer and campaign without a write.",
  );
  assert.deepEqual(input, originalInput, "Preserving an arrival must not mutate its inputs.");
}

for (const storedAttribution of [undefined, null]) {
  assert.deepEqual(
    resolveSourceAttributionArrival({
      search: allInvalidSearch,
      pathname: "/about?fixture=synthetic-marker#details",
      referrer: "https://directory-b.example/listing?fixture=synthetic-marker#details",
      storedAttribution,
    }),
    {
      attribution: {
        landingPage: "/about",
        referrer: "https://directory-b.example",
        utmSource: "",
        utmMedium: "",
        utmCampaign: "",
        utmTerm: "",
        utmContent: "",
      },
      shouldPersist: true,
    },
    "A clean session captures sanitized initial provenance even when every incoming UTM is invalid.",
  );
}

for (const field of ["content", "term"] as const) {
  for (const { referrer, expectedOrigin, expectedLabel } of [
    { referrer: "", expectedOrigin: "", expectedLabel: "Direct or unattributed inquiry" },
    {
      referrer: "https://directory-b.example/listing?fixture=synthetic-marker",
      expectedOrigin: "https://directory-b.example",
      expectedLabel: "Referral: directory-b.example",
    },
    {
      referrer: "https://www.arcfortweld.com/products?fixture=synthetic-marker",
      expectedOrigin: "https://www.arcfortweld.com",
      expectedLabel: "Direct or unattributed inquiry",
    },
    {
      referrer: "https://catalog.arcfortweld.com/products",
      expectedOrigin: "https://catalog.arcfortweld.com",
      expectedLabel: "Direct or unattributed inquiry",
    },
  ]) {
    for (const storedAttribution of [undefined, campaignA]) {
      const arrival = resolveSourceAttributionArrival({
        search: `?utm_${field}=synthetic_${field}_c`,
        pathname: "/downloads",
        referrer,
        storedAttribution,
      });

      assert.deepEqual(
        arrival,
        {
          attribution: {
            landingPage: "/downloads",
            referrer: expectedOrigin,
            utmSource: "",
            utmMedium: "",
            utmCampaign: "",
            utmTerm: field === "term" ? "synthetic_term_c" : "",
            utmContent: field === "content" ? "synthetic_content_c" : "",
          },
          shouldPersist: true,
        },
        `A ${field}-only arrival is accepted without borrowing any saved campaign fields.`,
      );
      assert.deepEqual(
        buildRfqLeadSourceSummary(arrival.attribution, "/rfq"),
        {
          label: expectedLabel,
          details:
            field === "content"
              ? ["Content: synthetic_content_c", "Entry: /downloads"]
              : ["Entry: /downloads"],
        },
        "Without a current source, the summary uses the current external referral or stays unattributed.",
      );
    }
  }
}

assert.deepEqual(
  resolveSourceAttributionArrival({
    search: "?utm_source=outreach_email&utm_source=linkedin&utm_content=first&utm_content=second",
    pathname: "/about",
    referrer: "",
    storedAttribution: campaignA,
  }),
  {
    attribution: { ...campaignB, utmMedium: "", utmCampaign: "", utmContent: "first" },
    shouldPersist: true,
  },
  "Duplicate UTM parameters retain the existing first-value behavior.",
);
assert.deepEqual(
  resolveSourceAttributionArrival({
    search: "?utm_source=invalid!&utm_source=outreach_email",
    pathname: "/about",
    referrer: "",
    storedAttribution: campaignA,
  }),
  { attribution: campaignA, shouldPersist: false },
  "An invalid first duplicate is not replaced by a later valid value.",
);

const rfqFormSource = readFileSync(
  new URL("../app/(public)/rfq/RfqForm.tsx", import.meta.url),
  "utf8",
);
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
  new URL("../app/(public)/distributor-supply/page.tsx", import.meta.url),
  "utf8",
);
const contactPageSource = readFileSync(
  new URL("../app/(public)/contact/page.tsx", import.meta.url),
  "utf8",
);

assert.match(distributorPageSource, /href="#distributor-rfq-builder"/);
assert.match(distributorPageSource, /id="distributor-rfq-builder"/);
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
assert.match(analyticsTrackerSource, /arcfort-distributor-rfq-workbook\.xlsx/);
assert.match(analyticsTrackerSource, /assetKey: "oem_project_brief"/);
assert.match(analyticsTrackerSource, /arcfort-plasma-consumables-rfq\.xlsx/);
assert.match(analyticsTrackerSource, /assetKey: "plasma_consumables_rfq_workbook"/);
assert.match(analyticsTrackerSource, /arcfort-welding-machine-rfq\.xlsx/);
assert.match(analyticsTrackerSource, /assetKey: "welding_machine_rfq_workbook"/);
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
