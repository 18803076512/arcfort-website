import { TO_BE_CONFIRMED } from "@/lib/content/schemas";

export function isUnconfirmedValue(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return (
    !normalizedValue ||
    value === TO_BE_CONFIRMED ||
    normalizedValue.includes("to be confirmed") ||
    normalizedValue === "available upon request" ||
    normalizedValue.includes("details available upon request") ||
    normalizedValue === "contact us for details" ||
    normalizedValue === "tbd" ||
    normalizedValue === "unknown" ||
    normalizedValue === "needs_review" ||
    normalizedValue.includes("compatibility can be confirmed")
  );
}

export function isLowSignalSpecificationValue(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return isUnconfirmedValue(value) || normalizedValue.includes("standard export packing");
}

export function displayConfirmedValue(value: string, fallback = "Confirm by RFQ") {
  return isUnconfirmedValue(value) ? fallback : value;
}
