import { TO_BE_CONFIRMED } from "@/lib/content/schemas";

export function displayConfirmedValue(value: string, fallback = "Confirm by RFQ") {
  return value === TO_BE_CONFIRMED ? fallback : value;
}
