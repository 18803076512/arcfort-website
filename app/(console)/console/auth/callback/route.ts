import { NextResponse, type NextRequest } from "next/server";
import { getConsoleConfig } from "@/lib/console/config";
import { checkInviteOnlyProvider, createConsoleClient } from "@/lib/console/client";
import { consolePrivateHeaders } from "@/lib/console/security";
import { isConsoleEntrance } from "@/lib/console/entrance";

export async function GET(request: NextRequest) {
  const settings = getConsoleConfig();
  if (settings.status !== "ready" || !(await isConsoleEntrance(request.headers, settings.config)))
    return new NextResponse("Unavailable.", { status: 403, headers: consolePrivateHeaders });
  const config = settings.config;
  const response = NextResponse.redirect(new URL("/console/login?state=link", config.origin));
  Object.entries(consolePrivateHeaders).forEach(([name, value]) =>
    response.headers.set(name, value),
  );
  const code = request.nextUrl.searchParams.get("code");
  if (!code || code.length > 512 || !(await checkInviteOnlyProvider(config))) return response;
  const client = createConsoleClient(config, {
    getAll: () => request.cookies.getAll(),
    setAll: (values) => {
      values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    },
  });
  try {
    const result = await client.auth.exchangeCodeForSession(code);
    if (!result.error) response.headers.set("Location", `${config.origin}/console/password`);
  } catch {
    /* A failed or replayed PKCE code never grants access. */
  }
  return response;
}
