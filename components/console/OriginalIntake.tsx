"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, RotateCcw } from "lucide-react";
import type { OriginalIntakeData } from "../../lib/console/originals";
import {
  originalSourceKinds,
  originalUploadBytes,
  originalUploadPath,
  originalUploadFailure,
  originalUuid,
  parseOriginalUpload,
  type OriginalUploadInput,
} from "../../lib/domain/catalog/originals";
import { useUnsavedChanges } from "./useConsoleCommand";
import { DataTable, EmptyState } from "./CatalogViews";

const sourceLabels = {
  own_photo: "Company photo",
  supplier_photo: "Supplier photo",
  company_catalog: "Company catalog",
  other_reference: "Other reference",
};
export function OriginalIntake({ data }: { data: OriginalIntakeData }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState({
    source_kind: "own_photo" as OriginalUploadInput["source_kind"],
    source_owner: "",
    source_reference: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const pending = useRef<{ file: File; signature: string; input: OriginalUploadInput } | null>(
    null,
  );
  const markSafe = useUnsavedChanges(!!file);
  useEffect(() => {
    if (
      !file ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > originalUploadBytes
    ) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!file || busy || !data.canUpload) return;
    setError("");
    setMessage("");
    const signature = JSON.stringify(source);
    if (
      !pending.current ||
      pending.current.file !== file ||
      pending.current.signature !== signature
    )
      pending.current = {
        file,
        signature,
        input: {
          request_id: crypto.randomUUID(),
          completion_id: crypto.randomUUID(),
          variant_id: data.variantId,
          filename: file.name,
          byte_size: file.size,
          ...source,
        },
      };
    const header = encodeURIComponent(JSON.stringify(pending.current.input));
    try {
      parseOriginalUpload(header);
    } catch {
      const failure = originalUploadFailure("22023");
      setError(failure.ok ? "" : failure.message);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(originalUploadPath, {
        method: "POST",
        headers: {
          "x-console-command": "1",
          "x-console-original": header,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
        signal: AbortSignal.timeout(90000),
      });
      const result: unknown = await response.json();
      if (
        result &&
        typeof result === "object" &&
        "ok" in result &&
        result.ok === true &&
        response.ok &&
        "asset_id" in result &&
        typeof result.asset_id === "string" &&
        originalUuid.test(result.asset_id) &&
        "intent_id" in result &&
        typeof result.intent_id === "string" &&
        originalUuid.test(result.intent_id)
      ) {
        setMessage(`Original received: ${file.name}. Rights and product-match review pending.`);
        setFile(null);
        pending.current = null;
        if (fileInput.current) fileInput.current.value = "";
        markSafe();
        router.refresh();
      } else {
        const code =
          result &&
          typeof result === "object" &&
          "code" in result &&
          typeof result.code === "string"
            ? result.code
            : undefined;
        const failure = originalUploadFailure(code);
        setError(failure.ok ? "" : failure.message);
      }
    } catch {
      const failure = originalUploadFailure();
      setError(failure.ok ? "" : failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="console-caption">{data.sku}</p>
      {message && (
        <p className="console-original-feedback" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="console-command-error" role="alert">
          {error}
        </p>
      )}
      {data.canUpload ? (
        <form className="console-editor" onSubmit={upload}>
          <fieldset disabled={busy}>
            <legend>New original</legend>
            <div className="console-editor-grid">
              <label className="console-span-full">
                Original image
                <input
                  ref={fileInput}
                  name="original"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.tif,.tiff"
                  required
                  onChange={(event) => {
                    const selected = event.target.files?.[0] ?? null;
                    setFile(selected);
                    pending.current = null;
                    setMessage("");
                    setError(
                      selected && selected.size > originalUploadBytes
                        ? "The original exceeds 25 MiB."
                        : "",
                    );
                  }}
                />
              </label>
              {preview && (
                <div className="console-original-preview console-span-full">
                  <Image
                    src={preview}
                    alt="Selected original"
                    width={320}
                    height={220}
                    unoptimized
                    onError={() => setPreview("")}
                  />
                </div>
              )}
              <label>
                Source type
                <select
                  aria-label="Source type"
                  value={source.source_kind}
                  onChange={(event) =>
                    setSource({
                      ...source,
                      source_kind: event.target.value as OriginalUploadInput["source_kind"],
                    })
                  }
                >
                  {originalSourceKinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {sourceLabels[kind]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Source custodian
                <input
                  required
                  maxLength={300}
                  value={source.source_owner}
                  onChange={(event) => setSource({ ...source, source_owner: event.target.value })}
                />
              </label>
              <label className="console-span-full">
                Source reference
                <input
                  required
                  maxLength={1000}
                  value={source.source_reference}
                  onChange={(event) =>
                    setSource({ ...source, source_reference: event.target.value })
                  }
                />
              </label>
            </div>
            <div className="console-editor-actions">
              <button
                className="console-button console-upload-button"
                type="submit"
                disabled={!file || file.size > originalUploadBytes}
              >
                <Upload size={18} aria-hidden="true" />
                {busy ? "Uploading..." : error ? "Retry upload" : "Upload original"}
              </button>
              <button
                className="console-action"
                type="button"
                disabled={!file}
                onClick={() => {
                  setFile(null);
                  pending.current = null;
                  setError("");
                  markSafe();
                  if (fileInput.current) fileInput.current.value = "";
                }}
              >
                <RotateCcw size={18} aria-hidden="true" />
                Clear selection
              </button>
            </div>
          </fieldset>
        </form>
      ) : (
        <p className="console-caption">Read-only access</p>
      )}
      <h2>Original intake history</h2>
      {data.items.length ? (
        <DataTable label="Original intake history" columns={["File", "Source", "Intake state"]}>
          {data.items.map((item) => (
            <tr key={item.intent_id}>
              <td>
                <strong>{item.filename}</strong>
                <p>
                  {item.width} x {item.height} px / {(item.byte_size / 1048576).toFixed(2)} MiB
                </p>
                <p className="console-caption">
                  {new Date(item.created_at).toISOString().slice(0, 10)}
                </p>
              </td>
              <td>
                {item.source_owner}
                <p>{item.source_reference}</p>
              </td>
              <td>
                {!item.subject_current
                  ? "Product identity changed"
                  : item.completed
                    ? "Recorded; review pending"
                    : "Upload incomplete"}
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState />
      )}
    </>
  );
}
