export const consolePrivateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
};

export function safeConsoleReturnPath(value: unknown): string {
  if (typeof value !== "string" || value.length > 300) return "/console/dashboard";
  return /^\/console\/(dashboard|products|series|technical-data)(\/[a-f0-9-]{36})?$/.test(value)
    ? value
    : "/console/dashboard";
}

export function isConsoleOrigin(headers: Headers, origin: string, mutation = false): boolean {
  const expected = new URL(origin);
  if (headers.get("host") !== expected.host) return false;
  if (!mutation) return true;
  const fetchSite = headers.get("sec-fetch-site");
  return headers.get("origin") === origin && (!fetchSite || fetchSite === "same-origin");
}

export async function readConsoleForm(request: Request): Promise<URLSearchParams | null> {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/x-www-form-urlencoded")
    return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return null;
      }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const form = new URLSearchParams(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (
      [...form.keys()].length > 8 ||
      [...form.keys()].some((key) => form.getAll(key).length !== 1)
    )
      return null;
    return form;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}
