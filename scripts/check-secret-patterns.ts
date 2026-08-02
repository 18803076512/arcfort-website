#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname, resolve } from "node:path";

type SecretPattern = {
  name: string;
  expression: RegExp;
};

type SecretFinding = {
  file: string;
  line: number;
  name: string;
};

const binaryExtensions = new Set([
  ".7z",
  ".avif",
  ".bmp",
  ".doc",
  ".docx",
  ".eot",
  ".gif",
  ".gz",
  ".ico",
  ".jpeg",
  ".jpg",
  ".mov",
  ".mp3",
  ".mp4",
  ".pdf",
  ".png",
  ".ppt",
  ".pptx",
  ".rar",
  ".tar",
  ".tif",
  ".tiff",
  ".ttf",
  ".wav",
  ".webm",
  ".webp",
  ".woff",
  ".woff2",
  ".xls",
  ".xlsx",
  ".zip",
]);

const secretPatterns: SecretPattern[] = [
  { name: "Resend API key", expression: /\bre_[A-Za-z0-9]{24,}\b/g },
  { name: "GitHub access token", expression: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/g },
  { name: "OpenAI API key", expression: /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/g },
  { name: "Stripe live secret", expression: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/g },
  { name: "AWS access key", expression: /\bAKIA[0-9A-Z]{16}\b/g },
  {
    name: "Private key",
    expression: /-----BEGIN (?:EC |OPENSSH |RSA )?PRIVATE KEY-----/g,
  },
  {
    name: "Slack access token",
    expression: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g,
  },
];

const sensitiveAssignment =
  /\b(RESEND_API_KEY|SUPABASE_SERVICE_ROLE_KEY|VERCEL_TOKEN|CLOUDFLARE_API_TOKEN|SMTP_PASSWORD|DATABASE_URL)\b[ \t]*(?:=|:)[ \t]*["']?([^\s"'`#,}]*)/g;

function isPlaceholder(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    normalized.length === 0 ||
    normalized.startsWith("${") ||
    normalized.startsWith("process.env") ||
    normalized.includes("secrets.") ||
    normalized.includes("placeholder") ||
    normalized.includes("redacted") ||
    normalized.includes("changeme") ||
    normalized.includes("example") ||
    normalized.includes("your-") ||
    normalized.includes("your_") ||
    normalized === "tbd" ||
    /^re_x+$/i.test(normalized) ||
    /^[x*._-]+$/.test(normalized)
  );
}

function getLineNumber(content: string, index: number) {
  let line = 1;

  for (let cursor = 0; cursor < index; cursor += 1) {
    if (content.charCodeAt(cursor) === 10) {
      line += 1;
    }
  }

  return line;
}

function scanText(file: string, content: string) {
  const findings: SecretFinding[] = [];

  for (const pattern of secretPatterns) {
    pattern.expression.lastIndex = 0;

    for (const match of content.matchAll(pattern.expression)) {
      const value = match[0] ?? "";

      if (!isPlaceholder(value)) {
        findings.push({
          file,
          line: getLineNumber(content, match.index),
          name: pattern.name,
        });
      }
    }
  }

  sensitiveAssignment.lastIndex = 0;

  for (const match of content.matchAll(sensitiveAssignment)) {
    const variableName = match[1] ?? "Sensitive environment variable";
    const value = match[2] ?? "";

    if (!isPlaceholder(value)) {
      findings.push({
        file,
        line: getLineNumber(content, match.index),
        name: `${variableName} value`,
      });
    }
  }

  return findings;
}

function runSelfTest() {
  const fakeResendKey = ["re_", "A1b2C3d4E5f6G7h8J9k0LmNoPqRsTuVw"].join("");
  const positive = scanText("self-test", `RESEND_API_KEY=${fakeResendKey}`);
  const negative = scanText("self-test", "RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx");

  if (positive.length === 0 || negative.length !== 0) {
    throw new Error("Secret scanner self-test failed.");
  }
}

function getTrackedFiles() {
  const output = execFileSync("git", ["ls-files", "-z"], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });

  return output.split("\0").filter(Boolean);
}

function main() {
  runSelfTest();

  const findings: SecretFinding[] = [];
  let scannedFiles = 0;

  for (const file of getTrackedFiles()) {
    if (binaryExtensions.has(extname(file).toLowerCase())) {
      continue;
    }

    const buffer = readFileSync(resolve(process.cwd(), file));

    if (buffer.includes(0)) {
      continue;
    }

    scannedFiles += 1;
    findings.push(...scanText(file, buffer.toString("utf8")));
  }

  const uniqueFindings = Array.from(
    new Map(
      findings.map((finding) => [`${finding.file}:${finding.line}:${finding.name}`, finding]),
    ).values(),
  );

  console.log("ArcFort Weld tracked-file secret scan");
  console.log(`Text files scanned: ${scannedFiles}`);

  if (uniqueFindings.length > 0) {
    console.error(`Potential secrets found: ${uniqueFindings.length}`);

    for (const finding of uniqueFindings) {
      console.error(`- ${finding.file}:${finding.line} (${finding.name})`);
    }

    console.error(
      "Secret values are intentionally redacted. Rotate confirmed credentials before continuing.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("No high-confidence secret patterns found in tracked text files.");
}

main();
