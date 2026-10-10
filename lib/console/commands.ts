import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess, type ConsoleRole } from "./access.ts";
import {
  CommandInputError,
  commandError,
  parseConsoleCommand,
  type ConsoleCommand,
  type CommandResult,
} from "../domain/catalog/commands.ts";
import { isConsoleOrigin } from "./security.ts";
import {
  consoleCompatibilityEnabled,
  consoleMediaReviewEnabled,
  consoleOemEnabled,
  consolePackagingEnabled,
} from "./working-config.ts";
import { isOemCommand } from "../domain/catalog/oem.ts";
import { isPackagingCommand } from "../domain/catalog/packaging.ts";
import { isCompatibilityCommand } from "../domain/catalog/compatibility.ts";
import { isMediaCommand } from "../domain/catalog/media-commands.ts";

export function isConsoleCommandOrigin(headers: Headers, origin: string) {
  if (headers.get("x-console-command") !== "1") return false;
  if (isConsoleOrigin(headers, origin, true) && headers.get("origin") === origin) return true;
  return (
    headers.get("host") === new URL(origin).host &&
    headers.get("origin") === "null" &&
    headers.get("sec-fetch-site") === "same-origin" &&
    headers.get("sec-fetch-mode") === "cors" &&
    headers.get("sec-fetch-dest") === "empty"
  );
}

export async function readConsoleCommand(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    throw new CommandInputError();
  const reader = request.body?.getReader();
  if (!reader) throw new CommandInputError();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 131072) {
        await reader.cancel();
        throw new CommandInputError();
      }
      chunks.push(part.value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const part of chunks) {
      body.set(part, offset);
      offset += part.byteLength;
    }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
  } catch {
    throw new CommandInputError();
  } finally {
    reader.releaseLock();
  }
}

export function canRunConsoleCommand(roles: ConsoleRole[], action: ConsoleCommand["action"]) {
  const allowed: ConsoleRole[] =
    action === "review" ||
    action === "compatibility_review" ||
    action === "media_review" ||
    action === "oem_review" ||
    action === "packaging_review"
      ? ["owner", "reviewer"]
      : action === "source" ||
          action === "submit" ||
          action === "compatibility_source" ||
          action === "compatibility_submit" ||
          action === "media_source" ||
          action === "media_submit" ||
          action === "oem_source" ||
          action === "oem_submit" ||
          action === "packaging_source" ||
          action === "packaging_submit"
        ? ["owner", "editor", "reviewer"]
        : ["owner", "editor"];
  return roles.some((role) => allowed.includes(role));
}

export async function executeConsoleCommand(
  client: ConsoleClient,
  input: unknown,
  env: Record<string, string | undefined> = process.env,
): Promise<CommandResult> {
  const access = await checkConsoleAccess(client);
  if (access.status !== "authorized")
    return { ok: false, code: "42501", message: commandError("42501") };
  let command: ConsoleCommand;
  try {
    command = parseConsoleCommand(input);
  } catch (error) {
    return {
      ok: false,
      code: "22023",
      message: commandError("22023"),
      fields: error instanceof CommandInputError ? error.fields : ["form"],
    };
  }
  if (
    !canRunConsoleCommand(access.roles, command.action) ||
    (isCompatibilityCommand(command.action) && !consoleCompatibilityEnabled(env)) ||
    (isMediaCommand(command.action) && !consoleMediaReviewEnabled(env)) ||
    (isOemCommand(command.action) && !consoleOemEnabled(env)) ||
    (isPackagingCommand(command.action) && !consolePackagingEnabled(env))
  )
    return { ok: false, code: "42501", message: commandError("42501") };
  try {
    const request_uuid = command.request_id;
    const response = await (async () => {
      switch (command.action) {
        case "packaging_source":
          return client.rpc("pi_add_packaging_source", {
            request_uuid,
            variant_uuid: command.variant_id,
            packaging_copy: command.copy,
            source_copy: command.source,
            ...(command.original_id === null ? {} : { original_uuid: command.original_id }),
          });
        case "packaging_propose":
          return client.rpc("pi_propose_packaging_revision", {
            request_uuid,
            variant_uuid: command.variant_id,
            requested_slot: command.slot,
            expected_revision: command.revision,
            packaging_copy: command.copy,
            source_uuids: command.sources,
            proposal_reason: command.reason,
            ...(command.head_id === null ? {} : { head_uuid: command.head_id }),
            ...(command.original_id === null ? {} : { original_uuid: command.original_id }),
          });
        case "packaging_submit":
          return client.rpc("pi_submit_packaging_revision", {
            request_uuid,
            revision_uuid: command.revision_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
          });
        case "packaging_review":
          return client.rpc("pi_review_packaging_revision", {
            request_uuid,
            revision_uuid: command.revision_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
            decision: command.decision,
            review_reason: command.reason,
            // PostgreSQL accepts NULL for required arguments that generated Args mark non-nullable.
            approved_status: command.status as NonNullable<typeof command.status>,
            confirmation: command.confirmation ?? {},
            source_uuid: command.source_id as string,
            conflict_resolution: command.resolution,
            replacement: command.replacement,
          });
        case "oem_source":
          return client.rpc("pi_add_oem_source", {
            request_uuid,
            variant_uuid: command.variant_id,
            requested_manufacturer: command.copy.manufacturer_name,
            requested_reference: command.copy.reference_number,
            source_copy: command.source,
          });
        case "oem_propose":
          return client.rpc("pi_propose_oem_revision", {
            request_uuid,
            variant_uuid: command.variant_id,
            requested_slot: command.slot,
            expected_revision: command.revision,
            reference_copy: command.copy,
            source_uuids: command.sources,
            proposal_reason: command.reason,
            ...(command.head_id === null ? {} : { head_uuid: command.head_id }),
            ...(command.original_id === null ? {} : { original_uuid: command.original_id }),
          });
        case "oem_submit":
          return client.rpc("pi_submit_oem_revision", {
            request_uuid,
            revision_uuid: command.revision_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
          });
        case "oem_review":
          return client.rpc("pi_review_oem_revision", {
            request_uuid,
            revision_uuid: command.revision_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
            decision: command.decision,
            review_reason: command.reason,
            // Required PostgreSQL arguments accept NULL; the generated Args omit that nullability.
            approved_status: command.status as NonNullable<typeof command.status>,
            confirmation: command.confirmation ?? {},
            source_uuid: command.source_id as string,
            conflict_resolution: command.resolution,
            replacement: command.replacement,
          });
        case "create":
          return client.rpc("pi_create_product_draft", {
            request_uuid,
            identity: command.identity,
            draft_copy: command.copy,
          });
        case "save":
          return client.rpc("pi_save_product_draft", {
            request_uuid,
            variant_uuid: command.variant_id,
            expected_revision: command.revision,
            draft_copy: command.copy,
          });
        case "source":
          return client.rpc("pi_add_technical_source", {
            request_uuid,
            variant_uuid: command.variant_id,
            field_uuid: command.field_id,
            scope_label: command.scope,
            source_copy: command.source,
          });
        case "propose":
          return client.rpc("pi_propose_technical_revision", {
            request_uuid,
            variant_uuid: command.variant_id,
            field_uuid: command.field_id,
            scope_label: command.scope,
            expected_revision: command.revision,
            value_copy: command.value,
            evidence_links: command.evidence,
            proposal_reason: command.reason,
          });
        case "submit":
          return client.rpc("pi_submit_technical_review", {
            request_uuid,
            value_uuid: command.value_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
          });
        case "review":
          return client.rpc("pi_review_technical_revision", {
            request_uuid,
            value_uuid: command.value_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
            decision: command.decision,
            review_reason: command.reason,
            conflict_resolution: command.resolution,
            replacement_value: command.replacement,
            replacement_evidence: command.evidence,
          });
        case "compatibility_entity":
          return client.rpc("pi_ensure_product_compatibility_entity", {
            request_uuid,
            variant_uuid: command.variant_id,
          });
        case "compatibility_source":
          return client.rpc("pi_add_compatibility_source", {
            request_uuid,
            subject_uuid: command.subject_id,
            target_uuid: command.target_id,
            relation_type: command.relationship_type,
            scope_label: command.scope,
            asserted_role: command.role,
            source_copy: command.source,
          });
        case "compatibility_propose":
          return client.rpc("pi_propose_compatibility_revision", {
            request_uuid,
            ...(command.root_id === null ? {} : { root_uuid: command.root_id }),
            subject_uuid: command.subject_id,
            target_uuid: command.target_id,
            relation_type: command.relationship_type,
            scope_label: command.scope,
            expected_revision: command.revision,
            relation_copy: command.copy,
            evidence_links: command.evidence,
            proposal_reason: command.reason,
          });
        case "compatibility_submit":
          return client.rpc("pi_submit_compatibility_review", {
            request_uuid,
            relationship_uuid: command.relationship_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
          });
        case "compatibility_review":
          return client.rpc("pi_review_compatibility_revision", {
            request_uuid,
            relationship_uuid: command.relationship_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
            decision: command.decision,
            review_reason: command.reason,
            conflict_resolution: command.resolution,
            replacement_copy: command.replacement,
            replacement_evidence: command.evidence,
          });
        case "media_source":
          return client.rpc("pi_add_media_source", {
            request_uuid,
            variant_uuid: command.variant_id,
            asset_uuid: command.asset_id,
            requested_role: command.role,
            requested_dimension: command.dimension,
            source_copy: command.source,
          });
        case "media_propose":
          return client.rpc("pi_propose_media_mapping", {
            request_uuid,
            variant_uuid: command.variant_id,
            asset_uuid: command.asset_id,
            requested_role: command.role,
            requested_slot: command.slot,
            expected_revision: command.revision,
            mapping_copy: command.copy,
            source_uuids: command.sources,
            proposal_reason: command.reason,
            ...(command.head_id === null ? {} : { head_uuid: command.head_id }),
          });
        case "media_submit":
          return client.rpc("pi_submit_media_mapping", {
            request_uuid,
            mapping_uuid: command.mapping_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
          });
        case "media_review":
          return client.rpc("pi_review_media_mapping", {
            request_uuid,
            mapping_uuid: command.mapping_id,
            expected_revision: command.revision,
            expected_digest: command.digest,
            decision: command.decision,
            review_reason: command.reason,
            confirmation: command.confirmation ?? {},
            // PostgreSQL permits NULL for these required arguments; the generated Args cannot express it.
            rights_source_uuid: command.rights_source_id as string,
            match_source_uuid: command.match_source_id as string,
            conflict_resolution: command.resolution,
            replacement: command.replacement,
            observation_token: command.observation as string,
          });
      }
    })();
    if (response.error) {
      const code = ["42501", "22023", "23505", "23514", "40001", "55000"].includes(
        response.error.code,
      )
        ? response.error.code
        : "unavailable";
      return { ok: false, code, message: commandError(code) };
    }
    const raw = response.data;
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      return { ok: false, code: "unavailable", message: commandError() };
    const result: Extract<CommandResult, { ok: true }>["result"] = {};
    if (typeof raw.revision === "number" && Number.isSafeInteger(raw.revision))
      result.revision = raw.revision;
    const { ids: requiredIds, digest: needsDigest, revision: needsRevision } = resultShape(command);
    const malformed =
      requiredIds.some(
        (field) =>
          typeof raw[field] !== "string" ||
          !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
            raw[field],
          ),
      ) ||
      (needsRevision && (typeof result.revision !== "number" || result.revision < 0)) ||
      (isMediaCommand(command.action) && needsRevision && result.revision! < 1) ||
      ((isOemCommand(command.action) || isPackagingCommand(command.action)) &&
        needsRevision &&
        result.revision! < 1) ||
      (needsDigest && (typeof raw.digest !== "string" || !/^[a-f0-9]{64}$/.test(raw.digest))) ||
      (command.action === "compatibility_entity" &&
        String(raw.product_variant_id).toLowerCase() !== command.variant_id.toLowerCase()) ||
      ((command.action === "media_submit" ||
        (command.action === "media_review" && command.decision !== "EDIT")) &&
        String(raw.mapping_id).toLowerCase() !== command.mapping_id.toLowerCase()) ||
      ((command.action === "oem_submit" ||
        command.action === "packaging_submit" ||
        ((command.action === "oem_review" || command.action === "packaging_review") &&
          command.decision !== "EDIT")) &&
        (String(raw.revision_id).toLowerCase() !== command.revision_id.toLowerCase() ||
          raw.revision !== command.revision)) ||
      ((command.action === "oem_propose" ||
        command.action === "packaging_propose" ||
        ((command.action === "oem_review" || command.action === "packaging_review") &&
          command.decision === "EDIT")) &&
        raw.revision !== command.revision + 1) ||
      ((command.action === "oem_propose" || command.action === "packaging_propose") &&
        command.head_id !== null &&
        raw.head_id !== command.head_id);
    if (malformed) return { ok: false, code: "unavailable", message: commandError() };
    for (const field of requiredIds) result[field] = raw[field] as string;
    if (needsDigest) result.digest = raw.digest as string;
    if (!needsRevision) delete result.revision;
    return { ok: true, result };
  } catch {
    return { ok: false, code: "unavailable", message: commandError() };
  }
}

type ResultId =
  | "variant_id"
  | "source_id"
  | "value_id"
  | "root_value_id"
  | "event_id"
  | "entity_id"
  | "product_variant_id"
  | "relationship_id"
  | "root_relationship_id"
  | "mapping_id"
  | "head_id"
  | "revision_id";
function resultShape(command: ConsoleCommand): {
  ids: ResultId[];
  digest: boolean;
  revision: boolean;
} {
  switch (command.action) {
    case "oem_source":
    case "packaging_source":
      return { ids: ["source_id"], digest: false, revision: false };
    case "oem_propose":
    case "packaging_propose":
      return { ids: ["revision_id", "head_id"], digest: true, revision: true };
    case "oem_submit":
    case "packaging_submit":
      return { ids: ["revision_id", "head_id"], digest: true, revision: true };
    case "oem_review":
    case "packaging_review":
      return {
        ids: ["revision_id", "head_id", "event_id"],
        digest: command.decision === "EDIT",
        revision: true,
      };
    case "create":
    case "save":
      return { ids: ["variant_id"], digest: false, revision: true };
    case "source":
    case "compatibility_source":
    case "media_source":
      return { ids: ["source_id"], digest: false, revision: false };
    case "compatibility_entity":
      return { ids: ["entity_id", "product_variant_id"], digest: false, revision: false };
    case "propose":
      return { ids: ["value_id", "root_value_id"], digest: true, revision: true };
    case "compatibility_propose":
      return { ids: ["relationship_id", "root_relationship_id"], digest: true, revision: true };
    case "media_propose":
      return { ids: ["mapping_id", "head_id"], digest: true, revision: true };
    case "submit":
      return { ids: ["value_id"], digest: true, revision: true };
    case "compatibility_submit":
      return { ids: ["relationship_id"], digest: true, revision: true };
    case "media_submit":
      return { ids: ["mapping_id"], digest: true, revision: true };
    case "review":
      return {
        ids:
          command.decision === "EDIT"
            ? ["value_id", "root_value_id", "event_id"]
            : ["value_id", "event_id"],
        digest: command.decision === "EDIT",
        revision: true,
      };
    case "compatibility_review":
      return {
        ids:
          command.decision === "EDIT"
            ? ["relationship_id", "root_relationship_id", "event_id"]
            : ["relationship_id", "event_id"],
        digest: command.decision === "EDIT",
        revision: true,
      };
    case "media_review":
      return {
        ids: ["mapping_id", "head_id", "event_id"],
        digest: command.decision === "EDIT",
        revision: true,
      };
  }
}
