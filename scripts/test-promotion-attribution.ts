#!/usr/bin/env node

import assert from "node:assert/strict";
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

console.log("Promotion attribution allowlist tests passed.");
