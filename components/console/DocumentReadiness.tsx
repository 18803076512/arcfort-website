import type { DocumentReadiness } from "@/lib/domain/catalog/document-readiness";
import { ConsoleLink } from "./ConsoleLink";

export function DocumentReadinessSummary({
  data,
  variantId,
  available = true,
}: {
  data: DocumentReadiness;
  variantId: string;
  available?: boolean;
}) {
  return (
    <section aria-labelledby="document-readiness-heading">
      <h2 id="document-readiness-heading">Document Review</h2>
      <p>
        {data.document_count === 0
          ? "No documents recorded."
          : `${data.reviewed_document_count} of ${data.document_count} document versions reviewed; ${data.unresolved_document_count} unresolved.`}
      </p>
      {data.document_count > 0 && (
        <dl className="console-facts">
          {[
            ["Original unavailable", data.unavailable_original_count],
            ["Open reviews", data.open_document_review_count],
            ["Invalid current approvals", data.invalid_document_approval_count],
            ["Unresolved conflicts", data.document_conflict_count],
          ].map(([label, count]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{count}</dd>
            </div>
          ))}
        </dl>
      )}
      {available && (
        <ConsoleLink href={`/console/products/${variantId}/documents`}>
          Technical documents
        </ConsoleLink>
      )}
    </section>
  );
}

export function DocumentReadinessCell({
  data,
  variantId,
  available,
}: {
  data: DocumentReadiness;
  variantId: string;
  available: boolean;
}) {
  const content = (
    <>
      {data.document_count === 0
        ? "No documents recorded"
        : `${data.unresolved_document_count} unresolved / ${data.document_count} versions`}
      {data.document_count > 0 && (
        <small>
          Reviewed: {data.reviewed_document_count}; original unavailable:{" "}
          {data.unavailable_original_count}; open reviews: {data.open_document_review_count};
          invalid approvals: {data.invalid_document_approval_count}; conflicts:{" "}
          {data.document_conflict_count}
        </small>
      )}
    </>
  );
  return available ? (
    <ConsoleLink href={`/console/products/${variantId}/documents`}>{content}</ConsoleLink>
  ) : (
    content
  );
}
