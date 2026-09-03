import { NextResponse, type NextRequest } from "next/server";
import { getConsoleConfig } from "@/lib/console/config";
import { createConsoleClient } from "@/lib/console/client";
import { consolePrivateHeaders, isConsoleOrigin } from "@/lib/console/security";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const settings = getConsoleConfig();
  if (settings.status === "ready" && isConsoleOrigin(request.headers, settings.config.origin)) {
    const client = createConsoleClient(settings.config, {
      getAll: () => request.cookies.getAll(),
      setAll: (values, cacheHeaders) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cacheHeaders).forEach(([name, value]) => response.headers.set(name, value));
      },
    });
    // Refresh only; each server query independently verifies identity and current database roles.
    try {
      await client.auth.getUser();
    } catch {
      /* DAL fails closed on provider failure. */
    }
  }
  for (const [name, value] of Object.entries(consolePrivateHeaders))
    response.headers.set(name, value);
  return response;
}

export const config = { matcher: ["/console/:path*"] };
