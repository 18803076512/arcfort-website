import "server-only";

// Image/document upload and inspection share the same single-loopback work budget.
const activeActors = new Set<string>();

export function claimOriginalWork(actor: string): (() => void) | null {
  if (activeActors.has(actor) || activeActors.size >= 2) return null;
  activeActors.add(actor);
  return () => activeActors.delete(actor);
}
