import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { ConsoleReadError, uuid } from "./catalog.ts";
import { consoleDocumentsEnabled, consoleDocumentReviewEnabled } from "./working-config.ts";
import {
  documentUuid,
  validDocumentCopy,
  documentUploadBytes,
  type DocumentCopy,
} from "../domain/catalog/documents.ts";

export type DocumentRow = DocumentCopy & {
  document_id: string;
  variant_id: string;
  sku: string;
  prior_document_id: string | null;
  created_at: string;
  subject_current: boolean;
  upload_state: "missing" | "pending" | "recorded";
  filename: string | null;
  byte_size: number | null;
  page_count: number | null;
  upload_request_id: string | null;
};
export type DocumentLibraryData = {
  variantId: string | null;
  sku: string | null;
  canWrite: boolean;
  reviewEnabled?: boolean;
  items: DocumentRow[];
  page: number;
  pageSize: number;
  total: number;
};
const object = (input: unknown): Record<string, unknown> => {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ConsoleReadError();
  return input as Record<string, unknown>;
};
export function parseDocumentPage(input: unknown, page: number, variantId: string | null) {
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 10000 ||
    (variantId !== null && !documentUuid.test(variantId))
  )
    throw new ConsoleReadError();
  const value = object(input);
  const total = value.total;
  if (
    !Number.isSafeInteger(total) ||
    Number(total) < 0 ||
    !Array.isArray(value.items) ||
    value.items.length !== Math.max(0, Math.min(25, Number(total) - (page - 1) * 25))
  )
    throw new ConsoleReadError();
  const items = value.items.map((raw): DocumentRow => {
    const row = object(raw);
    const copy = {
      title: row.title,
      document_type: row.document_type,
      source_kind: row.source_kind,
      source_level: row.source_level,
      owner_name: row.owner_name,
      source_reference: row.source_reference,
      source_location: row.source_location,
      scope_note: row.scope_note,
      issued_date: row.issued_date,
      revision_label: row.revision_label,
    };
    if (
      !validDocumentCopy(copy) ||
      typeof row.document_id !== "string" ||
      !documentUuid.test(row.document_id) ||
      typeof row.variant_id !== "string" ||
      !documentUuid.test(row.variant_id) ||
      (variantId !== null && row.variant_id !== variantId) ||
      typeof row.sku !== "string" ||
      !/^AF-[A-Z0-9-]{3,40}$/.test(row.sku) ||
      (row.prior_document_id !== null &&
        (typeof row.prior_document_id !== "string" ||
          !documentUuid.test(row.prior_document_id) ||
          row.prior_document_id === row.document_id)) ||
      typeof row.created_at !== "string" ||
      !Number.isFinite(Date.parse(row.created_at)) ||
      typeof row.subject_current !== "boolean" ||
      !["missing", "pending", "recorded"].includes(String(row.upload_state)) ||
      (row.upload_request_id !== null &&
        (row.upload_state !== "pending" ||
          typeof row.upload_request_id !== "string" ||
          !documentUuid.test(row.upload_request_id)))
    )
      throw new ConsoleReadError();
    if (row.upload_state === "missing") {
      if ([row.filename, row.byte_size, row.page_count].some((v) => v !== null))
        throw new ConsoleReadError();
    } else if (
      typeof row.filename !== "string" ||
      row.filename.length > 180 ||
      !/\.pdf$/i.test(row.filename) ||
      /[\p{Cc}\p{Cf}/\\:*?"<>|]/u.test(row.filename) ||
      !Number.isSafeInteger(row.byte_size) ||
      Number(row.byte_size) < 1 ||
      Number(row.byte_size) > documentUploadBytes ||
      !Number.isSafeInteger(row.page_count) ||
      Number(row.page_count) < 1 ||
      Number(row.page_count) > 200
    )
      throw new ConsoleReadError();
    return {
      ...copy,
      document_id: row.document_id,
      variant_id: row.variant_id,
      sku: row.sku,
      prior_document_id: row.prior_document_id as string | null,
      created_at: row.created_at,
      subject_current: row.subject_current,
      upload_state: row.upload_state as DocumentRow["upload_state"],
      filename: row.filename as string | null,
      byte_size: row.byte_size as number | null,
      page_count: row.page_count as number | null,
      upload_request_id: row.upload_request_id as string | null,
    };
  });
  if (new Set(items.map((row) => row.document_id)).size !== items.length)
    throw new ConsoleReadError();
  return { items, total: Number(total) };
}

export async function readDocumentLibrary(
  client: ConsoleClient,
  id: string | null,
  page: number,
  env: Record<string, string | undefined> = process.env,
): Promise<DocumentLibraryData | null> {
  if (!consoleDocumentsEnabled(env)) throw new ConsoleReadError();
  const access = await checkConsoleAccess(client);
  if (access.status !== "authorized") throw new ConsoleReadError();
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) throw new ConsoleReadError();
  let sku: string | null = null;
  if (id !== null) {
    uuid(id);
    const states = await client.rpc("pi_product_working_states", { variant_ids: [id] });
    if (states.error || !states.data) throw new ConsoleReadError();
    if (!states.data.length) return null;
    if (states.data.length !== 1 || states.data[0].product_variant_id !== id)
      throw new ConsoleReadError();
    const identity = await client.from("product_variants").select("sku").eq("id", id).single();
    if (identity.error || !identity.data) throw new ConsoleReadError();
    sku = identity.data.sku;
  }
  // PostgreSQL permits NULL for the global scope; generated Args mark required values non-nullable.
  const response = await client.rpc("pi_read_document_references", {
    variant_uuid: id as string,
    page_number: page,
  });
  if (response.error) throw new ConsoleReadError();
  const parsed = parseDocumentPage(response.data, page, id);
  return {
    variantId: id,
    sku,
    canWrite: access.roles.some((role) => ["owner", "editor", "reviewer"].includes(role)),
    reviewEnabled: consoleDocumentReviewEnabled(env),
    ...parsed,
    page,
    pageSize: 25,
  };
}
