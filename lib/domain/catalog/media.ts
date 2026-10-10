export const detailMediaRoles = [
  "thread_detail",
  "hole_detail",
  "surface_detail",
  "dimension",
  "technical",
] as const;

export type MediaEvidence = {
  publication: string;
  rights: string;
  match: string;
  hasOwner: boolean;
  hasSource: boolean;
  hasApproval: boolean;
};

export function recordedMediaApproval(asset: MediaEvidence): boolean {
  return (
    asset.publication === "search_eligible" &&
    asset.rights === "approved" &&
    asset.match === "exact_product" &&
    asset.hasOwner &&
    asset.hasSource &&
    asset.hasApproval
  );
}

// This is a metadata inventory, not file-existence, exact-SKU or release approval.
export function mediaCoverage(links: { role: string; asset: MediaEvidence | null }[]) {
  const group = (roles: readonly string[]) => {
    const mapped = links.filter((link) => roles.includes(link.role));
    return {
      mapped: mapped.length,
      recordedApproval: mapped.filter((link) => link.asset && recordedMediaApproval(link.asset))
        .length,
    };
  };
  return {
    main: group(["main"]),
    detail: group(detailMediaRoles),
    packaging: group(["packaging"]),
  };
}

export function mediaThumbnailPath(path: string | null): string | null {
  return path && /^\/images\/products\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|avif)$/.test(path)
    ? path
    : null;
}

export function mediaHash(hash: string | null): string | null {
  return hash && /^[a-f0-9]{64}$/.test(hash) ? hash : null;
}
