import "server-only";
import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { getConsoleConfig } from "./config.ts";
import { consoleOriginalsEnabled } from "./working-config.ts";
import { isConsoleCommandOrigin } from "./commands.ts";
import { OriginalFileError, validateOriginalFile } from "./original-files.ts";
import { claimOriginalWork } from "./original-work.ts";
import {
  originalUploadFailure,
  originalUuid,
  parseOriginalUpload,
  type OriginalUploadResult,
} from "../domain/catalog/originals.ts";

export async function executeOriginalUpload(
  client: ConsoleClient,
  request: Request,
  env: Record<string, string | undefined> = process.env,
): Promise<OriginalUploadResult> {
  const settings = getConsoleConfig(env);
  const deny = (code: string) => {
    if (!request.bodyUsed) void request.body?.cancel().catch(() => {});
    return originalUploadFailure(code);
  };
  if (
    !consoleOriginalsEnabled(env) ||
    settings.status !== "ready" ||
    request.method !== "POST" ||
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
    input = parseOriginalUpload(request.headers.get("x-console-original"));
    const length = request.headers.get("content-length");
    if (
      (length !== null && length !== String(input.byte_size)) ||
      !request.body ||
      !["image/jpeg", "image/png", "image/webp", "image/tiff", "application/octet-stream"].includes(
        request.headers.get("content-type") ?? "",
      )
    )
      return deny("22023");
  } catch {
    return deny("22023");
  }
  const release = claimOriginalWork(access.userId);
  if (!release) return deny("54000");
  try {
    const original = await validateOriginalFile({
      name: input.filename,
      size: input.byte_size,
      type:
        request.headers.get("content-type") === "application/octet-stream"
          ? ""
          : request.headers.get("content-type")!,
      stream: () => request.body!,
    });
    const { bytes, ...fileManifest } = original;
    const begin = await client.rpc("pi_begin_media_upload", {
      request_uuid: input.request_id,
      variant_uuid: input.variant_id,
      manifest: {
        ...fileManifest,
        source_kind: input.source_kind,
        source_owner: input.source_owner,
        source_reference: input.source_reference,
      },
    });
    if (begin.error) return originalUploadFailure(begin.error.code);
    const receipt = begin.data;
    if (
      !receipt ||
      typeof receipt !== "object" ||
      Array.isArray(receipt) ||
      typeof receipt.intent_id !== "string" ||
      !originalUuid.test(receipt.intent_id) ||
      typeof receipt.asset_id !== "string" ||
      !originalUuid.test(receipt.asset_id)
    )
      return originalUploadFailure();
    const extension = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/tiff": "tiff",
    }[original.mime_type];
    const path = `working-originals/${access.userId}/${receipt.asset_id}/original.${extension}`;
    if (receipt.storage_path !== path) return originalUploadFailure();
    const storage = client.storage.from("pi-product-originals");
    // A timeout may occur after persistence. Always reconcile the exact reserved path; never overwrite.
    try {
      await storage.upload(path, bytes, {
        contentType: original.mime_type,
        upsert: false,
        cacheControl: "0",
      });
    } catch {
      /* Readback decides whether the original is present. */
    }
    const stored = await storage.download(path).asStream();
    if (stored.error || !stored.data) return originalUploadFailure();
    const readback = await validateOriginalFile({
      name: input.filename,
      size: original.byte_size,
      type: original.mime_type,
      stream: () => stored.data,
    });
    if (readback.file_hash !== original.file_hash || !readback.bytes.equals(bytes))
      return originalUploadFailure("40001");
    const completed = await client.rpc("pi_complete_media_upload", {
      request_uuid: input.completion_id,
      intent_uuid: receipt.intent_id,
    });
    if (completed.error) return originalUploadFailure(completed.error.code);
    if (
      !completed.data ||
      typeof completed.data !== "object" ||
      Array.isArray(completed.data) ||
      completed.data.asset_id !== receipt.asset_id ||
      completed.data.intent_id !== receipt.intent_id
    )
      return originalUploadFailure();
    return { ok: true, asset_id: receipt.asset_id, intent_id: receipt.intent_id };
  } catch (error) {
    return originalUploadFailure(error instanceof OriginalFileError ? "22023" : "unavailable");
  } finally {
    release();
  }
}
