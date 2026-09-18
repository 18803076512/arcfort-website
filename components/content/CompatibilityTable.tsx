import type { CompatibilityRow } from "@/lib/content/schemas";
import { TechnicalTable } from "@/components/content/TechnicalTable";

type CompatibilityTableProps = {
  rows: CompatibilityRow[];
};

export function CompatibilityTable({ rows }: CompatibilityTableProps) {
  return (
    <TechnicalTable
      rows={rows}
      title="Compatibility Information"
      emptyMessage="Compatibility can be confirmed by torch or machine model, drawing, sample, reference part and dimensional details."
    />
  );
}
