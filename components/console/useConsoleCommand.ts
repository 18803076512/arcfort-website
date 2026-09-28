"use client";

import { useEffect, useRef, useState } from "react";
import {
  CommandInputError,
  commandError,
  parseConsoleCommand,
  type CommandInput,
  type CommandResult,
} from "../../lib/domain/catalog/commands";

export function useUnsavedChanges(dirty: boolean) {
  const active = useRef(dirty);
  active.current = dirty;
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (active.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (
        !active.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        !link.href ||
        link.getAttribute("href")?.startsWith("#")
      )
        return;
      if (!window.confirm("Discard unsaved changes and leave this page?")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      } else active.current = false;
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, []);
  return () => {
    active.current = false;
  };
}

export function useConsoleCommand() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Extract<CommandResult, { ok: false }> | null>(null);
  const inFlight = useRef(false);
  const receipt = useRef<{ payload: string; id: string } | null>(null);
  const alert = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) alert.current?.focus();
  }, [error]);
  async function run(input: CommandInput) {
    if (inFlight.current) return null;
    const payload = JSON.stringify(input);
    if (receipt.current?.payload !== payload)
      receipt.current = { payload, id: crypto.randomUUID() };
    let command;
    try {
      command = parseConsoleCommand({ ...input, request_id: receipt.current.id });
    } catch (problem) {
      setError({
        ok: false,
        code: "22023",
        message: commandError("22023"),
        fields: problem instanceof CommandInputError ? problem.fields : ["form"],
      });
      return null;
    }
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/console/commands", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json", "X-Console-Command": "1" },
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(25000),
      });
      const result: CommandResult = await response.json();
      if (!response.ok || result.ok !== true) {
        setError(
          result.ok === false
            ? { ...result, message: commandError(result.code) }
            : { ok: false, code: "unavailable", message: commandError() },
        );
        return null;
      }
      receipt.current = null;
      return result.result;
    } catch {
      setError({ ok: false, code: "unavailable", message: commandError() });
      return null;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return { run, busy, error, alert };
}
