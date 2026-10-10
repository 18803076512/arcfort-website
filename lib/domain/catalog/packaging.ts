export const PACKAGING_SOURCE_FIELDS = [
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
export type PackagingCopy = {
  package_description: string;
  quantity: number | null;
  quantity_unit: string | null;
};
export type PackagingSourceCopy = Record<(typeof PACKAGING_SOURCE_FIELDS)[number], string>;
export type PackagingApprovedStatus = "CONFIRMED" | "OEM_REFERENCE";
export const packagingSourceClasses = {
  company_record: {
    level: "A",
    bases: [
      "packaging_record",
      "factory_record",
      "controlled_drawing",
      "approved_sample",
      "company_catalog",
    ],
  },
  official_manufacturer: { level: "B", bases: ["manufacturer_catalog"] },
  technical_standard: { level: "C", bases: ["standard_reference"] },
  secondary_reference: { level: "D", bases: ["secondary_reference"] },
} as const;
export function validPackagingCopy(copy: PackagingCopy) {
  const exact = (value: unknown, max: number) =>
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim() &&
    value.length <= max &&
    !/[\u0000-\u001f\u007f]/.test(value);
  return (
    exact(copy.package_description, 1000) &&
    (copy.quantity === null
      ? copy.quantity_unit === null
      : Number.isSafeInteger(copy.quantity) &&
        copy.quantity > 0 &&
        copy.quantity <= 2147483647 &&
        exact(copy.quantity_unit, 40))
  );
}
export function samePackaging(a: PackagingCopy, b: PackagingCopy) {
  return (
    a.package_description === b.package_description &&
    a.quantity === b.quantity &&
    a.quantity_unit === b.quantity_unit
  );
}
export function isPackagingCommand(action: string) {
  return ["packaging_source", "packaging_propose", "packaging_submit", "packaging_review"].includes(
    action,
  );
}
export function qualifyingPackagingSource(
  source: {
    kind: string;
    level: string;
    basis: string;
    assertion: string;
    current: boolean;
    copy: PackagingCopy;
  },
  status: PackagingApprovedStatus,
) {
  if (!source.current) return false;
  return status === "CONFIRMED"
    ? source.copy.quantity !== null &&
        source.kind === "company_record" &&
        source.level === "A" &&
        source.assertion === "supports" &&
        ["packaging_record", "factory_record", "controlled_drawing", "approved_sample"].includes(
          source.basis,
        )
    : source.kind === "official_manufacturer" &&
        source.level === "B" &&
        source.basis === "manufacturer_catalog" &&
        ["supports", "reference_only"].includes(source.assertion);
}
export type PackagingCommand =
  | {
      action: "packaging_source";
      variant_id: string;
      original_id: string | null;
      copy: PackagingCopy;
      source: PackagingSourceCopy;
    }
  | {
      action: "packaging_propose";
      variant_id: string;
      slot: number;
      revision: number;
      head_id: string | null;
      original_id: string | null;
      copy: PackagingCopy;
      sources: string[];
      reason: string;
    }
  | { action: "packaging_submit"; revision_id: string; revision: number; digest: string }
  | {
      action: "packaging_review";
      revision_id: string;
      revision: number;
      digest: string;
      decision: "APPROVE" | "EDIT" | "REJECT";
      reason: string;
      status: PackagingApprovedStatus | null;
      confirmation: {
        source_checked: true;
        packaging_checked: true;
        commercial_terms_unchanged: true;
        arcfort_packaging_confirmed: boolean;
      } | null;
      source_id: string | null;
      resolution: string;
      replacement: { copy: PackagingCopy; sources: string[] } | null;
    };
