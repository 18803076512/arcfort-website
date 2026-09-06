import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import { createConsoleClient, checkInviteOnlyProvider } from "../../lib/console/client.ts";
import { checkConsoleAccess } from "../../lib/console/access.ts";
import {
  filters,
  readDashboard,
  readProducts,
  readSeries,
  readSeriesDetail,
  readProductDetail,
  readReadiness,
  readTechnicalData,
} from "../../lib/console/catalog.ts";
import type { CookieOptions } from "@supabase/ssr";

// Synthetic accounts and records belong exclusively to the disposable Linux CI database.
// Never use this account-creation path, auto-confirmation or fixture data on hosted staging.
if (process.env.CI !== "true" || !process.argv.includes("--local"))
  throw new Error("Disposable local CI only.");
let status: Record<string, string>;
try {
  const raw = execFileSync(
    process.execPath,
    [path.resolve("node_modules/supabase/dist/supabase.js"), "status", "--output", "json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  status = JSON.parse(raw.slice(raw.indexOf("{")));
} catch {
  throw new Error("Local Supabase status unavailable.");
}
const url = status.API_URL ?? status.api_url;
const key = status.ANON_KEY ?? status.anon_key;
const adminKey = status.SERVICE_ROLE_KEY ?? status.service_role_key;
assert.equal(url, "http://127.0.0.1:54321");
assert.ok(key && adminKey);
const config = {
  origin: "http://127.0.0.1:3000",
  supabaseUrl: url,
  publicKey: key,
  environment: "local" as const,
};
assert.equal(await checkInviteOnlyProvider(config), true);
const admin = createClient<Database>(url, adminKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
function cookieClient() {
  const jar = new Map<string, string>();
  const writes: { name: string; value: string; options: CookieOptions }[] = [];
  const client = createConsoleClient(config, {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (values, headers) => {
      assert.match(headers["Cache-Control"], /no-store/);
      for (const item of values) {
        writes.push(item);
        if (item.value) jar.set(item.name, item.value);
        else jar.delete(item.name);
      }
    },
  });
  return { client, jar, writes };
}
async function createFixture(role?: "owner" | "viewer") {
  const email = `console-qa-${randomUUID()}@example.invalid`;
  const password = randomUUID() + randomUUID();
  const user = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "owner" },
  });
  if (user.error || !user.data.user) throw new Error("Isolated account fixture failed.");
  if (role) {
    const result = await admin
      .from("console_user_roles")
      .insert({ user_id: user.data.user.id, role });
    if (result.error) throw new Error("Isolated role fixture failed.");
  }
  const session = cookieClient();
  const login = await session.client.auth.signInWithPassword({ email, password });
  if (login.error) throw new Error("Isolated fixture login failed.");
  return { ...session, id: user.data.user.id };
}

const anon = cookieClient();
assert.equal((await checkConsoleAccess(anon.client)).status, "unauthenticated");
await assert.rejects(() => readDashboard(anon.client));
const noRole = await createFixture();
assert.equal((await checkConsoleAccess(noRole.client)).status, "no_role");
await assert.rejects(() => readProducts(noRole.client, filters({})));
const owner = await createFixture("owner");
const viewer = await createFixture("viewer");
assert.equal((await checkConsoleAccess(owner.client)).status, "authorized");
assert.equal((await checkConsoleAccess(viewer.client)).status, "authorized");
assert.notDeepEqual([...owner.jar], [...viewer.jar]);
assert.ok(owner.writes.length > 0);
for (const cookie of owner.writes) {
  assert.equal(cookie.options.path, "/console");
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.sameSite, "lax");
  assert.equal(cookie.options.secure, false);
  assert.equal(cookie.options.domain, undefined);
}
const initial = await readDashboard(viewer.client);
assert.equal(initial.metrics.total_products, 43);
assert.equal(initial.metrics.data_conflicts, 14);
assert.equal(initial.metrics.published_products, 0);
const productPage = await readProducts(viewer.client, filters({}));
assert.equal(productPage.total, 43);
assert.equal(productPage.items.length, 25);
const detail = await readProductDetail(viewer.client, productPage.items[0].id);
assert.ok(detail);
const series = await readSeries(viewer.client, filters({}));
assert.equal(series.total, 10);
assert.ok(await readSeriesDetail(viewer.client, series.items[0].id, filters({})));
assert.equal(
  (await readTechnicalData(viewer.client, filters({ verification: "DATA_CONFLICT" }))).total,
  14,
);
assert.equal((await readReadiness(viewer.client, filters({ blocker: "image" }))).total, 43);
for (const value of [productPage, detail, series]) {
  const serialized = JSON.stringify(value);
  for (const forbidden of [
    "raw_snapshot",
    "notes_internal",
    "private_storage_path",
    "storage_path",
    "access_token",
  ])
    assert.equal(serialized.includes(forbidden), false);
}
const deniedWrite = await viewer.client
  .from("product_variants")
  .update({ model: "MUST NOT WRITE" })
  .eq("id", productPage.items[0].id)
  .select("id");
assert.ok(deniedWrite.error || deniedWrite.data?.length === 0);
const unchanged = await readProductDetail(owner.client, productPage.items[0].id);
assert.notEqual(unchanged?.identity.model, "MUST NOT WRITE");

const categoryId = productPage.categories[0].id;
const familyId = randomUUID();
const family = await admin.from("products").insert({
  id: familyId,
  external_key: `qa-${familyId}`,
  category_id: categoryId,
  name_en: "QA pagination fixture",
  product_type: "welding-consumable",
  source_type: "unknown",
});
if (family.error) throw new Error("Isolated family fixture failed.");
for (let start = 0; start < 1103; start += 100) {
  const values = Array.from({ length: Math.min(100, 1103 - start) }, (_, offset) => ({
    product_id: familyId,
    category_id: categoryId,
    sku: `AF-ACC-QA-${String(2000 + start + offset)}`,
    public_slug: `qa-page-${start + offset}`,
    is_shadow: false,
    lifecycle_state: "DRAFT" as const,
    legacy_status: "draft",
    legacy_data_status: "needs_review",
    legacy_image_status: "needs_photo",
    legacy_compatibility_status: "unverified",
    legacy_oem_status: "unknown",
  }));
  const result = await admin.from("product_variants").insert(values);
  if (result.error) throw new Error("Isolated pagination fixture failed.");
}
const first = await readProducts(viewer.client, filters({ q: "AF-ACC-QA-" }));
const afterCap = await readProducts(viewer.client, filters({ q: "AF-ACC-QA-", page: "41" }));
const last = await readProducts(viewer.client, filters({ q: "AF-ACC-QA-", page: "45" }));
assert.equal(first.total, 1103);
assert.equal(first.items.length, 25);
assert.equal(afterCap.items.length, 25);
assert.equal(last.items.length, 3);
assert.equal(afterCap.items[0].sku, "AF-ACC-QA-3000");
assert.equal(last.items[2].sku, "AF-ACC-QA-3102");
assert.equal(
  new Set([...first.items, ...afterCap.items, ...last.items].map((item) => item.id)).size,
  53,
);
assert.equal(
  (await readProducts(viewer.client, filters({ q: "QA pagination", searchBy: "name" }))).total,
  1103,
);
const refreshed = await viewer.client.auth.refreshSession();
assert.equal(refreshed.error, null);
assert.equal((await checkConsoleAccess(viewer.client)).status, "authorized");
const revoked = await admin
  .from("console_user_roles")
  .update({ revoked_at: new Date().toISOString() })
  .eq("user_id", viewer.id);
if (revoked.error) throw new Error("Isolated revocation failed.");
assert.equal((await checkConsoleAccess(viewer.client)).status, "no_role");
await assert.rejects(() => readDashboard(viewer.client));
assert.equal((await checkConsoleAccess(owner.client)).status, "authorized");
await owner.client.auth.signOut({ scope: "local" });
assert.equal((await checkConsoleAccess(owner.client)).status, "unauthenticated");
assert.equal(owner.jar.size, 0);
console.log(
  "Isolated Console Auth/RLS, cookie refresh, role revocation, DTO privacy and 1,103-row pagination passed. Synthetic fixtures are discarded with the CI stack; no hosted users or data were changed.",
);
