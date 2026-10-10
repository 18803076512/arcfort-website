import "server-only";

// Upload and inspection share the same single-loopback decoder budget.
const activeActors = new Set<string>();

export function claimOriginalWork(actor: string): (() => void) | null {
  if (activeActors.has(actor) || activeActors.size >= 2) return null;
  activeActors.add(actor);
  return () => activeActors.delete(actor);
}
