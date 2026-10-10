import { getConsoleConfig } from "./config.ts";

export function consoleWorkingEnabled(env: Record<string, string | undefined> = process.env) {
  const settings = getConsoleConfig(env);
  return (
    env.CONSOLE_WORKING_ENABLED === "true" &&
    settings.status === "ready" &&
    settings.config.environment === "local" &&
    !settings.config.access &&
    settings.config.origin === "http://127.0.0.1:3000" &&
    settings.config.supabaseUrl === "http://127.0.0.1:54321"
  );
}

export function consoleCompatibilityEnabled(env: Record<string, string | undefined> = process.env) {
  return env.CONSOLE_COMPATIBILITY_ENABLED === "true" && consoleWorkingEnabled(env);
}

export function consoleOriginalsEnabled(env: Record<string, string | undefined> = process.env) {
  return env.CONSOLE_ORIGINALS_ENABLED === "true" && consoleWorkingEnabled(env);
}

export function consoleMediaReviewEnabled(env: Record<string, string | undefined> = process.env) {
  return env.CONSOLE_MEDIA_REVIEW_ENABLED === "true" && consoleOriginalsEnabled(env);
}

export function consoleOemEnabled(env: Record<string, string | undefined> = process.env) {
  return env.CONSOLE_OEM_ENABLED === "true" && consoleWorkingEnabled(env);
}

export function consolePackagingEnabled(env: Record<string, string | undefined> = process.env) {
  return env.CONSOLE_PACKAGING_ENABLED === "true" && consoleWorkingEnabled(env);
}
