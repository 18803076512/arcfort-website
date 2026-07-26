import { createHash, randomBytes } from "node:crypto";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimiterOptions = {
  limit: number;
  windowMs: number;
  maxEntries: number;
};

export type RfqRateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
  windowSeconds: number;
};

export const rfqRateLimitConfig = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
  maxEntries: 5000,
} as const;

const processSalt = randomBytes(16).toString("hex");

function hashClientKey(value: string) {
  return createHash("sha256").update(processSalt).update(value).digest("hex");
}

function getForwardedClientIp(headers: Headers) {
  const forwardedValue =
    headers.get("x-vercel-forwarded-for") ||
    headers.get("x-forwarded-for") ||
    headers.get("x-real-ip");
  const candidate = forwardedValue?.split(",", 1)[0]?.trim().slice(0, 128);

  return candidate && /^[0-9a-f:.]+$/i.test(candidate) ? candidate : "";
}

export function getRfqRateLimitClientKey(headers: Headers) {
  const clientIp = getForwardedClientIp(headers);

  if (clientIp) {
    return hashClientKey(`ip:${clientIp}`);
  }

  const userAgent = (headers.get("user-agent") || "unknown").trim().slice(0, 240);
  const acceptLanguage = (headers.get("accept-language") || "unknown").trim().slice(0, 120);

  return hashClientKey(`fallback:${userAgent}:${acceptLanguage}`);
}

export function createFixedWindowRateLimiter({ limit, windowMs, maxEntries }: RateLimiterOptions) {
  if (limit < 1 || windowMs < 1000 || maxEntries < 1) {
    throw new Error("Invalid fixed-window rate limiter configuration.");
  }

  const entries = new Map<string, RateLimitEntry>();
  let checkCount = 0;

  function pruneExpiredEntries(now: number) {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) {
        entries.delete(key);
      }
    }
  }

  function makeResult(entry: RateLimitEntry, allowed: boolean, now: number): RfqRateLimitResult {
    return {
      allowed,
      limit,
      remaining: Math.max(0, limit - entry.count),
      resetAt: entry.resetAt,
      retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      windowSeconds: Math.ceil(windowMs / 1000),
    };
  }

  return {
    check(clientKey: string, now = Date.now()) {
      checkCount += 1;

      if (checkCount % 100 === 0 || entries.size >= maxEntries) {
        pruneExpiredEntries(now);
      }

      const existingEntry = entries.get(clientKey);

      if (existingEntry && existingEntry.resetAt > now) {
        if (existingEntry.count >= limit) {
          return makeResult(existingEntry, false, now);
        }

        existingEntry.count += 1;
        return makeResult(existingEntry, true, now);
      }

      while (entries.size >= maxEntries) {
        const oldestKey = entries.keys().next().value;

        if (typeof oldestKey !== "string") {
          break;
        }

        entries.delete(oldestKey);
      }

      const nextEntry = {
        count: 1,
        resetAt: now + windowMs,
      };
      entries.set(clientKey, nextEntry);

      return makeResult(nextEntry, true, now);
    },
    clear() {
      entries.clear();
      checkCount = 0;
    },
  };
}

const applicationRateLimiter = createFixedWindowRateLimiter(rfqRateLimitConfig);

export function checkRfqRateLimit(headers: Headers, now = Date.now()) {
  return applicationRateLimiter.check(getRfqRateLimitClientKey(headers), now);
}

export function getRfqRateLimitHeaders(result: RfqRateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "X-RateLimit-Policy": `${result.limit};w=${result.windowSeconds}`,
  };
}
