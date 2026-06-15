import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/content/site";

type RfqPayload = {
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  country: string;
  productRequirements: string;
  quantity: string;
  message: string;
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

function cleanField(formData: FormData, field: keyof RfqPayload) {
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
      source_path: "/rfq",
      status: "new",
    }),
  });

  if (!response.ok) {
    throw new Error("RFQ database insert failed.");
  }

  return true;
}

function buildInquiryEmailText(payload: RfqPayload, attachments: AttachmentRecord[]) {
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
  ].join("\n");
}

async function sendEmailNotification(
  payload: RfqPayload,
  attachments: AttachmentRecord[],
): Promise<EmailNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RFQ_EMAIL_FROM;
  const recipient = process.env.RFQ_EMAIL_RECIPIENT || siteConfig.email;

  if (!apiKey || !from) {
    return {
      configured: false,
      delivered: false,
      recipient,
    };
  }

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
      text: buildInquiryEmailText(payload, attachments),
    }),
  });

  if (!response.ok) {
    throw new Error("RFQ email notification failed.");
  }

  return {
    configured: true,
    delivered: true,
    recipient,
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
    };
    const files = getAttachments(formData);
    const errors: Partial<Record<keyof RfqPayload | "attachments", string>> = {};

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
    const emailNotification = await sendEmailNotification(payload, uploadedAttachments);

    return NextResponse.json({
      ok: true,
      stored,
      emailConfigured: emailNotification.configured,
      emailDelivered: emailNotification.delivered,
      emailRecipient: emailNotification.recipient,
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
