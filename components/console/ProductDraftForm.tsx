"use client";

import { useState } from "react";
import { Save, Plus, RotateCcw } from "lucide-react";
import { DRAFT_LIMITS, type ProductDraftCopy } from "../../lib/domain/catalog/drafts";
import type { DraftIdentity } from "../../lib/domain/catalog/commands";
import type { ProductDraft } from "../../lib/console/working";
import { useConsoleCommand, useUnsavedChanges } from "./useConsoleCommand";
import { CommandFeedback } from "./CommandFeedback";

export const emptyProductCopy: ProductDraftCopy = {
  name_en: "",
  name_zh: "",
  model: "",
  summary: "",
  description: "",
  applications: "",
};
const labels: Record<keyof ProductDraftCopy, string> = {
  name_en: "English name",
  name_zh: "Chinese name",
  model: "Model wording",
  summary: "Summary",
  description: "Description",
  applications: "Applications",
};
function draftCopy(draft: ProductDraft | null): ProductDraftCopy {
  return Object.fromEntries(
    Object.keys(emptyProductCopy).map((field) => [
      field,
      draft?.[field as keyof ProductDraftCopy] ?? "",
    ]),
  ) as ProductDraftCopy;
}
export function ProductDraftForm({ draft }: { draft: ProductDraft | null }) {
  const [copy, setCopy] = useState(() => draftCopy(draft));
  const [saved, setSaved] = useState(() => draftCopy(draft));
  const [identity, setIdentity] = useState<DraftIdentity>({
    sku: "",
    slug: "",
    source_reference: "",
  });
  const [revision, setRevision] = useState(draft?.revision ?? 0);
  const [message, setMessage] = useState("");
  const command = useConsoleCommand();
  const dirty =
    JSON.stringify(copy) !== JSON.stringify(saved) ||
    (!draft && Object.values(identity).some(Boolean));
  const markSafe = useUnsavedChanges(dirty);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const result = await command.run(
      draft
        ? { action: "save", variant_id: draft.product_variant_id, revision, copy }
        : { action: "create", identity, copy },
    );
    if (!result) return;
    if (!draft && result.variant_id) {
      markSafe();
      window.location.assign(`/console/products/${result.variant_id}/edit`);
      return;
    }
    if (typeof result.revision !== "number") return;
    setRevision(result.revision);
    setSaved({ ...copy });
    setMessage(`Saved revision ${result.revision}.`);
    markSafe();
  }
  const invalid = (field: string) => command.error?.fields?.includes(field) || undefined;
  return (
    <form className="console-editor" onSubmit={save}>
      <CommandFeedback
        {...command}
        comparePath={draft ? `/console/products/${draft.product_variant_id}/edit` : undefined}
      />
      {!draft && (
        <fieldset disabled={command.busy}>
          <legend>Product identity</legend>
          <div className="console-editor-grid">
            <label>
              SKU
              <input
                name="sku"
                required
                maxLength={30}
                value={identity.sku}
                aria-invalid={invalid("sku")}
                onChange={(event) => setIdentity({ ...identity, sku: event.target.value })}
              />
            </label>
            <label>
              Product slug
              <input
                name="slug"
                required
                maxLength={160}
                value={identity.slug}
                aria-invalid={invalid("slug")}
                onChange={(event) => setIdentity({ ...identity, slug: event.target.value })}
              />
            </label>
            <label className="console-span-full">
              Identity source reference
              <input
                name="source_reference"
                required
                minLength={3}
                maxLength={1000}
                value={identity.source_reference}
                aria-invalid={invalid("source_reference")}
                onChange={(event) =>
                  setIdentity({ ...identity, source_reference: event.target.value })
                }
              />
            </label>
          </div>
          <p className="console-caption">MIG/MAG Torch Parts / DRAFT</p>
        </fieldset>
      )}
      {draft && (
        <dl className="console-facts">
          <div>
            <dt>SKU</dt>
            <dd>{draft.sku}</dd>
          </div>
          <div>
            <dt>Stable slug</dt>
            <dd>{draft.public_slug}</dd>
          </div>
          <div>
            <dt>Working revision</dt>
            <dd>{revision}</dd>
          </div>
        </dl>
      )}
      <fieldset disabled={command.busy || Boolean(draft && !draft.editable)}>
        <legend>Product copy</legend>
        <div className="console-editor-grid">
          {(Object.keys(labels) as (keyof ProductDraftCopy)[]).map((field) => (
            <label
              key={field}
              className={
                ["summary", "description", "applications"].includes(field)
                  ? "console-span-full"
                  : undefined
              }
            >
              {labels[field]}
              {["summary", "description", "applications"].includes(field) ? (
                <textarea
                  name={field}
                  aria-label={labels[field]}
                  rows={field === "description" ? 7 : 3}
                  maxLength={DRAFT_LIMITS[field]}
                  value={copy[field]}
                  aria-invalid={invalid(field)}
                  onChange={(event) => setCopy({ ...copy, [field]: event.target.value })}
                />
              ) : (
                <input
                  name={field}
                  required={field === "name_en"}
                  maxLength={DRAFT_LIMITS[field]}
                  value={copy[field]}
                  aria-invalid={invalid(field)}
                  onChange={(event) => setCopy({ ...copy, [field]: event.target.value })}
                />
              )}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="console-editor-actions">
        <button
          className="console-button console-action"
          disabled={command.busy || Boolean(draft && !draft.editable)}
          type="submit"
        >
          {draft ? <Save size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
          {command.busy ? "Saving..." : draft ? "Save product" : "Create draft"}
        </button>
        <button
          className="console-icon-button"
          type="button"
          title="Reset unsaved changes"
          aria-label="Reset unsaved changes"
          disabled={!dirty || command.busy}
          onClick={() => {
            if (window.confirm("Discard unsaved changes?")) {
              setCopy({ ...saved });
              setIdentity({ sku: "", slug: "", source_reference: "" });
              setMessage("");
            }
          }}
        >
          <RotateCcw size={20} aria-hidden="true" />
        </button>
        <span className="console-caption" role="status">
          {command.busy ? "Saving" : dirty ? "Unsaved changes" : message || "No unsaved changes"}
        </span>
      </div>
    </form>
  );
}
