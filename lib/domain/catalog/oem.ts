export const OEM_SOURCE_FIELDS = [
  "source_kind",
  "source_level",
  "title",
  "source_reference",
  "evidence_basis",
  "evidence_date",
  "owner_name",
  "revision_label",
  "source_location",
  "assertion",
] as const;
export type OemSourceCopy = Record<(typeof OEM_SOURCE_FIELDS)[number], string>;
export type OemCopy = { manufacturer_name: string; reference_number: string };
export type OemApprovedStatus = "CONFIRMED" | "OEM_REFERENCE";
export type OemConfirmation = {
  source_checked: true;
  reference_checked: true;
  compatibility_not_asserted: true;
  arcfort_reference_confirmed: boolean;
};
export const oemSourceClasses = {
  company_record: {
    level: "A",
    bases: [
      "factory_record",
      "controlled_drawing",
      "approved_sample",
      "verified_reference",
      "company_catalog",
    ],
  },
  official_manufacturer: { level: "B", bases: ["manufacturer_catalog"] },
  technical_standard: { level: "C", bases: ["standard_reference"] },
  secondary_reference: { level: "D", bases: ["secondary_reference"] },
} as const;
export function isOemCommand(action: string) {
  return ["oem_source", "oem_propose", "oem_submit", "oem_review"].includes(action);
}
export function qualifyingOemSource(
  source: {
    kind: string;
    level: string;
    basis: string;
    assertion: string;
    current: boolean;
  },
  status: OemApprovedStatus,
) {
  if (!source.current) return false;
  return status === "CONFIRMED"
    ? source.kind === "company_record" &&
        source.level === "A" &&
        source.assertion === "supports" &&
        ["factory_record", "controlled_drawing", "approved_sample", "verified_reference"].includes(
          source.basis,
        )
    : source.kind === "official_manufacturer" &&
        source.level === "B" &&
        source.basis === "manufacturer_catalog" &&
        ["supports", "reference_only"].includes(source.assertion);
}
export type OemCommand =
  | { action: "oem_source"; variant_id: string; copy: OemCopy; source: OemSourceCopy }
  | {
      action: "oem_propose";
      variant_id: string;
      slot: number;
      revision: number;
      head_id: string | null;
      original_id: string | null;
      copy: OemCopy;
      sources: string[];
      reason: string;
    }
  | { action: "oem_submit"; revision_id: string; revision: number; digest: string }
  | {
      action: "oem_review";
      revision_id: string;
      revision: number;
      digest: string;
      decision: "APPROVE" | "EDIT" | "REJECT";
      reason: string;
      status: OemApprovedStatus | null;
      confirmation: OemConfirmation | null;
      source_id: string | null;
      resolution: string;
      replacement: { copy: OemCopy; sources: string[] } | null;
    };
