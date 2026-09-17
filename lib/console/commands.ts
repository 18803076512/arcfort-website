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
    action === "review"
      ? ["owner", "reviewer"]
      : action === "source" || action === "submit"
        ? ["owner", "editor", "reviewer"]
        : ["owner", "editor"];
  return roles.some((role) => allowed.includes(role));
}

export async function executeConsoleCommand(
  client: ConsoleClient,
  input: unknown,
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
  if (!canRunConsoleCommand(access.roles, command.action))
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
    const requiredIds: ("variant_id" | "source_id" | "value_id" | "root_value_id" | "event_id")[] =
      command.action === "source"
        ? ["source_id"]
        : command.action === "create" || command.action === "save"
          ? ["variant_id"]
          : command.action === "propose"
            ? ["value_id", "root_value_id"]
            : command.action === "review"
              ? command.decision === "EDIT"
                ? ["value_id", "root_value_id", "event_id"]
                : ["value_id", "event_id"]
              : ["value_id"];
    const needsDigest =
      command.action === "propose" ||
      command.action === "submit" ||
      (command.action === "review" && command.decision === "EDIT");
    const malformed =
      requiredIds.some(
        (field) =>
          typeof raw[field] !== "string" ||
          !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
            raw[field],
          ),
      ) ||
      (command.action !== "source" &&
        (typeof result.revision !== "number" || result.revision < 0)) ||
      (needsDigest && (typeof raw.digest !== "string" || !/^[a-f0-9]{64}$/.test(raw.digest)));
    if (malformed) return { ok: false, code: "unavailable", message: commandError() };
    for (const field of requiredIds) result[field] = raw[field] as string;
    if (needsDigest) result.digest = raw.digest as string;
    if (command.action === "source") delete result.revision;
    return { ok: true, result };
  } catch {
    return { ok: false, code: "unavailable", message: commandError() };
  }
}
