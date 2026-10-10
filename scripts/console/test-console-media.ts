import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { mediaFilters, readMediaAssets, readMediaCoverage } from "../../lib/console/media.ts";
import { ConsoleInputError, ConsoleReadError } from "../../lib/console/catalog.ts";
import {
  mediaCoverage,
  mediaHash,
  mediaThumbnailPath,
  recordedMediaApproval,
} from "../../lib/domain/catalog/media.ts";

const id = "10000000-0000-4000-8000-000000000001";
const assetId = "20000000-0000-4000-8000-000000000001";
const proof = {
  publication: "search_eligible",
  rights: "approved",
  match: "exact_product",
  hasOwner: true,
  hasSource: true,
  hasApproval: true,
};
assert.equal(recordedMediaApproval(proof), true);
for (const change of [
  { publication: "legacy_reference" },
  { rights: "restricted" },
  { match: "product_family_reference" },
  { hasOwner: false },
  { hasSource: false },
  { hasApproval: false },
])
  assert.equal(recordedMediaApproval({ ...proof, ...change }), false);
assert.deepEqual(mediaCoverage([]), {
  main: { mapped: 0, recordedApproval: 0 },
  detail: { mapped: 0, recordedApproval: 0 },
  packaging: { mapped: 0, recordedApproval: 0 },
});
const roles = mediaCoverage([
  { role: "gallery", asset: proof },
  { role: "main", asset: null },
  { role: "main", asset: proof },
  { role: "thread_detail", asset: { ...proof, rights: "needs_confirmation" } },
  { role: "packaging", asset: proof },
]);
assert.deepEqual(roles, {
  main: { mapped: 2, recordedApproval: 1 },
  detail: { mapped: 1, recordedApproval: 0 },
  packaging: { mapped: 1, recordedApproval: 1 },
});
for (const unsafe of [
  null,
  "https://example.invalid/x.jpg",
  "//example.invalid/x.jpg",
  "/images/products/../private.jpg",
  "/images/products/%2e%2e.jpg",
  "/images/products/a.svg",
  "/images/products/a.jpg?token=private",
  "/images/products/folder/a.jpg",
])
  assert.equal(mediaThumbnailPath(unsafe), null);
assert.equal(
  mediaThumbnailPath("/images/products/mig-tip-holder-for-mb15.jpg"),
  "/images/products/mig-tip-holder-for-mb15.jpg",
);
assert.equal(mediaHash("a".repeat(64)), "a".repeat(64));
for (const hash of [null, "", "a".repeat(63), "not-a-hash"]) assert.equal(mediaHash(hash), null);
for (const invalid of [
  { view: "other" },
  { view: ["coverage", "assets"] },
  { rights: "true" },
  { missingView: "gallery" },
  { assignment: "mapped" },
  { match: "confirmed" },
  { variant: "../" },
  { variant: [id] },
  { variant: id, assignment: "unassigned" },
  { page: "0" },
])
  assert.throws(() => mediaFilters(invalid), ConsoleInputError);
console.log("PASS media evidence, coverage, image path, hash and filter contracts");

type Handler = (url: URL) => Response;
function response(data: unknown[], count = data.length, offset = 0) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "content-range": `${offset}-${offset + Math.max(0, data.length - 1)}/${count}`,
    },
  });
}
function fixture(handler: Handler, role: string | null = "viewer") {
  const calls: URL[] = [];
  const client = createClient<Database>(
    "https://media-fixture.example.invalid",
    "synthetic-public-key",
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (input, init) => {
          assert.equal(init?.method, "GET", "Media inspection must not mutate data");
          const url = new URL(String(input));
          calls.push(url);
          const selection = url.searchParams.get("select") ?? "";
          assert.doesNotMatch(
            selection,
            /raw_snapshot|storage_path|storage_bucket|source_file|notes_internal|\*/,
          );
          if (url.pathname.endsWith("/console_user_roles")) return response(role ? [{ role }] : []);
          return handler(url);
        },
      },
    },
  );
  Object.assign(client.auth, {
    getUser: async () => ({
      error: null,
      data: { user: { id, email_confirmed_at: "2026-09-24" } },
    }),
  });
  return { client: client as unknown as ConsoleClient, calls };
}
const rowProof = {
  publication_status: "legacy_reference",
  usage_rights_status: "needs_confirmation",
  content_match_status: "product_family_reference",
  source_owner: "Synthetic owner",
  source_reference: "Synthetic source",
  approved_by: null,
  approved_at: null,
};
const variant = { id, sku: "AF-MIG-QA-9999", products: { name_en: "Synthetic product" } };
const pageFilter = mediaFilters({ q: "50%_", page: "41" });
const coverageFixture = fixture((url) => {
  if (url.pathname.endsWith("/product_variants")) {
    assert.equal(url.searchParams.get("offset"), "1000");
    assert.equal(url.searchParams.get("limit"), "25");
    assert.equal(url.searchParams.get("sku"), "ilike.%50\\%\\_%");
    return response([variant], 1001, 1000);
  }
  assert.ok(url.pathname.endsWith("/product_media"));
  assert.equal(url.searchParams.get("product_variant_id"), `in.(${id})`);
  const offset = Number(url.searchParams.get("offset"));
  // A provider cap below requested size must not truncate the coverage inventory.
  return response(
    Array.from({ length: Math.min(100, 1103 - offset) }, (_, index) => ({
      id: `link-${offset + index}`,
      product_variant_id: id,
      role: offset + index === 1102 ? "packaging" : "main",
      media_assets: rowProof,
    })),
    1103,
    offset,
  );
});
const coverage = await readMediaCoverage(coverageFixture.client, pageFilter);
assert.equal(coverage.total, 1001);
assert.deepEqual(coverage.items[0].coverage, {
  main: { mapped: 1102, recordedApproval: 0 },
  detail: { mapped: 0, recordedApproval: 0 },
  packaging: { mapped: 1, recordedApproval: 0 },
});
assert.equal(
  coverageFixture.calls.filter((url) => url.pathname.endsWith("/product_media")).length,
  12,
);
assert.doesNotMatch(
  JSON.stringify(coverage),
  /Synthetic owner|Synthetic source|approved_by|source_owner/,
);
console.log(
  "PASS real Supabase query transport, escaped search and 1,103-link coverage pagination",
);

const assetFixture = fixture((url) => {
  if (url.pathname.endsWith("/product_media"))
    return response([
      {
        id: "mapping",
        media_asset_id: assetId,
        role: "main",
        product_variants: { id, sku: variant.sku },
      },
    ]);
  if (url.searchParams.has("file_hash")) {
    assert.equal(url.searchParams.get("file_hash"), `in.(${"a".repeat(64)})`);
    return response([
      { id: assetId, file_hash: "a".repeat(64) },
      { id: "other-page-asset", file_hash: "a".repeat(64) },
    ]);
  }
  assert.equal(url.searchParams.get("product_media"), "not.is.null");
  assert.equal(url.searchParams.get("product_media.product_variant_id"), `eq.${id}`);
  assert.equal(url.searchParams.get("publication_status"), "eq.legacy_reference");
  return response([
    {
      id: assetId,
      external_key: "Synthetic asset",
      public_path: "/images/products/mig-tip-holder-for-mb15.jpg",
      source_kind: "company_catalog",
      file_hash: "a".repeat(64),
      ...rowProof,
    },
  ]);
});
const assets = await readMediaAssets(
  assetFixture.client,
  mediaFilters({ view: "assets", variant: id, publication: "legacy_reference" }),
);
assert.equal(assets.items[0].sameHashAssets, 2);
assert.equal(assets.items[0].assignments[0].sku, variant.sku);
assert.equal(assets.items[0].recordedApproval, false);
assert.doesNotMatch(
  JSON.stringify(assets),
  /Synthetic owner|Synthetic source|approved_by|source_owner|file_hash/,
);
const unassigned = fixture((url) => {
  assert.equal(url.searchParams.get("product_media"), "is.null");
  return response([]);
});
assert.equal(
  (
    await readMediaAssets(
      unassigned.client,
      mediaFilters({ view: "assets", assignment: "unassigned" }),
    )
  ).total,
  0,
);
console.log("PASS inventory filters, anti-join, global recorded-hash duplicates and minimal DTOs");

for (const reader of [readMediaAssets, readMediaCoverage]) {
  const denied = fixture(() => {
    throw new Error("Catalog accessed without current role");
  }, null);
  await assert.rejects(reader(denied.client, mediaFilters({})), ConsoleReadError);
  assert.equal(denied.calls.length, 1);
  const failed = fixture(
    () => new Response(JSON.stringify({ message: "private provider detail" }), { status: 403 }),
  );
  await assert.rejects(
    reader(failed.client, mediaFilters({})),
    (error: unknown) => error instanceof ConsoleReadError && !error.message.includes("private"),
  );
}
for (const failure of ["empty", "duplicate", "count-drift", "oversized"] as const) {
  let call = 0;
  const broken = fixture((url) => {
    if (url.pathname.endsWith("/product_variants")) return response([variant]);
    call++;
    if (failure === "empty") return response([], 3);
    if (failure === "oversized") return response([], 10001);
    return response(
      [{ id: "repeated", product_variant_id: id, role: "main", media_assets: rowProof }],
      failure === "count-drift" && call > 1 ? 3 : 2,
    );
  });
  await assert.rejects(
    readMediaCoverage(broken.client, mediaFilters({})),
    ConsoleReadError,
    failure,
  );
}
console.log(
  "PASS current-role denial, provider errors and incomplete/drifting/duplicate/oversized reads fail closed",
);
for (const reader of [readMediaAssets, readMediaCoverage]) {
  const truncated = fixture(() => response([], 2));
  await assert.rejects(reader(truncated.client, mediaFilters({})), ConsoleReadError);
}
assert.equal(
  mediaCoverage([
    { role: "front", asset: proof },
    { role: "45_degree", asset: proof },
  ]).detail.mapped,
  0,
);
for (const missingView of ["main", "detail", "packaging"]) {
  const missing = fixture((url) => {
    assert.ok(url.pathname.endsWith("/product_variants"));
    assert.ok(url.searchParams.get("select")?.includes("missing_media:product_media()"));
    assert.equal(url.searchParams.get("missing_media"), "is.null");
    assert.equal(
      url.searchParams.get("missing_media.role"),
      missingView === "detail"
        ? "in.(thread_detail,hole_detail,surface_detail,dimension,technical)"
        : `eq.${missingView}`,
    );
    return response([]);
  });
  assert.equal((await readMediaCoverage(missing.client, mediaFilters({ missingView }))).total, 0);
}
console.log(
  "PASS complete parent pages, global missing-view filters and conservative detail coverage",
);
