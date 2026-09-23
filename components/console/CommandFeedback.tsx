"use client";

import type { RefObject } from "react";
import type { CommandResult } from "../../lib/domain/catalog/commands";
import { ExternalLink } from "lucide-react";

export function CommandFeedback({
  error,
  alert,
  comparePath,
}: {
  error: Extract<CommandResult, { ok: false }> | null;
  alert: RefObject<HTMLDivElement | null>;
  comparePath?: string;
}) {
  if (!error) return null;
  return (
    <div className="console-command-error" role="alert" tabIndex={-1} ref={alert}>
      <p>{error.message}</p>
      {error.fields?.length ? (
        <p className="console-caption">Fields: {error.fields.join(", ")}</p>
      ) : null}
      {error.code === "40001" && comparePath && (
        <a className="console-action" href={comparePath} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={18} aria-hidden="true" />
          Compare latest record
        </a>
      )}
    </div>
  );
}
