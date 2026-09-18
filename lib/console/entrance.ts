import { createRemoteJWKSet } from "jose/jwks/remote";
import { jwtVerify, type JWTVerifyGetKey } from "jose/jwt/verify";
import type { ConsoleConfig } from "./config.ts";
import { isConsoleOrigin } from "./security.ts";

let keySet: { issuer: string; resolve: ReturnType<typeof createRemoteJWKSet> } | undefined;

function accessKeys(issuer: string) {
  if (keySet?.issuer !== issuer) {
    keySet = {
      issuer,
      resolve: createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`), {
        timeoutDuration: 5000,
        cooldownDuration: 30000,
        cacheMaxAge: 300000,
      }),
    };
  }
  return keySet.resolve;
}

// Supabase authorization is still required after this outer entrance check.
// The optional resolver is only used by offline tests; never read it from a request or env.
export async function isConsoleEntrance(
  headers: Headers,
  config: ConsoleConfig,
  mutation = false,
  resolveKey?: JWTVerifyGetKey,
): Promise<boolean> {
  if (!isConsoleOrigin(headers, config.origin, mutation)) return false;
  if (!config.access) return config.origin === "http://127.0.0.1:3000";
  if (headers.get("x-forwarded-proto") !== "https") return false;
  const assertion = headers.get("cf-access-jwt-assertion");
  if (!assertion || assertion.length > 8192) return false;
  try {
    const { payload } = await jwtVerify(assertion, resolveKey ?? accessKeys(config.access.issuer), {
      issuer: config.access.issuer,
      audience: config.access.audience,
      algorithms: ["RS256"],
      requiredClaims: ["exp", "iat", "sub", "email"],
      maxTokenAge: "1h",
    });
    return (
      payload.type === "app" &&
      payload.email === config.access.email &&
      typeof payload.sub === "string" &&
      payload.sub.length > 0
    );
  } catch {
    // Never log tokens, invitation URLs, identities, or provider error payloads.
    return false;
  }
}

export function isStagingConsoleHost(host: string | null) {
  // Classify host variants for denial; authorization still requires the exact canonical Host.
  return /^console-staging\.arcfortweld\.com\.?(?::.*)?$/i.test(host ?? "");
}

export function stagingPathKind(path: string, method: string) {
  if (/%|\\|\/\//.test(path)) return "blocked";
  if ((method === "GET" || method === "HEAD") && path === "/robots.txt") return "robots";
  if ((method === "GET" || method === "HEAD") && path === "/") return "root";
  if (/^\/console(?:\/|$)/.test(path)) {
    return method === "GET" ||
      method === "HEAD" ||
      (method === "POST" && path === "/console/auth/session")
      ? "console"
      : "blocked";
  }
  if ((method === "GET" || method === "HEAD") && path.startsWith("/_next/static/")) return "asset";
  return "blocked";
}
