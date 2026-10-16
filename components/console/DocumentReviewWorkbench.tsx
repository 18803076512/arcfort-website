"use client";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileSearch,
  Plus,
  RotateCcw,
  Save,
  Send,
  X,
} from "lucide-react";
import type { DocumentReviewData, DocumentCandidate } from "../../lib/console/document-review";
import { documentSources } from "../../lib/domain/catalog/documents";
import {
  documentEvidenceBases,
  documentObservationParts,
  type DocumentSourceCopy,
  type DocumentDimension,
} from "../../lib/domain/catalog/document-review";
import { ConsoleLink } from "./ConsoleLink";
import { StoredDocumentInspection } from "./StoredDocumentInspection";
import { DataTable, Status } from "./CatalogViews";
import { useConsoleCommand, useUnsavedChanges } from "./useConsoleCommand";

const blankSource = (): DocumentSourceCopy => ({
  title: "",
  source_kind: "company_record",
  source_level: "A",
  evidence_basis: "company_catalog",
  evidence_date: null,
  owner_name: "",
  revision_label: null,
  source_reference: "",
  source_location: "",
  scope_note: "",
  assertion: "reference_only",
});
function State({ candidate }: { candidate: DocumentCandidate | null }) {
  if (!candidate) return <p className="console-caption">No review recorded</p>;
  return (
    <>
      <p>
        Revision {candidate.revision} /{" "}
        {candidate.decision ?? (candidate.submitted ? "Pending review" : "Draft")}
      </p>
      <Status value={candidate.verification_status} />
      <p>{candidate.scope_note}</p>
      {!candidate.fresh && <p className="console-command-error">Original or evidence changed</p>}
      {candidate.decision === "APPROVE" && (
        <p className="console-caption">
          {candidate.human_valid && candidate.observed
            ? "Current rights and scope decision"
            : "Approval requires revalidation"}
        </p>
      )}
    </>
  );
}
export function DocumentReviewWorkbench({ data }: { data: DocumentReviewData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const command = useConsoleCommand();
  const [paging, transition] = useTransition();
  const latest = data.latest;
  const pending = !!latest?.submitted && latest.decision === null;
  const [scope, setScope] = useState(latest?.scope_note ?? data.document.scope_note);
  const [selected, setSelected] = useState<string[]>(latest?.sources ?? []);
  const [dirty, setDirty] = useState(false);
  const [reason, setReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [mode, setMode] = useState<"APPROVE" | "EDIT" | "REJECT">("APPROVE");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [dimension, setDimension] = useState<DocumentDimension>("usage_rights");
  const [source, setSource] = useState<DocumentSourceCopy>(blankSource);
  const [sourceDirty, setSourceDirty] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionAttempt, setInspectionAttempt] = useState(0);
  const [observation, setObservation] = useState<string | null>(null);
  const [ack, setAck] = useState({ original: false, rights: false, scope: false });
  const [rights, setRights] = useState("");
  const [exactScope, setExactScope] = useState("");
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const changed =
    dirty || sourceDirty || !!reason || !!resolution || Object.values(ack).some(Boolean);
  const markSafe = useUnsavedChanges(changed);
  const blocked = command.busy || paging || refreshing;
  const stale = command.error?.code === "40001" || command.error?.code === "55000";
  const canCopy =
    data.originalCurrent &&
    !stale &&
    !sourceDirty &&
    (pending ? data.canReview && mode === "EDIT" : data.canPropose);
  const base = `/console/products/${data.document.variant_id}/documents/${data.document.document_id}`;
  const observed = useCallback((token: string | null) => {
    setObservation(token);
    setAck({ original: false, rights: false, scope: false });
  }, []);
  useEffect(() => {
    setRefreshing(false);
  }, [data]);
  useEffect(() => {
    if (!observation) return;
    const parts = documentObservationParts(observation);
    if (!parts) {
      observed(null);
      return;
    }
    const timer = setTimeout(
      () => observed(null),
      Math.max(0, Number(parts[12]) * 1000 - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [observation, observed]);
  const sourceChoices = data.selectedSources.filter(
    (item) => latest?.sources.includes(item.source_id) && item.qualifies,
  );
  const sources = [
    ...new Map(
      [...data.selectedSources, ...data.sources.items].map((item) => [item.source_id, item]),
    ).values(),
  ];
  function reload() {
    if (changed && !window.confirm("Discard unsaved changes and reload this review?")) return;
    markSafe();
    window.location.reload();
  }
  function refresh(text: string) {
    setMessage(text);
    setRefreshing(true);
    markSafe();
    router.refresh();
  }
  async function saveProposal(event: React.FormEvent) {
    event.preventDefault();
    if (blocked || !canCopy || pending) return;
    const result = await command.run({
      action: "document_propose",
      variant_id: data.document.variant_id,
      document_id: data.document.document_id,
      revision: data.revision,
      copy: { scope_note: scope, sources: selected },
      reason,
    });
    if (result) refresh("Review draft saved.");
  }
  async function submit() {
    if (
      !latest ||
      blocked ||
      dirty ||
      sourceDirty ||
      stale ||
      !latest.fresh ||
      latest.submitted ||
      !data.canSubmit
    )
      return;
    if (
      await command.run({
        action: "document_submit",
        candidate_id: latest.candidate_id,
        revision: latest.revision,
        digest: latest.digest,
      })
    )
      refresh("Review submitted.");
  }
  async function decide(event: React.FormEvent) {
    event.preventDefault();
    if (!latest || !pending || blocked || !data.canReview || sourceDirty || stale) return;
    if (
      mode === "APPROVE" &&
      (dirty || !latest.fresh || !observation || !Object.values(ack).every(Boolean))
    )
      return;
    if (mode === "REJECT" && dirty) return;
    const result = await command.run({
      action: "document_review",
      candidate_id: latest.candidate_id,
      revision: latest.revision,
      digest: latest.digest,
      decision: mode,
      reason,
      resolution: mode === "APPROVE" ? resolution : "",
      confirmation:
        mode === "APPROVE"
          ? {
              original_digest: latest.original_digest,
              original_inspected: true,
              usage_rights_confirmed: true,
              exact_scope_confirmed: true,
            }
          : null,
      rights_source_id: mode === "APPROVE" ? rights : null,
      scope_source_id: mode === "APPROVE" ? exactScope : null,
      observation: mode === "APPROVE" ? observation : null,
      replacement: mode === "EDIT" ? { scope_note: scope, sources: selected } : null,
    });
    if (result) {
      observed(null);
      setInspecting(false);
      refresh(
        mode === "EDIT" ? "Correction saved as a new unconfirmed draft." : "Decision recorded.",
      );
    }
  }
  async function addSource(event: React.FormEvent) {
    event.preventDefault();
    if (blocked || !data.canSource || dirty || !!reason || !data.originalCurrent) return;
    if (
      await command.run({
        action: "document_source",
        variant_id: data.document.variant_id,
        document_id: data.document.document_id,
        dimension,
        source,
      })
    )
      refresh("Evidence registered. Review snapshots require revalidation.");
  }
  function pager(kind: "source" | "history", number: number, total: number) {
    const pages = Math.max(1, Math.ceil(total / 25));
    const move = (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("source_page", String(kind === "source" ? next : data.sourcePage));
      params.set("history_page", String(kind === "history" ? next : data.historyPage));
      transition(() => router.push(`${base}?${params}`, { scroll: false }));
    };
    return (
      <nav className="console-pagination" aria-label={`${kind} pagination`}>
        <span>
          {total} records / Page {number} of {pages}
        </span>
        <button
          type="button"
          className="console-icon-button"
          title={`Previous ${kind} page`}
          aria-label={`Previous ${kind} page`}
          disabled={blocked || number <= 1}
          onClick={() => move(Math.min(pages, number - 1))}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          className="console-icon-button"
          title={`Next ${kind} page`}
          aria-label={`Next ${kind} page`}
          disabled={blocked || number >= pages}
          onClick={() => move(number + 1)}
        >
          <ArrowRight size={18} />
        </button>
      </nav>
    );
  }
  return (
    <div className="console-document-review">
      <ConsoleLink href={`/console/products/${data.document.variant_id}/documents`}>
        Technical documents
      </ConsoleLink>
      <div className="console-inspection-heading">
        <div>
          <h2>{data.document.title}</h2>
          <p>
            {data.document.sku} / {data.document.revision_label ?? "Unknown document revision"}
          </p>
          <p className="console-caption">
            {data.document.source_reference} / {data.document.source_location}
          </p>
        </div>
        <button
          type="button"
          className="console-icon-button"
          title="Reload review"
          aria-label="Reload review"
          disabled={blocked}
          onClick={reload}
        >
          <RotateCcw size={20} />
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      {command.error && (
        <div ref={command.alert} tabIndex={-1} role="alert" className="console-command-error">
          {command.error.message}
        </div>
      )}
      {!data.originalCurrent && (
        <p className="console-command-error">Current original unavailable</p>
      )}
      <div className="console-editor-grid">
        <section>
          <h2>Current decision</h2>
          <State candidate={data.current} />
          <p role="status">
            {data.reviewed ? "Rights and scope reviewed" : "Document review incomplete"}
          </p>
        </section>
        <section>
          <h2>Latest candidate</h2>
          <State candidate={latest} />
          {data.open && <p className="console-caption">Open review remains</p>}
        </section>
      </div>
      <section>
        <div className="console-inspection-heading">
          <h2>Evidence</h2>
          {data.canSource && (
            <button
              type="button"
              className="console-button"
              disabled={blocked || dirty || !!reason || !data.originalCurrent}
              onClick={() => setSourceOpen(!sourceOpen)}
            >
              <Plus size={18} /> Add evidence
            </button>
          )}
        </div>
        {sourceOpen && (
          <form className="console-editor" onSubmit={addSource}>
            <fieldset disabled={blocked || dirty || !!reason || !data.originalCurrent}>
              <legend>New evidence source</legend>
              <div className="console-editor-grid">
                <label>
                  Evidence dimension
                  <select
                    value={dimension}
                    onChange={(e) => {
                      setDimension(e.target.value as DocumentDimension);
                      setSource({
                        ...source,
                        evidence_basis:
                          source.source_kind === "company_record"
                            ? "company_catalog"
                            : source.evidence_basis,
                      });
                      setSourceDirty(true);
                    }}
                  >
                    <option value="usage_rights">Usage rights</option>
                    <option value="exact_scope">Exact SKU scope</option>
                  </select>
                </label>
                <label>
                  Source class
                  <select
                    value={source.source_kind}
                    onChange={(e) => {
                      const kind = e.target.value as DocumentSourceCopy["source_kind"];
                      setSource({
                        ...source,
                        source_kind: kind,
                        source_level: documentSources[kind].level,
                        evidence_basis:
                          kind === "company_record"
                            ? "company_catalog"
                            : kind === "official_manufacturer"
                              ? "manufacturer_catalog"
                              : kind === "technical_standard"
                                ? "standard_reference"
                                : "secondary_reference",
                      });
                      setSourceDirty(true);
                    }}
                  >
                    {Object.entries(documentSources).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Evidence basis
                  <select
                    value={source.evidence_basis}
                    onChange={(e) => {
                      setSource({ ...source, evidence_basis: e.target.value });
                      setSourceDirty(true);
                    }}
                  >
                    {(source.source_kind === "company_record"
                      ? documentEvidenceBases[dimension]
                      : [source.evidence_basis]
                    ).map((item) => (
                      <option key={item} value={item}>
                        {item.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Assertion
                  <select
                    value={source.assertion}
                    onChange={(e) => {
                      setSource({
                        ...source,
                        assertion: e.target.value as DocumentSourceCopy["assertion"],
                      });
                      setSourceDirty(true);
                    }}
                  >
                    {["reference_only", "supports", "contradicts"].map((item) => (
                      <option key={item} value={item}>
                        {item.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                {(
                  [
                    ["title", "Evidence title"],
                    ["owner_name", "Evidence owner"],
                    ["source_reference", "Evidence reference"],
                    ["source_location", "Evidence location"],
                    ["scope_note", "Evidence scope"],
                    ["revision_label", "Evidence revision (unknown allowed)"],
                    ["evidence_date", "Evidence date (unknown allowed)"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field}>
                    {label}
                    <input
                      type={field === "evidence_date" ? "date" : "text"}
                      value={source[field] ?? ""}
                      required={!["revision_label", "evidence_date"].includes(field)}
                      maxLength={field === "title" ? 500 : field === "revision_label" ? 200 : 2000}
                      onChange={(e) => {
                        setSource({
                          ...source,
                          [field]:
                            e.target.value ||
                            (["revision_label", "evidence_date"].includes(field) ? null : ""),
                        });
                        setSourceDirty(true);
                      }}
                    />
                  </label>
                ))}
              </div>
              <div className="console-form-actions">
                <button className="console-button" type="submit">
                  <Save size={18} /> Register evidence
                </button>
                <button
                  type="button"
                  className="console-icon-button"
                  title="Discard evidence draft"
                  aria-label="Discard evidence draft"
                  onClick={() => {
                    if (sourceDirty && !window.confirm("Discard the evidence draft?")) return;
                    setSource(blankSource());
                    setSourceDirty(false);
                    setSourceOpen(false);
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </fieldset>
          </form>
        )}
        <DataTable
          label="Document evidence"
          columns={["Selected", "Evidence / Dimension", "Source / Scope", "Eligibility"]}
        >
          {sources.map((item) => (
            <tr key={item.source_id}>
              <td>
                <label className="console-review-select">
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.title}`}
                    checked={selected.includes(item.source_id)}
                    disabled={
                      blocked ||
                      !canCopy ||
                      !item.current ||
                      (!selected.includes(item.source_id) && selected.length >= 20)
                    }
                    onChange={(e) => {
                      setSelected(
                        e.target.checked
                          ? [...selected, item.source_id]
                          : selected.filter((id) => id !== item.source_id),
                      );
                      setDirty(true);
                    }}
                  />
                </label>
              </td>
              <td>
                {item.title}
                <p>
                  {item.dimension.replaceAll("_", " ")} / {item.assertion.replaceAll("_", " ")}
                </p>
                <p>{item.evidence_basis.replaceAll("_", " ")}</p>
              </td>
              <td>
                {item.source_reference}
                <p>{item.source_location}</p>
                <p>{item.scope_note}</p>
                <p>
                  {item.owner_name} / {item.source_level} / {item.evidence_date ?? "Unknown date"} /{" "}
                  {item.revision_label ?? "Unknown revision"}
                </p>
              </td>
              <td>
                {!item.current
                  ? "Original changed"
                  : item.qualifies
                    ? "Eligible for human review"
                    : "Reference or unresolved evidence"}
              </td>
            </tr>
          ))}
        </DataTable>
        {pager("source", data.sourcePage, data.sources.total)}
      </section>
      {pending && data.canReview && (
        <fieldset className="console-review-options" disabled={blocked || sourceDirty || stale}>
          <legend>Decision</legend>
          {["APPROVE", "EDIT", "REJECT"].map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="document-decision"
                value={value}
                checked={mode === value}
                onChange={() => {
                  setMode(value as typeof mode);
                  observed(null);
                  setInspecting(false);
                }}
              />
              {value === "APPROVE" ? "Approve" : value === "EDIT" ? "Edit" : "Reject"}
            </label>
          ))}
        </fieldset>
      )}
      {(pending ? data.canReview : data.canPropose) && (
        <form className="console-editor" onSubmit={pending ? decide : saveProposal}>
          <fieldset disabled={blocked || sourceDirty || stale}>
            <legend>{pending ? "Human review" : "Review draft"}</legend>
            <label>
              Review scope
              <textarea
                value={scope}
                maxLength={2000}
                required
                disabled={!canCopy}
                onChange={(e) => {
                  setScope(e.target.value);
                  setDirty(true);
                }}
              />
            </label>
            <label>
              Reason
              <input
                value={reason}
                maxLength={2000}
                minLength={3}
                required
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            {pending && mode === "APPROVE" && (
              <>
                <div className="console-editor-grid">
                  {(
                    [
                      ["usage_rights", "Rights evidence", rights, setRights],
                      ["exact_scope", "Exact-scope evidence", exactScope, setExactScope],
                    ] as const
                  ).map(([dimension, label, value, update]) => (
                    <label key={dimension}>
                      {label}
                      <select
                        required
                        value={value}
                        onChange={(e) => {
                          update(e.target.value);
                          setAck({ original: false, rights: false, scope: false });
                        }}
                      >
                        <option value="">Choose evidence</option>
                        {sourceChoices
                          .filter((item) => item.dimension === dimension)
                          .map((item) => (
                            <option key={item.source_id} value={item.source_id}>
                              {item.title} / {item.source_reference}
                            </option>
                          ))}
                      </select>
                    </label>
                  ))}
                </div>
                {latest?.verification_status === "DATA_CONFLICT" && (
                  <label>
                    Conflict resolution
                    <textarea
                      required
                      minLength={3}
                      maxLength={2000}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    />
                  </label>
                )}
                <button
                  type="button"
                  className="console-button"
                  disabled={dirty || !latest?.fresh || !data.originalCurrent}
                  onClick={() => {
                    observed(null);
                    setInspectionAttempt((value) => value + 1);
                    setInspecting(true);
                  }}
                >
                  <FileSearch size={18} /> Inspect review original
                </button>
                <div className="console-review-options">
                  {(
                    [
                      ["original", "I inspected this original document"],
                      ["rights", "I confirm the usage rights for this document"],
                      ["scope", "I confirm the exact SKU scope"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={ack[key]}
                        disabled={!observation}
                        onChange={(e) => setAck({ ...ack, [key]: e.target.checked })}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {!observation && (
                  <p className="console-caption">Current signed inspection required</p>
                )}
              </>
            )}
            <div className="console-form-actions">
              <button
                type="submit"
                className="console-button"
                disabled={
                  pending
                    ? mode === "APPROVE"
                      ? dirty ||
                        !latest?.fresh ||
                        !observation ||
                        !rights ||
                        !exactScope ||
                        !Object.values(ack).every(Boolean)
                      : mode === "EDIT"
                        ? !data.originalCurrent
                        : dirty
                    : !data.canPropose || !data.originalCurrent
                }
              >
                <Check size={18} />
                {pending
                  ? mode === "EDIT"
                    ? "Save correction"
                    : mode === "REJECT"
                      ? "Reject review"
                      : "Record approval"
                  : "Save review draft"}
              </button>
              {!pending && latest && !latest.submitted && data.canSubmit && (
                <button
                  type="button"
                  className="console-button"
                  disabled={dirty || !!reason || !latest.fresh}
                  onClick={submit}
                >
                  <Send size={18} /> Submit review
                </button>
              )}
            </div>
          </fieldset>
        </form>
      )}
      {!data.canPropose && data.canSubmit && latest && !latest.submitted && (
        <button
          className="console-button"
          disabled={blocked || sourceDirty || stale || !latest.fresh}
          onClick={submit}
        >
          <Send size={18} /> Submit review
        </button>
      )}
      {inspecting && latest && pending && data.canReview && (
        <StoredDocumentInspection
          key={inspectionAttempt}
          item={data.document}
          review={latest}
          onObserved={observed}
          onClose={() => {
            setInspecting(false);
            observed(null);
          }}
        />
      )}
      <section>
        <h2>Review history</h2>
        <DataTable
          label="Document review history"
          columns={["Revision / State", "Scope / Reason", "Decision"]}
        >
          {data.history.items.map((item) => (
            <tr key={item.candidate_id}>
              <td>
                {item.revision}
                <p>{item.verification_status.replaceAll("_", " ")}</p>
                <p>{item.created_at.slice(0, 10)}</p>
              </td>
              <td>
                {item.scope_note}
                <p>{item.reason}</p>
              </td>
              <td>
                {item.decision ?? (item.submitted ? "Pending review" : "Draft")}
                <p>{item.review_reason}</p>
                <p>{item.resolution}</p>
              </td>
            </tr>
          ))}
        </DataTable>
        {pager("history", data.historyPage, data.history.total)}
      </section>
    </div>
  );
}
