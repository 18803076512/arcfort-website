import type { ConsoleClient } from "./client.ts";
import type { Database } from "../supabase/database.types.ts";
import { checkConsoleAccess } from "./access.ts";
import { ConsoleReadError, uuid } from "./catalog.ts";
import { consoleOriginalsEnabled } from "./working-config.ts";
import { originalUuid } from "../domain/catalog/originals.ts";

export type OriginalIntakeRow =
  Database["public"]["Functions"]["pi_read_original_intakes"]["Returns"][number];
export type OriginalIntakeData = {
  variantId: string;
  sku: string;
  canUpload: boolean;
  items: OriginalIntakeRow[];
  page: number;
  pageSize: number;
  total: number;
};
export async function readOriginalIntakes(
  client: ConsoleClient,
  id: string,
  page: number,
  env: Record<string, string | undefined> = process.env,
): Promise<OriginalIntakeData | null> {
  if (!consoleOriginalsEnabled(env)) throw new ConsoleReadError();
  const access = await checkConsoleAccess(client);
  if (access.status !== "authorized") throw new ConsoleReadError();
  uuid(id);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) throw new ConsoleReadError();
  const states = await client.rpc("pi_product_working_states", { variant_ids: [id] });
  if (states.error || !states.data) throw new ConsoleReadError();
  if (!states.data.length) return null;
  const identity = await client.from("product_variants").select("sku").eq("id", id).single();
  const rows = await client.rpc("pi_read_original_intakes", {
    variant_uuid: id,
    page_number: page,
  });
  if (identity.error || !identity.data || rows.error || !rows.data || rows.data.length > 25)
    throw new ConsoleReadError();
  const items = rows.data.map((row) => ({
    intent_id: row.intent_id,
    asset_id: row.asset_id,
    filename: row.filename,
    byte_size: row.byte_size,
    mime_type: row.mime_type,
    width: row.width,
    height: row.height,
    source_kind: row.source_kind,
    source_owner: row.source_owner,
    source_reference: row.source_reference,
    created_at: row.created_at,
    completed: row.completed,
    subject_current: row.subject_current,
    total_count: row.total_count,
  }));
  const total = items[0]?.total_count ?? 0;
  if (
    !Number.isSafeInteger(total) ||
    total < 0 ||
    new Set(items.map((row) => row.intent_id)).size !== items.length ||
    items.some(
      (row) =>
        row.total_count !== total ||
        !originalUuid.test(row.intent_id) ||
        !originalUuid.test(row.asset_id) ||
        ![
          row.filename,
          row.source_owner,
          row.source_reference,
          row.source_kind,
          row.mime_type,
        ].every((value) => typeof value === "string" && value.length > 0) ||
        ![row.byte_size, row.width, row.height].every(
          (value) => Number.isSafeInteger(value) && value > 0,
        ) ||
        typeof row.completed !== "boolean" ||
        typeof row.subject_current !== "boolean" ||
        !Number.isFinite(Date.parse(row.created_at)),
    ) ||
    items.length !== Math.max(0, Math.min(25, total - (page - 1) * 25))
  )
    throw new ConsoleReadError();
  return {
    variantId: id,
    sku: identity.data.sku,
    canUpload: access.roles.some((role) => ["owner", "editor", "reviewer"].includes(role)),
    items,
    total,
    page,
    pageSize: 25,
  };
}
