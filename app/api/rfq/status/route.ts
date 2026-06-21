import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/content/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function configured(value: string | undefined) {
  return Boolean(value?.trim());
}

export function GET() {
  const resendApiKeyConfigured = configured(process.env.RESEND_API_KEY);
  const emailFromConfigured = configured(process.env.RFQ_EMAIL_FROM);
  const emailRecipient = process.env.RFQ_EMAIL_RECIPIENT || siteConfig.email;
  const emailRecipientConfigured = configured(emailRecipient);
  const supabaseUrlConfigured = configured(process.env.SUPABASE_URL);
  const supabaseServiceRoleConfigured = configured(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const supabaseTableConfigured = configured(process.env.SUPABASE_RFQ_TABLE);
  const supabaseBucketConfigured = configured(process.env.SUPABASE_RFQ_BUCKET);
  const emailReady = resendApiKeyConfigured && emailFromConfigured && emailRecipientConfigured;
  const storageReady =
    supabaseUrlConfigured && supabaseServiceRoleConfigured && supabaseTableConfigured;
  const attachmentStorageReady = storageReady && supabaseBucketConfigured;
  const productionReady = emailReady || storageReady;
  const nextSteps: string[] = [];

  if (!emailReady) {
    nextSteps.push("Configure RESEND_API_KEY and RFQ_EMAIL_FROM in Vercel for email delivery.");
  }

  if (!emailRecipientConfigured) {
    nextSteps.push("Configure RFQ_EMAIL_RECIPIENT in Vercel.");
  }

  if (!storageReady) {
    nextSteps.push("Configure Supabase RFQ variables if inquiry database storage is required.");
  }

  if (storageReady && !attachmentStorageReady) {
    nextSteps.push("Configure SUPABASE_RFQ_BUCKET if attachment storage is required.");
  }

  return NextResponse.json(
    {
      ok: true,
      productionReady,
      email: {
        ready: emailReady,
        resendApiKeyConfigured,
        fromConfigured: emailFromConfigured,
        recipientConfigured: emailRecipientConfigured,
        recipient: emailRecipient,
      },
      storage: {
        ready: storageReady,
        supabaseUrlConfigured,
        serviceRoleConfigured: supabaseServiceRoleConfigured,
        tableConfigured: supabaseTableConfigured,
        attachmentBucketConfigured: supabaseBucketConfigured,
        attachmentStorageReady,
      },
      nextSteps,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
