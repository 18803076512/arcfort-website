import "server-only";
import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { getConsoleConfig } from "./config.ts";
import { consoleDocumentsEnabled } from "./working-config.ts";
import { isConsoleCommandOrigin } from "./commands.ts";
import { DocumentFileError, validateDocumentFile } from "./document-files.ts";
import { claimOriginalWork } from "./original-work.ts";
import {
  documentUploadFailure,
  documentUuid,
  parseDocumentUpload,
  type DocumentUploadResult,
} from "../domain/catalog/documents.ts";

export async function executeDocumentUpload(
  client: ConsoleClient,
  request: Request,
  env: Record<string, string | undefined> = process.env,
): Promise<DocumentUploadResult> {
  const deny = (code: string) => {
    if (!request.bodyUsed) void request.body?.cancel().catch(() => {});
    return documentUploadFailure(code);
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
  const access = await checkConsoleAccess(client);
  if (
    access.status !== "authorized" ||
    !access.roles.some((role) => ["owner", "editor", "reviewer"].includes(role))
  )
    return deny("42501");
  let input;
  try {
    input = parseDocumentUpload(request.headers.get("x-console-document"));
    const length = request.headers.get("content-length");
    if (
      !request.body ||
      (length !== null && length !== String(input.byte_size)) ||
      !["application/pdf", "application/octet-stream"].includes(
        request.headers.get("content-type") ?? "",
      ) ||
      request.headers.has("content-encoding")
    )
      return deny("22023");
  } catch {
    return deny("22023");
  }
  // Share the existing loopback upload/inspection budget, including the authenticated actor lock.
  const release = claimOriginalWork(access.userId);
  if (!release) return deny("54000");
  try {
    const original = await validateDocumentFile(
      {
        name: input.filename,
        size: input.byte_size,
        type: "application/pdf",
        stream: () => request.body!,
      },
      request.signal,
    );
    const { bytes, ...manifest } = original;
    const begin = await client.rpc("pi_begin_document_upload", {
      request_uuid: input.request_id,
      document_uuid: input.document_id,
      manifest,
    });
    if (begin.error) return documentUploadFailure(begin.error.code);
    const receipt = begin.data;
    if (
      !receipt ||
      typeof receipt !== "object" ||
      Array.isArray(receipt) ||
      receipt.document_id !== input.document_id ||
      typeof receipt.intent_id !== "string" ||
      !documentUuid.test(receipt.intent_id)
    )
      return documentUploadFailure();
    const path = `working-documents/${access.userId}/${receipt.intent_id}/original.pdf`;
    if (receipt.storage_path !== path || request.signal.aborted) return documentUploadFailure();
    const storage = client.storage.from("pi-technical-evidence");
    // A failed response can follow persistence. Reconcile this exact path without overwriting it.
    try {
      await storage.upload(path, bytes, {
        contentType: "application/pdf",
        upsert: false,
        cacheControl: "0",
      });
    } catch {
      /* The unchanged stored original decides whether a retry can finish. */
    }
    if (request.signal.aborted) return documentUploadFailure();
    const stored = await storage.download(path).asStream();
    if (stored.error || !stored.data) return documentUploadFailure();
    let readback;
    try {
      readback = await validateDocumentFile(
        {
          name: input.filename,
          size: original.byte_size,
          type: "application/pdf",
          stream: () => stored.data,
        },
        request.signal,
      );
    } catch {
      // The submitted PDF passed. A missing/corrupt/timed-out stored copy is a service failure.
      return documentUploadFailure();
    }
    if (
      readback.file_hash !== original.file_hash ||
      !readback.bytes.equals(bytes) ||
      readback.page_count !== original.page_count
    )
      return documentUploadFailure("40001");
    if (request.signal.aborted) return documentUploadFailure();
    const completed = await client.rpc("pi_complete_document_upload", {
      request_uuid: input.completion_id,
      intent_uuid: receipt.intent_id,
    });
    if (completed.error) return documentUploadFailure(completed.error.code);
    if (
      !completed.data ||
      typeof completed.data !== "object" ||
      Array.isArray(completed.data) ||
      completed.data.document_id !== input.document_id ||
      completed.data.intent_id !== receipt.intent_id
    )
      return documentUploadFailure();
    return { ok: true, document_id: input.document_id, intent_id: receipt.intent_id };
  } catch (error) {
    return documentUploadFailure(error instanceof DocumentFileError ? "22023" : "unavailable");
  } finally {
    release();
  }
}
