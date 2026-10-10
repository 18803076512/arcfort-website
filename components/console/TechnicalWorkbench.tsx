"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Save, Send, X } from "lucide-react";
import type {
  TechnicalWorkbenchData,
  WorkingFact,
  WorkingScope,
  WorkingSource,
  WorkingEvidence,
} from "../../lib/console/working";
import type {
  EvidenceLink,
  TechnicalSourceCopy,
  TechnicalValueCopy,
} from "../../lib/domain/catalog/commands";
import { useConsoleCommand, useUnsavedChanges } from "./useConsoleCommand";
import { CommandFeedback } from "./CommandFeedback";

function FactSnapshot({ title, fact }: { title: string; fact: WorkingFact | null }) {
  return (
    <section className="console-fact-snapshot">
      <h3>{title}</h3>
      {fact ? (
        <>
          <strong className="console-value">
            {fact.value} {fact.unit}
          </strong>
          <p className={fact.status === "DATA_CONFLICT" ? "console-conflict" : "console-caption"}>
            {fact.status.replaceAll("_", " ")}
          </p>
          {fact.evidence.length ? (
            fact.evidence.map((source) => (
              <div className="console-source-note" key={source.id}>
                <p>{source.title}</p>
                <p className="console-caption">{source.reference}</p>
                {source.version && (
                  <p className="console-caption">
                    Revision {source.version} / {source.location}
                  </p>
                )}
                {source.value && (
                  <p className="console-caption">
                    Source value: {source.value} {source.unit}
                  </p>
                )}
                <p
                  className={source.role === "conflicting" ? "console-conflict" : "console-caption"}
                >
                  Level {source.level} / {source.role}
                </p>
              </div>
            ))
          ) : (
            <p className="console-caption">No source linked</p>
          )}
        </>
      ) : (
        <p className="console-caption">No value recorded</p>
      )}
    </section>
  );
}

const emptySource: TechnicalSourceCopy = {
  source_kind: "company_record",
  source_level: "A",
  title: "",
  source_reference: "",
  evidence_basis: "",
  evidence_date: "",
  owner_name: "",
  revision_label: "",
  source_location: "",
  asserted_value: "",
  asserted_unit: "",
};
const sourceLabels = {
  title: "Source title",
  source_reference: "Document / record reference",
  owner_name: "Source custodian",
  revision_label: "Document revision",
  source_location: "Page / clause / callout",
  asserted_value: "Source value",
  asserted_unit: "Source unit",
} as const;

function SourceReferenceForm({
  variantId,
  fieldId,
  scope,
  onCreated,
  onDirty,
  onBusy,
  disabled,
}: {
  variantId: string;
  fieldId: string;
  scope: string;
  onCreated: (source: WorkingSource) => void;
  onDirty: (dirty: boolean) => void;
  onBusy: (busy: boolean) => void;
  disabled: boolean;
}) {
  const [source, setSource] = useState({ ...emptySource });
  const [saved, setSaved] = useState("");
  const command = useConsoleCommand();
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaved("");
    onBusy(true);
    const result = await command.run({
      action: "source",
      variant_id: variantId,
      field_id: fieldId,
      scope,
      source,
    });
    onBusy(false);
    if (!result?.source_id) return;
    onCreated({
      id: result.source_id,
      fieldId,
      scope,
      title: source.title,
      reference: source.source_reference,
      level: source.source_level,
      value: source.asserted_value,
      unit: source.asserted_unit,
      location: source.source_location,
      version: source.revision_label,
    });
    setSource({ ...emptySource });
    setSaved("Source reference recorded.");
    onDirty(false);
  }
  function update(field: keyof TechnicalSourceCopy, value: string) {
    setSource({ ...source, [field]: value });
    onDirty(true);
  }
  return (
    <details className="console-source-entry">
      <summary>
        <Plus size={18} aria-hidden="true" />
        Add source reference
      </summary>
      <form className="console-editor" onSubmit={save}>
        <CommandFeedback {...command} />
        <fieldset disabled={command.busy || disabled}>
          <legend>Exact source record</legend>
          <div className="console-editor-grid">
            <label>
              Source class
              <select
                value={source.source_kind}
                aria-label="Source class"
                onChange={(event) => {
                  setSource({
                    ...source,
                    source_kind: event.target.value,
                    source_level: {
                      company_record: "A",
                      official_manufacturer: "B",
                      technical_standard: "C",
                      secondary_reference: "D",
                    }[event.target.value as "company_record"],
                  });
                  onDirty(true);
                }}
              >
                <option value="company_record">Company record / A</option>
                <option value="official_manufacturer">Official manufacturer / B</option>
                <option value="technical_standard">Technical standard / C</option>
                <option value="secondary_reference">Secondary reference / D</option>
              </select>
            </label>
            <label>
              Evidence basis
              <select
                required
                value={source.evidence_basis}
                aria-label="Evidence basis"
                onChange={(event) => update("evidence_basis", event.target.value)}
              >
                <option value="">Select basis</option>
                {[
                  "company_catalog",
                  "factory_confirmation",
                  "factory_specification",
                  "drawing",
                  "approved_sample",
                  "verified_reference_number",
                  "confirmed_dimensions",
                  "measurement_record",
                  "packaging_record",
                  "official_manual",
                  "standard_clause",
                  "secondary_reference",
                ].map((basis) => (
                  <option key={basis} value={basis}>
                    {basis.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            {Object.entries(sourceLabels).map(([field, label]) => (
              <label key={field}>
                {label}
                <input
                  name={`source_${field}`}
                  required={field !== "asserted_unit"}
                  maxLength={2000}
                  value={source[field as keyof typeof sourceLabels]}
                  onChange={(event) =>
                    update(field as keyof typeof sourceLabels, event.target.value)
                  }
                />
              </label>
            ))}
            <label>
              Evidence date
              <input
                type="date"
                required
                value={source.evidence_date}
                onChange={(event) => update("evidence_date", event.target.value)}
              />
            </label>
          </div>
        </fieldset>
        <div className="console-editor-actions">
          <button
            className="console-button console-action"
            disabled={command.busy || disabled}
            type="submit"
          >
            <Save size={18} aria-hidden="true" />
            {command.busy ? "Recording..." : "Record source"}
          </button>
          <span role="status" className="console-caption">
            {saved}
          </span>
        </div>
      </form>
    </details>
  );
}

function ScopeEditor({
  data,
  scope,
  onDirty,
  markSafe,
  onBusy,
}: {
  data: TechnicalWorkbenchData;
  scope: WorkingScope | null;
  onDirty: () => void;
  markSafe: () => void;
  onBusy: (busy: boolean) => void;
}) {
  const initial = scope?.candidate ?? scope?.current;
  const [fieldId, setFieldId] = useState(scope?.fieldId ?? data.fields[0]?.id ?? "");
  const [scopeLabel, setScopeLabel] = useState(scope?.scope ?? "");
  const [value, setValue] = useState<TechnicalValueCopy>({
    value_text: initial?.value ?? "",
    unit: initial?.unit ?? "",
  });
  const initialLinks: EvidenceLink[] = (initial?.evidence ?? []).map((source) => ({
    source_id: source.id,
    role: source.role === "conflicting" ? "conflicting" : "supporting",
  }));
  const [links, setLinks] = useState(initialLinks);
  const [sources, setSources] = useState(data.sources);
  const [reason, setReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [editing, setEditing] = useState(false);
  const [sourceDirty, setSourceDirty] = useState(false);
  const [sourceBusy, setSourceBusy] = useState(false);
  const command = useConsoleCommand();
  const busy = command.busy || sourceBusy;
  useEffect(() => {
    onBusy(busy);
    return () => onBusy(false);
  }, [busy, onBusy]);
  const candidate = scope?.candidate;
  const pending = candidate?.state === "pending";
  const canPropose = data.canEdit && !pending && candidate?.status !== "DATA_CONFLICT";
  const canEditValue = canPropose || Boolean(pending && data.canReview && editing);
  const proposalDirty =
    value.value_text !== (initial?.value ?? "") ||
    value.unit !== (initial?.unit ?? "") ||
    JSON.stringify(links) !== JSON.stringify(initialLinks) ||
    Boolean(reason.trim());
  const path = `/console/products/${data.variantId}/review`;
  const available = new Map<string, Omit<WorkingEvidence, "role">>();
  for (const source of initial?.evidence ?? []) available.set(source.id, source);
  for (const source of sources.filter(
    (item) => item.fieldId === fieldId && item.scope === scopeLabel,
  ))
    available.set(source.id, source);
  function selectSource(id: string, checked: boolean) {
    setLinks(
      checked
        ? [...links, { source_id: id, role: "supporting" }]
        : links.filter((link) => link.source_id !== id),
    );
    onDirty();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      sourceBusy ||
      (sourceDirty && !window.confirm("Discard unrecorded source entries and continue?"))
    )
      return;
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    let result;
    if (action === "propose")
      result = await command.run({
        action: "propose",
        variant_id: data.variantId,
        field_id: fieldId,
        scope: scopeLabel,
        revision: scope?.revision ?? 0,
        value,
        evidence: links,
        reason,
      });
    else if (action === "submit" && candidate)
      result = await command.run({
        action: "submit",
        value_id: candidate.id,
        revision: scope!.revision,
        digest: candidate.digest,
      });
    else if (candidate && (action === "APPROVE" || action === "REJECT" || action === "EDIT"))
      result = await command.run({
        action: "review",
        value_id: candidate.id,
        revision: scope!.revision,
        digest: candidate.digest,
        decision: action,
        reason,
        resolution,
        replacement: action === "EDIT" ? value : null,
        evidence: action === "EDIT" ? links : null,
      });
    if (result) {
      markSafe();
      window.location.assign(`${path}?scope=${result.root_value_id ?? scope?.id ?? ""}`);
    }
  }
  return (
    <div className="console-scope-editor">
      <div className="console-comparison">
        <FactSnapshot title="Original reference" fact={scope?.original ?? null} />
        <FactSnapshot title="Current value" fact={scope?.current ?? null} />
        <FactSnapshot title="Saved proposal" fact={candidate ?? null} />
      </div>
      <form className="console-editor" onSubmit={submit}>
        <CommandFeedback {...command} comparePath={`${path}${scope ? `?scope=${scope.id}` : ""}`} />
        <fieldset disabled={busy || !canEditValue}>
          <legend>{editing ? "Replacement proposal" : "Technical proposal"}</legend>
          {!scope && (
            <div className="console-editor-grid">
              <label>
                Technical field
                <select
                  value={fieldId}
                  aria-label="Technical field"
                  onChange={(event) => {
                    setFieldId(event.target.value);
                    setLinks([]);
                    onDirty();
                  }}
                >
                  {data.fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Profile / connection side
                <input
                  maxLength={200}
                  value={scopeLabel}
                  onChange={(event) => {
                    setScopeLabel(event.target.value);
                    setLinks([]);
                    onDirty();
                  }}
                />
              </label>
            </div>
          )}
          <div className="console-editor-grid">
            <label>
              Candidate value
              <input
                name="value_text"
                required
                maxLength={1000}
                value={value.value_text}
                aria-invalid={command.error?.fields?.includes("value_text") || undefined}
                onChange={(event) => {
                  setValue({ ...value, value_text: event.target.value });
                  onDirty();
                }}
              />
            </label>
            <label>
              Candidate unit
              <input
                name="unit"
                maxLength={80}
                value={value.unit}
                onChange={(event) => {
                  setValue({ ...value, unit: event.target.value });
                  onDirty();
                }}
              />
            </label>
          </div>
          <div className="console-evidence-selection">
            <h3>Evidence references</h3>
            {[...available.values()].map((source) => {
              const selected = links.find((link) => link.source_id === source.id);
              return (
                <div key={source.id} className="console-evidence-row">
                  <label className="console-checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(selected)}
                      onChange={(event) => selectSource(source.id, event.target.checked)}
                    />
                    <span>
                      {source.title}
                      <small>
                        {source.reference} / Level {source.level}
                      </small>
                      {source.version && (
                        <small>
                          Revision {source.version} / {source.location}
                        </small>
                      )}
                      {source.value && (
                        <small>
                          Source value: {source.value} {source.unit}
                        </small>
                      )}
                    </span>
                  </label>
                  <label className="console-evidence-role">
                    <span className="sr-only">Evidence role for {source.title}</span>
                    <select
                      disabled={!selected}
                      aria-label={`Evidence role for ${source.title}`}
                      value={selected?.role ?? "supporting"}
                      onChange={(event) => {
                        setLinks(
                          links.map((link) =>
                            link.source_id === source.id
                              ? { ...link, role: event.target.value as EvidenceLink["role"] }
                              : link,
                          ),
                        );
                        onDirty();
                      }}
                    >
                      <option value="supporting">Supporting</option>
                      <option value="conflicting">Conflicting</option>
                    </select>
                  </label>
                </div>
              );
            })}
            {available.size === 0 && (
              <p className="console-caption">No exact-scope source references recorded</p>
            )}
          </div>
        </fieldset>
        {(canPropose || (pending && data.canReview)) && (
          <fieldset disabled={busy}>
            <legend>{pending ? "Human decision" : "Change record"}</legend>
            <label>
              {pending ? "Decision reason" : "Proposal reason"}
              <textarea
                name="reason"
                aria-label={pending ? "Decision reason" : "Proposal reason"}
                rows={3}
                maxLength={2000}
                required
                value={reason}
                aria-invalid={command.error?.fields?.includes("reason") || undefined}
                onChange={(event) => {
                  setReason(event.target.value);
                  onDirty();
                }}
              />
            </label>
            {pending && candidate?.status === "DATA_CONFLICT" && (
              <label>
                Conflict resolution
                <textarea
                  name="resolution"
                  aria-label="Conflict resolution"
                  rows={3}
                  maxLength={2000}
                  value={resolution}
                  onChange={(event) => {
                    setResolution(event.target.value);
                    onDirty();
                  }}
                />
              </label>
            )}
          </fieldset>
        )}
        <div className="console-editor-actions">
          {canPropose && (
            <button
              className="console-button console-action"
              type="submit"
              value="propose"
              disabled={busy}
            >
              <Save size={18} aria-hidden="true" />
              Save proposal
            </button>
          )}
          {candidate?.state === "proposed" && (data.canEdit || data.canReview) && (
            <button
              className="console-button console-action"
              type="submit"
              value="submit"
              formNoValidate
              disabled={busy || proposalDirty}
            >
              <Send size={18} aria-hidden="true" />
              Submit for review
            </button>
          )}
          {pending && data.canReview && !editing && (
            <>
              <button
                className="console-button console-action"
                type="submit"
                value="APPROVE"
                disabled={busy}
              >
                <Check size={18} aria-hidden="true" />
                Approve
              </button>
              <button
                className="console-secondary console-action"
                type="button"
                onClick={() => setEditing(true)}
                disabled={busy}
              >
                <Pencil size={18} aria-hidden="true" />
                Edit
              </button>
              <button
                className="console-danger console-action"
                type="submit"
                value="REJECT"
                disabled={busy}
              >
                <X size={18} aria-hidden="true" />
                Reject
              </button>
            </>
          )}
          {pending && data.canReview && editing && (
            <button
              className="console-button console-action"
              type="submit"
              value="EDIT"
              disabled={busy}
            >
              <Save size={18} aria-hidden="true" />
              Save edit for review
            </button>
          )}
          <span role="status" className="console-caption">
            {command.busy
              ? "Saving..."
              : candidate
                ? `${candidate.state} / revision ${scope?.revision}`
                : `Revision ${scope?.revision ?? 0}`}
          </span>
        </div>
      </form>
      {canEditValue && fieldId && (
        <SourceReferenceForm
          variantId={data.variantId}
          fieldId={fieldId}
          scope={scopeLabel}
          disabled={command.busy}
          onBusy={setSourceBusy}
          onDirty={(dirty) => {
            setSourceDirty(dirty);
            if (dirty) onDirty();
          }}
          onCreated={(source) => {
            setSources([...sources, source]);
            setLinks([...links, { source_id: source.id, role: "supporting" }]);
            onDirty();
          }}
        />
      )}
    </div>
  );
}

export function TechnicalWorkbench({
  data,
  selectedId,
}: {
  data: TechnicalWorkbenchData;
  selectedId?: string;
}) {
  const [selected, setSelected] = useState(
    data.scopes.some((scope) => scope.id === selectedId)
      ? selectedId!
      : (data.scopes[0]?.id ?? "new"),
  );
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const markSafe = useUnsavedChanges(dirty);
  const scope = data.scopes.find((item) => item.id === selected) ?? null;
  return (
    <div>
      <div className="console-toolbar">
        <label className="console-search">
          Field / exact scope
          <select
            value={selected}
            aria-label="Field / exact scope"
            disabled={busy}
            onChange={(event) => {
              if (dirty && !window.confirm("Discard unsaved changes and switch fields?")) return;
              setDirty(false);
              setSelected(event.target.value);
            }}
          >
            {data.scopes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
                {item.scope ? ` / ${item.scope}` : ""}
              </option>
            ))}
            {data.canEdit && <option value="new">New technical field / scope</option>}
          </select>
        </label>
        <span className="console-caption">
          {data.sku}
          {dirty ? " / Unsaved changes" : ""}
        </span>
      </div>
      {scope || data.canEdit ? (
        <ScopeEditor
          key={selected}
          data={data}
          scope={scope}
          onDirty={() => setDirty(true)}
          markSafe={markSafe}
          onBusy={setBusy}
        />
      ) : (
        <p className="console-empty">No technical records available.</p>
      )}
    </div>
  );
}
