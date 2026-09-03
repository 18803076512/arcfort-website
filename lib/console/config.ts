export type ConsoleConfig = {
  origin: string;
  supabaseUrl: string;
  publicKey: string;
  environment: "local" | "staging";
};

export type ConsoleConfigResult =
  | { status: "ready"; config: ConsoleConfig }
  | { status: "disabled" | "invalid" };

export const stagingProjectRef = "fdsvzuqixppsakukkrsf";

export function getConsoleConfig(
  env: Record<string, string | undefined> = process.env,
): ConsoleConfigResult {
  if (env.CONSOLE_ENABLED !== "true") return { status: "disabled" };
  if (
    env.VERCEL ||
    env.VERCEL_ENV ||
    env.PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE === "true" ||
    env.PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY ||
    !["local", "staging"].includes(env.CONSOLE_ENVIRONMENT ?? "")
  )
    return { status: "invalid" };
  // M2 is local UI only. Hosted preview/production origins need a separate approval.
  if (env.CONSOLE_ORIGIN !== "http://127.0.0.1:3000") return { status: "invalid" };
  const environment = env.CONSOLE_ENVIRONMENT as ConsoleConfig["environment"];
  const expectedUrl =
    environment === "staging"
      ? `https://${stagingProjectRef}.supabase.co`
      : "http://127.0.0.1:54321";
  if (env.CONSOLE_SUPABASE_URL !== expectedUrl) return { status: "invalid" };
  const publicKey = env.CONSOLE_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publicKey)) {
    try {
      const parts = publicKey.split(".");
      if (parts.length !== 3) return { status: "invalid" };
      const claims = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (
        claims.role !== "anon" ||
        (environment === "staging" && claims.ref !== stagingProjectRef)
      ) {
        return { status: "invalid" };
      }
    } catch {
      return { status: "invalid" };
    }
  }
  return {
    status: "ready",
    config: { origin: env.CONSOLE_ORIGIN, supabaseUrl: expectedUrl, publicKey, environment },
  };
}

export const consoleCookieOptions = {
  path: "/console",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
};
