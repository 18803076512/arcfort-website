"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, RotateCcw, Save, Send, X } from "lucide-react";
import type { OemData, OemFact, OemHistory, OemSource } from "../../lib/console/oem";
import {
  OEM_SOURCE_FIELDS,
  oemSourceClasses,
  qualifyingOemSource,
  type OemCopy,
  type OemSourceCopy,
  type OemApprovedStatus,
} from "../../lib/domain/catalog/oem";
import { useConsoleCommand, useUnsavedChanges } from "./useConsoleCommand";
import { CommandFeedback } from "./CommandFeedback";
import { ConsoleLink } from "./ConsoleLink";
import { Status } from "./CatalogViews";

const words = (value: string) => value.replaceAll("_", " ");
const blankSource = (): OemSourceCopy => ({
  source_kind: "company_record",
  source_level: "A",
  title: "",
  source_reference: "",
  evidence_basis: "company_catalog",
  evidence_date: "",
  owner_name: "",
  revision_label: "",
  source_location: "",
  assertion: "reference_only",
});
function SourceNote({ source }: { source: OemSource }) {
  return (
    <div className="console-source-note">
      <p>{source.title}</p>
      <p>{source.document}</p>
      <p
        className={
          source.assertion === "contradicts" || !source.current
            ? "console-conflict"
            : "console-caption"
        }
      >
        Level {source.level} / {words(source.basis)} / {words(source.assertion)}
        {!source.current && " / Source identity changed"}
      </p>
      <p className="console-caption">
        {source.version} / {source.location} / {source.date} / {source.owner}
      </p>
    </div>
  );
}
function Snapshot({ title, fact, data }: { title: string; fact: OemFact | null; data: OemData }) {
  return (
    <section className="console-fact-snapshot">
      <h3>{title}</h3>
      {fact ? (
        <>
          <p>{fact.manufacturer}</p>
          <p>{fact.reference}</p>
          <Status value={fact.status} />
          <p className="console-caption">
            Revision {fact.revision} / {words(fact.state)}
          </p>
          {fact.state === "approved" && !fact.valid && (
            <p className="console-conflict">Approval invalidated</p>
          )}
          {!fact.fresh && fact.state !== "approved" && (
            <p className="console-conflict">Evidence snapshot changed</p>
          )}
          <p className="console-caption">{fact.reason}</p>
          {fact.sources.map((id) => {
            const source = data.sources.find((source) => source.id === id);
            return source ? <SourceNote key={id} source={source} /> : null;
          })}
        </>
      ) : (
        <p className="console-caption">No current reference</p>
      )}
    </section>
  );
}
function SourceEntry({
  data,
  copy,
  blocked,
  onBusy,
  onDirty,
  onCreated,
}: {
  data: OemData;
  copy: OemCopy;
  blocked: boolean;
  onBusy: (busy: boolean) => void;
  onDirty: (dirty: boolean) => void;
  onCreated: () => void;
}) {
  const [source, setSource] = useState(blankSource);
  const command = useConsoleCommand();
  const change = (key: keyof OemSourceCopy, value: string) => {
    setSource({ ...source, [key]: value });
    onDirty(true);
  };
  const classification = oemSourceClasses[source.source_kind as keyof typeof oemSourceClasses];
  return (
    <details className="console-source-entry">
      <summary>
        <Plus size={18} aria-hidden="true" />
        Add reference evidence
      </summary>
      <form
        className="console-editor"
        onSubmit={async (event) => {
          event.preventDefault();
          onBusy(true);
          try {
            if (
              await command.run({
                action: "oem_source",
                variant_id: data.variantId,
                copy,
                source: Object.fromEntries(
                  Object.entries(source).map(([key, value]) => [key, value.trim()]),
                ) as OemSourceCopy,
              })
            ) {
              setSource(blankSource());
              onDirty(false);
              onCreated();
            }
          } finally {
            onBusy(false);
          }
        }}
      >
        <CommandFeedback {...command} />
        <fieldset
          disabled={
            blocked ||
            command.busy ||
            !data.canSource ||
            !copy.manufacturer_name ||
            !copy.reference_number
          }
        >
          <legend>
            {copy.manufacturer_name} / {copy.reference_number}
          </legend>
          <div className="console-editor-grid">
            <label>
              Source classification
              <select
                aria-label="Source classification"
                value={source.source_kind}
                onChange={(event) => {
                  const kind = event.target.value as keyof typeof oemSourceClasses;
                  setSource({
                    ...source,
                    source_kind: kind,
                    source_level: oemSourceClasses[kind].level,
                    evidence_basis: oemSourceClasses[kind].bases.at(-1)!,
                  });
                  onDirty(true);
                }}
              >
                {Object.entries(oemSourceClasses).map(([kind, value]) => (
                  <option key={kind} value={kind}>
                    Level {value.level} / {words(kind)}
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
                {classification.bases.map((basis) => (
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
                {["reference_only", "supports", "contradicts"].map((value) => (
                  <option key={value} value={value}>
                    {words(value)}
                  </option>
                ))}
              </select>
            </label>
            {OEM_SOURCE_FIELDS.filter(
              (key) =>
                !["source_kind", "source_level", "evidence_basis", "assertion"].includes(key),
            ).map((key) => (
              <label key={key}>
                {words(key)}
                <input
                  aria-label={words(key)}
                  value={source[key]}
                  required
                  maxLength={2000}
                  type={key === "evidence_date" ? "date" : "text"}
                  max={key === "evidence_date" ? new Date().toISOString().slice(0, 10) : undefined}
                  onChange={(event) => change(key, event.target.value)}
                />
              </label>
            ))}
          </div>
          <div className="console-editor-actions">
            <button className="console-button console-action" type="submit">
              <Plus size={18} aria-hidden="true" />
              Add source
            </button>
            <button
              className="console-secondary console-action"
              type="button"
              onClick={() => {
                setSource(blankSource());
                onDirty(false);
              }}
            >
              <RotateCcw size={18} aria-hidden="true" />
              Discard source entries
            </button>
          </div>
        </fieldset>
      </form>
    </details>
  );
}
export function OemWorkbench({
  data,
  selectedId,
  history,
}: {
  data: OemData;
  selectedId: string;
  history: OemHistory | null;
}) {
  const router = useRouter();
  const scope = data.scopes.find((scope) => scope.id === selectedId);
  const latest = scope?.latest;
  const pending = latest?.state === "pending";
  const proposed = latest?.state === "proposed";
  const [copy, setCopy] = useState<OemCopy>({
    manufacturer_name: latest?.manufacturer ?? "",
    reference_number: latest?.reference ?? "",
  });
  const [originalId, setOriginalId] = useState(scope?.originalId ?? "");
  const [selectedSources, setSelectedSources] = useState(latest?.sources ?? []);
  const [reason, setReason] = useState(pending ? "" : (latest?.reason ?? ""));
  const [resolution, setResolution] = useState("");
  const [status, setStatus] = useState<OemApprovedStatus>("OEM_REFERENCE");
  const [approvalSource, setApprovalSource] = useState("");
  const [checks, setChecks] = useState([false, false, false, false]);
  const [dirty, setDirty] = useState(false);
  const [copyDirty, setCopyDirty] = useState(false);
  const [sourceDirty, setSourceDirty] = useState(false);
  const [sourceBusy, setSourceBusy] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const command = useConsoleCommand();
  const stale = command.error?.code === "40001";
  const clearUnsaved = useUnsavedChanges(dirty || sourceDirty);
  const url = `/console/products/${data.variantId}/oem`;
  const slot = Array.from({ length: 100 }, (_, n) => n).find(
    (n) => !data.scopes.some((scope) => scope.slot === n),
  );
  const applicable = data.sources.filter(
    (source) =>
      source.manufacturer === copy.manufacturer_name && source.reference === copy.reference_number,
  );
  const approvalSources = data.sources.filter(
    (source) =>
      latest?.sources.includes(source.id) &&
      source.manufacturer === latest.manufacturer &&
      source.reference === latest.reference &&
      qualifyingOemSource(source, status),
  );
  const approved =
    checks.slice(0, 3).every(Boolean) &&
    (status !== "CONFIRMED" || checks[3]) &&
    approvalSources.some((source) => source.id === approvalSource) &&
    (latest?.status !== "DATA_CONFLICT" || resolution.replace(/\s/g, "").length >= 3);
  const blocked = command.busy || sourceBusy;
  const canSave =
    data.canPropose &&
    !pending &&
    !(proposed && latest.status === "DATA_CONFLICT") &&
    (scope || slot !== undefined);
  const changeCopy = (key: keyof OemCopy, value: string) => {
    setCopy({ ...copy, [key]: value });
    setSelectedSources([]);
    setCopyDirty(true);
    setDirty(true);
  };
  const reset = () => {
    clearUnsaved();
    setCopy({
      manufacturer_name: latest?.manufacturer ?? "",
      reference_number: latest?.reference ?? "",
    });
    setOriginalId(scope?.originalId ?? "");
    setSelectedSources(latest?.sources ?? []);
    setReason(pending ? "" : (latest?.reason ?? ""));
    setResolution("");
    setStatus("OEM_REFERENCE");
    setApprovalSource("");
    setChecks([false, false, false, false]);
    setDirty(false);
    setCopyDirty(false);
    setSourceDirty(false);
    command.clearError();
    setResetVersion((n) => n + 1);
  };
  return (
    <div className="console-oem-workbench">
      <p className="console-caption">
        {data.sku} / Private reference records / Publication blocked
      </p>
      <div className="console-editor-actions">
        <label>
          Reference record
          <select
            aria-label="Reference record"
            value={selectedId}
            disabled={blocked}
            onChange={(event) => {
              if (
                (!dirty && !sourceDirty) ||
                window.confirm("Discard unsaved changes and select another reference?")
              ) {
                clearUnsaved();
                router.push(`${url}?head=${event.target.value || "new"}`);
              }
            }}
          >
            <option value="">New reference</option>
            {data.scopes.map((scope) => (
              <option value={scope.id} key={scope.id}>
                {scope.latest.manufacturer} / {scope.latest.reference}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="console-secondary console-action"
          disabled={blocked}
          onClick={() => {
            if ((!dirty && !sourceDirty) || window.confirm("Discard unsaved changes and reload?")) {
              reset();
              router.refresh();
            }
          }}
        >
          <RotateCcw size={18} aria-hidden="true" />
          Reload record
        </button>
      </div>
      {scope && (
        <div className="console-comparison console-oem-comparison">
          <Snapshot title="Current reference" fact={scope.current} data={data} />
          <Snapshot title="Latest proposal" fact={scope.latest} data={data} />
        </div>
      )}
      <form
        className="console-editor"
        onSubmit={async (event) => {
          event.preventDefault();
          const button = (event.nativeEvent as SubmitEvent).submitter;
          const action = button instanceof HTMLButtonElement ? button.value : "";
          if (blocked || sourceDirty) return;
          let result;
          if (action === "propose" && canSave)
            result = await command.run({
              action: "oem_propose",
              variant_id: data.variantId,
              slot: scope?.slot ?? slot!,
              revision: scope?.revision ?? 0,
              head_id: scope?.id ?? null,
              original_id: originalId || null,
              copy,
              sources: [...selectedSources].sort(),
              reason,
            });
          else if (
            action === "submit" &&
            proposed &&
            latest.fresh &&
            !stale &&
            !copyDirty &&
            data.canSubmit
          )
            result = await command.run({
              action: "oem_submit",
              revision_id: latest.id,
              revision: latest.revision,
              digest: latest.digest,
            });
          else if (
            pending &&
            latest &&
            data.canReview &&
            ["APPROVE", "EDIT", "REJECT"].includes(action)
          ) {
            if (action === "APPROVE" && (!latest.fresh || stale || !approved || copyDirty)) return;
            const decision = action as "APPROVE" | "EDIT" | "REJECT";
            result = await command.run({
              action: "oem_review",
              revision_id: latest.id,
              revision: latest.revision,
              digest: latest.digest,
              decision,
              reason,
              status: decision === "APPROVE" ? status : null,
              confirmation:
                decision === "APPROVE"
                  ? {
                      source_checked: true,
                      reference_checked: true,
                      compatibility_not_asserted: true,
                      arcfort_reference_confirmed: status === "CONFIRMED",
                    }
                  : null,
              source_id: decision === "APPROVE" ? approvalSource : null,
              resolution: decision === "APPROVE" ? resolution : "",
              replacement:
                decision === "EDIT" ? { copy, sources: [...selectedSources].sort() } : null,
            });
          }
          if (result) {
            clearUnsaved();
            setDirty(false);
            setSourceDirty(false);
            router.push(`${url}?head=${result.head_id ?? scope?.id ?? "new"}`);
            router.refresh();
          }
        }}
      >
        <CommandFeedback {...command} comparePath={`${url}?head=${selectedId || "new"}`} />
        <fieldset disabled={blocked || (!data.canPropose && !(pending && data.canReview))}>
          <legend>{pending ? "Correction candidate" : "Reference proposal"}</legend>
          <label>
            Original reference
            <select
              aria-label="Original reference"
              disabled={!!scope}
              value={originalId}
              onChange={(event) => {
                const id = event.target.value;
                const original = data.originals.find((row) => row.id === id);
                setOriginalId(id);
                setCopy({
                  manufacturer_name: original?.manufacturer ?? "",
                  reference_number: original?.reference ?? "",
                });
                setSelectedSources([]);
                setCopyDirty(true);
                setDirty(true);
              }}
            >
              <option value="">No imported original</option>
              {data.originals
                .filter(
                  (row) =>
                    row.id === originalId ||
                    !data.scopes.some((scope) => scope.originalId === row.id),
                )
                .map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.manufacturer || "Manufacturer unknown"} / {row.reference}
                  </option>
                ))}
            </select>
          </label>
          <div className="console-editor-grid">
            <label>
              Manufacturer
              <input
                value={copy.manufacturer_name}
                maxLength={120}
                required
                onChange={(event) => changeCopy("manufacturer_name", event.target.value)}
              />
            </label>
            <label>
              Reference number
              <input
                value={copy.reference_number}
                maxLength={100}
                required
                onChange={(event) => changeCopy("reference_number", event.target.value)}
              />
            </label>
          </div>
          <fieldset className="console-evidence-list">
            <legend>Selected proposal evidence</legend>
            {applicable.length ? (
              applicable.map((source) => (
                <div key={source.id}>
                  <label className="console-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      disabled={!source.current}
                      onChange={(event) => {
                        setSelectedSources(
                          event.target.checked
                            ? [...selectedSources, source.id]
                            : selectedSources.filter((id) => id !== source.id),
                        );
                        setCopyDirty(true);
                        setDirty(true);
                      }}
                    />
                    {source.title}
                  </label>
                  <SourceNote source={source} />
                </div>
              ))
            ) : (
              <p className="console-caption">No exact reference evidence recorded</p>
            )}
          </fieldset>
        </fieldset>
        <fieldset disabled={blocked || !(data.canPropose || data.canReview)}>
          <legend>Decision record</legend>
          <label>
            Proposal or decision reason
            <textarea
              aria-label="Proposal or decision reason"
              value={reason}
              required
              minLength={3}
              maxLength={2000}
              onChange={(event) => {
                setReason(event.target.value);
                setDirty(true);
                if (!pending) setCopyDirty(true);
              }}
            />
          </label>
          {pending && data.canReview && (
            <>
              <label>
                Approved status
                <select
                  aria-label="Approved status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as OemApprovedStatus);
                    setChecks([false, false, false, false]);
                    setApprovalSource("");
                    setDirty(true);
                  }}
                >
                  <option value="OEM_REFERENCE">Official manufacturer reference</option>
                  <option value="CONFIRMED">ArcFort SKU confirmed</option>
                </select>
              </label>
              <label>
                Approval evidence
                <select
                  aria-label="Approval evidence"
                  value={approvalSource}
                  onChange={(event) => {
                    setApprovalSource(event.target.value);
                    setDirty(true);
                  }}
                >
                  <option value="">Select exact qualifying source</option>
                  {approvalSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.title}
                    </option>
                  ))}
                </select>
              </label>
              {!approvalSources.length && (
                <p className="console-conflict">No qualifying selected evidence</p>
              )}
              <div className="console-acknowledgements">
                {[
                  "Source document reviewed",
                  "Exact reference reviewed",
                  "No compatibility claim",
                  ...(status === "CONFIRMED" ? ["ArcFort SKU designation confirmed"] : []),
                ].map((label, index) => (
                  <label className="console-checkbox" key={label}>
                    <input
                      type="checkbox"
                      checked={checks[index]}
                      onChange={(event) => {
                        setChecks(
                          checks.map((value, n) => (n === index ? event.target.checked : value)),
                        );
                        setDirty(true);
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {latest.status === "DATA_CONFLICT" && (
                <label>
                  Conflict resolution
                  <textarea
                    aria-label="Conflict resolution"
                    value={resolution}
                    maxLength={2000}
                    onChange={(event) => {
                      setResolution(event.target.value);
                      setDirty(true);
                    }}
                  />
                </label>
              )}
            </>
          )}
        </fieldset>
        <div className="console-editor-actions">
          {canSave && (
            <button
              className="console-button console-action"
              value="propose"
              disabled={blocked || sourceDirty}
            >
              <Save size={18} aria-hidden="true" />
              Save proposal
            </button>
          )}
          {proposed && data.canSubmit && (
            <button
              className="console-button console-action"
              value="submit"
              formNoValidate
              disabled={blocked || sourceDirty || copyDirty || stale || !latest.fresh}
            >
              <Send size={18} aria-hidden="true" />
              Submit frozen proposal
            </button>
          )}
          {pending && data.canReview && (
            <>
              <button
                className="console-button console-action"
                value="APPROVE"
                disabled={
                  blocked || sourceDirty || copyDirty || stale || !latest.fresh || !approved
                }
              >
                <Check size={18} aria-hidden="true" />
                Approve
              </button>
              <button
                className="console-secondary console-action"
                value="EDIT"
                disabled={blocked || sourceDirty}
              >
                <Pencil size={18} aria-hidden="true" />
                Edit proposal
              </button>
              <button
                className="console-danger console-action"
                value="REJECT"
                formNoValidate
                disabled={blocked || sourceDirty}
              >
                <X size={18} aria-hidden="true" />
                Reject
              </button>
            </>
          )}
        </div>
      </form>
      {data.canSource && (
        <SourceEntry
          key={resetVersion}
          data={data}
          copy={copy}
          blocked={command.busy}
          onBusy={setSourceBusy}
          onDirty={setSourceDirty}
          onCreated={() => router.refresh()}
        />
      )}
      {history && (
        <section className="console-history">
          <h2>Reference history</h2>
          <p className="console-caption">
            {history.total} revisions / Page {history.page}
          </p>
          {history.items.map((item) => (
            <article key={item.id}>
              <h3>
                Revision {item.revision} / {words(item.state)}
              </h3>
              <p>
                {item.manufacturer} / {item.reference}
              </p>
              <p>{item.reason}</p>
              <p className="console-caption">{item.createdAt}</p>
              {item.decision && (
                <p>
                  {item.decision} / {item.approvedStatus ?? item.status}
                </p>
              )}
              {item.reviewReason && <p>{item.reviewReason}</p>}
              {item.resolution && <p>{item.resolution}</p>}
            </article>
          ))}
          <nav className="console-pagination" aria-label="Reference history pages">
            {history.page > 1 && (
              <ConsoleLink href={`${url}?head=${selectedId}&historyPage=${history.page - 1}`}>
                Previous page
              </ConsoleLink>
            )}
            {history.page * history.pageSize < history.total && (
              <ConsoleLink href={`${url}?head=${selectedId}&historyPage=${history.page + 1}`}>
                Next page
              </ConsoleLink>
            )}
          </nav>
        </section>
      )}
      {data.originals.length > 0 && (
        <section>
          <h2>Imported references</h2>
          {data.originals.map((row) => (
            <div className="console-source-note" key={row.id}>
              <p>
                {row.manufacturer || "Manufacturer unknown"} / {row.reference}
              </p>
              <Status value={row.status} />
              <p className="console-caption">Level {row.level} / Original record</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
