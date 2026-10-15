import "server-only";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";

export const documentFileLimits = Object.freeze({
  bytes: 25 * 1024 * 1024,
  pages: 200,
  readMilliseconds: 15_000,
  parseMilliseconds: 10_000,
  concurrent: 2,
});

export class DocumentFileError extends Error {
  constructor() {
    super(
      "Use a readable, unencrypted PDF within the document limits, without active forms or attachments.",
    );
    this.name = "DocumentFileError";
  }
}

type DocumentInput = Pick<File, "name" | "type" | "size" | "stream">;
let active = 0;

// The optional lower deadline supports deterministic timeout tests; it cannot raise the limit.
export async function parseDocumentBytes(
  bytes: Buffer,
  signal?: AbortSignal,
  milliseconds: number = documentFileLimits.parseMilliseconds,
): Promise<number> {
  if (
    signal?.aborted ||
    bytes.length > documentFileLimits.bytes ||
    !Number.isInteger(milliseconds) ||
    milliseconds < 1 ||
    milliseconds > documentFileLimits.parseMilliseconds
  )
    throw new DocumentFileError();
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--max-old-space-size=128", path.join(process.cwd(), "lib/console/document-parser.mjs")],
      {
        windowsHide: true,
        stdio: ["pipe", "pipe", "ignore"],
        env:
          process.platform === "win32" && process.env.SystemRoot
            ? { NODE_ENV: "production", SystemRoot: process.env.SystemRoot }
            : { NODE_ENV: "production" },
      },
    );
    let failed = false;
    let output = "";
    const abort = () => {
      failed = true;
      child.kill();
    };
    const timer = setTimeout(abort, milliseconds);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    child.on("error", () => {
      failed = true;
    });
    child.stdin.on("error", abort);
    child.stdout.on("data", (chunk: Buffer) => {
      if (output.length + chunk.length > 64) abort();
      else output += chunk.toString("utf8");
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (failed || code !== 0) {
        reject(new DocumentFileError());
        return;
      }
      try {
        const result = JSON.parse(output) as Record<string, unknown>;
        if (
          Object.keys(result).join(",") !== "page_count" ||
          !Number.isInteger(result.page_count) ||
          Number(result.page_count) < 1 ||
          Number(result.page_count) > documentFileLimits.pages
        )
          throw new DocumentFileError();
        resolve(Number(result.page_count));
      } catch {
        reject(new DocumentFileError());
      }
    });
    child.stdin.end(bytes);
  });
}

async function readDocument(file: DocumentInput, signal?: AbortSignal) {
  const reader = file.stream().getReader();
  const chunks: Buffer[] = [];
  let size = 0;
  let reads = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abort: () => void = () => {};
  const stopped = new Promise<never>((_, reject) => {
    abort = () => reject(new DocumentFileError());
    timer = setTimeout(abort, documentFileLimits.readMilliseconds);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
  // Cancellation can precede the first read; the main loop still rejects the operation.
  void stopped.catch(() => {});
  const deadline = Date.now() + documentFileLimits.readMilliseconds;
  try {
    while (true) {
      if (signal?.aborted || Date.now() >= deadline || reads++ >= 8192)
        throw new DocumentFileError();
      const part = await Promise.race([reader.read(), stopped]);
      if (part.done) break;
      size += part.value.byteLength;
      if (size > file.size || size > documentFileLimits.bytes) throw new DocumentFileError();
      if (part.value.byteLength) chunks.push(Buffer.from(part.value));
    }
    if (size !== file.size) throw new DocumentFileError();
    return Buffer.concat(chunks, size);
  } catch {
    void reader.cancel().catch(() => {});
    throw new DocumentFileError();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
    reader.releaseLock();
  }
}

export async function validateDocumentFile(file: DocumentInput, signal?: AbortSignal) {
  if (
    active >= documentFileLimits.concurrent ||
    signal?.aborted ||
    !file.name ||
    file.name !== file.name.trim() ||
    file.name.length > 180 ||
    /[\p{Cc}\p{Cf}/\\:*?"<>|]/u.test(file.name) ||
    file.name.startsWith(".") ||
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])\./i.test(file.name) ||
    !/\.pdf$/i.test(file.name) ||
    (file.type && file.type !== "application/pdf") ||
    !Number.isSafeInteger(file.size) ||
    file.size <= 0 ||
    file.size > documentFileLimits.bytes
  )
    throw new DocumentFileError();
  active++;
  try {
    const bytes = await readDocument(file, signal);
    if (
      !/^%PDF-(1\.[0-7]|2\.0)[\r\n]/.test(bytes.toString("ascii", 0, 10)) ||
      !/%%EOF[\t\r\n\f \0]*$/.test(bytes.toString("latin1", Math.max(0, bytes.length - 1024)))
    )
      throw new DocumentFileError();
    const page_count = await parseDocumentBytes(bytes, signal);
    if (signal?.aborted) throw new DocumentFileError();
    return {
      bytes,
      filename: file.name,
      file_hash: createHash("sha256").update(bytes).digest("hex"),
      byte_size: bytes.length,
      mime_type: "application/pdf" as const,
      page_count,
    };
  } catch {
    throw new DocumentFileError();
  } finally {
    active--;
  }
}
