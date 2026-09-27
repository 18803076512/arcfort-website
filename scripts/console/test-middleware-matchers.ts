import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getPageStaticInfo,
  type MiddlewareMatcher,
} from "next/dist/build/analysis/get-page-static-info.js";
import { getMiddlewareRouteMatcher } from "next/dist/shared/lib/router/utils/middleware-route-matcher.js";
import { originalUploadPath } from "../../lib/domain/catalog/originals.ts";
import { consoleCookieOptions } from "../../lib/console/config.ts";

function verify(matchers: MiddlewareMatcher[], label: string) {
  assert.ok(matchers.length > 0);
  const match = getMiddlewareRouteMatcher(matchers);
  const request = (host: string) => ({ headers: { host } }) as Parameters<typeof match>[1];
  const local = request("127.0.0.1:3000");
  const cookie = consoleCookieOptions({
    origin: "http://127.0.0.1:3000",
    environment: "local",
    supabaseUrl: "http://127.0.0.1:54321",
    publicKey: "sb_publishable_synthetic",
  });
  assert.equal(cookie.path, "/console");
  assert.ok(originalUploadPath.startsWith(cookie.path + "/"));
  for (const pathname of [originalUploadPath, originalUploadPath + "/"])
    assert.equal(match(pathname, local, {}), false, `${label}: exact upload skips body clone`);
  for (const pathname of [
    "/console",
    "/console/",
    "/console/login",
    "/console/auth/session",
    "/console/commands",
    "/console/media",
    "/console/products/10000000-0000-4000-8000-000000000001/originals",
    "/console/originals/child",
    "/console/originals-extra",
    "/console/originals.json",
    "/console/originals.rsc",
    "/console/Originals",
    "/console/%6friginals",
  ])
    assert.equal(match(pathname, local, {}), true, `${label}: ${pathname} retains middleware`);
  for (const pathname of ["/", "/rfq", "/api/rfq", "/api/console/originals", "/console-other"])
    assert.equal(match(pathname, local, {}), false, `${label}: no expanded public middleware`);
  for (const host of [
    "console-staging.arcfortweld.com",
    "console-staging.arcfortweld.com:443",
    "console-staging.arcfortweld.com.",
  ])
    for (const pathname of [
      originalUploadPath,
      originalUploadPath + "/",
      "/",
      "/api/rfq",
      "/console/auth/session",
    ])
      assert.equal(match(pathname, request(host), {}), true, `${label}: staging isolation remains`);
  console.log(
    `PASS ${label}: exact upload exemption, scoped cookie, surrounding routes and staging host coverage.`,
  );
}

const info = await getPageStaticInfo({
  pageFilePath: path.resolve("middleware.ts"),
  nextConfig: {},
  pageType: "pages" as Parameters<typeof getPageStaticInfo>[0]["pageType"],
  page: "/middleware",
  isDev: false,
});
assert.ok(info.middleware?.matchers);
verify(info.middleware.matchers, "Installed Next source parser");
if (process.argv.includes("--built")) {
  const manifest = JSON.parse(await readFile(".next/server/middleware-manifest.json", "utf8"));
  verify(manifest.middleware["/"].matchers, "Production middleware manifest");
}
