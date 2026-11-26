import { Buffer } from "node:buffer";
import { getRfqFileExtension, rfqAllowedFileExtensions } from "./rfq-constraints.ts";

export type RfqAttachmentRecord = {
  name: string;
  originalName?: string;
  size: number;
  type: string;
  path?: string;
};

type RfqAttachmentFile = {
  name: string;
  size: number;
  type: string;
};

// Called after file validation. One indexed name identifies the same bytes in mail and storage.
export function buildRfqAttachmentMetadata(files: RfqAttachmentFile[]): RfqAttachmentRecord[] {
  return files.map((file, index) => {
    const baseName = file.name.split(/[\\/]/).at(-1) || "attachment";
    const extension = getRfqFileExtension(baseName);
    const safeExtension = rfqAllowedFileExtensions.some((allowed) => allowed === extension)
      ? extension
      : "";
    const originalCharacters = Array.from(baseName.replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, "-"));
    const originalName =
      originalCharacters.length > 255
        ? `${originalCharacters.slice(0, 190).join("")}…${originalCharacters.slice(-64).join("")}`
        : originalCharacters.join("");
    const rawStem = safeExtension ? baseName.slice(0, -safeExtension.length) : baseName;
    const sanitizedStem = rawStem.replace(/[^a-zA-Z0-9._-]/g, "-");
    const stem = /[a-zA-Z0-9]/.test(sanitizedStem) ? sanitizedStem : "attachment";
    const prefix = `${index + 1}-`;
    const name = `${prefix}${stem.slice(0, 120 - prefix.length - safeExtension.length)}${safeExtension}`;

    return {
      name,
      originalName,
      size: file.size,
      type: file.type || "application/octet-stream",
    };
  });
}

export async function buildRfqEmailAttachments(
  files: Array<RfqAttachmentFile & { arrayBuffer: () => Promise<ArrayBuffer> }>,
) {
  const metadata = buildRfqAttachmentMetadata(files);
  return Promise.all(
    files.map(async (file, index) => ({
      filename: metadata[index].name,
      content: Buffer.from(await file.arrayBuffer()).toString("base64"),
    })),
  );
}
