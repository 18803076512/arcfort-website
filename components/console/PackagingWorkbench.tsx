"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, RotateCcw, Save, Send, X } from "lucide-react";
import type {
  PackagingData,
  PackagingFact,
  PackagingHistory,
  PackagingSource,
} from "../../lib/console/packaging";
import {
  PACKAGING_SOURCE_FIELDS,
  packagingSourceClasses,
  qualifyingPackagingSource,
  validPackagingCopy,
  samePackaging,
  type PackagingCopy,
  type PackagingSourceCopy,
  type PackagingApprovedStatus,
} from "../../lib/domain/catalog/packaging";
import { useConsoleCommand, useUnsavedChanges } from "./useConsoleCommand";
import { CommandFeedback } from "./CommandFeedback";
import { ConsoleLink } from "./ConsoleLink";
import { Status } from "./CatalogViews";

const words = (value: string) => value.replaceAll("_", " ");
const emptyCopy: PackagingCopy = { package_description: "", quantity: null, quantity_unit: null };
const amount = (copy: PackagingCopy) =>
  copy.quantity === null ? "Quantity unknown" : `${copy.quantity} ${copy.quantity_unit}`;
const blankSource = (): PackagingSourceCopy => ({
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
function SourceNote({ source }: { source: PackagingSource }) {
  return (
    <div className="console-source-note">
      <p>{source.title}</p>
      <p>
        {source.copy.package_description} / {amount(source.copy)}
      </p>
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
function Snapshot({
  title,
  fact,
  data,
}: {
  title: string;
  fact: PackagingFact | null;
  data: PackagingData;
}) {
  return (
    <section className="console-fact-snapshot">
      <h3>{title}</h3>
      {fact ? (
        <>
          <p>{fact.copy.package_description}</p>
          <p>{amount(fact.copy)}</p>
          <Status value={fact.status} />
          <p className="console-caption">
            Revision {fact.revision} / {words(fact.state)}
          </p>
          {!fact.fresh && (
            <p className="console-conflict">
              {fact.state === "approved" ? "Approval invalidated" : "Evidence snapshot changed"}
            </p>
          )}
          <p className="console-caption">{fact.reason}</p>
          {fact.sources.map((id) => {
            const source = data.sources.find((row) => row.id === id);
            return source ? <SourceNote key={id} source={source} /> : null;
          })}
        </>
      ) : (
        <p className="console-caption">No current packaging</p>
      )}
    </section>
  );
}
function SourceEntry({
  data,
  copy,
  originalId,
  blocked,
  onBusy,
  onDirty,
  onCreated,
}: {
  data: PackagingData;
  copy: PackagingCopy;
  originalId: string | null;
  blocked: boolean;
  onBusy: (busy: boolean) => void;
  onDirty: (dirty: boolean) => void;
  onCreated: () => void;
}) {
  const [source, setSource] = useState(blankSource),
    command = useConsoleCommand();
  const classification =
    packagingSourceClasses[source.source_kind as keyof typeof packagingSourceClasses];
  const change = (key: keyof PackagingSourceCopy, value: string) => {
    setSource({ ...source, [key]: value });
    onDirty(true);
  };
  return (
    <details className="console-source-entry">
      <summary>
        <Plus size={18} aria-hidden="true" />
        Add packaging evidence
      </summary>
      <form
        className="console-editor"
        onSubmit={async (event) => {
          event.preventDefault();
          onBusy(true);
          try {
            if (
              await command.run({
                action: "packaging_source",
                variant_id: data.variantId,
                original_id: originalId,
                copy,
                source: Object.fromEntries(
                  Object.entries(source).map(([key, value]) => [key, value.trim()]),
                ) as PackagingSourceCopy,
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
          disabled={blocked || command.busy || !data.canSource || !validPackagingCopy(copy)}
        >
          <legend>
            {copy.package_description || "Packaging evidence"} / {amount(copy)}
          </legend>
          <div className="console-editor-grid">
            <label>
              Source classification
              <select
                aria-label="Source classification"
                value={source.source_kind}
                onChange={(event) => {
                  const kind = event.target.value as keyof typeof packagingSourceClasses;
                  setSource({
                    ...source,
                    source_kind: kind,
                    source_level: packagingSourceClasses[kind].level,
                    evidence_basis: packagingSourceClasses[kind].bases.at(-1)!,
                  });
                  onDirty(true);
                }}
              >
                {Object.entries(packagingSourceClasses).map(([kind, value]) => (
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
            {PACKAGING_SOURCE_FIELDS.filter(
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
export function PackagingWorkbench({
  data,
  selectedId,
  history,
}: {
  data: PackagingData;
  selectedId: string;
  history: PackagingHistory | null;
}) {
  const router = useRouter(),
    scope = data.scopes.find((row) => row.id === selectedId),
    latest = scope?.latest;
  const pending = latest?.state === "pending",
    proposed = latest?.state === "proposed";
  const [description, setDescription] = useState(latest?.copy.package_description ?? "");
  const [known, setKnown] = useState(latest?.copy.quantity != null);
  const [quantity, setQuantity] = useState(latest?.copy.quantity?.toString() ?? "");
  const [unit, setUnit] = useState(latest?.copy.quantity_unit ?? "");
  const [originalId, setOriginalId] = useState(scope?.originalId ?? "");
  const [selectedSources, setSelectedSources] = useState(latest?.sources ?? []),
    [reason, setReason] = useState(pending ? "" : (latest?.reason ?? ""));
  const [resolution, setResolution] = useState(""),
    [status, setStatus] = useState<PackagingApprovedStatus>("OEM_REFERENCE"),
    [approvalSource, setApprovalSource] = useState("");
  const [checks, setChecks] = useState([false, false, false, false]),
    [dirty, setDirty] = useState(false),
    [copyDirty, setCopyDirty] = useState(false);
  const [sourceDirty, setSourceDirty] = useState(false),
    [sourceBusy, setSourceBusy] = useState(false),
    [resetVersion, setResetVersion] = useState(0);
  const command = useConsoleCommand(),
    clearUnsaved = useUnsavedChanges(dirty || sourceDirty);
  const copy: PackagingCopy = {
    package_description: description,
    quantity: known ? (/^[1-9][0-9]*$/.test(quantity) ? Number(quantity) : NaN) : null,
    quantity_unit: known ? unit : null,
  };
  const url = `/console/products/${data.variantId}/packaging`,
    blocked = command.busy || sourceBusy,
    stale = command.error?.code === "40001";
  const slot = Array.from({ length: 100 }, (_, n) => n).find(
    (n) => !data.scopes.some((row) => row.slot === n),
  );
  const applicable = data.sources.filter(
    (source) => source.originalId === (originalId || null) && samePackaging(source.copy, copy),
  );
  const approvalSources = data.sources.filter(
    (source) =>
      latest?.sources.includes(source.id) &&
      source.originalId === (scope?.originalId ?? null) &&
      samePackaging(source.copy, latest.copy) &&
      qualifyingPackagingSource(source, status),
  );
  const approved =
    checks.slice(0, 3).every(Boolean) &&
    (status !== "CONFIRMED" || checks[3]) &&
    approvalSources.some((row) => row.id === approvalSource) &&
    (latest?.status !== "DATA_CONFLICT" || resolution.replace(/\s/g, "").length >= 3);
  const canSave =
    data.canPropose &&
    !pending &&
    !(proposed && latest.status === "DATA_CONFLICT") &&
    (scope || slot !== undefined);
  const edited = () => {
    setSelectedSources([]);
    setCopyDirty(true);
    setDirty(true);
  };
  const setPhysical = (value: PackagingCopy) => {
    setDescription(value.package_description);
    setKnown(value.quantity !== null);
    setQuantity(value.quantity?.toString() ?? "");
    setUnit(value.quantity_unit ?? "");
  };
  const reset = () => {
    clearUnsaved();
    setPhysical(latest?.copy ?? emptyCopy);
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
    <div className="console-packaging-workbench">
      <p className="console-caption">{data.sku} / Private packaging / Publication blocked</p>
      <p className={data.readiness.unresolved ? "console-conflict" : "console-caption"}>
        {data.readiness.count === 0
          ? "Packaging missing"
          : `${data.readiness.count} records / ${data.readiness.unknown} quantities unknown`}{" "}
        / {data.readiness.unresolved} unresolved / {data.readiness.conflicts} conflicts
      </p>
      <div className="console-editor-actions">
        <label>
          Packaging record
          <select
            aria-label="Packaging record"
            value={selectedId}
            disabled={blocked}
            onChange={(event) => {
              if (
                (!dirty && !sourceDirty) ||
                window.confirm("Discard unsaved changes and select another package?")
              ) {
                clearUnsaved();
                window.location.assign(`${url}?head=${event.target.value || "new"}`);
              }
            }}
          >
            <option value="">New packaging</option>
            {data.scopes.map((row) => (
              <option value={row.id} key={row.id}>
                {row.latest.copy.package_description} / {amount(row.latest.copy)}
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
          <Snapshot title="Current packaging" fact={scope.current} data={data} />
          <Snapshot title="Latest proposal" fact={scope.latest} data={data} />
        </div>
      )}
      {!!scope?.conflicts.length && (
        <section aria-label="Known packaging conflicts">
          <h2>Conflicting evidence</h2>
          {scope.conflicts.map((id) => {
            const source = data.sources.find((row) => row.id === id);
            return source ? <SourceNote key={id} source={source} /> : null;
          })}
        </section>
      )}
      <form
        className="console-editor"
        onSubmit={async (event) => {
          event.preventDefault();
          const button = (event.nativeEvent as SubmitEvent).submitter,
            action = button instanceof HTMLButtonElement ? button.value : "";
          if (blocked || sourceDirty) return;
          let result;
          if (action === "propose" && canSave)
            result = await command.run({
              action: "packaging_propose",
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
              action: "packaging_submit",
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
              action: "packaging_review",
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
                      packaging_checked: true,
                      commercial_terms_unchanged: true,
                      arcfort_packaging_confirmed: status === "CONFIRMED",
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
            window.location.assign(`${url}?head=${result.head_id ?? scope?.id ?? "new"}`);
          }
        }}
      >
        <CommandFeedback {...command} comparePath={`${url}?head=${selectedId || "new"}`} />
        <fieldset disabled={blocked || (!data.canPropose && !(pending && data.canReview))}>
          <legend>{pending ? "Correction candidate" : "Packaging proposal"}</legend>
          <label>
            Original packaging
            <select
              aria-label="Original packaging"
              disabled={!!scope || sourceDirty}
              value={originalId}
              onChange={(event) => {
                const id = event.target.value;
                setOriginalId(id);
                setPhysical(data.originals.find((row) => row.id === id)?.copy ?? emptyCopy);
                edited();
              }}
            >
              <option value="">No imported original</option>
              {data.originals
                .filter(
                  (row) =>
                    row.id === originalId ||
                    !data.scopes.some((head) => head.originalId === row.id),
                )
                .map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.copy.package_description} / {amount(row.copy)}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Package description
            <textarea
              aria-label="Package description"
              value={description}
              maxLength={1000}
              required
              disabled={sourceDirty}
              onChange={(event) => {
                setDescription(event.target.value);
                edited();
              }}
            />
          </label>
          <label className="console-checkbox">
            <input
              type="checkbox"
              checked={known}
              disabled={sourceDirty}
              onChange={(event) => {
                setKnown(event.target.checked);
                edited();
              }}
            />
            Quantity known
          </label>
          <div className="console-editor-grid">
            <label>
              Quantity
              <input
                aria-label="Quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={2147483647}
                step={1}
                required={known}
                disabled={!known || sourceDirty}
                value={known ? quantity : ""}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  edited();
                }}
              />
            </label>
            <label>
              Quantity unit
              <input
                aria-label="Quantity unit"
                value={known ? unit : ""}
                maxLength={40}
                required={known}
                disabled={!known || sourceDirty}
                onChange={(event) => {
                  setUnit(event.target.value);
                  edited();
                }}
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
              <p className="console-caption">No exact packaging evidence recorded</p>
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
                    setStatus(event.target.value as PackagingApprovedStatus);
                    setChecks([false, false, false, false]);
                    setApprovalSource("");
                    setDirty(true);
                  }}
                >
                  <option value="OEM_REFERENCE">Official manufacturer reference</option>
                  <option value="CONFIRMED">ArcFort supplied packaging confirmed</option>
                </select>
              </label>
              <label>
                Approval evidence
                <select
                  aria-label="Approval evidence"
                  value={approvalSource}
                  onChange={(event) => {
                    setApprovalSource(event.target.value);
                    setChecks([false, false, false, false]);
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
                  "Exact packaging reviewed",
                  "Commercial terms unchanged",
                  ...(status === "CONFIRMED" ? ["ArcFort supplied packaging confirmed"] : []),
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
          originalId={originalId || null}
          blocked={command.busy}
          onBusy={setSourceBusy}
          onDirty={setSourceDirty}
          onCreated={() => router.refresh()}
        />
      )}
      {history && (
        <section className="console-history">
          <h2>Packaging history</h2>
          <p className="console-caption">
            {history.total} revisions / Page {history.page}
          </p>
          {history.items.map((item) => (
            <article key={item.id}>
              <h3>
                Revision {item.revision} / {words(item.state)}
              </h3>
              <p>
                {item.copy.package_description} / {amount(item.copy)}
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
          <nav className="console-pagination" aria-label="Packaging history pages">
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
      {!!data.originals.length && (
        <section>
          <h2>Imported packaging and commercial notes</h2>
          {data.originals.map((row) => (
            <div className="console-source-note" key={row.id}>
              <p>
                {row.copy.package_description} / {amount(row.copy)}
              </p>
              <Status value={row.status} />
              <p className="console-caption">
                {row.level ? `Level ${row.level}` : "Source level unknown"} / Original record
              </p>
              <dl className="console-facts">
                <dt>MOQ</dt>
                <dd>{row.moq || "Unknown"}</dd>
                <dt>Lead time</dt>
                <dd>{row.leadTime || "Unknown"}</dd>
              </dl>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
