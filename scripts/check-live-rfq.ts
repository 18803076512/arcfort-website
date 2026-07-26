#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

type RfqStatusResponse = {
  ok?: boolean;
  productionReady?: boolean;
  inquiryCaptureReady?: boolean;
  attachmentDeliveryReady?: boolean;
  deliveryMode?: string;
  rateLimit?: {
    applicationFallback?: boolean;
    distributed?: boolean;
    limit?: number;
    windowSeconds?: number;
    infrastructureRuleRecommended?: boolean;
  };
  email?: {
    ready?: boolean;
    buyerConfirmationReady?: boolean;
    recipient?: string;
  };
};

type RfqSubmissionResponse = {
  ok?: boolean;
  reference?: string;
  message?: string;
  emailDelivered?: boolean;
  buyerConfirmationDelivered?: boolean;
  emailAttachmentCount?: number;
};

const args = process.argv.slice(2);

function getOption(name: string) {
  const inlinePrefix = `--${name}=`;
  const inlineValue = args.find((argument) => argument.startsWith(inlinePrefix));

  if (inlineValue) {
    return inlineValue.slice(inlinePrefix.length).trim();
  }

  const optionIndex = args.indexOf(`--${name}`);
  return optionIndex >= 0 ? (args[optionIndex + 1] ?? "").trim() : "";
}

function getMimeType(filePath: string) {
  const extension = extname(filePath).toLowerCase();

  return (
    {
      ".csv": "text/csv",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }[extension] ?? "application/octet-stream"
  );
}

function normalizeBaseUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("The RFQ check base URL must use HTTP or HTTPS.");
  }

  return url.origin;
}

async function readJsonResponse<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(`Expected JSON from ${response.url}, received HTTP ${response.status}.`);
  }
}

async function main() {
  const baseUrl = normalizeBaseUrl(getOption("base-url") || "https://www.arcfortweld.com");
  const sendTest = args.includes("--send");
  const confirmProduction = args.includes("--confirm-production");
  const email = getOption("email");
  const attachmentOption = getOption("attachment");
  const statusUrl = `${baseUrl}/api/rfq/status?check=${Date.now()}`;
  const statusResponse = await fetch(statusUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const status = await readJsonResponse<RfqStatusResponse>(statusResponse);

  console.log("ArcFort Weld live RFQ check");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`HTTP status: ${statusResponse.status}`);
  console.log(`Production ready: ${Boolean(status.productionReady)}`);
  console.log(`Inquiry capture ready: ${Boolean(status.inquiryCaptureReady)}`);
  console.log(`Attachment delivery ready: ${Boolean(status.attachmentDeliveryReady)}`);
  console.log(`Delivery mode: ${status.deliveryMode ?? "unknown"}`);
  console.log(`Application rate-limit fallback: ${Boolean(status.rateLimit?.applicationFallback)}`);
  console.log(`Distributed rate limit: ${Boolean(status.rateLimit?.distributed)}`);
  console.log(
    `Rate-limit policy: ${status.rateLimit?.limit ?? "unknown"} requests / ${status.rateLimit?.windowSeconds ?? "unknown"} seconds`,
  );
  console.log(`Email ready: ${Boolean(status.email?.ready)}`);
  console.log(`Buyer confirmation ready: ${Boolean(status.email?.buyerConfirmationReady)}`);
  console.log(`Sales recipient: ${status.email?.recipient ?? "not reported"}`);

  if (!statusResponse.ok || !status.ok || !status.productionReady) {
    throw new Error("The live RFQ status endpoint is not production-ready.");
  }

  if (!sendTest) {
    console.log("Readiness check only. No RFQ or email was sent.");
    return;
  }

  if (!confirmProduction) {
    throw new Error("Add --confirm-production to acknowledge that this command sends real emails.");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Pass a valid test inbox with --email=buyer@example.com.");
  }

  const formData = new FormData();
  formData.append("name", "ArcFort Website Delivery Test");
  formData.append("company", "Renqiu Ailesen Welding Technology Co., Ltd.");
  formData.append("email", email);
  formData.append("whatsapp", "+86-18803076512");
  formData.append("country", "China");
  formData.append(
    "productRequirements",
    "Controlled production RFQ delivery test. No quotation or sales follow-up is required.",
  );
  formData.append("quantity", "Test submission only");
  formData.append(
    "message",
    "Please retain this message only as evidence that the ArcFort Weld website inquiry channel reached the configured email service.",
  );
  formData.append("website", "");
  formData.append("startedAt", String(Date.now() - 5000));
  formData.append("sourcePath", "/rfq?test=live-delivery");
  formData.append("landingPage", "/rfq?test=live-delivery");
  formData.append("referrer", "ArcFort live RFQ diagnostic");
  formData.append("utmSource", "internal_test");
  formData.append("utmMedium", "qa");
  formData.append("utmCampaign", "rfq_delivery_verification");

  if (attachmentOption) {
    const attachmentPath = resolve(attachmentOption);
    const attachmentStat = await stat(attachmentPath);

    if (!attachmentStat.isFile()) {
      throw new Error(`Attachment is not a file: ${attachmentPath}`);
    }

    if (attachmentStat.size > 4 * 1024 * 1024) {
      throw new Error("The diagnostic attachment must be 4 MB or smaller.");
    }

    const attachment = await readFile(attachmentPath);
    formData.append(
      "attachments",
      new Blob([new Uint8Array(attachment)], { type: getMimeType(attachmentPath) }),
      basename(attachmentPath),
    );
  }

  const submissionResponse = await fetch(`${baseUrl}/api/rfq`, {
    method: "POST",
    body: formData,
  });
  const submission = await readJsonResponse<RfqSubmissionResponse>(submissionResponse);

  console.log(`Submission HTTP status: ${submissionResponse.status}`);
  console.log(`RFQ reference: ${submission.reference ?? "not reported"}`);
  console.log(`Sales email accepted: ${Boolean(submission.emailDelivered)}`);
  console.log(`Buyer confirmation accepted: ${Boolean(submission.buyerConfirmationDelivered)}`);
  console.log(`Email attachments accepted: ${submission.emailAttachmentCount ?? 0}`);

  if (!submissionResponse.ok || !submission.ok || !submission.emailDelivered) {
    throw new Error(submission.message || "The production RFQ delivery test failed.");
  }

  if (attachmentOption && submission.emailAttachmentCount !== 1) {
    throw new Error("The RFQ was accepted, but the diagnostic attachment was not accepted.");
  }

  console.log(
    "The email provider accepted the test. Confirm final inbox placement and the matching RFQ reference in Outlook or Resend logs.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
