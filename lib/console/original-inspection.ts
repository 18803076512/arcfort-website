import "server-only";
import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { getConsoleConfig } from "./config.ts";
import { consoleOriginalsEnabled, consoleMediaReviewEnabled } from "./working-config.ts";
import { isConsoleCommandOrigin, readConsoleCommand } from "./commands.ts";
import { originalFileLimits, validateOriginalFile } from "./original-files.ts";
import { claimOriginalWork } from "./original-work.ts";
import { originalUuid } from "../domain/catalog/originals.ts";
import {
  mediaObservationKey,
  parseMediaReviewSnapshot,
  signMediaObservation,
} from "./media-observation.ts";
import type { MediaReviewSnapshot } from "../domain/catalog/media-commands.ts";
import {
  originalInspectionFailure,
  type OriginalInspectionFailure,
} from "../domain/catalog/original-inspection.ts";

type Inspection =
  | OriginalInspectionFailure
  | { ok: true; bytes: Buffer; mime: string; observation?: string };
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/tiff": "tiff",
};

export async function inspectStoredOriginal(
  client: ConsoleClient,
  request: Request,
  env: Record<string, string | undefined> = process.env,
): Promise<Inspection> {
  const settings = getConsoleConfig(env);
  const deny = (code: OriginalInspectionFailure["code"]) => {
    if (!request.bodyUsed) void request.body?.cancel().catch(() => {});
    return originalInspectionFailure(code);
  };
  if (
    !consoleOriginalsEnabled(env) ||
    settings.status !== "ready" ||
    request.method !== "POST" ||
    !isConsoleCommandOrigin(request.headers, settings.config.origin)
  )
    return deny("42501");

  let release: (() => void) | null = null;
  try {
    const access = await checkConsoleAccess(client);
    if (access.status !== "authorized") return deny("42501");
    let input: unknown;
    try {
      input = await readConsoleCommand(request);
    } catch {
      return deny("22023");
    }
    if (!input || typeof input !== "object" || Array.isArray(input)) return deny("22023");
    const fields = input as Record<string, unknown>;
    let snapshot: MediaReviewSnapshot | null = null;
    const key = mediaObservationKey(env);
    let variantId: string;
    let assetId: string;
    if (Object.keys(fields).sort().join(",") === "digest,mapping_id,revision") {
      if (
        !consoleMediaReviewEnabled(env) ||
        !access.roles.some((role) => role === "owner" || role === "reviewer")
      )
        return deny("42501");
      if (!key) return deny("unavailable");
      if (
        typeof fields.mapping_id !== "string" ||
        !originalUuid.test(fields.mapping_id) ||
        !Number.isSafeInteger(fields.revision) ||
        (fields.revision as number) < 1 ||
        typeof fields.digest !== "string" ||
        !/^[a-f0-9]{64}$/.test(fields.digest)
      )
        return deny("22023");
      const observed = await client.rpc("pi_media_review_snapshot", {
        mapping_uuid: fields.mapping_id,
        expected_revision: fields.revision as number,
        expected_digest: fields.digest,
        observer_key_uuid: key.id,
      });
      if (observed.error)
        return deny(
          observed.error.code === "42501"
            ? "42501"
            : observed.error.code === "40001"
              ? "40001"
              : "unavailable",
        );
      snapshot = parseMediaReviewSnapshot(observed.data);
      if (
        !snapshot ||
        snapshot.mapping_id.toLowerCase() !== fields.mapping_id.toLowerCase() ||
        snapshot.revision !== fields.revision ||
        snapshot.digest !== fields.digest
      )
        return deny("40001");
      variantId = snapshot.variant_id;
      assetId = snapshot.asset_id;
    } else {
      if (
        Object.keys(fields).sort().join(",") !== "asset_id,variant_id" ||
        typeof fields.asset_id !== "string" ||
        !originalUuid.test(fields.asset_id) ||
        typeof fields.variant_id !== "string" ||
        !originalUuid.test(fields.variant_id)
      )
        return deny("22023");
      variantId = fields.variant_id;
      assetId = fields.asset_id;
    }
    release = claimOriginalWork(access.userId);
    if (!release) return deny("54000");

    const state = await client.rpc("pi_product_working_states", {
      variant_ids: [variantId],
    });
    if (state.error || !state.data?.some((row) => row.product_variant_id === variantId))
      return deny("42501");
    const intent = await client
      .from("media_upload_intents")
      .select("id,actor_id,media_asset_id,storage_path,manifest")
      .eq("product_variant_id", variantId)
      .eq("media_asset_id", assetId)
      .single();
    if (intent.error || !intent.data) return deny("unavailable");
    const completion = await client
      .from("media_upload_completions")
      .select("intent_id,media_asset_id")
      .eq("intent_id", intent.data.id)
      .eq("media_asset_id", assetId)
      .single();
    const asset = await client
      .from("media_assets")
      .select("storage_bucket,storage_path,file_hash,mime_type,width,height")
      .eq("id", assetId)
      .single();
    if (completion.error || !completion.data || asset.error || !asset.data)
      return deny("unavailable");
    const manifest = intent.data.manifest;
    if (
      !manifest ||
      typeof manifest !== "object" ||
      Array.isArray(manifest) ||
      typeof manifest.filename !== "string" ||
      typeof manifest.mime_type !== "string" ||
      !Object.hasOwn(extensions, manifest.mime_type) ||
      typeof manifest.file_hash !== "string" ||
      !/^[a-f0-9]{64}$/.test(manifest.file_hash) ||
      typeof manifest.byte_size !== "number" ||
      !Number.isSafeInteger(manifest.byte_size) ||
      manifest.byte_size <= 0 ||
      manifest.byte_size > originalFileLimits.bytes ||
      !originalUuid.test(intent.data.actor_id) ||
      intent.data.media_asset_id !== assetId ||
      completion.data.intent_id !== intent.data.id ||
      completion.data.media_asset_id !== assetId
    )
      return deny("40001");
    const path = `working-originals/${intent.data.actor_id}/${assetId}/original.${extensions[manifest.mime_type]}`;
    if (
      intent.data.storage_path !== path ||
      asset.data.storage_path !== path ||
      asset.data.storage_bucket !== "pi-product-originals" ||
      asset.data.file_hash !== manifest.file_hash ||
      asset.data.mime_type !== manifest.mime_type ||
      asset.data.width !== manifest.width ||
      asset.data.height !== manifest.height
    )
      return deny("40001");

    const stored = await client.storage
      .from("pi-product-originals")
      .download(
        path,
        {},
        {
          cache: "no-store",
          signal: AbortSignal.any([
            request.signal,
            AbortSignal.timeout(originalFileLimits.readMilliseconds),
          ]),
        },
      )
      .asStream();
    if (stored.error || !stored.data) return deny("unavailable");
    const original = await validateOriginalFile({
      name: manifest.filename,
      size: manifest.byte_size,
      type: manifest.mime_type,
      stream: () => stored.data,
    });
    if (
      original.file_hash !== manifest.file_hash ||
      original.width !== manifest.width ||
      original.height !== manifest.height
    )
      return deny("40001");
    // A role can be revoked during the download/decode. Do not release bytes under stale access.
    const current = await checkConsoleAccess(client);
    if (
      current.status !== "authorized" ||
      current.userId !== access.userId ||
      request.signal.aborted ||
      (snapshot && !current.roles.some((role) => role === "owner" || role === "reviewer"))
    )
      return deny("42501");
    if (snapshot && key) {
      const observed = await client.rpc("pi_media_review_snapshot", {
        mapping_uuid: snapshot.mapping_id,
        expected_revision: snapshot.revision,
        expected_digest: snapshot.digest,
        observer_key_uuid: key.id,
      });
      const fresh = parseMediaReviewSnapshot(observed.data);
      if (
        observed.error ||
        !fresh ||
        Object.keys(snapshot).some(
          (field) =>
            snapshot[field as keyof MediaReviewSnapshot] !==
            fresh[field as keyof MediaReviewSnapshot],
        )
      )
        return deny(observed.error?.code === "42501" ? "42501" : "40001");
      if (request.signal.aborted) return deny("42501");
      return {
        ok: true,
        bytes: original.bytes,
        mime: original.mime_type,
        observation: signMediaObservation(snapshot, access.userId, key),
      };
    }
    return { ok: true, bytes: original.bytes, mime: original.mime_type };
  } catch {
    return deny("unavailable");
  } finally {
    release?.();
  }
}
