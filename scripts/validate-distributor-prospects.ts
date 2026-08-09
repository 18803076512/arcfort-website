#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseCsv } from "./product-import-utils.ts";

const prospectsPath = path.resolve("docs/promotion/distributor-prospect-research.csv");
const campaignsPath = path.resolve("data/promotion/campaigns.csv");
const expectedHeaders = [
  "company",
  "country_region",
  "website",
  "public_contact_url",
  "source_evidence_url",
  "verified_product_overlap",
  "suggested_offer",
  "campaign_link_id",
  "priority",
  "status",
  "verified_date",
  "notes",
] as const;
const allowedPriorities = new Set(["A", "B", "C"]);
const allowedStatuses = new Set([
  "not_contacted",
  "research_review",
  "contacted",
  "replied",
  "qualified",
  "not_relevant",
  "opted_out",
]);
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phonePattern = /(?:\+?\d[\d ().-]{7,}\d)/;

type ProspectHeader = (typeof expectedHeaders)[number];
type ProspectRow = Record<ProspectHeader, string>;

function normalizeHostname(value: string) {
  return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
}

function requireOfficialHttpsUrl(value: string, website: string, rowNumber: number, field: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`Prospect row ${rowNumber} has an invalid ${field}: ${value}`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`Prospect row ${rowNumber} must use HTTPS for ${field}.`);
  }

  if (normalizeHostname(value) !== normalizeHostname(website)) {
    throw new Error(`Prospect row ${rowNumber} ${field} must use the official company domain.`);
  }
}

function readCampaignIds() {
  if (!existsSync(campaignsPath)) {
    throw new Error(`Promotion campaign source is missing: ${campaignsPath}`);
  }

  const rows = parseCsv(readFileSync(campaignsPath, "utf8"));
  const idIndex = (rows[0] ?? []).indexOf("id");

  if (idIndex < 0) {
    throw new Error("Promotion campaign source is missing the id column.");
  }

  return new Set(
    rows
      .slice(1)
      .map((row) => row[idIndex]?.trim())
      .filter(Boolean),
  );
}

function readProspects() {
  if (!existsSync(prospectsPath)) {
    throw new Error(`Distributor prospect research is missing: ${prospectsPath}`);
  }

  const parsed = parseCsv(readFileSync(prospectsPath, "utf8"));
  const headers = parsed[0] ?? [];

  if (headers.join(",") !== expectedHeaders.join(",")) {
    throw new Error(`Distributor prospect headers must be: ${expectedHeaders.join(",")}`);
  }

  return parsed
    .slice(1)
    .map(
      (values) =>
        Object.fromEntries(
          expectedHeaders.map((header, index) => [header, values[index]?.trim() ?? ""]),
        ) as ProspectRow,
    );
}

function main() {
  const campaignIds = readCampaignIds();
  const rows = readProspects();
  const companies = new Set<string>();
  const websites = new Set<string>();

  if (rows.length === 0) {
    throw new Error("Distributor prospect research must contain at least one company.");
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    for (const field of expectedHeaders.filter((header) => header !== "notes")) {
      if (!row[field]) {
        throw new Error(`Prospect row ${rowNumber} is missing ${field}.`);
      }
    }

    requireOfficialHttpsUrl(row.website, row.website, rowNumber, "website");
    requireOfficialHttpsUrl(row.public_contact_url, row.website, rowNumber, "public_contact_url");
    requireOfficialHttpsUrl(row.source_evidence_url, row.website, rowNumber, "source_evidence_url");

    const companyKey = row.company.toLowerCase();
    const websiteKey = normalizeHostname(row.website);

    if (companies.has(companyKey)) {
      throw new Error(`Distributor company is duplicated: ${row.company}.`);
    }

    if (websites.has(websiteKey)) {
      throw new Error(`Distributor website is duplicated: ${row.website}.`);
    }

    if (!campaignIds.has(row.campaign_link_id)) {
      throw new Error(
        `Prospect row ${rowNumber} references an unknown campaign ID: ${row.campaign_link_id}.`,
      );
    }

    if (!allowedPriorities.has(row.priority)) {
      throw new Error(`Prospect row ${rowNumber} has an invalid priority: ${row.priority}.`);
    }

    if (!allowedStatuses.has(row.status)) {
      throw new Error(`Prospect row ${rowNumber} has an invalid status: ${row.status}.`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.verified_date)) {
      throw new Error(`Prospect row ${rowNumber} must use YYYY-MM-DD for verified_date.`);
    }

    for (const field of [
      "company",
      "country_region",
      "verified_product_overlap",
      "suggested_offer",
      "notes",
    ] as const) {
      if (emailPattern.test(row[field]) || phonePattern.test(row[field])) {
        throw new Error(
          `Prospect row ${rowNumber} contains contact data outside the official URL fields.`,
        );
      }
    }

    companies.add(companyKey);
    websites.add(websiteKey);
  });

  const prioritySummary = [...allowedPriorities]
    .map((priority) => `${priority}:${rows.filter((row) => row.priority === priority).length}`)
    .join(", ");

  console.log(
    `Distributor prospect research passed (${rows.length} companies; ${prioritySummary}).`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
