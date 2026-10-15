import "server-only";
import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { getConsoleConfig } from "./config.ts";
import { consoleDocumentsEnabled, consoleDocumentReviewEnabled } from "./working-config.ts";
import {
  documentObservationKey,
  parseDocumentReviewSnapshot,
  signDocumentObservation,
  type DocumentReviewSnapshot,
} from "./document-observation.ts";
import { isConsoleCommandOrigin, readConsoleCommand } from "./commands.ts";
import { validateDocumentFile, documentFileLimits } from "./document-files.ts";
import { claimOriginalWork } from "./original-work.ts";
import { documentUuid } from "../domain/catalog/documents.ts";
import {
  documentInspectionFailure,
  parseDocumentInspection,
  parseDocumentDownload,
  type DocumentDownload,
  type DocumentInspectionFailure,
  type DocumentInspectionInput,
} from "../domain/catalog/document-inspection.ts";

function snapshot(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid document snapshot.");
  const row = value as Record<string, unknown>;
  if (
    Object.keys(row).sort().join(",") !==
    "actor_id,document_id,intent_id,manifest,snapshot_digest,storage_path,variant_id"
  )
    throw new Error("Invalid snapshot fields.");
  for (const key of ["actor_id", "document_id", "intent_id", "variant_id"])
    if (typeof row[key] !== "string" || !documentUuid.test(row[key]))
      throw new Error("Invalid snapshot identity.");
  if (
    row.storage_path !== `working-documents/${row.actor_id}/${row.intent_id}/original.pdf` ||
    typeof row.snapshot_digest !== "string" ||
    !/^[a-f0-9]{64}$/.test(row.snapshot_digest) ||
    !row.manifest ||
    typeof row.manifest !== "object" ||
    Array.isArray(row.manifest)
  )
    throw new Error("Invalid original snapshot.");
  const manifest = row.manifest as Record<string, unknown>;
  if (
    Object.keys(manifest).sort().join(",") !==
      "byte_size,file_hash,filename,mime_type,page_count" ||
    manifest.mime_type !== "application/pdf" ||
    typeof manifest.file_hash !== "string" ||
    !/^[a-f0-9]{64}$/.test(manifest.file_hash)
  )
    throw new Error("Invalid original manifest.");
  const download = parseDocumentDownload({
    document_id: row.document_id,
    filename: manifest.filename,
    byte_size: manifest.byte_size,
    page_count: manifest.page_count,
  });
  return {
    ...download,
    variant_id: row.variant_id as string,
    intent_id: row.intent_id as string,
    actor_id: row.actor_id as string,
    storage_path: row.storage_path,
    snapshot_digest: row.snapshot_digest,
    file_hash: manifest.file_hash,
  };
}
export async function inspectStoredDocument(
  client: ConsoleClient,
  request: Request,
  env: Record<string, string | undefined> = process.env,
): Promise<
  | DocumentInspectionFailure
  | { ok: true; bytes: Buffer; download: DocumentDownload; observation?: string }
> {
  const deny = (code = "unavailable") => {
    if (!request.bodyUsed) void request.body?.cancel().catch(() => {});
    return documentInspectionFailure(code);
  };
  const settings = getConsoleConfig(env);
  if (
    !consoleDocumentsEnabled(env) ||
    settings.status !== "ready" ||
    request.method !== "POST" ||
    request.signal.aborted ||
    !isConsoleCommandOrigin(request.headers, settings.config.origin)
  )
    return deny("42501");
  let release: (() => void) | null = null;
  try {
    const access = await checkConsoleAccess(client);
    if (access.status !== "authorized") return deny("42501");
    let input;
    try {
      input = parseDocumentInspection(await readConsoleCommand(request));
    } catch {
      return deny("22023");
    }
    const reviewInput = "candidate_id" in input ? input : null;
    const key = reviewInput ? documentObservationKey(env) : null;
    if (
      reviewInput &&
      (!consoleDocumentReviewEnabled(env) ||
        !key ||
        !access.roles.some((role) => role === "owner" || role === "reviewer"))
    )
      return deny("42501");
    release = claimOriginalWork(access.userId);
    if (!release) return deny("54000");
    let review: DocumentReviewSnapshot | null = null;
    const reviewArgs =
      reviewInput && key
        ? {
            candidate_uuid: reviewInput.candidate_id,
            expected_revision: reviewInput.revision,
            expected_digest: reviewInput.digest,
            observer_key_uuid: key.id,
          }
        : null;
    if (reviewArgs) {
      const result = await client.rpc("pi_document_review_snapshot", reviewArgs);
      if (result.error) return deny(result.error.code);
      review = parseDocumentReviewSnapshot(result.data);
      if (
        !review ||
        review.candidate_id !== reviewArgs.candidate_uuid ||
        review.revision !== reviewArgs.expected_revision ||
        review.digest !== reviewArgs.expected_digest
      )
        return deny("40001");
    }
    const target: DocumentInspectionInput =
      "candidate_id" in input
        ? { variant_id: review!.variant_id, document_id: review!.document_id }
        : input;
    const args = { variant_uuid: target.variant_id, document_uuid: target.document_id };
    const initial = await client.rpc("pi_document_original_snapshot", args);
    if (initial.error) return deny(initial.error.code);
    const before = snapshot(initial.data);
    if (
      before.document_id !== target.document_id ||
      before.variant_id !== target.variant_id ||
      (review && review.original_digest !== before.snapshot_digest)
    )
      return deny("40001");
    if (request.signal.aborted) return deny("42501");
    const stored = await client.storage
      .from("pi-technical-evidence")
      .download(
        before.storage_path,
        {},
        {
          cache: "no-store",
          signal: AbortSignal.any([
            request.signal,
            AbortSignal.timeout(documentFileLimits.readMilliseconds),
          ]),
        },
      )
      .asStream();
    if (stored.error || !stored.data) return deny();
    const original = await validateDocumentFile(
      {
        name: before.filename,
        size: before.byte_size,
        type: "application/pdf",
        stream: () => stored.data,
      },
      request.signal,
    );
    if (original.file_hash !== before.file_hash || original.page_count !== before.page_count)
      return deny("40001");
    const current = await checkConsoleAccess(client);
    if (
      current.status !== "authorized" ||
      current.userId !== access.userId ||
      (review && !current.roles.some((role) => role === "owner" || role === "reviewer")) ||
      request.signal.aborted
    )
      return deny("42501");
    // Never release bytes after a reference, completion or Storage object changed during the read.
    const checked = await client.rpc("pi_document_original_snapshot", args);
    if (checked.error) return deny(checked.error.code);
    const after = snapshot(checked.data);
    if (JSON.stringify(after) !== JSON.stringify(before)) return deny("40001");
    if (reviewArgs && review) {
      const result = await client.rpc("pi_document_review_snapshot", reviewArgs);
      if (result.error) return deny(result.error.code);
      const rechecked = parseDocumentReviewSnapshot(result.data);
      if (!rechecked || JSON.stringify(rechecked) !== JSON.stringify(review)) return deny("40001");
    }
    if (request.signal.aborted) return deny("42501");
    return {
      ok: true,
      bytes: original.bytes,
      ...(review && key
        ? { observation: signDocumentObservation(review, access.userId, key) }
        : {}),
      download: {
        document_id: target.document_id,
        filename: original.filename,
        byte_size: original.byte_size,
        page_count: original.page_count,
      },
    };
  } catch {
    return deny();
  } finally {
    release?.();
  }
}
