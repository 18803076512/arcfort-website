export const PRODUCT_LIFECYCLE_STATES = [
  "DRAFT",
  "INGESTED",
  "DATA_INCOMPLETE",
  "NEEDS_VERIFICATION",
  "VERIFIED",
  "READY_FOR_PUBLISH",
  "QA_PASSED",
  "PUBLISHED",
  "NEEDS_UPDATE",
] as const;

export type ProductLifecycleState = (typeof PRODUCT_LIFECYCLE_STATES)[number];

const lifecycleTransitions: Readonly<
  Record<ProductLifecycleState, readonly ProductLifecycleState[]>
> = {
  DRAFT: ["INGESTED"],
  INGESTED: ["DATA_INCOMPLETE", "NEEDS_VERIFICATION"],
  DATA_INCOMPLETE: ["NEEDS_VERIFICATION"],
  NEEDS_VERIFICATION: ["VERIFIED", "DATA_INCOMPLETE"],
  VERIFIED: ["READY_FOR_PUBLISH", "NEEDS_UPDATE"],
  READY_FOR_PUBLISH: ["QA_PASSED", "NEEDS_UPDATE"],
  QA_PASSED: ["PUBLISHED", "NEEDS_UPDATE"],
  PUBLISHED: ["NEEDS_UPDATE"],
  NEEDS_UPDATE: ["NEEDS_VERIFICATION", "DATA_INCOMPLETE"],
};

export function isProductLifecycleState(value: string): value is ProductLifecycleState {
  return PRODUCT_LIFECYCLE_STATES.some((state) => state === value);
}

export function canTransitionProductLifecycle(
  from: ProductLifecycleState,
  to: ProductLifecycleState,
): boolean {
  return from === to || lifecycleTransitions[from].includes(to);
}

export function assertProductLifecycleTransition(
  from: ProductLifecycleState,
  to: ProductLifecycleState,
): void {
  if (!canTransitionProductLifecycle(from, to)) {
    throw new Error(`Invalid product lifecycle transition: ${from} -> ${to}`);
  }
}

export function initialShadowLifecycle(): ProductLifecycleState {
  return "INGESTED";
}

export function isPublishableLifecycle(state: ProductLifecycleState): boolean {
  return state === "QA_PASSED" || state === "PUBLISHED";
}
