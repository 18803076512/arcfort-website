import { readFile } from "node:fs/promises";
import path from "node:path";

// Fixture-only access to two existing public references, never private originals.
export async function GET(_request: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  if (!["mig-tip-holder-for-mb15.jpg", "mig-torch-liner.jpg"].includes(name))
    return new Response(null, { status: 404 });
  const root = process.cwd();
  return new Response(await readFile(path.join(root, "public/images/products", name)), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" },
  });
}
