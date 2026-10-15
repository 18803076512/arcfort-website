import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { getConsoleConfig } from "@/lib/console/config";
import { consoleDocumentsEnabled } from "@/lib/console/working-config";
import { checkInviteOnlyProvider, createConsoleClient } from "@/lib/console/client";
import { isConsoleCommandOrigin } from "@/lib/console/commands";
import { inspectStoredDocument } from "@/lib/console/document-inspection";
import { documentInspectionFailure } from "@/lib/domain/catalog/document-inspection";
import { consolePrivateHeaders } from "@/lib/console/security";
export const runtime = "nodejs";
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
  const finish = (result: Awaited<ReturnType<typeof inspectStoredDocument>>) => {
    const response = result.ok
      ? new NextResponse(Uint8Array.from(result.bytes), {
          headers: {
            ...consolePrivateHeaders,
            "Content-Type": "application/pdf",
            "Content-Length": String(result.bytes.length),
            "Content-Disposition": `attachment; filename="document.pdf"; filename*=UTF-8''${encodeURIComponent(result.download.filename).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)}`,
            "Content-Security-Policy": "sandbox; default-src 'none'",
            "X-Content-Type-Options": "nosniff",
            "Cross-Origin-Resource-Policy": "same-origin",
            "X-Console-Document": encodeURIComponent(JSON.stringify(result.download)),
            ...(result.observation ? { "X-Console-Document-Observation": result.observation } : {}),
          },
        })
      : NextResponse.json(result, {
          status:
            result.code === "42501"
              ? 403
              : result.code === "22023"
                ? 422
                : result.code === "40001"
                  ? 409
                  : result.code === "54000"
                    ? 429
                    : 503,
          headers: consolePrivateHeaders,
        });
    for (const cookie of updates) response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  };
  if (
    !consoleDocumentsEnabled() ||
    settings.status !== "ready" ||
    !isConsoleCommandOrigin(request.headers, settings.config.origin)
  )
    return finish(documentInspectionFailure("42501"));
  if (!(await checkInviteOnlyProvider(settings.config))) return finish(documentInspectionFailure());
  const client = createConsoleClient(settings.config, {
    getAll: () => request.cookies.getAll(),
    setAll: (values) => {
      updates.push(...values);
      for (const value of values) request.cookies.set(value.name, value.value);
    },
  });
  return finish(await inspectStoredDocument(client, request));
}
