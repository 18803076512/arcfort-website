import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { getConsoleConfig } from "@/lib/console/config";
import { consoleOriginalsEnabled } from "@/lib/console/working-config";
import { checkInviteOnlyProvider, createConsoleClient } from "@/lib/console/client";
import { isConsoleCommandOrigin } from "@/lib/console/commands";
import { executeOriginalUpload } from "@/lib/console/original-upload";
import { originalUploadFailure, type OriginalUploadResult } from "@/lib/domain/catalog/originals";
import { consolePrivateHeaders } from "@/lib/console/security";

export const runtime = "nodejs";
// The exact upload path skips the 10 MiB middleware body clone but retains /console cookies.
// This route owns its complete origin, configuration, session, role and private-response boundary.
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
  const settings = getConsoleConfig();
  const updates: { name: string; value: string; options: CookieOptions }[] = [];
  const finish = (result: OriginalUploadResult) => {
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
  if (
    !consoleOriginalsEnabled() ||
    settings.status !== "ready" ||
    !isConsoleCommandOrigin(request.headers, settings.config.origin)
  )
    return finish(originalUploadFailure("42501"));
  if (!(await checkInviteOnlyProvider(settings.config))) return finish(originalUploadFailure());
  const client = createConsoleClient(settings.config, {
    getAll: () => request.cookies.getAll(),
    setAll: (values) => {
      updates.push(...values);
      for (const value of values) request.cookies.set(value.name, value.value);
    },
  });
  return finish(await executeOriginalUpload(client, request));
}
