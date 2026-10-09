import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const hydrationProbePrefix = "CONSOLE_HYDRATION_SHAPE:";

// Temporary, disposable-build diagnostic. Record only an already-failing React claim, never
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
    return {
      file: path.join(root, file),
      source,
      offset: claim.index + claim[0].indexOf("{") + 1,
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
  target: Awaited<ReturnType<typeof hydrationProbeTarget>>,
) {
  assert.equal(process.env.CI, "true", "Owned disposable build only.");
  assert.equal(target.source.includes(hydrationProbePrefix), false);
  const probe = `try{console.info(${JSON.stringify(hydrationProbePrefix)}+JSON.stringify(${target.expression}));}catch{}`;
  const instrumented =
    target.source.slice(0, target.offset) + probe + target.source.slice(target.offset);
  assert.equal((await readFile(target.file, "utf8")) === target.source, true);
  await writeFile(target.file, instrumented);
  return async () => {
    assert.equal(
      (await readFile(target.file, "utf8")) === instrumented,
      true,
      "Owned diagnostic asset changed unexpectedly.",
    );
    await writeFile(target.file, target.source);
  };
}
