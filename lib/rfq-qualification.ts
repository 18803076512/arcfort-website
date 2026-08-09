import type { RfqTextValues } from "./rfq-constraints.ts";

type RfqQualificationAttachment = {
  name: string;
};

export type RfqQuotationReadiness = {
  status: "ready_for_sales_review" | "technical_details_needed";
  label: "Ready for sales review" | "Technical details needed";
  confirmedSignals: string[];
  followUpItems: string[];
};

const technicalReferencePattern =
  /\b(?:model|part\s*(?:number|no\.?|reference)|sku|drawing|sample|photo|thread|size|material|compatible|compatibility)\b/i;
const dimensionalReferencePattern =
  /(?:\bM\d+\b|#\s*\d+\b|\b\d+(?:\.\d+)?\s*(?:mm|cm|inch|inches)\b|\b(?:MB|WP|PT|PK|CB)\s*-?\s*\d+\b)/i;
const packagingPattern =
  /\b(?:pack|packing|packaging|carton|bag|box|label|logo|private label|oem)\b/i;
const deliveryPattern =
  /\b(?:incoterm|fob|cif|cfr|exw|shipping|shipment|freight|air freight|sea freight|port|destination city)\b/i;

export function buildRfqQuotationReadiness(
  payload: Pick<RfqTextValues, "country" | "quantity" | "productRequirements" | "message">,
  attachments: RfqQualificationAttachment[],
): RfqQuotationReadiness {
  const productText = payload.productRequirements.trim();
  const combinedText = `${payload.productRequirements}\n${payload.message}`;
  const hasQuantity = Boolean(payload.quantity.trim());
  const hasCountry = Boolean(payload.country.trim());
  const hasAttachment = attachments.length > 0;
  const hasTechnicalReference = technicalReferencePattern.test(productText);
  const hasDimensionalReference = dimensionalReferencePattern.test(productText);
  const hasProductEvidence = hasAttachment || hasTechnicalReference || hasDimensionalReference;
  const isReadyForSalesReview = hasQuantity && hasCountry && hasProductEvidence;
  const confirmedSignals = [
    hasQuantity ? "Requested quantity provided" : "",
    hasCountry ? "Destination country provided" : "",
    hasAttachment
      ? `${attachments.length} supporting file${attachments.length === 1 ? "" : "s"} attached`
      : "",
    hasTechnicalReference || hasDimensionalReference
      ? "Product reference or dimensional detail detected"
      : "",
  ].filter(Boolean);
  const followUpItems: string[] = [];

  if (!hasQuantity) {
    followUpItems.push("Confirm the required quantity or order plan for each requested item.");
  }

  if (!hasCountry) {
    followUpItems.push("Confirm the destination country for packing and delivery planning.");
  }

  if (!hasProductEvidence) {
    followUpItems.push(
      "Confirm the part number, torch or machine model, size, thread, or marked dimensions as applicable.",
    );
  }

  if (!hasAttachment) {
    followUpItems.push(
      "Request a drawing, product list, or clear sample photos when compatibility cannot be verified from the written details.",
    );
  }

  if (!packagingPattern.test(combinedText)) {
    followUpItems.push(
      "Confirm standard export packing or any logo, private-label, or carton requirement.",
    );
  }

  if (!deliveryPattern.test(combinedText)) {
    followUpItems.push(
      "Confirm the delivery destination and preferred shipping term before final freight calculation.",
    );
  }

  followUpItems.push(
    "Verify compatibility and unconfirmed specifications against buyer-supplied evidence before quoting.",
  );

  return {
    status: isReadyForSalesReview ? "ready_for_sales_review" : "technical_details_needed",
    label: isReadyForSalesReview ? "Ready for sales review" : "Technical details needed",
    confirmedSignals,
    followUpItems,
  };
}
