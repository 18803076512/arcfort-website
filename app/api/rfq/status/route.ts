import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/content/site";
import { rfqRateLimitConfig } from "@/lib/rfq-rate-limit";
import { rfqEmailIdempotencyWindowHours } from "@/lib/rfq-idempotency";
import { rfqEmailProviderTimeoutSeconds } from "@/lib/rfq-provider-timeout";
import { rfqStorageConflictColumn } from "@/lib/rfq-storage";

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
  const inquiryCaptureReady = emailReady || storageReady;
  const attachmentDeliveryReady = emailReady || attachmentStorageReady;
  const productionReady = inquiryCaptureReady && attachmentDeliveryReady;
  const deliveryMode =
    emailReady && attachmentStorageReady
      ? "email_and_storage"
      : emailReady
        ? "email"
        : attachmentStorageReady
          ? "storage"
          : "none";
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
      inquiryCaptureReady,
      attachmentDeliveryReady,
      deliveryMode,
      referenceTracking: true,
      botProtection: {
        integrated: true,
        provider: "Vercel BotID",
        checkLevel: "basic",
        protectedPath: "/api/rfq",
        method: "POST",
        fallbackOnVerificationError: true,
      },
      rateLimit: {
        applicationFallback: true,
        distributed: false,
        limit: rfqRateLimitConfig.limit,
        windowSeconds: Math.ceil(rfqRateLimitConfig.windowMs / 1000),
        infrastructureRuleRecommended: true,
      },
      email: {
        ready: emailReady,
        buyerConfirmationReady: emailReady,
        idempotencyProtected: true,
        idempotencyWindowHours: rfqEmailIdempotencyWindowHours,
        providerRequestTimeoutSeconds: rfqEmailProviderTimeoutSeconds,
        resendApiKeyConfigured,
        fromConfigured: emailFromConfigured,
        recipientConfigured: emailRecipientConfigured,
        recipient: emailRecipient,
      },
      storage: {
        ready: storageReady,
        idempotencyProtected: true,
        conflictKey: rfqStorageConflictColumn,
        attachmentRetrySafe: true,
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
