import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
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

    return NextResponse.json({
      ok: true,
      stored,
      backendConfigured: stored,
      message: stored
        ? "RFQ submitted successfully."
        : "RFQ validated. Configure Supabase environment variables to store submissions.",
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
