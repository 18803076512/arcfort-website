import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { BrowserContext, Page } from "./browser-runtime/node_modules/playwright/index.js";

// Temporary, disposable-CI diagnostic. Stop only at React's already-failing claim, never on
// normal rendering. Inspect tag names/counts, not text, attributes, props, URLs or credentials.
export async function hydrationProbeTarget(root = path.resolve(".next/static/chunks")) {
  for (const file of await readdir(root)) {
    if (!file.endsWith(".js")) continue;
    const source = await readFile(path.join(root, file), "utf8");
    const claim = /function (\w+)\((\w+)\)\{var \w+=Error\(\w+\(418,/.exec(source);
    if (!claim) continue;
    const cursor =
      /var (\w+)=null,(\w+)=null,\w+=!1,\w+=null,\w+=!1,\w+=Error\(\w+\(519\)\);$/.exec(
        source.slice(0, claim.index),
      );
    assert.ok(cursor, "Pinned React hydration diagnostic signature changed.");
    const prefix = source.slice(0, claim.index + claim[0].indexOf("{") + 1).split("\n");
    return {
      urlRegex: `/_next/static/chunks/${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      lineNumber: prefix.length - 1,
      columnNumber: prefix.at(-1)!.length,
      expression: `(() => {
        const allowed = new Set(["HTML","HEAD","BODY","DIV","MAIN","ASIDE","NAV","P","H1","H2","H3","SPAN","A","FORM","FIELDSET","LEGEND","LABEL","INPUT","SELECT","OPTION","TEXTAREA","BUTTON","SECTION","ARTICLE","DL","DT","DD","TABLE","TBODY","TR","TD","TH","SCRIPT","META","TITLE","LINK","TEMPLATE","#text","#comment"]);
        const tag = value => allowed.has(value) ? value : value == null ? "missing" : "other";
        const expected = [];
        for (let fiber = ${claim[2]}; fiber && expected.length < 12; fiber = fiber.return)
          if (typeof fiber.type === "string") expected.push(tag(fiber.type.toUpperCase()));
        const actual = [];
        for (let node = ${cursor[2]}; node && actual.length < 12; node = node.parentNode)
          actual.push(tag(node.nodeName));
        return { expected, actual, readyState: document.readyState,
          parent: tag(typeof ${cursor[1]}?.type === "string" ? ${cursor[1]}.type.toUpperCase() : null),
          bodyChildren: Array.from(document.body?.childNodes ?? []).slice(0,12).map(node => tag(node.nodeName)),
          templates: document.querySelectorAll("template").length };
      })()`,
    };
  }
  throw new Error("Pinned React hydration diagnostic target was not found.");
}

export async function installHydrationProbe(
  context: BrowserContext,
  page: Page,
  target: Awaited<ReturnType<typeof hydrationProbeTarget>>,
  report: (shape: unknown) => void,
) {
  const session = await context.newCDPSession(page);
  await session.send("Debugger.enable");
  const { breakpointId } = await session.send("Debugger.setBreakpointByUrl", {
    urlRegex: target.urlRegex,
    lineNumber: target.lineNumber,
    columnNumber: target.columnNumber,
  });
  session.on("Debugger.paused", async (event) => {
    try {
      if (event.hitBreakpoints?.includes(breakpointId) && event.callFrames[0]) {
        const { result, exceptionDetails } = await session.send("Debugger.evaluateOnCallFrame", {
          callFrameId: event.callFrames[0].callFrameId,
          expression: target.expression,
          returnByValue: true,
          silent: true,
        });
        report(exceptionDetails ? { diagnostic: "unavailable" } : result.value);
      }
    } catch {
      report({ diagnostic: "unavailable" });
    } finally {
      await session.send("Debugger.resume").catch(() => undefined);
    }
  });
}
