import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";

const root = await realpath(process.cwd());
for (const mode of ["upload", "inspect"]) {
  const route = `.next/server/app/(console)/console/documents/${mode}/route.js`;
  const source = path.resolve(root, route);
  const trace = JSON.parse(await readFile(`${source}.nft.json`, "utf8"));
  const paths = new Set([
    source,
    ...trace.files.map((file) => path.resolve(path.dirname(source), file)),
  ]);
  for (const required of [
    "lib/console/document-parser.mjs",
    "node_modules/pdf-lib/package.json",
    "node_modules/pako/package.json",
  ])
    assert.ok(paths.has(path.resolve(root, required)), `Missing traced PDF runtime: ${required}`);
  const tempRoot = await realpath(tmpdir());
  const isolated = await mkdtemp(path.join(tempRoot, "arcfort-document-package-"));
  try {
    for (const file of paths) {
      const relative = path.relative(root, file);
      assert.ok(
        relative && !relative.startsWith("..") && !path.isAbsolute(relative),
        "Trace escaped the project.",
      );
      const destination = path.join(isolated, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(file, destination);
    }
    await copyFile(
      fileURLToPath(new URL("./test-document-package-child.mjs", import.meta.url)),
      path.join(isolated, "package-check.mjs"),
    );
    const doc = await PDFDocument.create();
    doc.addPage([200, 200]);
    const pdf = Buffer.from(await doc.save({ useObjectStreams: false }));
    const marker = pdf.lastIndexOf("%%EOF");
    const large = Buffer.concat([
      pdf.subarray(0, marker),
      Buffer.from("%"),
      Buffer.alloc(11 * 1024 * 1024, 65),
      Buffer.from("\n"),
      pdf.subarray(marker),
    ]);
    const child = spawn(process.execPath, ["package-check.mjs"], {
      cwd: isolated,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        NODE_ENV: "production",
        ...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}),
      },
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
    const timer = setTimeout(() => child.kill(), 90_000);
    const result = new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("close", resolve);
    });
    child.stdin.on("error", () => {});
    child.stdin.end(JSON.stringify({ mode, route, pdf: large.toString("base64") }));
    const code = await result.finally(() => clearTimeout(timer));
    assert.equal(code, 0, `Isolated built handler failed:\n${output}`);
    process.stdout.write(output);
    console.log(
      `PASS isolated ${mode} handler from ${paths.size} traced files; no repository dependency fallback or native provider call.`,
    );
  } finally {
    // Delete only the unique temporary directory this test just created, never a computed project path.
    assert.equal(path.dirname(isolated), tempRoot);
    assert.ok(path.basename(isolated).startsWith("arcfort-document-package-"));
    await rm(isolated, { recursive: true, force: true });
  }
}
