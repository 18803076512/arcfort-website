#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { siteConfig } from "../lib/content/site.ts";
import { parseCsv } from "./product-import-utils.ts";

const inputPath = path.resolve("data/promotion/campaigns.csv");
const outputPath = path.resolve("docs/promotion/campaign-links.csv");
const expectedHeaders = [
  "id",
  "channel",
  "source",
  "medium",
  "campaign",
  "content",
  "landing_path",
  "audience",
  "primary_action",
] as const;
const valuePattern = /^[a-z0-9][a-z0-9_-]{1,79}$/;

type CampaignHeader = (typeof expectedHeaders)[number];
type CampaignRow = Record<CampaignHeader, string>;

function escapeCsvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function readCampaigns() {
  if (!existsSync(inputPath)) {
    throw new Error(`Promotion campaign source is missing: ${inputPath}`);
  }

  const parsed = parseCsv(readFileSync(inputPath, "utf8"));
  const headers = parsed[0] ?? [];

  if (headers.join(",") !== expectedHeaders.join(",")) {
    throw new Error(`Promotion campaign headers must be: ${expectedHeaders.join(",")}`);
  }

  const ids = new Set<string>();

  return parsed.slice(1).map((values, index) => {
    const rowNumber = index + 2;
    const row = Object.fromEntries(
      expectedHeaders.map((header, headerIndex) => [header, values[headerIndex]?.trim() ?? ""]),
    ) as CampaignRow;

    for (const field of expectedHeaders) {
      if (!row[field]) {
        throw new Error(`Promotion campaign row ${rowNumber} is missing ${field}.`);
      }
    }

    for (const field of ["id", "source", "medium", "campaign", "content"] as const) {
      if (!valuePattern.test(row[field])) {
        throw new Error(
          `Promotion campaign row ${rowNumber} has an invalid ${field}: ${row[field]}.`,
        );
      }
    }

    if (ids.has(row.id)) {
      throw new Error(`Promotion campaign id is duplicated: ${row.id}.`);
    }

    if (!row.landing_path.startsWith("/") || row.landing_path.startsWith("//")) {
      throw new Error(`Promotion campaign row ${rowNumber} must use an internal landing path.`);
    }

    ids.add(row.id);
    return row;
  });
}

function buildTrackingUrl(row: CampaignRow) {
  const url = new URL(row.landing_path, siteConfig.url);
  url.searchParams.set("utm_source", row.source);
  url.searchParams.set("utm_medium", row.medium);
  url.searchParams.set("utm_campaign", row.campaign);
  url.searchParams.set("utm_content", row.content);
  return url.toString();
}

function serializeCampaignLinks(rows: CampaignRow[]) {
  const outputHeaders = ["id", "channel", "audience", "primary_action", "tracking_url"] as const;
  const lines = [outputHeaders.join(",")];

  for (const row of rows) {
    lines.push(
      [row.id, row.channel, row.audience, row.primary_action, buildTrackingUrl(row)]
        .map(escapeCsvCell)
        .join(","),
    );
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const rows = readCampaigns();
  const generated = serializeCampaignLinks(rows);
  const checkOnly = process.argv.includes("--check");

  if (checkOnly) {
    if (!existsSync(outputPath) || readFileSync(outputPath, "utf8") !== generated) {
      throw new Error("Promotion campaign links are outdated. Run npm run promotion:links.");
    }

    console.log(`Promotion campaign links are current (${rows.length} campaigns).`);
    return;
  }

  writeFileSync(outputPath, generated, "utf8");
  console.log(`Generated ${rows.length} promotion links: ${outputPath}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
