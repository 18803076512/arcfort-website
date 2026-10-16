import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildShadowCatalog, shadowCatalogPath } from "./build-shadow-catalog.ts";

const catalog = await buildShadowCatalog();
await mkdir(path.dirname(shadowCatalogPath), { recursive: true });
await writeFile(shadowCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

console.log(`Wrote ${path.relative(process.cwd(), shadowCatalogPath)}.`);
console.log(JSON.stringify(catalog.counts, null, 2));
console.log(`Source revision: ${catalog.sourceRevision}`);
