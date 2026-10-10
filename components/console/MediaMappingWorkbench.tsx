"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Image as ImageIcon, Pencil, Plus, RotateCcw, Save, Send, X } from "lucide-react";
import type {
  MediaMappingData,
  MediaMappingFact,
  MediaMappingHistory,
  MediaMappingScope,
  MediaSource,
} from "../../lib/console/media-mapping";
import {
  mediaMappingRoles,
  type MediaMappingRole,
  type MediaSourceCopy,
} from "../../lib/domain/catalog/media-commands";
import {
  mediaEvidenceBases,
  qualifyingMediaSource,
  readMediaObservation,
  type MediaDimension,
  type MediaObservation,
} from "../../lib/domain/catalog/media-review";
import { StoredOriginalInspection } from "./StoredOriginalInspection";
import { CommandFeedback } from "./CommandFeedback";
import { ConsoleLink } from "./ConsoleLink";
import { Status } from "./CatalogViews";
import { useConsoleCommand, useUnsavedChanges } from "./useConsoleCommand";

const words = (value: string) => value.replaceAll("_", " ");
const classifications = {
  company_record: "A",
  official_manufacturer: "B",
  technical_standard: "C",
  secondary_reference: "D",
} as const;
const emptySource: MediaSourceCopy = {
  source_kind: "company_record",
  source_level: "A",
  title: "",
  source_reference: "",
  evidence_basis: "company_ownership",
  evidence_date: "",
  owner_name: "",
  revision_label: "",
  source_location: "",
  assertion: "supports",
};
function SourceNote({ source, showTitle = true }: { source: MediaSource; showTitle?: boolean }) {
  return (
    <div className="console-source-note">
      {showTitle && <p>{source.title}</p>}
      <p className="console-caption">{source.reference}</p>
      <p className={source.assertion === "contradicts" ? "console-conflict" : "console-caption"}>
        Level {source.level} / {words(source.dimension)} / {words(source.assertion)} /{" "}
        {words(source.basis)}
      </p>
      <p className="console-caption">
        {source.version} / {source.location}
        {source.date && ` / ${source.date}`}
        {source.owner && ` / ${source.owner}`}
      </p>
    </div>
  );
}
function Snapshot({
  title,
  fact,
  data,
}: {
  title: string;
  fact: MediaMappingFact | null;
  data: MediaMappingData;
}) {
  const original = data.originals.find((item) => item.asset_id === fact?.assetId);
  return (
    <section className="console-fact-snapshot">
      <h3>{title}</h3>
      {fact ? (
        <>
          <p>{original?.filename}</p>
          <p>{fact.altText}</p>
          <p className="console-caption">
            Revision {fact.revision} / {words(fact.state)}
          </p>
          {fact.state === "approved" && fact.valid && !fact.observed ? (
            <p className="console-caption">Internal approval only</p>
          ) : (
            <Status value={fact.status} />
          )}
          {fact.state === "approved" && (
            <p className={fact.valid && fact.observed ? "console-caption" : "console-conflict"}>
              {!fact.valid
                ? "Approval invalidated"
                : fact.observed
                  ? "Original inspection recorded"
                  : "Original inspection not recorded"}
            </p>
          )}
          <p className="console-caption">Private original / Not publication ready</p>
          {fact.sourceIds.map((id) => {
            const source = data.sources.find((source) => source.id === id);
            return source ? <SourceNote key={id} source={source} /> : null;
          })}
        </>
      ) : (
        <p className="console-caption">No mapping recorded</p>
      )}
    </section>
  );
}
function SourceEntry({
  data,
  assetId,
  role,
  disabled,
  onBusy,
  onDirty,
  onCreated,
}: {
  data: MediaMappingData;
  assetId: string;
  role: MediaMappingRole;
  disabled: boolean;
  onBusy: (value: boolean) => void;
  onDirty: (value: boolean) => void;
  onCreated: () => void;
}) {
  const [dimension, setDimension] = useState<MediaDimension>("usage_rights");
  const [source, setSource] = useState({ ...emptySource });
  const command = useConsoleCommand();
  useEffect(() => {
    onBusy(command.busy);
    return () => onBusy(false);
  }, [command.busy, onBusy]);
  const change = (field: keyof MediaSourceCopy, value: string) => {
    setSource({ ...source, [field]: value });
    onDirty(true);
  };
  return (
    <details className="console-source-entry">
      <summary>
        <Plus size={18} aria-hidden="true" />
        Add exact-image evidence
      </summary>
      <form
        className="console-editor"
        onSubmit={async (event) => {
          event.preventDefault();
          const clean = Object.fromEntries(
            Object.entries(source).map(([key, value]) => [key, value.trim()]),
          ) as MediaSourceCopy;
          if (
            await command.run({
              action: "media_source",
              variant_id: data.variantId,
              asset_id: assetId,
              role,
              dimension,
              source: clean,
            })
          ) {
            setSource({ ...emptySource });
            setDimension("usage_rights");
            onDirty(false);
            onCreated();
          }
        }}
      >
        <CommandFeedback {...command} />
        <fieldset disabled={disabled || command.busy || !assetId}>
          <legend>{words(role)} / Exact image source</legend>
          <div className="console-editor-grid">
            <label>
              Evidence dimension
              <select
                aria-label="Evidence dimension"
                value={dimension}
                onChange={(event) => {
                  const next = event.target.value as MediaDimension;
                  setDimension(next);
                  setSource({ ...source, evidence_basis: mediaEvidenceBases[next][0] });
                  onDirty(true);
                }}
              >
                <option value="usage_rights">Usage rights</option>
                <option value="product_match">Exact product match</option>
              </select>
            </label>
            <label>
              Source class
              <select
                aria-label="Source class"
                value={source.source_kind}
                onChange={(event) => {
                  const kind = event.target.value as keyof typeof classifications;
                  setSource({ ...source, source_kind: kind, source_level: classifications[kind] });
                  onDirty(true);
                }}
              >
                {Object.entries(classifications).map(([kind, level]) => (
                  <option key={kind} value={kind}>
                    Level {level} / {words(kind)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Evidence basis
              <select
                aria-label="Evidence basis"
                value={source.evidence_basis}
                onChange={(event) => change("evidence_basis", event.target.value)}
              >
                {mediaEvidenceBases[dimension].map((basis) => (
                  <option key={basis} value={basis}>
                    {words(basis)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assertion
              <select
                aria-label="Assertion"
                value={source.assertion}
                onChange={(event) => change("assertion", event.target.value)}
              >
                {(["supports", "contradicts", "reference_only"] as const).map((assertion) => (
                  <option key={assertion} value={assertion}>
                    {words(assertion)}
                  </option>
                ))}
              </select>
            </label>
            {Object.entries({
              title: "Source title",
              source_reference: "Document / record reference",
              owner_name: "Source custodian",
              revision_label: "Document revision",
              source_location: "Page / clause / callout",
            }).map(([field, label]) => (
              <label key={field}>
                {label}
                <input
                  required
                  maxLength={2000}
                  value={source[field as keyof MediaSourceCopy]}
                  onChange={(event) => change(field as keyof MediaSourceCopy, event.target.value)}
                />
              </label>
            ))}
            <label>
              Evidence date
              <input
                required
                type="date"
                value={source.evidence_date}
                onChange={(event) => change("evidence_date", event.target.value)}
              />
            </label>
          </div>
          <div className="console-editor-actions">
            <button className="console-button console-action" disabled={command.busy}>
              <Save size={18} aria-hidden="true" />
              Record evidence
            </button>
          </div>
        </fieldset>
      </form>
    </details>
  );
}
function ScopeEditor({
  data,
  scope,
  history,
}: {
  data: MediaMappingData;
  scope: MediaMappingScope | null;
  history: MediaMappingHistory | null;
}) {
  const initial = scope?.candidate ?? scope?.current;
  const candidate = scope?.candidate;
  const pending = candidate?.state === "pending";
  const [role, setRole] = useState<MediaMappingRole>(scope?.role ?? "main");
  const [slot, setSlot] = useState(scope?.slot ?? 0);
  const [assetId, setAssetId] = useState(initial?.assetId ?? "");
  const [altText, setAltText] = useState(initial?.altText ?? "");
  const [sourceIds, setSourceIds] = useState(initial?.sourceIds ?? []);
  const [reason, setReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [editing, setEditing] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [inspectionRound, setInspectionRound] = useState(0);
  const [observation, setObservation] = useState<MediaObservation | null>(null);
  const [expired, setExpired] = useState(false);
  const [ack, setAck] = useState([false, false, false]);
  const [rights, setRights] = useState("");
  const [match, setMatch] = useState("");
  const [sourceDirty, setSourceDirty] = useState(false);
  const [sourceBusy, setSourceBusy] = useState(false);
  const [evidenceChanged, setEvidenceChanged] = useState(false);
  const command = useConsoleCommand();
  const busy = command.busy || sourceBusy;
  const inspectButton = useRef<HTMLButtonElement>(null);
  const path = `/console/products/${data.variantId}/media`;
  const comparePath = `${path}${scope ? `?head=${scope.id}` : "?head=new"}`;
  const proposalDirty =
    assetId !== (initial?.assetId ?? "") ||
    altText !== (initial?.altText ?? "") ||
    JSON.stringify([...sourceIds].sort()) !==
      JSON.stringify([...(initial?.sourceIds ?? [])].sort()) ||
    role !== (scope?.role ?? "main") ||
    slot !== (scope?.slot ?? 0);
  const markSafe = useUnsavedChanges(
    proposalDirty ||
      sourceDirty ||
      Boolean(reason || resolution || rights || match) ||
      ack.some(Boolean),
  );
  const editable = (!pending && data.canPropose) || Boolean(pending && data.canReview && editing);
  const original = data.originals.find((item) => item.asset_id === assetId && item.completed);
  const sources = data.sources.filter(
    (source) => source.assetId === assetId && source.role === role,
  );
  const knownConflicts = data.sources.filter(
    (source) =>
      source.role === role &&
      (source.assetId === assetId || source.assetId === candidate?.assetId) &&
      source.assertion === "contradicts",
  );
  const conflicting = knownConflicts.length > 0 || candidate?.status === "DATA_CONFLICT";
  const review = useMemo(
    () =>
      candidate && pending && data.canReview && !editing
        ? {
            mapping_id: candidate.id,
            revision: scope!.revision,
            digest: candidate.digest,
            original_digest: candidate.originalDigest,
          }
        : undefined,
    [candidate, pending, data.canReview, editing, scope],
  );
  const observed = useCallback((value: MediaObservation | null) => {
    setObservation(value);
    setAck([false, false, false]);
    setExpired(false);
  }, []);
  const observationRef = useRef(observation);
  observationRef.current = observation;
  useEffect(() => {
    if (!observation) return;
    const timer = setTimeout(
      () => {
        setObservation(null);
        setAck([false, false, false]);
        setExpired(true);
      },
      Math.max(0, observation.expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [observation]);
  const eligible =
    candidate?.sourceIds
      .map((id) => data.sources.find((source) => source.id === id))
      .filter((source): source is MediaSource =>
        Boolean(source && qualifyingMediaSource(source)),
      ) ?? [];
  const canApprove = Boolean(
    pending &&
    !editing &&
    data.canReview &&
    observation &&
    ack.every(Boolean) &&
    rights &&
    match &&
    eligible.some((source) => source.id === rights && source.dimension === "usage_rights") &&
    eligible.some((source) => source.id === match && source.dimension === "product_match") &&
    (!conflicting || resolution.trim().length >= 3),
  );
  const navigate = (headId?: string) => {
    markSafe();
    window.location.assign(`${path}${headId || scope ? `?head=${headId ?? scope!.id}` : ""}`);
  };
  return (
    <>
      <div className="console-comparison">
        <Snapshot title="Current mapping" fact={scope?.current ?? null} data={data} />
        <Snapshot title="Saved proposal" fact={candidate ?? null} data={data} />
        <section className="console-fact-snapshot">
          <h3>Original record</h3>
          {original ? (
            <>
              <p>{original.filename}</p>
              <p className="console-caption">
                {original.width} x {original.height} px /{" "}
                {(original.byte_size / 1048576).toFixed(2)} MiB
              </p>
              <p>{original.source_owner}</p>
              <p className="console-caption">{original.source_reference}</p>
              {!original.subject_current && (
                <p className="console-conflict">Product identity changed</p>
              )}
              <button
                type="button"
                className="console-secondary console-action"
                disabled={busy || evidenceChanged}
                ref={inspectButton}
                onClick={() => {
                  observed(null);
                  setInspectionRound((value) => value + 1);
                  setInspect(true);
                }}
              >
                <ImageIcon size={18} aria-hidden="true" />
                Inspect original
              </button>
            </>
          ) : (
            <p className="console-caption">No completed original selected</p>
          )}
        </section>
      </div>
      {inspect && original && (
        <StoredOriginalInspection
          key={`${original.asset_id}:${editing}:${candidate?.id ?? "read"}:${inspectionRound}`}
          item={original}
          variantId={data.variantId}
          review={review}
          onObservation={observed}
          onClose={() => {
            setInspect(false);
            observed(null);
            inspectButton.current?.focus();
          }}
        />
      )}
      {expired && (
        <div role="status" className="console-command-error">
          <p>Original inspection expired</p>
          <button
            type="button"
            className="console-secondary console-action"
            onClick={() => {
              observed(null);
              setInspectionRound((value) => value + 1);
              setInspect(true);
            }}
          >
            <RotateCcw size={18} aria-hidden="true" />
            Recheck original
          </button>
        </div>
      )}
      {evidenceChanged && (
        <p role="status" className="console-conflict">
          Evidence changed / Latest record required
        </p>
      )}
      <form
        className="console-editor"
        onSubmit={async (event) => {
          event.preventDefault();
          if (
            busy ||
            evidenceChanged ||
            (sourceDirty && !window.confirm("Discard unrecorded source entries and continue?"))
          )
            return;
          const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
          let result;
          if (action === "propose" && data.canPropose && !pending)
            result = await command.run({
              action: "media_propose",
              variant_id: data.variantId,
              asset_id: assetId,
              role,
              slot,
              head_id: scope?.id ?? null,
              revision: scope?.revision ?? 0,
              copy: { alt_text: altText.trim() },
              sources: sourceIds,
              reason,
            });
          else if (
            action === "submit" &&
            candidate &&
            candidate.state === "proposed" &&
            data.canSubmit &&
            !proposalDirty
          )
            result = await command.run({
              action: "media_submit",
              mapping_id: candidate.id,
              revision: scope!.revision,
              digest: candidate.digest,
            });
          else if (
            candidate &&
            pending &&
            data.canReview &&
            (action === "APPROVE" || action === "EDIT" || action === "REJECT")
          ) {
            if (
              action === "APPROVE" &&
              (!canApprove ||
                !review ||
                !readMediaObservation(observationRef.current?.value ?? null, review))
            ) {
              observed(null);
              setExpired(true);
              return;
            }
            if (action === "EDIT" && !editing) return;
            result = await command.run({
              action: "media_review",
              mapping_id: candidate.id,
              revision: scope!.revision,
              digest: candidate.digest,
              decision: action,
              reason,
              resolution: action === "APPROVE" ? resolution : "",
              confirmation:
                action === "APPROVE"
                  ? {
                      original_digest: candidate.originalDigest,
                      original_inspected: true,
                      usage_rights_confirmed: true,
                      exact_product_confirmed: true,
                    }
                  : null,
              rights_source_id: action === "APPROVE" ? rights : null,
              match_source_id: action === "APPROVE" ? match : null,
              observation: action === "APPROVE" ? observationRef.current!.value : null,
              replacement:
                action === "EDIT"
                  ? { asset_id: assetId, copy: { alt_text: altText.trim() }, sources: sourceIds }
                  : null,
            });
          }
          if (result) navigate(result.head_id);
          else if (action === "APPROVE") {
            observed(null);
            setInspect(false);
          }
        }}
      >
        <CommandFeedback {...command} comparePath={comparePath} />
        {command.error && command.error.code !== "40001" && (
          <a className="console-secondary console-action" href={comparePath}>
            <RotateCcw size={18} aria-hidden="true" />
            Reload latest record
          </a>
        )}
        <fieldset disabled={!editable || busy || evidenceChanged}>
          <legend>{editing ? "Replacement mapping" : "Image mapping proposal"}</legend>
          <div className="console-editor-grid">
            <label>
              Image role
              <select
                aria-label="Image role"
                value={role}
                disabled={Boolean(scope)}
                onChange={(event) => {
                  setRole(event.target.value as MediaMappingRole);
                  setSlot(0);
                  setSourceIds([]);
                  setSourceDirty(false);
                }}
              >
                {mediaMappingRoles.map((role) => (
                  <option key={role} value={role}>
                    {words(role)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Image slot
              <input
                type="number"
                min={0}
                max={99}
                step={1}
                disabled={Boolean(scope) || role === "main"}
                value={slot}
                onChange={(event) => setSlot(event.target.valueAsNumber)}
              />
            </label>
            <label className="console-span-full">
              Stored original
              <select
                aria-label="Stored original"
                required
                value={assetId}
                onChange={(event) => {
                  setAssetId(event.target.value);
                  setSourceIds([]);
                  setSourceDirty(false);
                  setInspect(false);
                  observed(null);
                }}
              >
                <option value="">Select original</option>
                {data.originals
                  .filter((item) => item.completed)
                  .map((item) => (
                    <option
                      key={item.asset_id}
                      value={item.asset_id}
                      disabled={!item.subject_current}
                    >
                      {item.filename}
                      {!item.subject_current && " / Product identity changed"}
                    </option>
                  ))}
              </select>
            </label>
            <label className="console-span-full">
              Image alt text
              <input
                required
                maxLength={500}
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
              />
            </label>
          </div>
          <section className="console-evidence-selection" aria-label="Image evidence selection">
            <h3>Image evidence</h3>
            {sources.length ? (
              sources.map((source) => (
                <div className="console-media-evidence-row" key={source.id}>
                  <label className="console-checkbox">
                    <input
                      type="checkbox"
                      checked={sourceIds.includes(source.id)}
                      disabled={!sourceIds.includes(source.id) && sourceIds.length >= 20}
                      onChange={(event) =>
                        setSourceIds(
                          event.target.checked
                            ? [...sourceIds, source.id]
                            : sourceIds.filter((id) => id !== source.id),
                        )
                      }
                    />
                    <span>
                      {source.title}
                      <small>
                        {words(source.dimension)} / Level {source.level} / {words(source.assertion)}
                      </small>
                    </span>
                  </label>
                  <SourceNote source={source} showTitle={false} />
                </div>
              ))
            ) : (
              <p className="console-caption">No exact-image source recorded</p>
            )}
          </section>
        </fieldset>
        {knownConflicts.length > 0 && (
          <section className="console-media-conflicts" aria-label="Known image conflicts">
            <h3>Known image conflicts</h3>
            {knownConflicts.map((source) => (
              <SourceNote key={source.id} source={source} />
            ))}
          </section>
        )}
        {(data.canPropose || (pending && data.canReview)) && (
          <label>
            Decision / proposal reason
            <textarea
              aria-label="Decision / proposal reason"
              required
              minLength={3}
              maxLength={2000}
              value={reason}
              disabled={busy || evidenceChanged}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
        )}
        {pending && data.canReview && !editing && (
          <fieldset disabled={busy || evidenceChanged}>
            <legend>Human review</legend>
            <div className="console-editor-grid">
              <label>
                Usage-rights evidence
                <select
                  aria-label="Usage-rights evidence"
                  value={rights}
                  onChange={(event) => {
                    setRights(event.target.value);
                    setAck([ack[0], false, ack[2]]);
                  }}
                >
                  <option value="">Select supporting source</option>
                  {eligible
                    .filter((source) => source.dimension === "usage_rights")
                    .map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.title}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Exact-product evidence
                <select
                  aria-label="Exact-product evidence"
                  value={match}
                  onChange={(event) => {
                    setMatch(event.target.value);
                    setAck([ack[0], ack[1], false]);
                  }}
                >
                  <option value="">Select supporting source</option>
                  {eligible
                    .filter((source) => source.dimension === "product_match")
                    .map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.title}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            {conflicting && (
              <label>
                Conflict resolution
                <textarea
                  aria-label="Conflict resolution"
                  required
                  minLength={3}
                  maxLength={2000}
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                />
              </label>
            )}
            <p className="console-caption" role="status">
              {observation
                ? "Original checked / Inspection active"
                : "Current original inspection required"}
            </p>
            {(
              [
                "I inspected the unchanged original",
                "I confirm documented image usage rights",
                "I confirm this image depicts the exact SKU",
              ] as const
            ).map((label, index) => (
              <label className="console-checkbox" key={label}>
                <input
                  type="checkbox"
                  checked={ack[index]}
                  disabled={!observation || (index === 1 && !rights) || (index === 2 && !match)}
                  onChange={(event) =>
                    setAck(ack.map((value, i) => (i === index ? event.target.checked : value)))
                  }
                />
                {label}
              </label>
            ))}
          </fieldset>
        )}
        <div className="console-editor-actions">
          {!pending && data.canPropose && (
            <button
              className="console-button console-action"
              value="propose"
              disabled={
                busy ||
                evidenceChanged ||
                !original?.subject_current ||
                !altText.trim() ||
                !reason.trim()
              }
            >
              <Save size={18} aria-hidden="true" />
              Save proposal
            </button>
          )}
          {candidate?.state === "proposed" && data.canSubmit && (
            <button
              className="console-secondary console-action"
              value="submit"
              formNoValidate
              disabled={busy || evidenceChanged || proposalDirty}
            >
              <Send size={18} aria-hidden="true" />
              Submit for review
            </button>
          )}
          {pending && data.canReview && (
            <>
              {!editing ? (
                <>
                  <button
                    className="console-button console-action"
                    value="APPROVE"
                    disabled={busy || evidenceChanged || !canApprove || !reason.trim()}
                  >
                    <Check size={18} aria-hidden="true" />
                    Approve mapping
                  </button>
                  <button
                    type="button"
                    className="console-secondary console-action"
                    disabled={busy || evidenceChanged}
                    onClick={() => {
                      setEditing(true);
                      setInspect(false);
                      observed(null);
                    }}
                  >
                    <Pencil size={18} aria-hidden="true" />
                    Edit mapping
                  </button>
                </>
              ) : (
                <button
                  className="console-button console-action"
                  value="EDIT"
                  disabled={
                    busy ||
                    evidenceChanged ||
                    !original?.subject_current ||
                    !altText.trim() ||
                    !reason.trim()
                  }
                >
                  <Save size={18} aria-hidden="true" />
                  Save replacement
                </button>
              )}
              <button
                className="console-danger console-action"
                value="REJECT"
                formNoValidate
                disabled={busy || evidenceChanged || reason.trim().length < 3}
              >
                <X size={18} aria-hidden="true" />
                Reject mapping
              </button>
              {editing && (
                <button
                  type="button"
                  className="console-secondary console-action"
                  disabled={busy}
                  onClick={() => {
                    setEditing(false);
                    setAssetId(candidate.assetId);
                    setAltText(candidate.altText);
                    setSourceIds(candidate.sourceIds);
                    setInspect(false);
                    observed(null);
                  }}
                >
                  <X size={18} aria-hidden="true" />
                  Cancel edit
                </button>
              )}
            </>
          )}
        </div>
      </form>
      {data.canSubmit && (
        <SourceEntry
          key={`${assetId}:${role}`}
          data={data}
          assetId={assetId}
          role={role}
          disabled={command.busy || evidenceChanged}
          onBusy={setSourceBusy}
          onDirty={setSourceDirty}
          onCreated={() => {
            observed(null);
            setInspect(false);
            setEvidenceChanged(true);
          }}
        />
      )}
      {evidenceChanged && (
        <a className="console-secondary console-action" href={comparePath}>
          <RotateCcw size={18} aria-hidden="true" />
          Reload latest record
        </a>
      )}
      {history && (
        <section className="console-history" aria-label="Image mapping history">
          <h2>Mapping history</h2>
          {history.items.map((item) => (
            <article key={item.id}>
              <h3>
                Revision {item.revision} / {words(item.state)}
              </h3>
              <p>{item.altText}</p>
              <Status value={item.status} />
              <p className="console-caption">{item.createdAt}</p>
              <p>{item.reason}</p>
              {item.decision && (
                <p>
                  {item.decision} / {item.reviewReason}
                </p>
              )}
              {item.resolution && <p>{item.resolution}</p>}
              {item.sourceIds.map((id) => {
                const source = data.sources.find((source) => source.id === id);
                return source ? <SourceNote key={id} source={source} /> : null;
              })}
            </article>
          ))}
          <nav className="console-pagination" aria-label="Mapping history pages">
            <span className="console-caption">
              {history.total} records / Page {history.page} of{" "}
              {Math.max(1, Math.ceil(history.total / history.pageSize))}
            </span>
            {history.page > 1 && (
              <ConsoleLink href={`${path}?head=${scope!.id}&historyPage=${history.page - 1}`}>
                Previous Page
              </ConsoleLink>
            )}
            {history.page * history.pageSize < history.total && (
              <ConsoleLink href={`${path}?head=${scope!.id}&historyPage=${history.page + 1}`}>
                Next Page
              </ConsoleLink>
            )}
          </nav>
        </section>
      )}
    </>
  );
}
export function MediaMappingWorkbench({
  data,
  selectedId,
  history,
}: {
  data: MediaMappingData;
  selectedId: string;
  history: MediaMappingHistory | null;
}) {
  const scope = data.scopes.find((scope) => scope.id === selectedId) ?? null;
  return (
    <>
      <p className="console-caption">{data.sku} / Private image mappings</p>
      <div className="console-media-scopes" role="navigation" aria-label="Image mapping slots">
        {data.scopes.map((scope) => (
          <ConsoleLink
            key={scope.id}
            className="console-action"
            href={`/console/products/${data.variantId}/media?head=${scope.id}`}
            aria-current={selectedId === scope.id ? "page" : undefined}
          >
            {words(scope.role)} / {scope.slot}
            <span className="console-caption">
              {words(scope.candidate?.state ?? scope.current?.state ?? "no current mapping")}
            </span>
          </ConsoleLink>
        ))}
        {data.canPropose && (
          <ConsoleLink
            className="console-action"
            href={`/console/products/${data.variantId}/media?head=new`}
            aria-current={!scope ? "page" : undefined}
          >
            <Plus size={18} aria-hidden="true" />
            New mapping
          </ConsoleLink>
        )}
        <ConsoleLink
          className="console-action"
          href={`/console/products/${data.variantId}/originals`}
        >
          <ImageIcon size={18} aria-hidden="true" />
          Original images
        </ConsoleLink>
      </div>
      {!data.originals.some((item) => item.completed) && (
        <p className="console-empty">No completed original images</p>
      )}
      {data.legacy.length > 0 && (
        <section className="console-media-legacy">
          <h2>Retained reference mappings</h2>
          {data.legacy.map((item) => (
            <p key={item.id}>
              {words(item.role)} / {item.slot} / {item.altText || "Catalog reference"}
              <span className="console-caption">
                {" "}
                / {item.publicationReady ? "Governed public asset" : "Not publication ready"}
              </span>
            </p>
          ))}
        </section>
      )}
      <ScopeEditor
        key={`${selectedId}:${scope?.revision ?? 0}`}
        data={data}
        scope={scope}
        history={history}
      />
    </>
  );
}
