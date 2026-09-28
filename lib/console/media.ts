import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { readAllConsoleRows } from "./read-pages.ts";
import {
  ConsoleInputError,
  ConsoleReadError,
  filters,
  literalPattern,
  pageSize,
  uuid,
  type SearchParams,
} from "./catalog.ts";
import {
  detailMediaRoles,
  mediaCoverage,
  mediaHash,
  mediaThumbnailPath,
  recordedMediaApproval,
} from "../domain/catalog/media.ts";

export const mediaPublications = [
  "search_eligible",
  "legacy_reference",
  "display_only",
  "blocked",
] as const;
export const mediaRights = ["approved", "needs_confirmation", "restricted"] as const;
export const mediaMatches = [
  "exact_product",
  "product_family_reference",
  "needs_review",
  "rejected",
] as const;

export function mediaFilters(params: SearchParams) {
  const base = filters(params);
  const option = (key: string, allowed: readonly string[], fallback = "") => {
    const value = params[key] ?? fallback;
    if (typeof value !== "string" || !allowed.includes(value)) throw new ConsoleInputError();
    return value;
  };
  const variant = params.variant ?? "";
  if (typeof variant !== "string") throw new ConsoleInputError();
  if (variant) uuid(variant);
  if (variant && params.assignment === "unassigned") throw new ConsoleInputError();
  return {
    ...base,
    variant,
    view: option("view", ["coverage", "assets"], "coverage"),
    publication: option("publication", ["", ...mediaPublications]),
    rights: option("rights", ["", ...mediaRights]),
    match: option("match", ["", ...mediaMatches]),
    assignment: option("assignment", ["all", "unassigned"], "all"),
    missingView: option("missingView", ["", "main", "detail", "packaging"]),
  };
}
export type MediaFilters = ReturnType<typeof mediaFilters>;

async function authorize(client: ConsoleClient) {
  if ((await checkConsoleAccess(client)).status !== "authorized") throw new ConsoleReadError();
}

type Result<T> = { data: T[] | null; count: number | null; error: unknown };
function checked<T>(result: Result<T>) {
  if (result.error || !result.data || !Number.isSafeInteger(result.count) || result.count! < 0)
    throw new ConsoleReadError();
  return { items: result.data, total: result.count! };
}

function checkedPage<T extends { id: string }>(result: Result<T>, page: number) {
  const value = checked(result);
  const expected = Math.min(pageSize, Math.max(0, value.total - (page - 1) * pageSize));
  if (
    value.items.length !== expected ||
    new Set(value.items.map((item) => item.id)).size !== expected
  )
    throw new ConsoleReadError();
  return value;
}

// Fetch only relationships for the visible page. Exact counts prevent API row caps
// or concurrent edits from silently turning a partial result into a missing-view claim.
async function allScoped<T extends { id: string }>(
  fetchPage: (start: number, end: number) => PromiseLike<Result<T>>,
) {
  return readAllConsoleRows(fetchPage, (row) => row.id);
}

const evidenceColumns =
  "publication_status,usage_rights_status,content_match_status,source_owner,source_reference,approved_by,approved_at" as const;
type EvidenceRow = {
  publication_status: string;
  usage_rights_status: string;
  content_match_status: string;
  source_owner: string | null;
  source_reference: string;
  approved_by: string | null;
  approved_at: string | null;
};
function evidence(row: EvidenceRow) {
  return {
    publication: row.publication_status,
    rights: row.usage_rights_status,
    match: row.content_match_status,
    hasOwner: Boolean(row.source_owner?.trim()),
    hasSource: Boolean(row.source_reference.trim()),
    hasApproval: Boolean(row.approved_by && row.approved_at),
  };
}

export async function readMediaCoverage(client: ConsoleClient, filter: MediaFilters) {
  await authorize(client);
  let query = client
    .from("product_variants")
    .select("id,sku,products!inner(name_en),missing_media:product_media()", { count: "exact" });
  if (filter.missingView) {
    query =
      filter.missingView === "detail"
        ? query.in("missing_media.role", [...detailMediaRoles])
        : query.eq("missing_media.role", filter.missingView);
    query = query.is("missing_media", null);
  }
  if (filter.variant) query = query.eq("id", filter.variant);
  if (filter.q)
    query =
      filter.searchBy === "name"
        ? query.ilike("products.name_en", literalPattern(filter.q))
        : query.ilike("sku", literalPattern(filter.q));
  const result = checkedPage(
    await query
      .order("sku")
      .order("id")
      .range((filter.page - 1) * pageSize, filter.page * pageSize - 1),
    filter.page,
  );
  const ids = result.items.map((item) => item.id);
  const links = ids.length
    ? await allScoped((start, end) =>
        client
          .from("product_media")
          .select(`id,product_variant_id,role,media_assets(${evidenceColumns})`, { count: "exact" })
          .in("product_variant_id", ids)
          .order("id")
          .range(start, end),
      )
    : [];
  return {
    view: "coverage" as const,
    total: result.total,
    page: filter.page,
    pageSize,
    items: result.items.map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.products.name_en,
      coverage: mediaCoverage(
        links
          .filter((link) => link.product_variant_id === item.id)
          .map((link) => ({
            role: link.role,
            asset: link.media_assets ? evidence(link.media_assets) : null,
          })),
      ),
    })),
  };
}

export async function readMediaAssets(client: ConsoleClient, filter: MediaFilters) {
  await authorize(client);
  let query = client
    .from("media_assets")
    .select(
      `id,external_key,public_path,file_hash,source_kind,${evidenceColumns},product_media()`,
      { count: "exact" },
    );
  if (filter.q) query = query.ilike("external_key", literalPattern(filter.q));
  if (filter.publication) query = query.eq("publication_status", filter.publication);
  if (filter.rights) query = query.eq("usage_rights_status", filter.rights);
  if (filter.match) query = query.eq("content_match_status", filter.match);
  if (filter.assignment === "unassigned") query = query.is("product_media", null);
  if (filter.variant)
    query = query
      .eq("product_media.product_variant_id", filter.variant)
      .not("product_media", "is", null);
  const result = checkedPage(
    await query
      .order("external_key")
      .order("id")
      .range((filter.page - 1) * pageSize, filter.page * pageSize - 1),
    filter.page,
  );
  const ids = result.items.map((item) => item.id);
  const links = ids.length
    ? await allScoped((start, end) =>
        client
          .from("product_media")
          .select("id,media_asset_id,role,product_variants(id,sku)", { count: "exact" })
          .in("media_asset_id", ids)
          .order("id")
          .range(start, end),
      )
    : [];
  const hashes = [
    ...new Set(
      result.items
        .map((item) => mediaHash(item.file_hash))
        .filter((hash): hash is string => Boolean(hash)),
    ),
  ];
  const duplicates = hashes.length
    ? await allScoped((start, end) =>
        client
          .from("media_assets")
          .select("id,file_hash", { count: "exact" })
          .in("file_hash", hashes)
          .order("id")
          .range(start, end),
      )
    : [];
  if (
    result.items.some(
      (item) =>
        mediaHash(item.file_hash) &&
        !duplicates.some((other) => other.id === item.id && other.file_hash === item.file_hash),
    )
  )
    throw new ConsoleReadError();
  return {
    view: "assets" as const,
    total: result.total,
    page: filter.page,
    pageSize,
    items: result.items.map((item) => {
      const proof = evidence(item);
      const hash = mediaHash(item.file_hash);
      return {
        id: item.id,
        key: item.external_key,
        thumbnail: mediaThumbnailPath(item.public_path),
        invalidPublicPath: Boolean(item.public_path && !mediaThumbnailPath(item.public_path)),
        sourceKind: item.source_kind,
        publication: proof.publication,
        rights: proof.rights,
        match: proof.match,
        recordedApproval: recordedMediaApproval(proof),
        hashState: hash ? "recorded" : item.file_hash ? "invalid" : "missing",
        sameHashAssets: hash ? duplicates.filter((other) => other.file_hash === hash).length : null,
        assignments: links
          .filter((link) => link.media_asset_id === item.id)
          .map((link) => ({
            id: link.id,
            role: link.role,
            variantId: link.product_variants?.id ?? null,
            sku: link.product_variants?.sku ?? null,
          })),
      };
    }),
  };
}
export type MediaData =
  | Awaited<ReturnType<typeof readMediaCoverage>>
  | Awaited<ReturnType<typeof readMediaAssets>>;
