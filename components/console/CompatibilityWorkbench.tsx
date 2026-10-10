"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Save, Search, Send, X } from "lucide-react";
import type {
  CompatibilityEvidence,
  CompatibilityFact,
  CompatibilityHistory,
  CompatibilityScope,
  CompatibilitySource,
  CompatibilityTargets,
  CompatibilityWorkbenchData,
  CompatibilityFilters,
} from "../../lib/console/compatibility";
import type {
  CompatibilitySourceCopy,
  CompatibilityRelationshipType,
} from "../../lib/domain/catalog/compatibility";
import type { EvidenceLink } from "../../lib/domain/catalog/commands";
import { useConsoleCommand, useUnsavedChanges } from "./useConsoleCommand";
import { CommandFeedback } from "./CommandFeedback";

function Snapshot({ title, fact }: { title: string; fact: CompatibilityFact | null }) {
  return (
    <section className="console-fact-snapshot">
      <h3>{title}</h3>
      {fact ? (
        <>
          <strong className="console-value">{fact.role}</strong>
          <p className={fact.status === "DATA_CONFLICT" ? "console-conflict" : "console-caption"}>
            {fact.status.replaceAll("_", " ")}
          </p>
          <p className="console-caption">{fact.relationshipStatus.replaceAll("_", " ")}</p>
          {fact.requirements.length > 0 && (
            <ul>
              {fact.requirements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
          {fact.evidence.length ? (
            fact.evidence.map((source) => (
              <div className="console-source-note" key={source.id}>
                <p>{source.title}</p>
                <p className="console-caption">{source.reference}</p>
                <p className="console-caption">
                  Level {source.level} / {source.linkRole}
                </p>
                <p
                  className={
                    source.assertion === "contradicts" ? "console-conflict" : "console-caption"
                  }
                >
                  {source.assertion?.replaceAll("_", " ") ?? "Unbound reference"}
                  {source.basis && ` / ${source.basis.replaceAll("_", " ")}`}
                </p>
                {source.version && (
                  <p className="console-caption">
                    {source.version} / {source.location}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="console-caption">No source linked</p>
          )}
        </>
      ) : (
        <p className="console-caption">No relationship recorded</p>
      )}
    </section>
  );
}

const emptySource: CompatibilitySourceCopy = {
  source_kind: "company_record",
  source_level: "A",
  title: "",
  source_reference: "",
  evidence_basis: "",
  evidence_date: "",
  owner_name: "",
  revision_label: "",
  source_location: "",
  assertion: "supports",
};
const sourceLabels = {
  title: "Source title",
  source_reference: "Document / record reference",
  owner_name: "Source custodian",
  revision_label: "Document revision",
  source_location: "Page / clause / callout",
} as const;
const sourceClasses = {
  company_record: "A",
  official_manufacturer: "B",
  technical_standard: "C",
  secondary_reference: "D",
} as const;
function SourceEntry({
  subjectId,
  targetId,
  type,
  scope,
  role,
  disabled,
  onDirty,
  onBusy,
  onCreated,
}: {
  subjectId: string;
  targetId: string;
  type: CompatibilityRelationshipType;
  scope: string;
  role: string;
  disabled: boolean;
  onDirty: (value: boolean) => void;
  onBusy: (value: boolean) => void;
  onCreated: (source: CompatibilitySource) => void;
}) {
  const [source, setSource] = useState({ ...emptySource });
  const [saved, setSaved] = useState(false);
  const command = useConsoleCommand();
  useEffect(() => {
    onBusy(command.busy);
    return () => onBusy(false);
  }, [command.busy, onBusy]);
  function change(field: keyof CompatibilitySourceCopy, value: string) {
    setSource({ ...source, [field]: value });
    onDirty(true);
    setSaved(false);
  }
  return (
    <details className="console-source-entry">
      <summary>
        <Plus size={18} aria-hidden="true" />
        Add relationship evidence
      </summary>
      <form
        className="console-editor"
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await command.run({
            action: "compatibility_source",
            subject_id: subjectId,
            target_id: targetId,
            relationship_type: type,
            scope,
            role,
            source,
          });
          if (!result?.source_id) return;
          onCreated({
            id: result.source_id,
            subjectId,
            targetId,
            type,
            scope,
            role,
            title: source.title,
            reference: source.source_reference,
            level: source.source_level,
            assertion: source.assertion,
            basis: source.evidence_basis,
            version: source.revision_label,
            location: source.source_location,
          });
          setSource({ ...emptySource });
          onDirty(false);
          setSaved(true);
        }}
      >
        <CommandFeedback {...command} />
        <fieldset disabled={disabled || command.busy || !targetId || !scope.trim() || !role.trim()}>
          <legend>Exact relationship source</legend>
          <div className="console-editor-grid">
            <label>
              Source class
              <select
                aria-label="Compatibility source class"
                value={source.source_kind}
                onChange={(event) => {
                  const kind = event.target.value as keyof typeof sourceClasses;
                  setSource({ ...source, source_kind: kind, source_level: sourceClasses[kind] });
                  onDirty(true);
                  setSaved(false);
                }}
              >
                {Object.entries(sourceClasses).map(([kind, level]) => (
                  <option key={kind} value={kind}>
                    {kind.replaceAll("_", " ")} / {level}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Source assertion
              <select
                value={source.assertion}
                aria-label="Source assertion"
                onChange={(event) => change("assertion", event.target.value)}
              >
                <option value="supports">Supports relationship</option>
                <option value="contradicts">Contradicts relationship</option>
                <option value="catalog_grouping">Catalog grouping only</option>
              </select>
            </label>
            <label>
              Evidence basis
              <select
                required
                value={source.evidence_basis}
                aria-label="Evidence basis"
                onChange={(event) => change("evidence_basis", event.target.value)}
              >
                <option value="">Select basis</option>
                {[
                  "company_catalog",
                  "factory_confirmation",
                  "drawing",
                  "approved_sample",
                  "verified_reference_number",
                  "confirmed_dimensions",
                  "official_catalog",
                  "standard",
                  "secondary_reference",
                ].map((basis) => (
                  <option key={basis} value={basis}>
                    {basis.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Evidence date
              <input
                type="date"
                required
                value={source.evidence_date}
                onChange={(event) => change("evidence_date", event.target.value)}
              />
            </label>
            {Object.entries(sourceLabels).map(([field, label]) => (
              <label key={field}>
                {label}
                <input
                  required
                  maxLength={2000}
                  value={source[field as keyof typeof sourceLabels]}
                  onChange={(event) =>
                    change(field as keyof typeof sourceLabels, event.target.value)
                  }
                />
              </label>
            ))}
          </div>
          <div className="console-editor-actions">
            <button className="console-button console-action" type="submit">
              <Save size={18} aria-hidden="true" />
              Record evidence
            </button>
          </div>
        </fieldset>
        {saved && (
          <p className="console-caption" role="status">
            Evidence recorded; no relationship approved.
          </p>
        )}
      </form>
    </details>
  );
}

function RelationshipEditor({
  data,
  selected,
  targets,
  onDirty,
  markSafe,
  onBusy,
  onSourceCreated,
}: {
  data: CompatibilityWorkbenchData;
  selected: CompatibilityScope | null;
  targets: CompatibilityTargets;
  onDirty: (value: boolean) => void;
  markSafe: () => void;
  onBusy: (value: boolean) => void;
  onSourceCreated: (source: CompatibilitySource) => void;
}) {
  const initial = selected?.candidate ?? selected?.current ?? selected?.original;
  const initialLinks: EvidenceLink[] = (initial?.evidence ?? []).map((source) => ({
    source_id: source.id,
    role: source.linkRole === "conflicting" ? "conflicting" : "supporting",
  }));
  const [targetId, setTargetId] = useState(selected?.targetId ?? "");
  const [scope, setScope] = useState(selected?.scope ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [requirements, setRequirements] = useState(initial?.requirements.join("\n") ?? "");
  const [links, setLinks] = useState(initialLinks);
  const sources = data.sources;
  const [reason, setReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [editing, setEditing] = useState(false);
  const [sourceDirty, setSourceDirty] = useState(false);
  const [sourceBusy, setSourceBusy] = useState(false);
  const command = useConsoleCommand();
  const busy = command.busy || sourceBusy;
  const target = targets.items.find((item) => item.id === targetId);
  const type =
    selected?.type ?? (`product_to_${target?.type ?? "series"}` as CompatibilityRelationshipType);
  const candidate = selected?.candidate;
  const pending = candidate?.state === "pending";
  const canPropose = data.canEdit && !pending && candidate?.status !== "DATA_CONFLICT";
  const canEdit = canPropose || Boolean(pending && data.canReview && editing);
  const proposalDirty =
    targetId !== (selected?.targetId ?? "") ||
    scope !== (selected?.scope ?? "") ||
    role !== (initial?.role ?? "") ||
    requirements !== (initial?.requirements.join("\n") ?? "") ||
    JSON.stringify(links) !== JSON.stringify(initialLinks);
  useEffect(() => {
    onBusy(busy);
    return () => onBusy(false);
  }, [busy, onBusy]);
  useEffect(() => {
    onDirty(proposalDirty || sourceDirty || Boolean(reason || resolution));
  }, [proposalDirty, sourceDirty, reason, resolution, onDirty]);
  const path = `/console/products/${data.variantId}/compatibility`;
  const available = new Map<string, Omit<CompatibilityEvidence, "linkRole">>();
  for (const item of initial?.evidence ?? []) available.set(item.id, item);
  for (const item of sources.filter(
    (item) =>
      item.subjectId === data.subjectId &&
      item.targetId === targetId &&
      item.type === type &&
      item.scope === scope &&
      item.role === role,
  ))
    available.set(item.id, item);
  const approvalEvidence = candidate?.evidence.some(
    (evidence) =>
      evidence.linkRole === "supporting" &&
      evidence.level === "A" &&
      sources.some(
        (source) =>
          source.id === evidence.id &&
          source.subjectId === data.subjectId &&
          source.targetId === selected?.targetId &&
          source.type === selected?.type &&
          source.scope === selected?.scope &&
          source.role === candidate.role &&
          source.assertion === "supports" &&
          [
            "factory_confirmation",
            "drawing",
            "approved_sample",
            "verified_reference_number",
            "confirmed_dimensions",
          ].includes(source.basis ?? ""),
      ),
  );
  const copy = {
    role,
    confirmation_requirements: requirements.split(/\r?\n/).filter((line) => line.trim()),
  };
  return (
    <div className="console-scope-editor console-compatibility-editor">
      {candidate && (
        <p className="console-caption">
          {pending ? "Pending human review" : "Draft proposal"} / Revision {selected.revision}
        </p>
      )}
      {selected && (
        <div className="console-comparison">
          <Snapshot title="Original reference" fact={selected?.original ?? null} />
          <Snapshot title="Current relationship" fact={selected?.current ?? null} />
          <Snapshot title="Saved proposal" fact={candidate ?? null} />
        </div>
      )}
      <form
        className="console-editor"
        onSubmit={async (event) => {
          event.preventDefault();
          if (
            sourceBusy ||
            !data.subjectId ||
            (sourceDirty && !window.confirm("Discard unrecorded source entries and continue?"))
          )
            return;
          const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
          let result;
          if (action === "propose" && canPropose)
            result = await command.run({
              action: "compatibility_propose",
              subject_id: data.subjectId,
              target_id: targetId,
              relationship_type: type,
              scope,
              root_id: selected?.id ?? null,
              revision: selected?.revision ?? 0,
              copy,
              evidence: links,
              reason,
            });
          else if (action === "submit" && candidate && !proposalDirty)
            result = await command.run({
              action: "compatibility_submit",
              relationship_id: candidate.id,
              revision: selected!.revision,
              digest: candidate.digest,
            });
          else if (
            candidate &&
            pending &&
            data.canReview &&
            (action === "APPROVE" || action === "EDIT" || action === "REJECT")
          )
            result = await command.run({
              action: "compatibility_review",
              relationship_id: candidate.id,
              revision: selected!.revision,
              digest: candidate.digest,
              decision: action,
              reason,
              resolution,
              replacement: action === "EDIT" ? copy : null,
              evidence: action === "EDIT" ? links : null,
            });
          if (result) {
            markSafe();
            window.location.assign(
              `${path}?root=${result.root_relationship_id ?? selected?.id ?? ""}`,
            );
          }
        }}
      >
        <CommandFeedback
          {...command}
          comparePath={`${path}${selected ? `?root=${selected.id}` : ""}`}
        />
        <fieldset disabled={!canEdit || busy}>
          <legend>{editing ? "Replacement relationship" : "Relationship proposal"}</legend>
          <div className="console-editor-grid">
            <label>
              Target
              {selected ? (
                <input readOnly value={selected.targetLabel} />
              ) : (
                <select
                  required
                  value={targetId}
                  aria-label="Target"
                  onChange={(event) => setTargetId(event.target.value)}
                >
                  <option value="">Select recorded target</option>
                  {targets.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              )}
            </label>
            <label>
              Assembly scope
              <input
                required
                maxLength={200}
                readOnly={Boolean(selected?.revision)}
                value={scope}
                onChange={(event) => setScope(event.target.value)}
              />
            </label>
            <label>
              Component role
              <input
                required
                maxLength={200}
                value={role}
                onChange={(event) => setRole(event.target.value)}
              />
            </label>
            <label>
              Confirmation requirements
              <textarea
                aria-label="Confirmation requirements"
                required
                rows={3}
                maxLength={10020}
                value={requirements}
                onChange={(event) => setRequirements(event.target.value)}
              />
            </label>
          </div>
          <div className="console-evidence-selection">
            <h3>Relationship evidence</h3>
            {[...available.values()].map((source) => {
              const link = links.find((link) => link.source_id === source.id);
              const binding = sources.find((item) => item.id === source.id);
              const scopeChanged =
                binding &&
                (binding.targetId !== targetId ||
                  binding.type !== type ||
                  binding.scope !== scope ||
                  binding.role !== role);
              return (
                <div className="console-evidence-row" key={source.id}>
                  <label className="console-checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(link)}
                      onChange={(event) =>
                        setLinks(
                          event.target.checked
                            ? [
                                ...links,
                                {
                                  source_id: source.id,
                                  role:
                                    source.assertion === "contradicts"
                                      ? "conflicting"
                                      : "supporting",
                                },
                              ]
                            : links.filter((item) => item.source_id !== source.id),
                        )
                      }
                    />
                    <span>
                      {source.title}
                      <small>
                        {source.reference} / Level {source.level}
                      </small>
                      <small>
                        {source.assertion?.replaceAll("_", " ") ?? "Unbound reference"}
                        {source.basis && ` / ${source.basis.replaceAll("_", " ")}`}
                      </small>
                      {scopeChanged && (
                        <small>Recorded source scope differs from this proposal</small>
                      )}
                      {source.version && (
                        <small>
                          {source.version} / {source.location}
                        </small>
                      )}
                    </span>
                  </label>
                  <label className="console-evidence-role">
                    <span className="sr-only">Evidence role for {source.title}</span>
                    <select
                      aria-label={`Evidence role for ${source.title}`}
                      disabled={!link}
                      value={link?.role ?? "supporting"}
                      onChange={(event) =>
                        setLinks(
                          links.map((item) =>
                            item.source_id === source.id
                              ? { ...item, role: event.target.value as EvidenceLink["role"] }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="supporting">Supporting</option>
                      <option value="conflicting">Conflicting</option>
                    </select>
                  </label>
                </div>
              );
            })}
            {!available.size && (
              <p className="console-caption">No matching relationship evidence recorded</p>
            )}
          </div>
        </fieldset>
        {(canPropose || (pending && data.canReview)) && (
          <fieldset disabled={busy}>
            <legend>{pending ? "Human decision" : "Change record"}</legend>
            <label>
              {pending ? "Decision reason" : "Proposal reason"}
              <textarea
                aria-label={pending ? "Decision reason" : "Proposal reason"}
                required
                maxLength={2000}
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            {pending && candidate?.status === "DATA_CONFLICT" && (
              <label>
                Conflict resolution
                <textarea
                  aria-label="Conflict resolution"
                  rows={3}
                  maxLength={2000}
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                />
              </label>
            )}
          </fieldset>
        )}
        <div className="console-editor-actions">
          {canPropose && (
            <button
              type="submit"
              value="propose"
              className="console-button console-action"
              disabled={busy}
            >
              <Save size={18} aria-hidden="true" />
              Save proposal
            </button>
          )}
          {candidate?.state === "proposed" && (data.canEdit || data.canReview) && (
            <button
              type="submit"
              value="submit"
              formNoValidate
              className="console-button console-action"
              disabled={busy || proposalDirty}
            >
              <Send size={18} aria-hidden="true" />
              Submit for review
            </button>
          )}
          {pending && data.canReview && !editing && (
            <>
              <button
                type="submit"
                value="APPROVE"
                className="console-button console-action"
                disabled={
                  busy ||
                  !approvalEvidence ||
                  (candidate.status === "DATA_CONFLICT" && !resolution.trim())
                }
              >
                <Check size={18} aria-hidden="true" />
                Approve
              </button>
              <button
                type="button"
                className="console-action"
                disabled={busy}
                onClick={() => setEditing(true)}
              >
                <Pencil size={18} aria-hidden="true" />
                Edit proposal
              </button>
              <button type="submit" value="REJECT" className="console-action" disabled={busy}>
                <X size={18} aria-hidden="true" />
                Reject
              </button>
              {!approvalEvidence && (
                <p className="console-caption">
                  Exact Level A relationship evidence required for approval
                </p>
              )}
            </>
          )}
          {editing && (
            <>
              <button
                type="submit"
                value="EDIT"
                className="console-button console-action"
                disabled={busy}
              >
                <Save size={18} aria-hidden="true" />
                Save review edit
              </button>
              <button
                type="button"
                className="console-action"
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  setRole(initial?.role ?? "");
                  setRequirements(initial?.requirements.join("\n") ?? "");
                  setLinks(initialLinks);
                }}
              >
                <X size={18} aria-hidden="true" />
                Cancel edit
              </button>
            </>
          )}
        </div>
      </form>
      {(data.canEdit || data.canReview) && data.subjectId && (
        <SourceEntry
          subjectId={data.subjectId}
          targetId={targetId}
          type={type}
          scope={scope}
          role={role}
          disabled={command.busy}
          onDirty={setSourceDirty}
          onBusy={setSourceBusy}
          onCreated={onSourceCreated}
        />
      )}
    </div>
  );
}

export function CompatibilityWorkbench({
  data,
  targets,
  selectedId,
  history,
  filter,
}: {
  data: CompatibilityWorkbenchData;
  targets: CompatibilityTargets;
  selectedId?: string;
  history: CompatibilityHistory | null;
  filter: CompatibilityFilters;
}) {
  const [selected, setSelected] = useState(selectedId ?? data.scopes[0]?.id ?? "");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sources, setSources] = useState(data.sources);
  const markSafe = useUnsavedChanges(dirty);
  const command = useConsoleCommand();
  const scope = data.scopes.find((item) => item.id === selected) ?? null;
  const path = `/console/products/${data.variantId}/compatibility`;
  return (
    <>
      <p className="console-record-id">{data.sku}</p>
      {!data.subjectId ? (
        <section className="console-section">
          <h2>Product relationship identity</h2>
          <p>No exact product entity recorded</p>
          <CommandFeedback {...command} />
          {data.canEdit && (
            <button
              className="console-button console-action"
              disabled={command.busy}
              onClick={async () => {
                const result = await command.run({
                  action: "compatibility_entity",
                  variant_id: data.variantId,
                });
                if (result) {
                  markSafe();
                  window.location.assign(path);
                }
              }}
            >
              <Plus size={18} aria-hidden="true" />
              Create product identity
            </button>
          )}
        </section>
      ) : (
        <>
          <label className="console-scope-select">
            Relationship
            <select
              value={selected}
              aria-label="Relationship"
              disabled={busy}
              onChange={(event) => {
                if (dirty && !window.confirm("Discard unsaved changes and switch relationship?"))
                  return;
                markSafe();
                setDirty(false);
                setSelected(event.target.value);
              }}
            >
              <option value="">
                {data.canEdit ? "New relationship" : "No relationship selected"}
              </option>
              {data.scopes.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.targetLabel} / {item.scope || "Unscoped reference"}
                </option>
              ))}
            </select>
          </label>
          {!scope && data.canEdit && (
            <section className="console-section">
              <h2>Recorded targets</h2>
              <form
                className="console-toolbar"
                action={path}
                method="get"
                onSubmit={(event) => {
                  if (
                    busy ||
                    (dirty && !window.confirm("Discard unsaved changes and search targets?"))
                  )
                    event.preventDefault();
                  else markSafe();
                }}
              >
                <input type="hidden" name="root" value="new" />
                <label>
                  Target type
                  <select
                    name="kind"
                    aria-label="Target type"
                    defaultValue={filter.kind}
                    disabled={busy}
                  >
                    <option value="series">Series</option>
                    <option value="torch">Torch</option>
                    <option value="machine">Machine</option>
                    <option value="oem_reference">OEM reference</option>
                  </select>
                </label>
                <label>
                  Target name
                  <input name="q" defaultValue={filter.q} maxLength={100} disabled={busy} />
                </label>
                <button className="console-button console-action" disabled={busy}>
                  <Search size={18} aria-hidden="true" />
                  Search targets
                </button>
              </form>
              <p className="console-caption">{targets.total} recorded targets</p>
              <nav className="console-working-nav" aria-label="Target pages">
                {targets.page > 1 && (
                  <a
                    className="console-action"
                    href={`${path}?${new URLSearchParams({ root: "new", kind: filter.kind, q: filter.q, targetPage: String(targets.page - 1) })}`}
                  >
                    Previous targets
                  </a>
                )}
                {targets.page * targets.pageSize < targets.total && (
                  <a
                    className="console-action"
                    href={`${path}?${new URLSearchParams({ root: "new", kind: filter.kind, q: filter.q, targetPage: String(targets.page + 1) })}`}
                  >
                    Next targets
                  </a>
                )}
              </nav>
            </section>
          )}
          <RelationshipEditor
            key={selected}
            data={{ ...data, sources }}
            selected={scope}
            targets={targets}
            onDirty={setDirty}
            onBusy={setBusy}
            markSafe={markSafe}
            onSourceCreated={(source) =>
              setSources((items) => [...items.filter((item) => item.id !== source.id), source])
            }
          />
          {scope && (
            <section className="console-section console-history">
              <h2>Relationship history</h2>
              {history?.rootId === scope.id ? (
                <>
                  {history.items.map((item) => (
                    <article key={item.id}>
                      <h3>
                        Revision {item.sequence} / {item.state}
                      </h3>
                      <p>
                        {item.role} / {item.status.replaceAll("_", " ")}
                      </p>
                      <p>{item.reason}</p>
                      <p className="console-caption">{item.createdAt}</p>
                      {item.decision && (
                        <p>
                          {item.decision}: {item.decisionReason}
                        </p>
                      )}
                    </article>
                  ))}
                  {!history.items.length && <p>No revision history recorded</p>}
                  <nav className="console-working-nav" aria-label="Relationship history pages">
                    {history.page > 1 && (
                      <a
                        className="console-action"
                        href={`${path}?root=${scope.id}&historyPage=${history.page - 1}`}
                      >
                        Previous history
                      </a>
                    )}
                    {history.page * history.pageSize < history.total && (
                      <a
                        className="console-action"
                        href={`${path}?root=${scope.id}&historyPage=${history.page + 1}`}
                      >
                        Next history
                      </a>
                    )}
                  </nav>
                </>
              ) : (
                <a className="console-action" href={`${path}?root=${scope.id}`}>
                  Open relationship history
                </a>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
}
