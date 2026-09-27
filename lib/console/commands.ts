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
import { consoleCompatibilityEnabled } from "./working-config.ts";
import { isCompatibilityCommand } from "../domain/catalog/compatibility.ts";

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
    action === "review" || action === "compatibility_review"
      ? ["owner", "reviewer"]
      : action === "source" ||
          action === "submit" ||
          action === "compatibility_source" ||
          action === "compatibility_submit"
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
    (isCompatibilityCommand(command.action) && !consoleCompatibilityEnabled(env))
  )
    return { ok: false, code: "42501", message: commandError("42501") };
  try {
    const request_uuid = command.request_id;
    const response = await (async () => {
      switch (command.action) {
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
      (needsDigest && (typeof raw.digest !== "string" || !/^[a-f0-9]{64}$/.test(raw.digest))) ||
      (command.action === "compatibility_entity" &&
        String(raw.product_variant_id).toLowerCase() !== command.variant_id.toLowerCase());
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
  | "root_relationship_id";
function resultShape(command: ConsoleCommand): {
  ids: ResultId[];
  digest: boolean;
  revision: boolean;
} {
  switch (command.action) {
    case "create":
    case "save":
      return { ids: ["variant_id"], digest: false, revision: true };
    case "source":
    case "compatibility_source":
      return { ids: ["source_id"], digest: false, revision: false };
    case "compatibility_entity":
      return { ids: ["entity_id", "product_variant_id"], digest: false, revision: false };
    case "propose":
      return { ids: ["value_id", "root_value_id"], digest: true, revision: true };
    case "compatibility_propose":
      return { ids: ["relationship_id", "root_relationship_id"], digest: true, revision: true };
    case "submit":
      return { ids: ["value_id"], digest: true, revision: true };
    case "compatibility_submit":
      return { ids: ["relationship_id"], digest: true, revision: true };
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
  }
}
