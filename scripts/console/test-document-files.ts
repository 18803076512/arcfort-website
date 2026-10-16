import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { PDFDocument, PDFName, PDFNumber, PDFString } from "pdf-lib";
import {
  DocumentFileError,
  documentFileLimits,
  parseDocumentBytes,
  validateDocumentFile,
} from "../../lib/console/document-files.ts";

async function fixture(
  pages = 2,
  mutate?: (doc: PDFDocument) => void | Promise<void>,
  streams = true,
) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([200, 200]).drawText("TEST-ONLY technical document");
  await mutate?.(doc);
  return Buffer.from(await doc.save({ useObjectStreams: streams, addDefaultPage: false }));
}
const file = (bytes: Buffer, name = "synthetic.pdf", type = "application/pdf") =>
  new File([Uint8Array.from(bytes)], name, { type });
const bytes = await fixture();
for (const source of [bytes, await fixture(2, undefined, false)]) {
  const before = Buffer.from(source);
  const result = await validateDocumentFile(file(source));
  assert.equal(result.page_count, 2);
  assert.equal(result.file_hash, createHash("sha256").update(before).digest("hex"));
  assert.equal(result.byte_size, before.length);
  assert.deepEqual(result.bytes, before);
  assert.deepEqual(source, before);
  assert.deepEqual(Object.keys(result).sort(), [
    "byte_size",
    "bytes",
    "file_hash",
    "filename",
    "mime_type",
    "page_count",
  ]);
}
console.log(
  "PASS PDF fidelity: compressed/plain objects parse; original bytes and hash remain exact.",
);

for (const name of [
  "../x.pdf",
  "dir\\x.pdf",
  "CON.pdf",
  ".x.pdf",
  " x.pdf",
  "x.pdf ",
  "x\n.pdf",
  "x\u202e.pdf",
  "a".repeat(181) + ".pdf",
  "x.png",
]) {
  await assert.rejects(validateDocumentFile(file(bytes, name)), DocumentFileError);
}
await assert.rejects(validateDocumentFile(file(bytes, "x.pdf", "image/png")), DocumentFileError);
assert.equal((await validateDocumentFile(file(bytes, "x.PDF", ""))).mime_type, "application/pdf");
for (const value of [
  Buffer.alloc(0),
  Buffer.from("%PDF-1.7\n%%EOF"),
  Buffer.from("<html>not PDF</html>"),
  bytes.subarray(0, bytes.length - 10),
  Buffer.concat([bytes, Buffer.from("not trailing whitespace")]),
]) {
  await assert.rejects(validateDocumentFile(file(value)), DocumentFileError);
}
await assert.rejects(validateDocumentFile(file(await fixture(0))), DocumentFileError);
await assert.rejects(validateDocumentFile(file(await fixture(201))), DocumentFileError);
await assert.rejects(
  validateDocumentFile(file(await fixture(1, (doc) => doc.getPage(0).setSize(15000, 200)))),
  DocumentFileError,
);
console.log(
  "PASS PDF identity/structure: names, signatures, MIME, truncation, page and dimension limits.",
);

for (const mutate of [
  (doc: PDFDocument) => doc.addJavaScript("test", "throw new Error('must never execute')"),
  (doc: PDFDocument) => doc.getForm().createTextField("synthetic").setText("TEST-ONLY"),
  async (doc: PDFDocument) => {
    await doc.attach(Uint8Array.of(1, 2, 3), "synthetic.txt");
  },
  (doc: PDFDocument) =>
    doc.catalog.set(
      PDFName.of("OpenAction"),
      doc.context.obj({ S: PDFName.of("Launch"), F: PDFString.of("not-executed") }),
    ),
  (doc: PDFDocument) => {
    doc.context.trailerInfo.Encrypt = doc.context.register(
      doc.context.obj({ Filter: PDFName.of("Standard"), V: PDFNumber.of(1) }),
    );
  },
]) {
  for (const compressed of [true, false])
    await assert.rejects(
      validateDocumentFile(file(await fixture(1, mutate, compressed))),
      DocumentFileError,
    );
}
console.log(
  "PASS PDF active-content boundary: scripts, forms, embedded files, launch and encryption refused.",
);

let opened = false;
await assert.rejects(
  validateDocumentFile({
    name: "large.pdf",
    type: "application/pdf",
    size: documentFileLimits.bytes + 1,
    stream() {
      opened = true;
      throw new Error("must not read");
    },
  }),
  DocumentFileError,
);
assert.equal(opened, false);
await assert.rejects(
  validateDocumentFile({
    name: "x.pdf",
    type: "application/pdf",
    size: bytes.length + 1,
    stream: () => file(bytes).stream(),
  }),
  DocumentFileError,
);
let cancelled = false;
await assert.rejects(
  validateDocumentFile({
    name: "x.pdf",
    type: "application/pdf",
    size: 1,
    stream: () =>
      new ReadableStream<Uint8Array<ArrayBuffer>>({
        start(controller) {
          controller.enqueue(Uint8Array.from(bytes));
        },
        cancel() {
          cancelled = true;
        },
      }),
  }),
  DocumentFileError,
);
assert.equal(cancelled, true);
let reads = 0;
await assert.rejects(
  validateDocumentFile({
    name: "x.pdf",
    type: "application/pdf",
    size: bytes.length,
    stream: () =>
      new ReadableStream<Uint8Array<ArrayBuffer>>({
        pull(controller) {
          reads++;
          controller.enqueue(new Uint8Array());
        },
      }),
  }),
  DocumentFileError,
);
assert.ok(reads < 9000);
console.log(
  "PASS PDF stream bounds: oversized and dishonest size, over-read and empty-read exhaustion.",
);

const pending = (signal: AbortSignal) =>
  validateDocumentFile(
    {
      name: "x.pdf",
      type: "application/pdf",
      size: bytes.length,
      stream: () => new ReadableStream<Uint8Array<ArrayBuffer>>({}),
    },
    signal,
  );
const first = new AbortController();
const second = new AbortController();
const firstCheck = assert.rejects(pending(first.signal), DocumentFileError);
const secondCheck = assert.rejects(pending(second.signal), DocumentFileError);
await assert.rejects(validateDocumentFile(file(bytes)), DocumentFileError);
first.abort();
second.abort();
await firstCheck;
await secondCheck;
await assert.rejects(validateDocumentFile(file(bytes), AbortSignal.abort()), DocumentFileError);
const abort = new AbortController();
const parserCheck = assert.rejects(parseDocumentBytes(bytes, abort.signal), DocumentFileError);
abort.abort();
await parserCheck;
await assert.rejects(parseDocumentBytes(bytes, undefined, 1), DocumentFileError);
await assert.rejects(
  parseDocumentBytes(bytes, undefined, documentFileLimits.parseMilliseconds + 1),
  DocumentFileError,
);
assert.equal((await validateDocumentFile(file(bytes))).page_count, 2);
console.log(
  "PASS PDF cancellation/process boundary: concurrency refused, stream/parser cancelled, actual child deadline, no extended budget, capacity recovered.",
);

const stalledAt = Date.now();
let stalledCancelled = false;
await assert.rejects(
  validateDocumentFile({
    name: "stalled.pdf",
    type: "application/pdf",
    size: bytes.length,
    stream: () =>
      new ReadableStream<Uint8Array<ArrayBuffer>>({
        cancel() {
          stalledCancelled = true;
        },
      }),
  }),
  DocumentFileError,
);
assert.equal(stalledCancelled, true);
assert.ok(Date.now() - stalledAt >= documentFileLimits.readMilliseconds - 100);
assert.ok(Date.now() - stalledAt < documentFileLimits.readMilliseconds + 5000);
assert.equal((await validateDocumentFile(file(bytes))).page_count, 2);
console.log(
  "PASS PDF stalled-read deadline: real timeout cancels the stream and releases capacity.",
);
