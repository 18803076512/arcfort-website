import { getRfqFileExtension } from "./rfq-constraints.ts";

type RfqReadableFile = {
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const attachmentTypeError =
  "An attachment does not match its file extension. Please upload the original PDF, Excel, CSV, Word, JPG or PNG file.";

function startsWithBytes(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function containsBytes(bytes: Uint8Array, signature: number[], limit = bytes.length) {
  const searchLimit = Math.min(bytes.length, limit) - signature.length;

  for (let index = 0; index <= searchLimit; index += 1) {
    if (signature.every((value, offset) => bytes[index + offset] === value)) {
      return true;
    }
  }

  return false;
}

function asciiBytes(value: string) {
  return Array.from(value, (character) => character.charCodeAt(0));
}

function isPdf(bytes: Uint8Array) {
  return containsBytes(bytes, asciiBytes("%PDF-"), 1024);
}

function isJpeg(bytes: Uint8Array) {
  return startsWithBytes(bytes, [0xff, 0xd8, 0xff]);
}

function isPng(bytes: Uint8Array) {
  return startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function isOleCompoundDocument(bytes: Uint8Array) {
  return startsWithBytes(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
}

function isZipContainer(bytes: Uint8Array) {
  return startsWithBytes(bytes, [0x50, 0x4b, 0x03, 0x04]);
}

function isOoxmlDocument(bytes: Uint8Array, directory: "word/" | "xl/") {
  return (
    isZipContainer(bytes) &&
    containsBytes(bytes, asciiBytes("[Content_Types].xml")) &&
    containsBytes(bytes, asciiBytes(directory))
  );
}

function isUtf16Text(bytes: Uint8Array, littleEndian: boolean) {
  if (bytes.length < 4 || bytes.length % 2 !== 0) {
    return false;
  }

  for (let index = 2; index < bytes.length; index += 2) {
    const codePoint = littleEndian
      ? bytes[index] | (bytes[index + 1] << 8)
      : (bytes[index] << 8) | bytes[index + 1];

    if (codePoint === 0 || codePoint < 0x09 || (codePoint > 0x0d && codePoint < 0x20)) {
      return false;
    }
  }

  return true;
}

function isTextCsv(bytes: Uint8Array) {
  if (bytes.length === 0) {
    return false;
  }

  if (startsWithBytes(bytes, [0xff, 0xfe])) {
    return isUtf16Text(bytes, true);
  }

  if (startsWithBytes(bytes, [0xfe, 0xff])) {
    return isUtf16Text(bytes, false);
  }

  const content = startsWithBytes(bytes, [0xef, 0xbb, 0xbf]) ? bytes.slice(3) : bytes;

  if (content.length === 0) {
    return false;
  }

  for (const byte of content) {
    if (byte === 0 || byte < 0x09 || (byte > 0x0d && byte < 0x20)) {
      return false;
    }
  }

  return true;
}

function matchesFileContent(extension: string, bytes: Uint8Array) {
  switch (extension) {
    case ".pdf":
      return isPdf(bytes);
    case ".jpg":
    case ".jpeg":
      return isJpeg(bytes);
    case ".png":
      return isPng(bytes);
    case ".doc":
    case ".xls":
      return isOleCompoundDocument(bytes);
    case ".docx":
      return isOoxmlDocument(bytes, "word/");
    case ".xlsx":
      return isOoxmlDocument(bytes, "xl/");
    case ".csv":
      return isTextCsv(bytes);
    default:
      return false;
  }
}

export async function validateRfqFileContents(files: RfqReadableFile[]) {
  for (const file of files) {
    const extension = getRfqFileExtension(file.name);
    const bytes = new Uint8Array(await file.arrayBuffer());

    if (!matchesFileContent(extension, bytes)) {
      return attachmentTypeError;
    }
  }

  return null;
}
