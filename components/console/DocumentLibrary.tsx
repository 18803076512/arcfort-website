"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, FileSearch, Upload, X, Save } from "lucide-react";
import { StoredDocumentInspection } from "./StoredDocumentInspection";
import { ConsoleLink } from "./ConsoleLink";
import { DataTable, EmptyState } from "./CatalogViews";
import { useConsoleCommand, useUnsavedChanges } from "./useConsoleCommand";
import type { DocumentLibraryData, DocumentRow } from "../../lib/console/documents";
import {
  documentSources,
  documentTypes,
  documentUuid,
  documentUploadBytes,
  documentUploadPath,
  documentUploadFailure,
  parseDocumentUpload,
  type DocumentCopy,
  type DocumentUploadInput,
} from "../../lib/domain/catalog/documents";

const blank = (): DocumentCopy => ({
  title: "",
  document_type: "drawing",
  source_kind: "company_record",
  source_level: "A",
  owner_name: "",
  source_reference: "",
  source_location: "",
  scope_note: "",
  revision_label: null,
  issued_date: null,
});
export function DocumentLibrary({ data }: { data: DocumentLibraryData }) {
  const router = useRouter();
  const command = useConsoleCommand();
  const [copy, setCopy] = useState<DocumentCopy>(blank);
  const [dirty, setDirty] = useState(false);
  const [prior, setPrior] = useState<DocumentRow | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [inspection, setInspection] = useState<string | null>(null);
  const inspectionTrigger = useRef<HTMLButtonElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const flight = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const pending = useRef<{ file: File; input: DocumentUploadInput } | null>(null);
  const markSafe = useUnsavedChanges(dirty || !!file);
  const target = data.items.find((row) => row.document_id === selected);
  const inspected = data.items.find(
    (row) =>
      row.document_id === inspection && row.subject_current && row.upload_state === "recorded",
  );
  const editable = data.canWrite && data.variantId !== null;
  const blocked = busy || command.busy;
  const canUpload = (row: DocumentRow) =>
    editable &&
    row.subject_current &&
    (row.upload_state === "missing" ||
      (row.upload_state === "pending" && row.upload_request_id !== null));
  useEffect(() => {
    if (selected) fileInput.current?.focus();
  }, [selected]);
  function update<K extends keyof DocumentCopy>(field: K, value: DocumentCopy[K]) {
    setCopy((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setMessage("");
  }
  function clearUpload() {
    setSelected(null);
    setFile(null);
    pending.current = null;
    setError("");
    if (fileInput.current) fileInput.current.value = "";
  }
  async function register(event: React.FormEvent) {
    event.preventDefault();
    if (blocked || !editable) return;
    const result = await command.run({
      action: "document_reference",
      variant_id: data.variantId!,
      prior_document_id: prior?.document_id ?? null,
      copy,
    });
    if (!result?.document_id || !documentUuid.test(result.document_id)) return;
    setCopy(blank());
    setDirty(false);
    setPrior(null);
    setMessage("Reference registered. Original file and review pending.");
    if (!file) markSafe();
    if (data.page !== 1) router.replace(`/console/products/${data.variantId}/documents`);
    router.refresh();
  }
  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!target || !canUpload(target) || !file || blocked || flight.current) return;
    setError("");
    setMessage("");
    if (
      !pending.current ||
      pending.current.file !== file ||
      pending.current.input.document_id !== target.document_id
    )
      pending.current = {
        file,
        input: {
          request_id: target.upload_request_id ?? crypto.randomUUID(),
          completion_id: crypto.randomUUID(),
          document_id: target.document_id,
          filename: file.name,
          byte_size: file.size,
        },
      };
    const header = encodeURIComponent(JSON.stringify(pending.current.input));
    try {
      parseDocumentUpload(header);
    } catch {
      const problem = documentUploadFailure("22023");
      setError(problem.ok ? "" : problem.message);
      return;
    }
    flight.current = true;
    setBusy(true);
    try {
      const response = await fetch(documentUploadPath, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "x-console-command": "1",
          "x-console-document": header,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
        signal: AbortSignal.timeout(90000),
      });
      const result: unknown = await response.json();
      if (
        response.ok &&
        result &&
        typeof result === "object" &&
        "ok" in result &&
        result.ok === true &&
        "document_id" in result &&
        result.document_id === target.document_id &&
        "intent_id" in result &&
        typeof result.intent_id === "string" &&
        documentUuid.test(result.intent_id)
      ) {
        clearUpload();
        if (!dirty) markSafe();
        setMessage("Original received. Document rights and exact-SKU review pending.");
        router.refresh();
      } else {
        const code =
          result &&
          typeof result === "object" &&
          "code" in result &&
          typeof result.code === "string"
            ? result.code
            : undefined;
        const problem = documentUploadFailure(code);
        setError(problem.ok ? "" : problem.message);
      }
    } catch {
      const problem = documentUploadFailure();
      setError(problem.ok ? "" : problem.message);
    } finally {
      flight.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="console-document-library">
      {data.sku && <p className="console-caption">{data.sku}</p>}
      {message && (
        <p className="console-original-feedback" role="status">
          {message}
        </p>
      )}
      {command.error && (
        <div ref={command.alert} tabIndex={-1} className="console-command-error" role="alert">
          {command.error.message}
        </div>
      )}
      {editable && (
        <form className="console-editor" onSubmit={register}>
          <fieldset disabled={blocked}>
            <legend>{prior ? "New document version" : "New document reference"}</legend>
            {prior && (
              <p className="console-caption">
                Previous reference: {prior.title} / {prior.revision_label ?? "Unknown revision"}
              </p>
            )}
            <div className="console-editor-grid">
              <label className="console-span-full">
                Document title
                <input
                  ref={titleInput}
                  required
                  maxLength={500}
                  value={copy.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </label>
              <label>
                Document type
                <select
                  value={copy.document_type}
                  onChange={(e) =>
                    update("document_type", e.target.value as DocumentCopy["document_type"])
                  }
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Source class
                <select
                  value={copy.source_kind}
                  onChange={(e) => {
                    const kind = e.target.value as DocumentCopy["source_kind"];
                    setCopy((current) => ({
                      ...current,
                      source_kind: kind,
                      source_level: documentSources[kind].level,
                    }));
                    setDirty(true);
                  }}
                >
                  {Object.entries(documentSources).map(([kind, item]) => (
                    <option key={kind} value={kind}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Revision label (optional)
                <input
                  maxLength={200}
                  value={copy.revision_label ?? ""}
                  onChange={(e) => update("revision_label", e.target.value || null)}
                />
              </label>
              <label>
                Issued date (optional)
                <input
                  type="date"
                  value={copy.issued_date ?? ""}
                  onChange={(e) => update("issued_date", e.target.value || null)}
                />
              </label>
              {(["owner_name", "source_reference", "source_location", "scope_note"] as const).map(
                (field) => (
                  <label className="console-span-full" key={field}>
                    {
                      {
                        owner_name: "Source custodian",
                        source_reference: "Source reference",
                        source_location: "Page or section",
                        scope_note: "Exact-SKU scope",
                      }[field]
                    }
                    <input
                      required
                      maxLength={2000}
                      value={copy[field]}
                      onChange={(e) => update(field, e.target.value)}
                    />
                  </label>
                ),
              )}
            </div>
            <div className="console-editor-actions">
              <button className="console-button console-action" type="submit">
                <Save size={18} aria-hidden="true" />
                {command.busy ? "Registering..." : "Register reference"}
              </button>
              <button
                className="console-icon-button"
                type="button"
                title="Clear reference draft"
                aria-label="Clear reference draft"
                onClick={() => {
                  setCopy(blank());
                  setDirty(false);
                  setPrior(null);
                  command.clearError();
                  if (!file) markSafe();
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </fieldset>
        </form>
      )}
      {!data.canWrite && <p className="console-caption">Read-only access</p>}
      {selected && editable && (
        <form className="console-editor" onSubmit={upload}>
          <fieldset disabled={blocked}>
            <legend>PDF original: {target?.title ?? "Unavailable reference"}</legend>
            {(!target || !canUpload(target)) && (
              <p role="alert" className="console-command-error">
                This reference is no longer available for upload. The selected file has not been
                discarded.
              </p>
            )}
            {target?.upload_state === "pending" && (
              <p className="console-caption">Reserved original: {target.filename}</p>
            )}
            <label>
              PDF original
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,application/pdf"
                required
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  pending.current = null;
                  setError("");
                  setMessage("");
                }}
              />
            </label>
            {error && (
              <p className="console-command-error" role="alert">
                {error}
              </p>
            )}
            <div className="console-editor-actions">
              <button
                className="console-button console-action"
                disabled={!target || !canUpload(target) || !file || file.size > documentUploadBytes}
                type="submit"
              >
                <Upload size={18} aria-hidden="true" />
                {busy ? "Uploading..." : error ? "Retry PDF upload" : "Upload PDF"}
              </button>
              <button
                type="button"
                className="console-icon-button"
                title="Close PDF upload"
                aria-label="Close PDF upload"
                onClick={() => {
                  clearUpload();
                  if (!dirty) markSafe();
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {file && file.size > documentUploadBytes && (
              <p role="alert" className="console-command-error">
                The PDF exceeds 25 MiB.
              </p>
            )}
          </fieldset>
        </form>
      )}
      {inspected && (
        <StoredDocumentInspection
          key={inspected.document_id}
          item={inspected}
          onClose={() => {
            setInspection(null);
            inspectionTrigger.current?.focus();
          }}
        />
      )}
      <h2>Document references</h2>
      {data.items.length ? (
        <DataTable
          label="Document references"
          columns={["Document / SKU", "Source / Scope", "Original / Review", "Actions"]}
        >
          {data.items.map((row) => (
            <tr key={row.document_id}>
              <td>
                <strong>{row.title}</strong>
                <p>
                  <ConsoleLink href={`/console/products/${row.variant_id}/documents`}>
                    {row.sku}
                  </ConsoleLink>
                </p>
                <p>
                  {row.document_type.replaceAll("_", " ")} /{" "}
                  {row.revision_label ?? "Unknown revision"}
                </p>
                <p>Issued: {row.issued_date ?? "Unknown"}</p>
                {row.prior_document_id && (
                  <p className="console-caption">Previous reference: {row.prior_document_id}</p>
                )}
              </td>
              <td>
                {documentSources[row.source_kind].label}
                <p>{row.owner_name}</p>
                <p>{row.source_reference}</p>
                <details>
                  <summary>Scope and provenance</summary>
                  <p>{row.source_location}</p>
                  <p>{row.scope_note}</p>
                  <p>Registered: {row.created_at.slice(0, 10)}</p>
                </details>
              </td>
              <td>
                {!row.subject_current
                  ? "SKU scope changed"
                  : row.upload_state === "recorded"
                    ? "Upload recorded"
                    : row.upload_state === "pending"
                      ? "Upload incomplete"
                      : "Original missing"}
                {row.filename && (
                  <p>
                    {row.filename} / {row.page_count} pages /{" "}
                    {(row.byte_size! / 1048576).toFixed(2)} MiB
                  </p>
                )}
                <p className="console-caption">Rights and exact-SKU review separate</p>
              </td>
              <td>
                <div className="console-document-actions">
                  {data.reviewEnabled && (
                    <ConsoleLink
                      href={`/console/products/${row.variant_id}/documents/${row.document_id}`}
                    >
                      Review record
                    </ConsoleLink>
                  )}
                  <button
                    type="button"
                    className="console-icon-button"
                    disabled={!row.subject_current || row.upload_state !== "recorded"}
                    title={`Inspect original for ${row.title}`}
                    aria-label={`Inspect original for ${row.title}`}
                    onClick={(event) => {
                      inspectionTrigger.current = event.currentTarget;
                      setInspection(row.document_id);
                    }}
                  >
                    <FileSearch size={18} aria-hidden="true" />
                  </button>
                  {editable && (
                    <>
                      <button
                        type="button"
                        className="console-icon-button"
                        disabled={blocked || !row.subject_current}
                        title={`New version of ${row.title}`}
                        aria-label={`New version of ${row.title}`}
                        onClick={() => {
                          if (dirty && !window.confirm("Discard the current reference draft?"))
                            return;
                          setPrior(row);
                          setCopy(blank());
                          setDirty(true);
                          command.clearError();
                          setMessage("");
                          titleInput.current?.focus();
                        }}
                      >
                        <FilePlus2 size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="console-icon-button"
                        disabled={blocked || !canUpload(row)}
                        title={`Upload original for ${row.title}`}
                        aria-label={`Upload original for ${row.title}`}
                        onClick={() => {
                          if (file && !window.confirm("Discard the selected PDF?")) return;
                          clearUpload();
                          setSelected(row.document_id);
                        }}
                      >
                        <Upload size={18} aria-hidden="true" />
                      </button>
                    </>
                  )}
                  {!editable && (
                    <ConsoleLink href={`/console/products/${row.variant_id}/documents`}>
                      Open SKU
                    </ConsoleLink>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
