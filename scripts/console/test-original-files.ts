import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import sharp from "sharp";
import {
  OriginalFileError,
  originalFileLimits,
  validateOriginalFile,
} from "../../lib/console/original-files.ts";

const pixels = Buffer.from(Array.from({ length: 32 * 24 * 3 }, (_, n) => (n * 67) % 256));
const source = () => sharp(pixels, { raw: { width: 32, height: 24, channels: 3 } });
const fixtures = [
  { bytes: await source().jpeg().toBuffer(), filename: "synthetic.jpg", type: "image/jpeg" },
  { bytes: await source().png().toBuffer(), filename: "synthetic.png", type: "image/png" },
  { bytes: await source().webp().toBuffer(), filename: "synthetic.webp", type: "image/webp" },
  { bytes: await source().tiff().toBuffer(), filename: "synthetic.tiff", type: "image/tiff" },
];
function file(bytes: Buffer, name = "synthetic.png", type = "image/png") {
  return new File([Uint8Array.from(bytes)], name, { type });
}
for (const fixture of fixtures) {
  const before = Buffer.from(fixture.bytes);
  const result = await validateOriginalFile(file(fixture.bytes, fixture.filename, fixture.type));
  assert.equal(result.mime_type, fixture.type);
  assert.equal(result.filename, fixture.filename);
  assert.equal(result.byte_size, fixture.bytes.length);
  assert.equal(result.width, 32);
  assert.equal(result.height, 24);
  assert.equal(result.file_hash, createHash("sha256").update(before).digest("hex"));
  assert.deepEqual(result.bytes, before);
  assert.deepEqual(fixture.bytes, before);
  assert.equal(Object.hasOwn(result, "approved_by"), false);
}
console.log("PASS original bytes: all four formats decode, hash and remain byte-identical.");

const png = fixtures[1].bytes;
for (const name of [
  "../photo.png",
  "folder\\photo.png",
  "x:photo.png",
  "CON.png",
  ".hidden.png",
  "photo\n.png",
  "photo\u202e.png",
  "x".repeat(181) + ".png",
  "photo.png ",
]) {
  await assert.rejects(validateOriginalFile(file(png, name)), OriginalFileError);
}
await assert.rejects(validateOriginalFile(file(png, "photo.jpg", "image/jpeg")), OriginalFileError);
await assert.rejects(validateOriginalFile(file(png, "photo.png", "image/webp")), OriginalFileError);
assert.equal((await validateOriginalFile(file(png, "photo.PNG", ""))).mime_type, "image/png");
console.log(
  "PASS original identity: unsafe names, extension/MIME mismatch and empty MIME handling.",
);

for (const bytes of [
  Buffer.alloc(0),
  Buffer.from("<svg xmlns='http://www.w3.org/2000/svg' width='3' height='3'/>"),
  Buffer.from("%PDF-1.7"),
  Buffer.from("not an image"),
  png.subarray(0, 32),
  fixtures[0].bytes.subarray(0, 50),
]) {
  await assert.rejects(validateOriginalFile(file(bytes)), OriginalFileError);
}
const damaged = Buffer.from(png);
damaged[Math.floor(damaged.length / 2)] ^= 255;
await assert.rejects(validateOriginalFile(file(damaged)), OriginalFileError);
const truncated = fixtures[0].bytes.subarray(0, fixtures[0].bytes.length - 20);
await assert.rejects(
  validateOriginalFile(file(truncated, "photo.jpg", "image/jpeg")),
  OriginalFileError,
);
console.log("PASS original decoding: corrupt/truncated rasters and non-raster inputs fail closed.");

const animated = await sharp(Buffer.concat([pixels, Buffer.from(pixels.map((v) => 255 - v))]), {
  raw: { width: 32, height: 48, pageHeight: 24, channels: 3 },
})
  .webp({ loop: 0, delay: [100, 100] })
  .toBuffer();
assert.equal((await sharp(animated).metadata()).pages, 2);
await assert.rejects(
  validateOriginalFile(file(animated, "animated.webp", "image/webp")),
  OriginalFileError,
);
const oriented = await source().withMetadata({ orientation: 6 }).jpeg().toBuffer();
const orientedResult = await validateOriginalFile(file(oriented, "oriented.jpg", "image/jpeg"));
assert.deepEqual(orientedResult.bytes, oriented);
assert.equal((await sharp(orientedResult.bytes).metadata()).orientation, 6);
assert.equal(orientedResult.width, 32);
assert.equal(orientedResult.height, 24);
console.log(
  "PASS original fidelity: animation rejected; EXIF orientation is preserved without rotating pixels.",
);

const tooWide = await sharp({
  create: { width: 16001, height: 1, channels: 3, background: "white" },
})
  .png()
  .toBuffer();
await assert.rejects(validateOriginalFile(file(tooWide)), OriginalFileError);
const tooManyPixels = await sharp({
  create: { width: 8000, height: 5001, channels: 3, background: "white" },
})
  .png()
  .toBuffer();
await assert.rejects(validateOriginalFile(file(tooManyPixels)), OriginalFileError);
let opened = false;
await assert.rejects(
  validateOriginalFile({
    name: "large.png",
    type: "image/png",
    size: originalFileLimits.bytes + 1,
    stream() {
      opened = true;
      throw new Error("must not read");
    },
  }),
  OriginalFileError,
);
assert.equal(opened, false);
console.log("PASS original resource bounds: byte, dimension and decoded pixel limits.");

let cancelled = false;
await assert.rejects(
  validateOriginalFile({
    name: "photo.png",
    type: "image/png",
    size: 1,
    stream() {
      return new ReadableStream<Uint8Array<ArrayBuffer>>({
        start(controller) {
          controller.enqueue(Uint8Array.from(png));
        },
        cancel() {
          cancelled = true;
        },
      });
    },
  }),
  OriginalFileError,
);
assert.equal(cancelled, true);
let emptyReads = 0;
let emptyCancelled = false;
await assert.rejects(
  validateOriginalFile({
    name: "photo.png",
    type: "image/png",
    size: png.length,
    stream: () =>
      new ReadableStream<Uint8Array<ArrayBuffer>>({
        pull(controller) {
          emptyReads++;
          if (emptyReads <= 9000) controller.enqueue(new Uint8Array());
          else {
            controller.enqueue(Uint8Array.from(png));
            controller.close();
          }
        },
        cancel() {
          emptyCancelled = true;
        },
      }),
  }),
  OriginalFileError,
);
assert.equal(emptyCancelled, true);
assert.ok(emptyReads < 9000, "Empty reads must count toward the resource limit.");
await assert.rejects(
  validateOriginalFile({
    name: "photo.png",
    type: "image/png",
    size: png.length + 1,
    stream: () => file(png).stream(),
  }),
  OriginalFileError,
);
await assert.rejects(
  validateOriginalFile({
    name: "photo.png",
    type: "image/png",
    size: 1,
    stream() {
      throw new Error("private transport detail");
    },
  }),
  (error: unknown) =>
    error instanceof OriginalFileError && !error.message.includes("private transport"),
);
let stalledCancelled = false;
const started = Date.now();
await assert.rejects(
  validateOriginalFile({
    name: "photo.png",
    type: "image/png",
    size: 1,
    stream: () =>
      new ReadableStream<Uint8Array<ArrayBuffer>>({
        cancel() {
          stalledCancelled = true;
        },
      }),
  }),
  OriginalFileError,
);
assert.equal(stalledCancelled, true);
assert.ok(Date.now() - started >= originalFileLimits.readMilliseconds - 100);
console.log(
  "PASS original streams: size mismatch, empty-read bound and actual deadline cancel safely; private errors are not returned.",
);
