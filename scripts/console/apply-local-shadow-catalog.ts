import { execFileSync } from "node:child_process";
import path from "node:path";

const cliScript = path.resolve("node_modules", "supabase", "dist", "supabase.js");
const rawStatus = execFileSync(process.execPath, [cliScript, "status", "--output", "json"], {
  cwd: process.cwd(),
  encoding: "utf8",
  env: {
    ...process.env,
    SUPABASE_TELEMETRY_DISABLED: "1",
  },
});
const jsonStart = rawStatus.indexOf("{");
if (jsonStart < 0) throw new Error("Supabase CLI did not return local status JSON.");

const status = JSON.parse(rawStatus.slice(jsonStart)) as Record<string, string>;
const url = status.API_URL ?? status.api_url;
const serviceRoleKey = status.SERVICE_ROLE_KEY ?? status.service_role_key;

if (!url || !serviceRoleKey) {
  throw new Error("Local Supabase status is missing API_URL or SERVICE_ROLE_KEY.");
}

process.env.PRODUCT_INTELLIGENCE_SUPABASE_URL = url;
process.env.PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey;
process.env.PRODUCT_INTELLIGENCE_ENVIRONMENT = "local";
process.env.PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE = "true";
process.argv.push("--apply");

await import("./apply-shadow-catalog.ts");
