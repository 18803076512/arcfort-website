import type { SpecRow } from "@/lib/content/schemas";
import { TechnicalTable } from "@/components/content/TechnicalTable";

type SpecificationTableProps = {
  rows: SpecRow[];
  title?: string;
};

export function SpecificationTable({
  rows,
  title = "Specification Table",
}: SpecificationTableProps) {
  return (
    <TechnicalTable
      rows={rows}
      title={title}
      emptyMessage="Technical specifications are available after the required model, drawing or sample is reviewed."
    />
  );
}
