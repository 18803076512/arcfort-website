import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { getConsoleConfig } from "@/lib/console/config";
import { checkInviteOnlyProvider, createConsoleClient } from "@/lib/console/client";
import { checkConsoleAccess } from "@/lib/console/access";
import { consolePrivateHeaders, readConsoleForm } from "@/lib/console/security";
import { isConsoleEntrance } from "@/lib/console/entrance";

export async function POST(request: NextRequest) {
  const settings = getConsoleConfig();
  if (
    settings.status !== "ready" ||
    !(await isConsoleEntrance(request.headers, settings.config, true))
  ) {
    return new NextResponse("Console request unavailable.", {
      status: 403,
      headers: consolePrivateHeaders,
    });
  }
  const config = settings.config;
  if (!(await checkInviteOnlyProvider(config)))
    return new NextResponse("Sign-in is unavailable.", {
      status: 503,
      headers: consolePrivateHeaders,
    });
  const form = await readConsoleForm(request);
  if (!form)
    return new NextResponse("Invalid form.", { status: 400, headers: consolePrivateHeaders });
  const updates: { name: string; value: string; options: CookieOptions }[] = [];
  const client = createConsoleClient(config, {
    getAll: () => request.cookies.getAll(),
    setAll: (values) => {
      updates.push(...values);
      values.forEach(({ name, value }) => request.cookies.set(name, value));
    },
  });
  function finish(path: string) {
    const response = NextResponse.redirect(new URL(path, config.origin), 303);
    Object.entries(consolePrivateHeaders).forEach(([name, value]) =>
      response.headers.set(name, value),
    );
    updates.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    return response;
  }
  const action = form.get("action");
  try {
    if (action === "logout") {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) return finish("/console/login?state=unavailable");
      return finish("/console/login");
    }
    if (action === "confirm") {
      const type = form.get("type");
      const token_hash = form.get("token_hash") ?? "";
      if (!/^[a-f0-9]{40,128}$/.test(token_hash) || (type !== "invite" && type !== "recovery"))
        return finish("/console/login?state=link");
      const { error } = await client.auth.verifyOtp({ token_hash, type });
      return finish(error ? "/console/login?state=link" : "/console/password");
    }
    if (action === "password") {
      const { data, error } = await client.auth.getUser();
      const password = form.get("password") ?? "";
      if (error || !data.user?.email_confirmed_at) return finish("/console/login?state=link");
      if (
        password.length < 12 ||
        password.length > 128 ||
        password !== form.get("confirm_password")
      )
        return finish("/console/password?error=1");
      const updated = await client.auth.updateUser({ password });
      if (updated.error) return finish("/console/password?error=1");
      await client.auth.signOut({ scope: "local" });
      return finish("/console/login?state=password_changed");
    }
    const email = form.get("email")?.trim() ?? "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return finish("/console/login?state=credentials");
    if (action === "recover") {
      await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${config.origin}/console/auth/callback`,
      });
      return finish("/console/recover?sent=1");
    }
    const password = form.get("password") ?? "";
    if (action !== "login" || !password || password.length > 128)
      return finish("/console/login?state=credentials");
    const result = await client.auth.signInWithPassword({ email, password });
    if (result.error) return finish("/console/login?state=credentials");
    const access = await checkConsoleAccess(client);
    return finish(
      access.status === "authorized"
        ? "/console/dashboard"
        : `/console/login?state=${access.status}`,
    );
  } catch {
    return finish("/console/login?state=unavailable");
  }
}
