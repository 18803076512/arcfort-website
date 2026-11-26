import {
  getProductTechnicalFacts,
  getProductTechnicalSpecificationProjection,
} from "./product-technical-facts.ts";

// Qualify only an exact bare reference. Descriptive source text may carry side roles or
// other confirmation guidance and must remain verbatim, including unmanaged products.
export function getPublicDownloadThread(productSlug: string, thread: string): string {
  const threadLabels = new Set(
    getProductTechnicalFacts(productSlug)
      .filter((fact) => fact.sourceField === "thread")
      .map((fact) => fact.label),
  );
  const matchingRows = getProductTechnicalSpecificationProjection(productSlug).rows.filter(
    (row) => threadLabels.has(row.label) && row.value === thread,
  );

  if (matchingRows.length !== 1 || !matchingRows[0].note) return thread;

  return `${thread}; ${matchingRows[0].note}`;
}
