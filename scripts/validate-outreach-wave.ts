#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseCsv } from "./product-import-utils.ts";

const prospectPath = path.resolve("docs/promotion/distributor-prospect-research.csv");
const campaignLinksPath = path.resolve("docs/promotion/campaign-links.csv");
const waveDefinitions = [
  {
    sourcePath: path.resolve("data/promotion/outreach-wave-01.csv"),
    draftPath: path.resolve("docs/promotion/outreach-wave-01.md"),
    expectedWaveId: "oceania_wave_01",
    label: "Outreach wave 01",
  },
  {
    sourcePath: path.resolve("data/promotion/outreach-wave-02.csv"),
    draftPath: path.resolve("docs/promotion/outreach-wave-02.md"),
    expectedWaveId: "global_wave_02",
    label: "Outreach wave 02",
  },
  {
    sourcePath: path.resolve("data/promotion/outreach-wave-03.csv"),
    draftPath: path.resolve("docs/promotion/outreach-wave-03.md"),
    expectedWaveId: "uae_wave_03",
    label: "Outreach wave 03",
  },
] as const;
const expectedHeaders = [
  "wave_id",
  "sequence",
  "company",
  "market",
  "official_contact_url",
  "evidence_url",
  "campaign_link_id",
  "tracking_url",
  "product_angle",
  "personalization_basis",
  "status",
] as const;
const allowedStatuses = new Set([
  "ready_for_manual_review",
  "approved_for_manual_send",
  "sent_manually",
  "replied",
  "qualified",
  "not_relevant",
  "opted_out",
]);
const forbiddenClaims = [
  /\b(?:CE|ISO|RoHS|UL) certified\b/i,
  /\bguaranteed compatibility\b/i,
  /\blowest price\b/i,
  /\balways in stock\b/i,
  /\bour (?:customer|partner|distributor)\b/i,
];
const personalContactPattern =
  /\b(?:Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Z][a-z]+|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|(?:\+?\d[\d ().-]{7,}\d)/i;
const optOutSentence =
  "If this product range is not relevant, please let us know and we will not follow up.";

type WaveHeader = (typeof expectedHeaders)[number];
type WaveRow = Record<WaveHeader, string>;

function readCsv(filePath: string, label: string) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} is missing: ${filePath}`);
  }

  return parseCsv(readFileSync(filePath, "utf8"));
}

type WaveDefinition = (typeof waveDefinitions)[number];

function readWave(definition: WaveDefinition) {
  const parsed = readCsv(definition.sourcePath, `${definition.label} source`);
  const headers = parsed[0] ?? [];

  if (headers.join(",") !== expectedHeaders.join(",")) {
    throw new Error(`Outreach wave headers must be: ${expectedHeaders.join(",")}`);
  }

  return parsed
    .slice(1)
    .map(
      (values) =>
        Object.fromEntries(
          expectedHeaders.map((header, index) => [header, values[index]?.trim() ?? ""]),
        ) as WaveRow,
    );
}

function readRowsByColumn(filePath: string, keyColumn: string) {
  const rows = readCsv(filePath, path.basename(filePath));
  const headers = rows[0] ?? [];
  const keyIndex = headers.indexOf(keyColumn);

  if (keyIndex < 0) {
    throw new Error(`${path.basename(filePath)} is missing ${keyColumn}.`);
  }

  return new Map(
    rows
      .slice(1)
      .map((values) => [
        values[keyIndex]?.trim() ?? "",
        Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""])),
      ]),
  );
}

function requireHttps(value: string, rowNumber: number, field: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`Outreach row ${rowNumber} has an invalid ${field}: ${value}`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`Outreach row ${rowNumber} must use HTTPS for ${field}.`);
  }
}

function sectionForCompany(markdown: string, company: string) {
  const heading = `## ${company}`;
  const headingIndex = markdown.indexOf(heading);

  if (headingIndex < 0) {
    return "";
  }

  const contentStart = headingIndex + heading.length;
  const nextHeadingIndex = markdown.indexOf("\n## ", contentStart);
  return markdown.slice(contentStart, nextHeadingIndex < 0 ? undefined : nextHeadingIndex).trim();
}

function main() {
  const prospects = readRowsByColumn(prospectPath, "company");
  const campaignLinks = readRowsByColumn(campaignLinksPath, "id");
  const companies = new Set<string>();
  let totalDrafts = 0;

  for (const definition of waveDefinitions) {
    const wave = readWave(definition);
    const markdown = readFileSync(definition.draftPath, "utf8");

    if (wave.length !== 5) {
      throw new Error(
        `${definition.label} must contain exactly 5 companies; received ${wave.length}.`,
      );
    }

    wave.forEach((row, index) => {
      const rowNumber = index + 2;

      for (const field of expectedHeaders) {
        if (!row[field]) {
          throw new Error(`${definition.label} row ${rowNumber} is missing ${field}.`);
        }
      }

      if (row.wave_id !== definition.expectedWaveId || row.sequence !== String(index + 1)) {
        throw new Error(`${definition.label} row ${rowNumber} has an invalid wave ID or sequence.`);
      }

      if (companies.has(row.company)) {
        throw new Error(`Outreach company is duplicated across waves: ${row.company}.`);
      }

      if (!allowedStatuses.has(row.status)) {
        throw new Error(
          `${definition.label} row ${rowNumber} has an invalid status: ${row.status}.`,
        );
      }

      for (const field of ["official_contact_url", "evidence_url", "tracking_url"] as const) {
        requireHttps(row[field], rowNumber, field);
      }

      for (const field of [
        "company",
        "market",
        "product_angle",
        "personalization_basis",
      ] as const) {
        if (personalContactPattern.test(row[field])) {
          throw new Error(
            `${definition.label} row ${rowNumber} contains personal contact data in ${field}.`,
          );
        }
      }

      const prospect = prospects.get(row.company);
      const campaign = campaignLinks.get(row.campaign_link_id);

      if (!prospect || prospect.priority !== "A") {
        throw new Error(
          `${definition.label} row ${rowNumber} must reference a Priority A researched company.`,
        );
      }

      if (
        prospect.public_contact_url !== row.official_contact_url ||
        prospect.source_evidence_url !== row.evidence_url
      ) {
        throw new Error(
          `${definition.label} row ${rowNumber} must reuse the verified prospect URLs.`,
        );
      }

      if (!campaign || campaign.tracking_url !== row.tracking_url) {
        throw new Error(
          `${definition.label} row ${rowNumber} must reuse a generated campaign tracking link.`,
        );
      }

      const section = sectionForCompany(markdown, row.company);

      if (!section) {
        throw new Error(`${definition.label} draft is missing a section for ${row.company}.`);
      }

      for (const requiredText of [
        row.official_contact_url,
        row.evidence_url,
        row.tracking_url,
        "Hello Purchasing Team,",
        "Renqiu Ailesen Welding Technology Co., Ltd.",
        optOutSentence,
      ]) {
        if (!section.includes(requiredText)) {
          throw new Error(
            `${definition.label} draft for ${row.company} is missing required text: ${requiredText}`,
          );
        }
      }

      if (section.split(row.tracking_url).length - 1 !== 1) {
        throw new Error(
          `${definition.label} draft for ${row.company} must contain exactly one tracking link.`,
        );
      }

      for (const claim of forbiddenClaims) {
        if (claim.test(section)) {
          throw new Error(
            `${definition.label} draft for ${row.company} contains a prohibited claim.`,
          );
        }
      }

      companies.add(row.company);
    });

    totalDrafts += wave.length;
    console.log(`${definition.label} passed (${wave.length} company drafts for manual review).`);
  }

  console.log(`All outreach waves passed (${totalDrafts} unique company drafts).`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
