"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, X } from "lucide-react";
import type { DocumentRow } from "../../lib/console/documents";
import { documentObservationParts } from "../../lib/domain/catalog/document-review";
import type { DocumentCandidate } from "../../lib/console/document-review";
import {
  documentInspectionFailure,
  documentInspectionPath,
  parseDocumentDownload,
} from "../../lib/domain/catalog/document-inspection";

export function StoredDocumentInspection({
  item,
  onClose,
  review,
  onObserved,
}: {
  item: DocumentRow;
  onClose: () => void;
  review?: DocumentCandidate;
  onObserved?: (token: string | null) => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let objectUrl = "";
    setUrl("");
    setError("");
    onObserved?.(null);
    void (async () => {
      try {
        const response = await fetch(documentInspectionPath, {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: { "content-type": "application/json", "x-console-command": "1" },
          body: JSON.stringify(
            review
              ? {
                  candidate_id: review.candidate_id,
                  revision: review.revision,
                  digest: review.digest,
                }
              : { variant_id: item.variant_id, document_id: item.document_id },
          ),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(45000)]),
        });
        if (!response.ok) {
          await response.body?.cancel();
          const code = (
            { 403: "42501", 409: "40001", 422: "22023", 429: "54000" } as Record<number, string>
          )[response.status];
          if (active) setError(documentInspectionFailure(code).message);
          return;
        }
        const receipt = parseDocumentDownload(
          JSON.parse(decodeURIComponent(response.headers.get("x-console-document") ?? "")),
        );
        if (
          receipt.document_id !== item.document_id ||
          receipt.filename !== item.filename ||
          receipt.byte_size !== item.byte_size ||
          receipt.page_count !== item.page_count ||
          response.headers.get("content-type") !== "application/pdf" ||
          response.headers.get("content-length") !== String(item.byte_size) ||
          !response.body
        )
          throw new Error();
        const reader = response.body.getReader();
        const chunks: Uint8Array<ArrayBuffer>[] = [];
        let length = 0;
        try {
          for (let reads = 0; ; reads++) {
            if (reads >= 8192) throw new Error();
            const chunk = await reader.read();
            if (chunk.done) break;
            length += chunk.value.byteLength;
            if (length > receipt.byte_size) throw new Error();
            chunks.push(Uint8Array.from(chunk.value));
          }
        } finally {
          await reader.cancel().catch(() => {});
          reader.releaseLock();
        }
        if (length !== receipt.byte_size) throw new Error();
        if (!active) return;
        const token = response.headers.get("x-console-document-observation");
        if (review) {
          const parts = documentObservationParts(token);
          if (
            !parts ||
            parts[4] !== review.candidate_id ||
            parts[5] !== item.document_id ||
            parts[6] !== item.variant_id ||
            parts[7] !== String(review.revision) ||
            parts[8] !== review.digest ||
            parts[9] !== review.original_digest ||
            parts[10] !== review.evidence_digest ||
            Number(parts[12]) * 1000 <= Date.now()
          )
            throw new Error();
        } else if (token !== null) throw new Error();
        objectUrl = URL.createObjectURL(new Blob(chunks, { type: "application/pdf" }));
        setUrl(objectUrl);
        if (review) onObserved?.(token);
      } catch {
        if (active) setError(documentInspectionFailure().message);
      } finally {
        controller.abort();
      }
    })();
    return () => {
      active = false;
      controller.abort();
      onObserved?.(null);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [
    item.variant_id,
    item.document_id,
    item.filename,
    item.byte_size,
    item.page_count,
    attempt,
    review,
    onObserved,
  ]);
  return (
    <section className="console-original-inspection" aria-label="Stored document inspection">
      <div className="console-inspection-heading">
        <div>
          <h3 ref={heading} tabIndex={-1}>
            {item.filename}
          </h3>
          <p className="console-caption">
            {item.sku} / {item.page_count} pages / {((item.byte_size ?? 0) / 1048576).toFixed(2)}{" "}
            MiB
          </p>
          <p className="console-caption">Rights and exact-SKU review separate</p>
        </div>
        <button
          type="button"
          className="console-icon-button"
          aria-label="Close document inspection"
          title="Close document inspection"
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      {error ? (
        <div className="console-command-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="console-icon-button"
            aria-label="Retry document inspection"
            title="Retry document inspection"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RotateCcw size={20} aria-hidden="true" />
          </button>
        </div>
      ) : !url ? (
        <p role="status">Checking stored PDF...</p>
      ) : (
        <div className="console-inspection-tools">
          <p role="status">Stored bytes checked</p>
          <a
            className="console-icon-button"
            href={url}
            download={item.filename ?? "document.pdf"}
            aria-label="Download PDF original"
            title="Download PDF original"
          >
            <Download size={20} aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}
