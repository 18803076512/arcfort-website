import { validateProductDraftCopy, type ProductDraftCopy } from "./drafts.ts";
import {
  COMPATIBILITY_SOURCE_FIELDS,
  compatibilityRelationshipTypes,
  type CompatibilityCopy,
  type CompatibilitySourceCopy,
  type CompatibilityRelationshipType,
} from "./compatibility.ts";

export type TechnicalValueCopy = { value_text: string; unit: string };
export type EvidenceLink = { source_id: string; role: "supporting" | "conflicting" };
export const SOURCE_FIELDS = [
  "source_kind",
  "source_level",
  "title",
  "source_reference",
  "evidence_basis",
  "evidence_date",
  "owner_name",
  "revision_label",
  "source_location",
  "asserted_value",
  "asserted_unit",
] as const;
export type TechnicalSourceCopy = Record<(typeof SOURCE_FIELDS)[number], string>;
export type DraftIdentity = { sku: string; slug: string; source_reference: string };
type Base = { request_id: string };
type Target = { variant_id: string; field_id: string; scope: string };
type ReviewTarget = { value_id: string; revision: number; digest: string };
type CompatibilityTarget = {
  subject_id: string;
  target_id: string;
  relationship_type: CompatibilityRelationshipType;
  scope: string;
};
type CompatibilityReviewTarget = { relationship_id: string; revision: number; digest: string };
export type ConsoleCommand = Base &
  (
    | { action: "create"; identity: DraftIdentity; copy: ProductDraftCopy }
    | { action: "save"; variant_id: string; revision: number; copy: ProductDraftCopy }
    | (Target & { action: "source"; source: TechnicalSourceCopy })
    | (Target & {
        action: "propose";
        revision: number;
        value: TechnicalValueCopy;
        evidence: EvidenceLink[];
        reason: string;
      })
    | (ReviewTarget & { action: "submit" })
    | (ReviewTarget & {
        action: "review";
        decision: "APPROVE" | "EDIT" | "REJECT";
        reason: string;
        resolution: string;
        replacement: TechnicalValueCopy | null;
        evidence: EvidenceLink[] | null;
      })
    | { action: "compatibility_entity"; variant_id: string }
    | (CompatibilityTarget & {
        action: "compatibility_source";
        role: string;
        source: CompatibilitySourceCopy;
      })
    | (CompatibilityTarget & {
        action: "compatibility_propose";
        root_id: string | null;
        revision: number;
        copy: CompatibilityCopy;
        evidence: EvidenceLink[];
        reason: string;
      })
    | (CompatibilityReviewTarget & { action: "compatibility_submit" })
    | (CompatibilityReviewTarget & {
        action: "compatibility_review";
        decision: "APPROVE" | "EDIT" | "REJECT";
        reason: string;
        resolution: string;
        replacement: CompatibilityCopy | null;
        evidence: EvidenceLink[] | null;
      })
  );
export type CommandInput = ConsoleCommand extends infer C
  ? C extends ConsoleCommand
    ? Omit<C, "request_id">
    : never
  : never;
export type CommandResult =
  | {
      ok: true;
      result: {
        variant_id?: string;
        value_id?: string;
        root_value_id?: string;
        source_id?: string;
        revision?: number;
        digest?: string;
        event_id?: string;
        entity_id?: string;
        product_variant_id?: string;
        relationship_id?: string;
        root_relationship_id?: string;
      };
    }
  | { ok: false; code: string; message: string; fields?: string[] };

export class CommandInputError extends Error {
  readonly fields: string[];
  constructor(fields: string[] = ["form"]) {
    super("Invalid command fields.");
    this.fields = fields;
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CommandInputError();
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, expected: string[]) {
  if (Object.keys(value).sort().join("|") !== [...expected].sort().join("|"))
    throw new CommandInputError();
}
function string(
  value: unknown,
  field: string,
  max: number,
  required = false,
): asserts value is string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim()))
    throw new CommandInputError([field]);
}
function uuid(value: unknown, field: string) {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)
  )
    throw new CommandInputError([field]);
}
function revision(value: unknown) {
  if (!Number.isSafeInteger(value) || (value as number) < 0)
    throw new CommandInputError(["revision"]);
}
function technical(value: unknown) {
  const copy = record(value);
  keys(copy, ["value_text", "unit"]);
  string(copy.value_text, "value_text", 1000, true);
  string(copy.unit, "unit", 80);
}
function evidence(value: unknown) {
  if (!Array.isArray(value) || value.length > 20) throw new CommandInputError(["evidence"]);
  const seen = new Set<string>();
  for (const item of value) {
    const link = record(item);
    keys(link, ["source_id", "role"]);
    uuid(link.source_id, "source_id");
    if (
      !["supporting", "conflicting"].includes(link.role as string) ||
      seen.has(String(link.source_id).toLowerCase())
    )
      throw new CommandInputError(["evidence"]);
    seen.add(String(link.source_id).toLowerCase());
  }
}
function reason(value: unknown) {
  string(value, "reason", 2000, true);
  if (value.replace(/\s/g, "").length < 3) throw new CommandInputError(["reason"]);
}
function exactLabel(value: unknown, field: string) {
  string(value, field, 200, true);
  if (value !== value.trim()) throw new CommandInputError([field]);
}
function compatibilityCopy(value: unknown) {
  const copy = record(value);
  keys(copy, ["role", "confirmation_requirements"]);
  exactLabel(copy.role, "role");
  if (
    !Array.isArray(copy.confirmation_requirements) ||
    copy.confirmation_requirements.length < 1 ||
    copy.confirmation_requirements.length > 20
  )
    throw new CommandInputError(["confirmation_requirements"]);
  for (const requirement of copy.confirmation_requirements)
    string(requirement, "confirmation_requirements", 500, true);
}
function sourceClassification(source: Record<string, unknown>) {
  const levels: Record<string, string> = {
    company_record: "A",
    official_manufacturer: "B",
    technical_standard: "C",
    secondary_reference: "D",
  };
  if (
    !Object.hasOwn(levels, String(source.source_kind)) ||
    levels[String(source.source_kind)] !== source.source_level
  )
    throw new CommandInputError(["source_kind"]);
  const date = String(source.evidence_date);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date ||
    date > new Date().toISOString().slice(0, 10)
  )
    throw new CommandInputError(["evidence_date"]);
}
export function parseConsoleCommand(input: unknown): ConsoleCommand {
  const value = record(input);
  uuid(value.request_id, "request_id");
  const base = ["action", "request_id"];
  if (value.action === "create" || value.action === "save") {
    keys(value, [
      ...base,
      ...(value.action === "create" ? ["identity"] : ["variant_id", "revision"]),
      "copy",
    ]);
    const copy = validateProductDraftCopy(value.copy);
    if (!copy.valid)
      throw new CommandInputError([
        ...new Set(
          copy.errors.map((error) =>
            Object.hasOwn(
              { name_en: 1, name_zh: 1, model: 1, summary: 1, description: 1, applications: 1 },
              error.field,
            )
              ? error.field
              : "form",
          ),
        ),
      ]);
    if (value.action === "save") {
      uuid(value.variant_id, "variant_id");
      revision(value.revision);
    } else {
      const identity = record(value.identity);
      keys(identity, ["sku", "slug", "source_reference"]);
      string(identity.sku, "sku", 30, true);
      string(identity.slug, "slug", 160, true);
      string(identity.source_reference, "source_reference", 1000, true);
      if (!/^AF-MIG-[A-Z0-9]{2,4}-[0-9]{4}$/.test(identity.sku))
        throw new CommandInputError(["sku"]);
      if (identity.slug.length < 3 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(identity.slug))
        throw new CommandInputError(["slug"]);
      if (identity.source_reference.trim().length < 3)
        throw new CommandInputError(["source_reference"]);
    }
  } else if (value.action === "source" || value.action === "propose") {
    keys(value, [
      ...base,
      "variant_id",
      "field_id",
      "scope",
      ...(value.action === "source" ? ["source"] : ["revision", "value", "evidence", "reason"]),
    ]);
    uuid(value.variant_id, "variant_id");
    uuid(value.field_id, "field_id");
    string(value.scope, "scope", 200);
    if (value.scope !== value.scope.trim()) throw new CommandInputError(["scope"]);
    if (value.action === "source") {
      const source = record(value.source);
      keys(source, [...SOURCE_FIELDS]);
      for (const field of SOURCE_FIELDS)
        string(source[field], field, 2000, field !== "asserted_unit");
      sourceClassification(source);
    } else {
      revision(value.revision);
      technical(value.value);
      evidence(value.evidence);
      reason(value.reason);
    }
  } else if (value.action === "submit" || value.action === "review") {
    keys(value, [
      ...base,
      "value_id",
      "revision",
      "digest",
      ...(value.action === "review"
        ? ["decision", "reason", "resolution", "replacement", "evidence"]
        : []),
    ]);
    uuid(value.value_id, "value_id");
    revision(value.revision);
    if (typeof value.digest !== "string" || !/^[a-f0-9]{64}$/.test(value.digest))
      throw new CommandInputError(["digest"]);
    if (value.action === "review") {
      reason(value.reason);
      string(value.resolution, "resolution", 2000);
      if (!["APPROVE", "EDIT", "REJECT"].includes(value.decision as string))
        throw new CommandInputError(["decision"]);
      if (value.decision === "EDIT") {
        technical(value.replacement);
        evidence(value.evidence);
      } else if (value.replacement !== null || value.evidence !== null)
        throw new CommandInputError(["replacement"]);
    }
  } else if (value.action === "compatibility_entity") {
    keys(value, [...base, "variant_id"]);
    uuid(value.variant_id, "variant_id");
  } else if (value.action === "compatibility_source" || value.action === "compatibility_propose") {
    keys(value, [
      ...base,
      "subject_id",
      "target_id",
      "relationship_type",
      "scope",
      ...(value.action === "compatibility_source"
        ? ["role", "source"]
        : ["root_id", "revision", "copy", "evidence", "reason"]),
    ]);
    uuid(value.subject_id, "subject_id");
    uuid(value.target_id, "target_id");
    if (String(value.subject_id).toLowerCase() === String(value.target_id).toLowerCase())
      throw new CommandInputError(["target_id"]);
    if (!compatibilityRelationshipTypes.some((type) => type === value.relationship_type))
      throw new CommandInputError(["relationship_type"]);
    exactLabel(value.scope, "scope");
    if (value.action === "compatibility_source") {
      exactLabel(value.role, "role");
      const source = record(value.source);
      keys(source, [...COMPATIBILITY_SOURCE_FIELDS]);
      for (const field of COMPATIBILITY_SOURCE_FIELDS) {
        string(source[field], field, 2000, true);
        if (source[field] !== source[field].trim()) throw new CommandInputError([field]);
      }
      sourceClassification(source);
      if (!["supports", "contradicts", "catalog_grouping"].includes(String(source.assertion)))
        throw new CommandInputError(["assertion"]);
      if (
        ![
          "company_catalog",
          "factory_confirmation",
          "drawing",
          "approved_sample",
          "verified_reference_number",
          "confirmed_dimensions",
          "official_catalog",
          "standard",
          "secondary_reference",
        ].includes(String(source.evidence_basis))
      )
        throw new CommandInputError(["evidence_basis"]);
    } else {
      if (value.root_id !== null) uuid(value.root_id, "root_id");
      revision(value.revision);
      if (value.root_id === null && value.revision !== 0) throw new CommandInputError(["revision"]);
      compatibilityCopy(value.copy);
      evidence(value.evidence);
      reason(value.reason);
    }
  } else if (value.action === "compatibility_submit" || value.action === "compatibility_review") {
    keys(value, [
      ...base,
      "relationship_id",
      "revision",
      "digest",
      ...(value.action === "compatibility_review"
        ? ["decision", "reason", "resolution", "replacement", "evidence"]
        : []),
    ]);
    uuid(value.relationship_id, "relationship_id");
    revision(value.revision);
    if (typeof value.digest !== "string" || !/^[a-f0-9]{64}$/.test(value.digest))
      throw new CommandInputError(["digest"]);
    if (value.action === "compatibility_review") {
      reason(value.reason);
      string(value.resolution, "resolution", 2000);
      if (
        typeof value.decision !== "string" ||
        !["APPROVE", "EDIT", "REJECT"].includes(value.decision)
      )
        throw new CommandInputError(["decision"]);
      if (value.decision === "EDIT") {
        compatibilityCopy(value.replacement);
        evidence(value.evidence);
      } else if (value.replacement !== null || value.evidence !== null)
        throw new CommandInputError(["replacement"]);
    }
  } else throw new CommandInputError(["action"]);
  return value as ConsoleCommand;
}

export function commandError(code?: string): string {
  switch (code) {
    case "42501":
      return "Your current role cannot perform this action.";
    case "23505":
      return "That SKU or slug already exists.";
    case "23514":
      return "The evidence does not meet this action's verification requirements.";
    case "40001":
      return "This revision changed. Compare the latest record before trying again.";
    case "55000":
      return "This record is not available for that action in the current working scope.";
    case "22023":
      return "Review the marked fields and required evidence or decision reason.";
    default:
      return "The request could not be verified. Your entries have been kept; retry the same action.";
  }
}
