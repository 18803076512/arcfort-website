import { PDFArray, PDFDict, PDFDocument, PDFName, PDFRawStream, PDFRef } from "pdf-lib";

// Dedicated disposable parser process: binary stdin, count-only stdout, no document logging.
const fail = () => {
  throw new Error("Document rejected");
};
try {
  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > 25 * 1024 * 1024) fail();
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks, size);
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: false,
    throwOnInvalidObject: true,
    updateMetadata: false,
    parseSpeed: 100,
  });
  if (doc.isEncrypted) fail();
  const count = doc.getPageCount();
  if (!Number.isInteger(count) || count < 1 || count > 200) fail();
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    if (![width, height].every((value) => Number.isFinite(value) && value > 0 && value <= 14400))
      fail();
  }
  const forbiddenKeys = new Set([
    "JS",
    "JavaScript",
    "AA",
    "OpenAction",
    "AcroForm",
    "XFA",
    "EmbeddedFiles",
    "EF",
    "RichMediaContent",
    "RichMediaSettings",
    "Collection",
    "3DD",
  ]);
  const forbiddenNames = new Set([
    "JavaScript",
    "Launch",
    "SubmitForm",
    "ImportData",
    "GoToR",
    "GoToE",
    "Rendition",
    "Movie",
    "Sound",
    "RichMedia",
    "3D",
    "EmbeddedFile",
  ]);
  const indirect = doc.context.enumerateIndirectObjects();
  if (indirect.length > 50_000) fail();
  const queue = indirect.map(([, value]) => ({ value, depth: 0 }));
  const seen = new Set();
  let inspected = 0;
  while (queue.length) {
    const { value, depth } = queue.pop();
    if (++inspected > 250_000 || depth > 64) fail();
    if (seen.has(value)) continue;
    seen.add(value);
    if (value instanceof PDFRef) {
      const target = doc.context.lookup(value);
      if (!target) fail();
      queue.push({ value: target, depth: depth + 1 });
    } else if (value instanceof PDFDict) {
      for (const [key, child] of value.entries()) {
        if (forbiddenKeys.has(key.decodeText())) fail();
        queue.push({ value: child, depth: depth + 1 });
      }
    } else if (value instanceof PDFArray) {
      for (const child of value.asArray()) queue.push({ value: child, depth: depth + 1 });
    } else if (value instanceof PDFName) {
      if (forbiddenNames.has(value.decodeText())) fail();
    } else if (value instanceof PDFRawStream) {
      queue.push({ value: value.dict, depth: depth + 1 });
    }
  }
  process.stdout.write(JSON.stringify({ page_count: count }));
} catch {
  process.exitCode = 1;
}
