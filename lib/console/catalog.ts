import { Constants } from "../supabase/database.types.ts";
import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";

export class ConsoleReadError extends Error {
  constructor() {
    super("Console data is unavailable.");
  }
}
export class ConsoleInputError extends Error {
  constructor() {
    super("Invalid Console filter.");
  }
}
export const pageSize = 25;
export const lifecycleStates = Constants.public.Enums.pi_product_lifecycle;
export const verificationStates = Constants.public.Enums.pi_verification_status;
export type SearchParams = Record<string, string | string[] | undefined>;
export function uuid(value: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))
    throw new ConsoleInputError();
  return value;
}
function single(params: SearchParams, key: string) {
  const value = params[key];
  if (Array.isArray(value)) throw new ConsoleInputError();
  return value ?? "";
}
export function filters(params: SearchParams) {
  const pageText = single(params, "page") || "1";
  if (!/^[1-9][0-9]{0,4}$/.test(pageText)) throw new ConsoleInputError();
  const q = single(params, "q").trim();
  if (q.length > 80 || /[\u0000-\u001f]/.test(q)) throw new ConsoleInputError();
  const category = single(params, "category");
  if (category) uuid(category);
  const lifecycle = single(params, "lifecycle");
  if (lifecycle && !lifecycleStates.some((value) => value === lifecycle))
    throw new ConsoleInputError();
  const verification = single(params, "verification");
  if (verification && !verificationStates.some((value) => value === verification))
    throw new ConsoleInputError();
  const searchBy = single(params, "searchBy") || "sku";
  if (!["sku", "name"].includes(searchBy)) throw new ConsoleInputError();
  const blocker = single(params, "blocker") || "all";
  if (!["all", "technical", "image", "compatibility", "seo"].includes(blocker))
    throw new ConsoleInputError();
  return { page: Number(pageText), q, category, lifecycle, verification, searchBy, blocker };
}
export type Filters = ReturnType<typeof filters>;
export function literalPattern(value: string) {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}
function range(filter: Filters): [number, number] {
  return [(filter.page - 1) * pageSize, filter.page * pageSize - 1];
}
async function authorize(client: ConsoleClient) {
  if ((await checkConsoleAccess(client)).status !== "authorized") throw new ConsoleReadError();
}
function rows<T>(result: { data: T[] | null; error: unknown }): T[] {
  if (result.error || !result.data) throw new ConsoleReadError();
  return result.data;
}
function page<T>(
  result: { data: T[] | null; error: unknown; count: number | null },
  filter: Filters,
) {
  const items = rows(result);
  if (result.count === null || result.count < 0) throw new ConsoleReadError();
  return { items, total: result.count, page: filter.page, pageSize };
}

export async function readDashboard(client: ConsoleClient) {
  await authorize(client);
  const result = rows(await client.from("pi_dashboard_metrics").select("metric,value"));
  const expected = [
    "total_products",
    "shadow_products",
    "verified_products",
    "ready_for_publish",
    "published_products",
    "needs_factory_confirmation",
    "data_conflicts",
    "missing_eligible_main_images",
    "unconfirmed_compatibility",
  ];
  if (
    result.length !== expected.length ||
    expected.some((key) => result.filter((row) => row.metric === key).length !== 1) ||
    result.some((row) => !Number.isSafeInteger(row.value) || (row.value ?? -1) < 0)
  )
    throw new ConsoleReadError();
  const legacy = await client
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .eq("legacy_status", "active");
  if (legacy.error || legacy.count === null) throw new ConsoleReadError();
  return {
    metrics: Object.fromEntries(result.map((row) => [row.metric!, row.value!])),
    legacyActive: legacy.count,
  };
}

export async function readProducts(client: ConsoleClient, filter: Filters) {
  await authorize(client);
  let query = client
    .from("product_variants")
    .select(
      "id,sku,public_slug,lifecycle_state,is_shadow,legacy_status,legacy_data_status,products!inner(name_en),product_categories!inner(id,name_en)",
      { count: "exact" },
    );
  if (filter.q)
    query =
      filter.searchBy === "name"
        ? query.ilike("products.name_en", literalPattern(filter.q))
        : query.ilike("sku", literalPattern(filter.q));
  if (filter.category) query = query.eq("category_id", filter.category);
  if (filter.lifecycle)
    query = query.eq("lifecycle_state", filter.lifecycle as (typeof lifecycleStates)[number]);
  const result = page(
    await query
      .order("sku")
      .order("id")
      .range(...range(filter)),
    filter,
  );
  const categories = rows(
    await client
      .from("product_categories")
      .select("id,name_en")
      .order("name_en")
      .order("id")
      .limit(100),
  );
  return { ...result, categories };
}

export async function readReadiness(client: ConsoleClient, filter: Filters) {
  await authorize(client);
  let query = client
    .from("pi_variant_readiness")
    .select(
      "id,sku,lifecycle_state,is_shadow,blocker_count,unresolved_technical_count,technical_conflict_count,eligible_main_image_count,approved_seo_count,compatibility_conflict_count,compatibility_count,confirmed_compatibility_count",
      { count: "exact" },
    );
  if (filter.q) query = query.ilike("sku", literalPattern(filter.q));
  if (filter.blocker === "technical") query = query.gt("unresolved_technical_count", 0);
  else if (filter.blocker === "image") query = query.eq("eligible_main_image_count", 0);
  else if (filter.blocker === "seo") query = query.eq("approved_seo_count", 0);
  else if (filter.blocker === "compatibility")
    query = query.gt("compatibility_count", 0).eq("confirmed_compatibility_count", 0);
  else query = query.gt("blocker_count", 0);
  return page(
    await query
      .order("sku")
      .order("id")
      .range(...range(filter)),
    filter,
  );
}

export async function readSeries(client: ConsoleClient, filter: Filters) {
  await authorize(client);
  let query = client
    .from("product_series")
    .select(
      "id,name,slug,process,publication_status,verification_status,source_level,series_components(count)",
      { count: "exact" },
    );
  if (filter.q) query = query.ilike("name", literalPattern(filter.q));
  return page(
    await query
      .order("name")
      .order("id")
      .range(...range(filter)),
    filter,
  );
}

export async function readSeriesDetail(client: ConsoleClient, id: string, filter: Filters) {
  await authorize(client);
  uuid(id);
  const result = await client
    .from("product_series")
    .select(
      "id,name,process,publication_status,verification_status,source_level,source_reference,image_evidence_status",
    )
    .eq("id", id)
    .maybeSingle();
  if (result.error) throw new ConsoleReadError();
  if (!result.data) return null;
  const components = page(
    await client
      .from("series_components")
      .select("id,component_name,variant_label,lifecycle_status,scope,target_variant_id", {
        count: "exact",
      })
      .eq("series_id", id)
      .order("component_name")
      .order("id")
      .range(...range(filter)),
    filter,
  );
  return { series: result.data, components };
}

export async function readTechnicalData(
  client: ConsoleClient,
  filter: Filters,
  subject?: { variantId?: string; componentId?: string },
) {
  await authorize(client);
  let query = client
    .from("technical_values")
    .select(
      "id,value_text,unit,verification_status,source_level,source_type,public_note,confirmation_requirements,confirmed_at,legacy_reviewed_date,product_variant_id,series_component_id,technical_field_definitions(label,is_critical),product_variants(id,sku),series_components(id,component_name,variant_label,series_id),technical_value_evidence(evidence_role,evidence_sources(title,source_reference,source_level,source_type,exact_subject,evidence_date))",
      { count: "exact" },
    );
  if (filter.verification)
    query = query.eq(
      "verification_status",
      filter.verification as (typeof verificationStates)[number],
    );
  if (filter.q) query = query.ilike("value_text", literalPattern(filter.q));
  if (subject?.variantId) query = query.eq("product_variant_id", uuid(subject.variantId));
  if (subject?.componentId) query = query.eq("series_component_id", uuid(subject.componentId));
  return page(await query.order("id").range(...range(filter)), filter);
}

export async function readProductDetail(client: ConsoleClient, id: string) {
  await authorize(client);
  uuid(id);
  const identity = await client
    .from("product_variants")
    .select(
      "id,sku,model,public_slug,is_shadow,lifecycle_state,legacy_status,legacy_data_status,products(name_en,name_zh,product_type,source_reference),product_categories(name_en)",
    )
    .eq("id", id)
    .maybeSingle();
  if (identity.error) throw new ConsoleReadError();
  if (!identity.data) return null;
  const readiness = await client
    .from("pi_variant_readiness")
    .select(
      "blocker_count,confirmed_technical_count,technical_conflict_count,eligible_main_image_count,approved_seo_count",
    )
    .eq("id", id)
    .single();
  if (readiness.error) throw new ConsoleReadError();
  const media = rows(
    await client
      .from("product_media")
      .select(
        "id,role,alt_text,media_assets(public_path,publication_status,usage_rights_status,content_match_status)",
      )
      .eq("product_variant_id", id)
      .order("sort_order")
      .order("id")
      .limit(50),
  );
  const packaging = rows(
    await client
      .from("packaging_records")
      .select("id,package_description,moq_note,lead_time_note,verification_status,source_level")
      .eq("product_variant_id", id)
      .order("id")
      .limit(50),
  );
  const entities = rows(
    await client
      .from("compatibility_entities")
      .select("id")
      .eq("product_variant_id", id)
      .order("id")
      .limit(50),
  );
  const compatibility = entities.length
    ? rows(
        await client
          .from("compatibility_relationships")
          .select(
            "id,relationship_status,relationship_type,verification_status,source_level,confirmation_requirements,target:compatibility_entities!compatibility_relationships_target_entity_id_fkey(label),compatibility_evidence(evidence_sources(title,source_reference))",
          )
          .in(
            "subject_entity_id",
            entities.map((entity) => entity.id),
          )
          .order("id")
          .limit(50),
      )
    : [];
  return { identity: identity.data, readiness: readiness.data, media, packaging, compatibility };
}
