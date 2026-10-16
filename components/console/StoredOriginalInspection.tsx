"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Download, Maximize, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import type { OriginalIntakeRow } from "../../lib/console/originals";
import {
  originalInspectionMessage,
  originalInspectionPath,
} from "../../lib/domain/catalog/original-inspection";
import {
  readMediaObservation,
  type MediaInspectionContext,
  type MediaObservation,
} from "../../lib/domain/catalog/media-review";

export function StoredOriginalInspection({
  item,
  variantId,
  onClose,
  review,
  onObservation,
}: {
  item: OriginalIntakeRow;
  variantId: string;
  onClose: () => void;
  review?: MediaInspectionContext;
  onObservation?: (value: MediaObservation | null) => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const report = useRef(onObservation);
  report.current = onObservation;
  const observed = useRef<MediaObservation | null>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let objectUrl = "";
    setUrl("");
    setError("");
    setZoom(0);
    observed.current = null;
    report.current?.(null);
    void (async () => {
      try {
        const response = await fetch(originalInspectionPath, {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: { "content-type": "application/json", "x-console-command": "1" },
          body: JSON.stringify(
            review
              ? { mapping_id: review.mapping_id, revision: review.revision, digest: review.digest }
              : { variant_id: variantId, asset_id: item.asset_id },
          ),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(45000)]),
        });
        if (
          !response.ok ||
          response.headers.get("content-type") !== item.mime_type ||
          response.headers.get("content-length") !== String(item.byte_size)
        )
          throw new Error();
        const blob = await response.blob();
        if (blob.size !== item.byte_size || blob.type !== item.mime_type) throw new Error();
        const proof = review
          ? readMediaObservation(response.headers.get("x-console-media-observation"), review)
          : null;
        if (review && !proof) throw new Error();
        if (!active) return;
        observed.current = proof;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (active) setError(originalInspectionMessage);
      }
    })();
    return () => {
      active = false;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      observed.current = null;
      report.current?.(null);
    };
  }, [variantId, item.asset_id, item.byte_size, item.mime_type, attempt, review]);
  const inline = item.mime_type !== "image/tiff";
  return (
    <section className="console-original-inspection" aria-label="Stored original inspection">
      <div className="console-inspection-heading">
        <div>
          <h3 ref={heading} tabIndex={-1}>
            {item.filename}
          </h3>
          <p className="console-caption">
            {item.width} x {item.height} px / {(item.byte_size / 1048576).toFixed(2)} MiB
          </p>
          <p className="console-caption">
            {item.subject_current
              ? "Rights and product-match review pending"
              : "Product identity changed; review required"}
          </p>
        </div>
        <button
          type="button"
          className="console-icon-button"
          aria-label="Close original inspection"
          title="Close original inspection"
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
            aria-label="Retry original inspection"
            title="Retry original inspection"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RotateCcw size={20} aria-hidden="true" />
          </button>
        </div>
      ) : !url ? (
        <p role="status">Checking stored original...</p>
      ) : (
        <>
          <div
            className="console-inspection-tools"
            role="group"
            aria-label="Original image controls"
          >
            {inline && (
              <>
                <button
                  type="button"
                  className="console-icon-button"
                  aria-label="Fit original"
                  title="Fit original"
                  aria-pressed={zoom === 0}
                  onClick={() => setZoom(0)}
                >
                  <Maximize size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="console-icon-button"
                  aria-label="Zoom out"
                  title="Zoom out"
                  disabled={zoom <= 1}
                  onClick={() => setZoom(1)}
                >
                  <ZoomOut size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="console-icon-button"
                  aria-label="Zoom in"
                  title="Zoom in"
                  disabled={zoom === 2}
                  onClick={() => setZoom((value) => value + 1)}
                >
                  <ZoomIn size={20} aria-hidden="true" />
                </button>
                <output className="console-inspection-zoom" aria-live="polite">
                  {zoom ? `${zoom * 100}%` : "Fit"}
                </output>
              </>
            )}
            <a
              className="console-icon-button"
              href={url}
              download={item.filename}
              aria-label="Download original"
              title="Download original"
              onClick={() => {
                if (!inline) report.current?.(observed.current);
              }}
            >
              <Download size={20} aria-hidden="true" />
            </a>
          </div>
          {inline ? (
            <div
              className="console-inspection-image"
              tabIndex={0}
              aria-label="Stored original image"
              data-fit={zoom === 0}
            >
              <Image
                src={url}
                alt={`Stored original: ${item.filename}`}
                unoptimized
                width={item.width}
                height={item.height}
                style={zoom ? { width: item.width * zoom, height: item.height * zoom } : undefined}
                onError={() => {
                  observed.current = null;
                  report.current?.(null);
                  setUrl("");
                  setError(originalInspectionMessage);
                }}
                onLoad={() => report.current?.(observed.current)}
              />
            </div>
          ) : (
            <p className="console-caption">TIFF original; inline preview unavailable</p>
          )}
        </>
      )}
    </section>
  );
}
