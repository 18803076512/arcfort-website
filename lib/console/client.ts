import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { Database } from "../supabase/database.types.ts";
import { consoleCookieOptions, type ConsoleConfig } from "./config.ts";

export function createConsoleClient(config: ConsoleConfig, cookies: CookieMethodsServer) {
  return createServerClient<Database>(config.supabaseUrl, config.publicKey, {
    cookies,
    cookieOptions: consoleCookieOptions(config),
    global: {
      fetch: (url, init) =>
        fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(12000) }),
    },
  });
}

export type ConsoleClient = ReturnType<typeof createConsoleClient>;

export async function checkInviteOnlyProvider(config: ConsoleConfig): Promise<boolean> {
  try {
    const result = await fetch(`${config.supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: config.publicKey },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!result.ok) return false;
    const settings = await result.json();
    return (
      settings.disable_signup === true &&
      settings.mailer_autoconfirm === false &&
      settings.external?.email === true &&
      settings.external?.anonymous_users !== true
    );
  } catch {
    return false;
  }
}
