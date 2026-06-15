import { existsSync } from "node:fs";
import path from "node:path";

export function hasPublicProductImage(imagePath?: string) {
  if (!imagePath?.startsWith("/images/products/")) {
    return false;
  }

  const relativePath = imagePath.replace(/^\/+/, "");

  return existsSync(path.join(process.cwd(), "public", relativePath));
}
