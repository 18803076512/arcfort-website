import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/content/site";
import {
  emptySourceAttribution,
  sourceAttributionFields,
  type SourceAttribution,
} from "@/lib/source-attribution";
import {
  rfqMaxRequestBodySize,
  type RfqTextValues,
  validateRfqFiles,
  validateRfqTextValues,
} from "@/lib/rfq-constraints";
import { createRfqReference } from "@/lib/rfq-reference";

export const runtime = "nodejs";

type RfqPayload = RfqTextValues & {
  sourcePath: string;
  sourceAttribution: SourceAttribution;
};

type AttachmentRecord = {
  name: string;
  size: number;
  type: string;
  path?: string;
};

type EmailNotificationResult = {
  configured: boolean;
  delivered: boolean;
  recipient: string;
  attachmentCount: number;
  buyerConfirmationDelivered: boolean;
};

type StorageDeliveryResult = {
  stored: boolean;
  attachmentsStored: boolean;
  attachmentCount: number;
};

const minSubmitDurationMs = 3000;
const maxSubmitAgeMs = 24 * 60 * 60 * 1000;

function cleanField(formData: FormData, field: keyof RfqPayload) {
  const value = formData.get(field);
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.replace(/\0/g, "").trim();

  if (field === "productRequirements" || field === "message") {
    return trimmedValue.replace(/\r\n?/g, "\n");
  }

  return trimmedValue.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ");
}

function cleanFormValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120) || "attachment";
}

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function buildStorageObjectUrl(supabaseUrl: string, bucket: string, objectPath: string) {
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  return `${normalizeSupabaseUrl(supabaseUrl)}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;
}

function getAttachments(formData: FormData) {
  return formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function normalizeSourcePath(sourcePath: string) {
  if (!sourcePath.startsWith("/") || sourcePath.startsWith("//") || sourcePath.length > 240) {
    return "/rfq";
  }

  return sourcePath;
}

function cleanSourceValue(value: string) {
  return value
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, 240);
}

function cleanSourceAttribution(formData: FormData): SourceAttribution {
  const sourceAttribution = emptySourceAttribution();

  for (const field of sourceAttributionFields) {
    sourceAttribution[field] = cleanSourceValue(cleanFormValue(formData, field));
  }

  return sourceAttribution;
}

function getSourceAttributionValue(payload: RfqPayload, field: keyof SourceAttribution) {
  return payload.sourceAttribution[field] || null;
}

function validateStartedAt(startedAt: string) {
  const timestamp = Number(startedAt);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const elapsed = Date.now() - timestamp;
  return elapsed >= minSubmitDurationMs && elapsed <= maxSubmitAgeMs;
}

function isConfigured(value: string | undefined) {
  return Boolean(value?.trim());
}

function rfqResponse(reference: string, body: Record<string, unknown>, status = 200) {
  return NextResponse.json(
    {
      ...body,
      reference,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-RFQ-Reference": reference,
      },
    },
  );
}

async function uploadAttachments(
  files: File[],
  supabaseUrl: string,
  serviceRoleKey: string,
  bucket: string,
  reference: string,
) {
  const uploadedAttachments: AttachmentRecord[] = [];

  for (const [index, file] of files.entries()) {
    const objectPath = `${reference.toLowerCase()}/${index + 1}-${sanitizeFileName(file.name)}`;
    const response = await fetch(buildStorageObjectUrl(supabaseUrl, bucket, objectPath), {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Attachment upload failed.");
    }

    uploadedAttachments.push({
      name: sanitizeFileName(file.name),
      size: file.size,
      type: file.type || "application/octet-stream",
      path: objectPath,
    });
  }

  return uploadedAttachments;
}

async function insertSupabaseInquiry(
  payload: RfqPayload,
  attachments: AttachmentRecord[],
  reference: string,
) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_RFQ_TABLE;

  if (!supabaseUrl || !serviceRoleKey || !table) {
    return false;
  }

  const response = await fetch(
    `${normalizeSupabaseUrl(supabaseUrl)}/rest/v1/${encodeURIComponent(table)}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        reference,
        name: payload.name,
        company: payload.company,
        email: payload.email,
        whatsapp: payload.whatsapp,
        country: payload.country,
        product_requirements: payload.productRequirements,
        quantity: payload.quantity,
        message: payload.message,
        attachments,
        source_path: payload.sourcePath,
        landing_page: getSourceAttributionValue(payload, "landingPage"),
        referrer: getSourceAttributionValue(payload, "referrer"),
        utm_source: getSourceAttributionValue(payload, "utmSource"),
        utm_medium: getSourceAttributionValue(payload, "utmMedium"),
        utm_campaign: getSourceAttributionValue(payload, "utmCampaign"),
        utm_term: getSourceAttributionValue(payload, "utmTerm"),
        utm_content: getSourceAttributionValue(payload, "utmContent"),
        status: "new",
      }),
    },
  );

  if (!response.ok) {
    throw new Error("RFQ database insert failed.");
  }

  return true;
}

function buildInquiryEmailText(
  payload: RfqPayload,
  attachments: AttachmentRecord[],
  reference: string,
  requestMeta: { userAgent: string; referrer: string },
) {
  const attachmentSummary =
    attachments.length > 0
      ? attachments
          .map((attachment) => {
            const sizeMb = (attachment.size / (1024 * 1024)).toFixed(2);
            return `- ${attachment.name} (${sizeMb} MB)${attachment.path ? ` - ${attachment.path}` : ""}`;
          })
          .join("\n")
      : "No attachments uploaded.";

  return [
    "New RFQ inquiry from ArcFort Weld website",
    `RFQ Reference: ${reference}`,
    "",
    `Name: ${payload.name}`,
    `Company: ${payload.company}`,
    `Email: ${payload.email}`,
    `WhatsApp: ${payload.whatsapp || "Not provided"}`,
    `Country: ${payload.country}`,
    `Quantity: ${payload.quantity}`,
    "",
    "Product Requirements:",
    payload.productRequirements,
    "",
    "Message:",
    payload.message || "No additional message.",
    "",
    "Attachments:",
    attachmentSummary,
    "",
    "Source:",
    `Path: ${payload.sourcePath}`,
    `Landing Page: ${payload.sourceAttribution.landingPage || "Not captured"}`,
    `Browser Referrer: ${payload.sourceAttribution.referrer || "Not captured"}`,
    `UTM Source: ${payload.sourceAttribution.utmSource || "Not captured"}`,
    `UTM Medium: ${payload.sourceAttribution.utmMedium || "Not captured"}`,
    `UTM Campaign: ${payload.sourceAttribution.utmCampaign || "Not captured"}`,
    `UTM Term: ${payload.sourceAttribution.utmTerm || "Not captured"}`,
    `UTM Content: ${payload.sourceAttribution.utmContent || "Not captured"}`,
    `Referrer: ${requestMeta.referrer}`,
    `User Agent: ${requestMeta.userAgent}`,
  ].join("\n");
}

function buildBuyerConfirmationEmailText(
  payload: RfqPayload,
  attachments: AttachmentRecord[],
  reference: string,
) {
  const attachmentSummary =
    attachments.length > 0
      ? attachments
          .map((attachment) => {
            const sizeMb = (attachment.size / (1024 * 1024)).toFixed(2);
            return `- ${attachment.name} (${sizeMb} MB)`;
          })
          .join("\n")
      : "No attachments uploaded.";

  return [
    `Dear ${payload.name},`,
    "",
    "Thank you for sending your RFQ to ArcFort Weld.",
    "",
    "We have received your inquiry and the sales team will review the product details, quantity, packaging requirement and delivery information before follow-up.",
    "",
    "RFQ Summary",
    `Reference: ${reference}`,
    `Company: ${payload.company}`,
    `Email: ${payload.email}`,
    `WhatsApp: ${payload.whatsapp || "Not provided"}`,
    `Country: ${payload.country}`,
    `Quantity: ${payload.quantity}`,
    "",
    "Product Requirements:",
    payload.productRequirements,
    "",
    "Message:",
    payload.message || "No additional message.",
    "",
    "Attachments:",
    attachmentSummary,
    "",
    "For urgent updates, you can also contact us directly:",
    `Email: ${siteConfig.email}`,
    `WhatsApp: ${siteConfig.whatsapp}`,
    "",
    `${siteConfig.legalName}`,
    siteConfig.tagline,
    "",
    "This is an automatic confirmation email from the ArcFort Weld website.",
  ].join("\n");
}

async function buildEmailAttachments(files: File[]) {
  return Promise.all(
    files.map(async (file) => ({
      filename: sanitizeFileName(file.name),
      content: Buffer.from(await file.arrayBuffer()).toString("base64"),
    })),
  );
}

async function sendEmailNotification(
  payload: RfqPayload,
  attachments: AttachmentRecord[],
  files: File[],
  reference: string,
  requestMeta: { userAgent: string; referrer: string },
): Promise<EmailNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RFQ_EMAIL_FROM;
  const recipient = process.env.RFQ_EMAIL_RECIPIENT || siteConfig.email;

  if (!apiKey || !from) {
    return {
      configured: false,
      delivered: false,
      recipient,
      attachmentCount: 0,
      buyerConfirmationDelivered: false,
    };
  }

  const emailAttachments = files.length > 0 ? await buildEmailAttachments(files) : [];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: payload.email,
      subject: `ArcFort Weld RFQ ${reference} - ${payload.company}`,
      text: buildInquiryEmailText(payload, attachments, reference, requestMeta),
      ...(emailAttachments.length > 0 ? { attachments: emailAttachments } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error("RFQ email notification failed.");
  }

  let buyerConfirmationDelivered = false;

  try {
    const buyerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.email],
        reply_to: recipient,
        subject: `ArcFort Weld received your RFQ - ${reference}`,
        text: buildBuyerConfirmationEmailText(payload, attachments, reference),
      }),
    });

    buyerConfirmationDelivered = buyerResponse.ok;
  } catch {
    buyerConfirmationDelivered = false;
  }

  return {
    configured: true,
    delivered: true,
    recipient,
    attachmentCount: emailAttachments.length,
    buyerConfirmationDelivered,
  };
}

export async function POST(request: Request) {
  const reference = createRfqReference();
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;

  if (Number.isFinite(contentLength) && contentLength > rfqMaxRequestBodySize) {
    return rfqResponse(
      reference,
      {
        ok: false,
        message: "RFQ upload is too large. Please reduce the attachments and try again.",
      },
      413,
    );
  }

  try {
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return rfqResponse(
        reference,
        {
          ok: false,
          message: "Invalid RFQ form data.",
        },
        400,
      );
    }

    const payload: RfqPayload = {
      name: cleanField(formData, "name"),
      company: cleanField(formData, "company"),
      email: cleanField(formData, "email"),
      whatsapp: cleanField(formData, "whatsapp"),
      country: cleanField(formData, "country"),
      productRequirements: cleanField(formData, "productRequirements"),
      quantity: cleanField(formData, "quantity"),
      message: cleanField(formData, "message"),
      sourcePath: normalizeSourcePath(cleanField(formData, "sourcePath")),
      sourceAttribution: cleanSourceAttribution(formData),
    };
    const files = getAttachments(formData);
    const honeypot = cleanFormValue(formData, "website");
    const startedAt = cleanFormValue(formData, "startedAt");
    const errors: Partial<Record<keyof RfqTextValues | "attachments", string>> = {};
    const requestMeta = {
      userAgent: (request.headers.get("user-agent") || "Unknown").slice(0, 240),
      referrer: (request.headers.get("referer") || "Direct").slice(0, 240),
    };

    if (honeypot) {
      return rfqResponse(
        reference,
        {
          ok: false,
          message: "RFQ submission failed. Please try again.",
        },
        400,
      );
    }

    if (!validateStartedAt(startedAt)) {
      return rfqResponse(
        reference,
        {
          ok: false,
          message: "Please reload the RFQ form and try again.",
        },
        400,
      );
    }

    Object.assign(errors, validateRfqTextValues(payload));
    const fileError = validateRfqFiles(files);

    if (fileError) {
      errors.attachments = fileError;
    }

    if (Object.keys(errors).length > 0) {
      return rfqResponse(reference, { ok: false, errors }, 400);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_RFQ_BUCKET;
    const table = process.env.SUPABASE_RFQ_TABLE;
    const emailRecipient = process.env.RFQ_EMAIL_RECIPIENT || siteConfig.email;
    const storageConfigured =
      isConfigured(supabaseUrl) && isConfigured(serviceRoleKey) && isConfigured(table);
    const emailConfigured =
      isConfigured(process.env.RESEND_API_KEY) &&
      isConfigured(process.env.RFQ_EMAIL_FROM) &&
      isConfigured(emailRecipient);
    const attachmentMetadata: AttachmentRecord[] = files.map((file) => ({
      name: sanitizeFileName(file.name),
      size: file.size,
      type: file.type || "application/octet-stream",
    }));

    const storageTask = async () => {
      if (!storageConfigured || !supabaseUrl || !serviceRoleKey) {
        return {
          stored: false,
          attachmentsStored: false,
          attachmentCount: 0,
        } satisfies StorageDeliveryResult;
      }

      let storageAttachments = attachmentMetadata;
      let attachmentsStored = files.length === 0;

      if (files.length > 0 && bucket) {
        try {
          storageAttachments = await uploadAttachments(
            files,
            supabaseUrl,
            serviceRoleKey,
            bucket,
            reference,
          );
          attachmentsStored = storageAttachments.length === files.length;
        } catch {
          console.error(
            `[RFQ ${reference}] Attachment storage failed; continuing with inquiry metadata.`,
          );
        }
      } else if (files.length > 0) {
        console.error(
          `[RFQ ${reference}] Attachment storage bucket is not configured; continuing with inquiry metadata.`,
        );
      }

      const stored = await insertSupabaseInquiry(payload, storageAttachments, reference);

      return {
        stored,
        attachmentsStored,
        attachmentCount: attachmentsStored ? files.length : 0,
      } satisfies StorageDeliveryResult;
    };

    const emailTask = () =>
      sendEmailNotification(payload, attachmentMetadata, files, reference, requestMeta);

    const [storageResult, emailResult] = await Promise.allSettled([storageTask(), emailTask()]);

    if (storageResult.status === "rejected") {
      console.error(`[RFQ ${reference}] Supabase inquiry storage failed.`);
    }

    if (emailResult.status === "rejected") {
      console.error(`[RFQ ${reference}] Resend email delivery failed.`);
    }

    const storageDelivery: StorageDeliveryResult =
      storageResult.status === "fulfilled"
        ? storageResult.value
        : {
            stored: false,
            attachmentsStored: false,
            attachmentCount: 0,
          };
    const stored = storageDelivery.stored;
    const emailNotification: EmailNotificationResult =
      emailResult.status === "fulfilled"
        ? emailResult.value
        : {
            configured: emailConfigured,
            delivered: false,
            recipient: emailRecipient,
            attachmentCount: 0,
            buyerConfirmationDelivered: false,
          };
    const storageDeliveryComplete =
      stored && (files.length === 0 || storageDelivery.attachmentsStored);
    const deliverySucceeded = storageDeliveryComplete || emailNotification.delivered;
    const responseBody = {
      stored,
      storageConfigured,
      storageDeliveryComplete,
      attachmentsStored: storageDelivery.attachmentsStored,
      storageAttachmentCount: storageDelivery.attachmentCount,
      emailConfigured: emailNotification.configured,
      emailDelivered: emailNotification.delivered,
      emailRecipient: emailNotification.recipient,
      emailAttachmentCount: emailNotification.attachmentCount,
      buyerConfirmationDelivered: emailNotification.buyerConfirmationDelivered,
      backendConfigured: deliverySucceeded,
    };

    if (!deliverySucceeded) {
      return rfqResponse(
        reference,
        {
          ok: false,
          ...responseBody,
          message:
            "Automated RFQ delivery is temporarily unavailable. Please send this inquiry by email or WhatsApp.",
        },
        storageConfigured || emailConfigured ? 502 : 503,
      );
    }

    return rfqResponse(reference, {
      ok: true,
      ...responseBody,
      message: "RFQ submitted successfully.",
    });
  } catch {
    console.error(`[RFQ ${reference}] Unexpected RFQ processing failure.`);

    return rfqResponse(
      reference,
      {
        ok: false,
        message:
          "RFQ submission failed. Please try again or send the inquiry by email or WhatsApp.",
      },
      500,
    );
  }
}
