import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { originalUploadBytes } from "../domain/catalog/originals.ts";

export const originalFileLimits = {
  bytes: originalUploadBytes,
  pixels: 40_000_000,
  dimension: 16_000,
  readMilliseconds: 15_000,
  decodeSeconds: 10,
} as const;

export class OriginalFileError extends Error {
  constructor() {
    super("Use an intact, single-image JPG, PNG, WebP or TIFF within the original-file limits.");
    this.name = "OriginalFileError";
  }
}

type OriginalInput = Pick<File, "name" | "type" | "size" | "stream">;
const formats = {
  jpeg: { mime: "image/jpeg", suffix: /\.jpe?g$/i },
  png: { mime: "image/png", suffix: /\.png$/i },
  webp: { mime: "image/webp", suffix: /\.webp$/i },
  tiff: { mime: "image/tiff", suffix: /\.tiff?$/i },
} as const;

function allowedSignature(bytes: Buffer): keyof typeof formats | null {
  if (bytes.length < 12) return null;
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP")
    return "webp";
  if (
    ["49492a00", "4d4d002a", "49492b00", "4d4d002b"].includes(bytes.subarray(0, 4).toString("hex"))
  )
    return "tiff";
  return null;
}

async function readOriginal(file: OriginalInput): Promise<Buffer> {
  if (!Number.isSafeInteger(file.size) || file.size <= 0 || file.size > originalFileLimits.bytes)
    throw new OriginalFileError();
  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = file.stream().getReader();
  } catch {
    throw new OriginalFileError();
  }
  const deadline = Date.now() + originalFileLimits.readMilliseconds;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new OriginalFileError()), originalFileLimits.readMilliseconds);
  });
  const chunks: Buffer[] = [];
  let size = 0;
  let reads = 0;
  try {
    while (true) {
      if (Date.now() >= deadline || reads++ >= 8192) throw new OriginalFileError();
      const part = await Promise.race([reader.read(), expired]);
      if (part.done) break;
      size += part.value.byteLength;
      if (size > file.size || size > originalFileLimits.bytes) throw new OriginalFileError();
      if (part.value.byteLength) chunks.push(Buffer.from(part.value));
    }
    if (size !== file.size) throw new OriginalFileError();
    return Buffer.concat(chunks, size);
  } catch {
    void reader.cancel().catch(() => {});
    throw new OriginalFileError();
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

export async function validateOriginalFile(file: OriginalInput) {
  if (
    !file.name ||
    file.name !== file.name.trim() ||
    file.name.length > 180 ||
    /[\p{Cc}\p{Cf}/\\:*?"<>|]/u.test(file.name) ||
    file.name.startsWith(".") ||
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])\./i.test(file.name)
  )
    throw new OriginalFileError();
  const bytes = await readOriginal(file);
  const format = allowedSignature(bytes);
  if (
    !format ||
    !formats[format].suffix.test(file.name) ||
    (file.type && file.type !== formats[format].mime)
  )
    throw new OriginalFileError();
  const decoder = sharp(bytes, {
    failOn: "warning",
    limitInputPixels: originalFileLimits.pixels,
    sequentialRead: true,
  }).timeout({ seconds: originalFileLimits.decodeSeconds });
  try {
    const metadata = await decoder.metadata();
    if (
      metadata.format !== format ||
      !metadata.width ||
      !metadata.height ||
      metadata.channels > 4 ||
      (metadata.pages ?? 1) !== 1 ||
      (metadata.subifds ?? 0) !== 0 ||
      metadata.width > originalFileLimits.dimension ||
      metadata.height > originalFileLimits.dimension ||
      metadata.width * metadata.height > originalFileLimits.pixels
    )
      throw new OriginalFileError();
    // Decode the full raster through the timed pipeline. Discard pixels; retain original bytes.
    await decoder.raw().toBuffer();
    return {
      bytes,
      filename: file.name,
      file_hash: createHash("sha256").update(bytes).digest("hex"),
      byte_size: bytes.length,
      mime_type: formats[format].mime,
      width: metadata.width,
      height: metadata.height,
    };
  } catch {
    throw new OriginalFileError();
  } finally {
    decoder.destroy();
  }
}
