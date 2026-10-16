import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { getConsoleConfig } from "@/lib/console/config";
import { consoleDocumentsEnabled } from "@/lib/console/working-config";
import { checkInviteOnlyProvider, createConsoleClient } from "@/lib/console/client";
import { isConsoleCommandOrigin } from "@/lib/console/commands";
import { executeDocumentUpload } from "@/lib/console/document-upload";
import { documentUploadFailure, type DocumentUploadResult } from "@/lib/domain/catalog/documents";
import { consolePrivateHeaders } from "@/lib/console/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// This exact raw upload owns auth/refresh and privacy; middleware must not clone its large body.
export function GET() {
  return new NextResponse(null, {
    status: 405,
    headers: { ...consolePrivateHeaders, Allow: "POST" },
  });
}
export const HEAD = GET;
export const OPTIONS = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
export async function POST(request: NextRequest) {
  const updates: { name: string; value: string; options: CookieOptions }[] = [];
  const finish = (result: DocumentUploadResult) => {
    if (!request.bodyUsed) void request.body?.cancel().catch(() => {});
    const status = result.ok
      ? 200
      : result.code === "42501"
        ? 403
        : result.code === "40001"
          ? 409
          : result.code === "54000"
            ? 429
            : result.code === "22023"
              ? 422
              : 503;
    const response = NextResponse.json(result, { status, headers: consolePrivateHeaders });
    for (const cookie of updates) response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  };
  try {
    const settings = getConsoleConfig();
    if (
      !consoleDocumentsEnabled() ||
      settings.status !== "ready" ||
      request.signal.aborted ||
      !isConsoleCommandOrigin(request.headers, settings.config.origin)
    )
      return finish(documentUploadFailure("42501"));
    if (!(await checkInviteOnlyProvider(settings.config))) return finish(documentUploadFailure());
    const client = createConsoleClient(settings.config, {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        updates.push(...values);
        for (const value of values) request.cookies.set(value.name, value.value);
      },
    });
    return finish(await executeDocumentUpload(client, request));
  } catch {
    return finish(documentUploadFailure());
  }
}
