#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAnalyticsPageLocation } from "../lib/analytics-campaign.ts";

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

const rfqFormSource = readFileSync(new URL("../app/rfq/RfqForm.tsx", import.meta.url), "utf8");
const analyticsTrackerSource = readFileSync(
  new URL("../components/AnalyticsTracker.tsx", import.meta.url),
  "utf8",
);
const formStartEvent = rfqFormSource.match(
  /trackAnalyticsEvent\("rfq_form_start",\s*\{([\s\S]*?)\}\);/,
);

assert.ok(formStartEvent, "RFQ form must emit rfq_form_start.");

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

assert.match(distributorPageSource, /href="#distributor-rfq-form"/);
assert.match(distributorPageSource, /id="distributor-rfq"/);
assert.match(distributorPageSource, /id="distributor-rfq-form"/);
assert.match(distributorPageSource, /formPlacement="distributor_landing"/);
assert.match(
  distributorPageSource,
  /initialProduct="Distributor mixed welding and cutting product inquiry"/,
);
assert.match(analyticsTrackerSource, /url\.hash === "#distributor-rfq-form"/);
assert.match(analyticsTrackerSource, /embedded_distributor_rfq/);

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

console.log("Promotion attribution and conversion funnel tests passed.");
