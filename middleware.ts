import { NextResponse, type NextRequest } from "next/server";
import { getConsoleConfig, stagingConsoleOrigin } from "@/lib/console/config";
import { createConsoleClient } from "@/lib/console/client";
import { consolePrivateHeaders } from "@/lib/console/security";
import { isConsoleEntrance, isStagingConsoleHost, stagingPathKind } from "@/lib/console/entrance";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const settings = getConsoleConfig();
  const entrance =
    settings.status === "ready" &&
    (await isConsoleEntrance(request.headers, settings.config, request.method === "POST"));
  if (isStagingConsoleHost(request.headers.get("host"))) {
    const kind = stagingPathKind(request.nextUrl.pathname, request.method);
    if (kind === "robots")
      return new NextResponse("User-agent: *\nDisallow: /\n", {
        headers: { ...consolePrivateHeaders, "Content-Type": "text/plain; charset=utf-8" },
      });
    if (kind === "blocked")
      return new NextResponse("Not found.", {
        status: 404,
        headers: consolePrivateHeaders,
      });
    if (!entrance || settings.status !== "ready" || !settings.config.access)
      return new NextResponse("Access required.", { status: 403, headers: consolePrivateHeaders });
    if (kind === "root") {
      const redirect = NextResponse.redirect(new URL("/console/login", stagingConsoleOrigin));
      Object.entries(consolePrivateHeaders).forEach(([key, value]) =>
        redirect.headers.set(key, value),
      );
      return redirect;
    }
  }
  if (
    settings.status === "ready" &&
    entrance &&
    stagingPathKind(request.nextUrl.pathname, request.method) === "console"
  ) {
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

export const config = {
  matcher: [
    "/console/:path*",
    {
      source: "/:path*",
      has: [{ type: "host", value: "console-staging\\.arcfortweld\\.com\\.?" }],
    },
  ],
};
