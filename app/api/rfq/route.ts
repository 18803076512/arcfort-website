import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/content/site";

export const runtime = "nodejs";

type RfqPayload = {
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  country: string;
  productRequirements: string;
  quantity: string;
  message: string;
  sourcePath: string;
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
};

const requiredFields: Array<keyof RfqPayload> = [
  "name",
  "company",
  "email",
  "country",
  "productRequirements",
  "quantity",
];

const allowedFileExtensions = [".pdf", ".xlsx", ".xls", ".csv", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
const maxFiles = 5;
const maxFileSize = 10 * 1024 * 1024;
const maxTotalFileSize = 25 * 1024 * 1024;
const minSubmitDurationMs = 3000;
const maxSubmitAgeMs = 24 * 60 * 60 * 1000;

function cleanField(formData: FormData, field: keyof RfqPayload) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function cleanFormValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
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

function getTotalFileSize(files: File[]) {
  return files.reduce((total, file) => total + file.size, 0);
}

function normalizeSourcePath(sourcePath: string) {
  if (!sourcePath.startsWith("/") || sourcePath.startsWith("//") || sourcePath.length > 240) {
    return "/rfq";
  }

  return sourcePath;
}

function validateStartedAt(startedAt: string) {
  const timestamp = Number(startedAt);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const elapsed = Date.now() - timestamp;
  return elapsed >= minSubmitDurationMs && elapsed <= maxSubmitAgeMs;
}

async function uploadAttachments(
  files: File[],
  supabaseUrl: string,
  serviceRoleKey: string,
  bucket: string,
) {
  const inquiryId = crypto.randomUUID();
  const uploadedAttachments: AttachmentRecord[] = [];

  for (const [index, file] of files.entries()) {
    const objectPath = `${inquiryId}/${index + 1}-${sanitizeFileName(file.name)}`;
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
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      path: objectPath,
    });
  }

  return uploadedAttachments;
}

async function insertSupabaseInquiry(payload: RfqPayload, attachments: AttachmentRecord[]) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_RFQ_TABLE;

  if (!supabaseUrl || !serviceRoleKey || !table) {
    return false;
  }

  const response = await fetch(`${normalizeSupabaseUrl(supabaseUrl)}/rest/v1/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
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
      status: "new",
    }),
  });

  if (!response.ok) {
    throw new Error("RFQ database insert failed.");
  }

  return true;
}

function buildInquiryEmailText(
  payload: RfqPayload,
  attachments: AttachmentRecord[],
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
    `Referrer: ${requestMeta.referrer}`,
    `User Agent: ${requestMeta.userAgent}`,
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
      subject: `ArcFort Weld RFQ - ${payload.company}`,
      text: buildInquiryEmailText(payload, attachments, requestMeta),
      ...(emailAttachments.length > 0 ? { attachments: emailAttachments } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error("RFQ email notification failed.");
  }

  return {
    configured: true,
    delivered: true,
    recipient,
    attachmentCount: emailAttachments.length,
  };
}

export async function POST(request: Request) {
  try {
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid RFQ form data.",
        },
        { status: 400 },
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
    };
    const files = getAttachments(formData);
    const honeypot = cleanFormValue(formData, "website");
    const startedAt = cleanFormValue(formData, "startedAt");
    const errors: Partial<Record<keyof RfqPayload | "attachments", string>> = {};
    const requestMeta = {
      userAgent: (request.headers.get("user-agent") || "Unknown").slice(0, 240),
      referrer: (request.headers.get("referer") || "Direct").slice(0, 240),
    };

    if (honeypot) {
      return NextResponse.json(
        {
          ok: false,
          message: "RFQ submission failed. Please try again.",
        },
        { status: 400 },
      );
    }

    if (!validateStartedAt(startedAt)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please reload the RFQ form and try again.",
        },
        { status: 400 },
      );
    }

    for (const field of requiredFields) {
      if (!payload[field]) {
        errors[field] = "This field is required.";
      }
    }

    if (payload.email && !validateEmail(payload.email)) {
      errors.email = "Please enter a valid business email address.";
    }

    if (files.length > maxFiles) {
      errors.attachments = `Please upload no more than ${maxFiles} files.`;
    }

    if (getTotalFileSize(files) > maxTotalFileSize) {
      errors.attachments = "Total attachment size must be 25 MB or smaller.";
    }

    for (const file of files) {
      const extension = getFileExtension(file.name);

      if (!allowedFileExtensions.includes(extension)) {
        errors.attachments = "Allowed files: PDF, Excel, CSV, Word, JPG and PNG.";
        break;
      }

      if (file.size > maxFileSize) {
        errors.attachments = "Each attachment must be 10 MB or smaller.";
        break;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_RFQ_BUCKET;
    const attachmentMetadata: AttachmentRecord[] = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    }));
    const uploadedAttachments =
      supabaseUrl && serviceRoleKey && bucket
        ? await uploadAttachments(files, supabaseUrl, serviceRoleKey, bucket)
        : attachmentMetadata;
    const stored = await insertSupabaseInquiry(payload, uploadedAttachments);
    const emailNotification = await sendEmailNotification(
      payload,
      uploadedAttachments,
      files,
      requestMeta,
    );

    return NextResponse.json({
      ok: true,
      stored,
      emailConfigured: emailNotification.configured,
      emailDelivered: emailNotification.delivered,
      emailRecipient: emailNotification.recipient,
      emailAttachmentCount: emailNotification.attachmentCount,
      backendConfigured: stored || emailNotification.delivered,
      message:
        stored || emailNotification.delivered
          ? "RFQ submitted successfully."
          : "RFQ validated. Configure Supabase or Resend email environment variables before production launch.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "RFQ submission failed. Please check backend configuration and try again.",
      },
      { status: 500 },
    );
  }
}
