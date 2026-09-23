export type ConsoleConfig = {
  origin: string;
  supabaseUrl: string;
  publicKey: string;
  environment: "local" | "staging";
  access?: { issuer: string; audience: string; email: string };
};

export type ConsoleConfigResult =
  | { status: "ready"; config: ConsoleConfig }
  | { status: "disabled" | "invalid" };

export const stagingProjectRef = "fdsvzuqixppsakukkrsf";
export const stagingConsoleOrigin = "https://console-staging.arcfortweld.com";

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
  const environment = env.CONSOLE_ENVIRONMENT as ConsoleConfig["environment"];
  let access: ConsoleConfig["access"];
  if (env.CONSOLE_DEPLOYMENT === "access-tunnel") {
    const issuer = env.CONSOLE_ACCESS_ISSUER ?? "";
    const audience = env.CONSOLE_ACCESS_AUDIENCE ?? "";
    const email = env.CONSOLE_ACCESS_EMAIL ?? "";
    if (
      environment !== "staging" ||
      env.CONSOLE_ORIGIN !== stagingConsoleOrigin ||
      !/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.cloudflareaccess\.com$/.test(issuer) ||
      !/^[a-f0-9]{64}$/.test(audience) ||
      email !== "arcfortweld1@outlook.com" ||
      [
        "SUPABASE_SERVICE_ROLE_KEY",
        "RESEND_API_KEY",
        "SUPABASE_AUTH_SMTP_PASS",
        "SUPABASE_ACCESS_TOKEN",
      ].some((name) => Boolean(env[name]))
    )
      return { status: "invalid" };
    access = { issuer, audience, email };
  } else if (
    (env.CONSOLE_DEPLOYMENT && env.CONSOLE_DEPLOYMENT !== "loopback") ||
    env.CONSOLE_ORIGIN !== "http://127.0.0.1:3000" ||
    env.CONSOLE_ACCESS_ISSUER ||
    env.CONSOLE_ACCESS_AUDIENCE ||
    env.CONSOLE_ACCESS_EMAIL
  )
    return { status: "invalid" };
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
    config: {
      origin: env.CONSOLE_ORIGIN,
      supabaseUrl: expectedUrl,
      publicKey,
      environment,
      access,
    },
  };
}

export function consoleCookieOptions(config: ConsoleConfig) {
  return {
    path: "/console",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: new URL(config.origin).protocol === "https:",
  };
}
