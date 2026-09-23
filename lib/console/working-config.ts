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
