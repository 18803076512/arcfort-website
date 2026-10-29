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
  /\b(?:model|part\s*(?:number|no\.?|reference)|sku|drawing(?:\s*(?:number|no\.?))?)\s*(?::|#|-)?\s*(?=[a-z0-9._/-]*\d)[a-z0-9._/-]+\b/i;
const dimensionalReferencePattern =
  /(?:\bM\d+\b|#\s*\d+\b|\b\d+(?:\.\d+)?\s*(?:mm|cm|inch|inches)\b|\b(?:MB|WP|PT|PK|CB)\s*-?\s*\d+\b)/i;
const packagingPattern =
  /\b(?:pack|packing|packaging|carton|bag|box|label|logo|private label|oem)\b/i;
const deliveryPattern =
  /\b(?:incoterm|fob|cif|cfr|exw|shipping|shipment|freight|air freight|sea freight|port|destination city)\b/i;

const quantityPlanPattern =
  /\b(?:trial|sample|initial|repeat|annual|monthly|quarterly|mixed)\s+(?:order|program)\b/i;
const quantityWithUnitPattern =
  /\b(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\s*(?:pcs?|pieces?|units?|sets?|pairs?|kg|tonnes?|tons?|rolls?|cartons?|boxes?|containers?|pallets?)\b/i;
const bareQuantityPattern =
  /^\s*(?:~\s*|about\s+|around\s+|approx(?:imately)?\.?\s+)?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\s*$/i;

function hasDirectQuantityEvidence(value: string) {
  const hasExplicitCount = quantityWithUnitPattern.test(value) || bareQuantityPattern.test(value);

  if (hasExplicitCount) {
    return true;
  }

  if (/\b(?:moq|minimum order quantity)\b/i.test(value)) {
    return false;
  }

  return quantityPlanPattern.test(value);
}

function hasBuyerQuantityEvidence(quantity: string, productText: string) {
  const trimmedQuantity = quantity.trim();

  if (trimmedQuantity !== "See selected product line quantities") {
    return hasDirectQuantityEvidence(trimmedQuantity);
  }

  const selectedProductSection = /^Selected products:\n([\s\S]*?)(?=\n\n|$)/.exec(productText)?.[1];
  const selectedLines = selectedProductSection
    ? selectedProductSection.split("\n").filter((line) => /^\d+\.\s/.test(line))
    : [];

  return (
    selectedLines.length > 0 &&
    selectedLines.every((line) => {
      const requestedQuantity = /\|\s*Requested quantity:\s*([^|]+)/i.exec(line)?.[1]?.trim();
      return requestedQuantity ? hasDirectQuantityEvidence(requestedQuantity) : false;
    })
  );
}

export function buildRfqQuotationReadiness(
  payload: Pick<RfqTextValues, "country" | "quantity" | "productRequirements" | "message">,
  attachments: RfqQualificationAttachment[],
): RfqQuotationReadiness {
  const productText = payload.productRequirements.trim();
  const combinedText = `${payload.productRequirements}\n${payload.message}`;
  const hasQuantity = hasBuyerQuantityEvidence(payload.quantity, productText);
  const hasCountry = Boolean(payload.country.trim());
  const hasAttachment = attachments.length > 0;
  const hasTechnicalReference = technicalReferencePattern.test(productText);
  const hasDimensionalReference = dimensionalReferencePattern.test(productText);
  const hasProductEvidence = hasAttachment || hasTechnicalReference || hasDimensionalReference;
  const isReadyForSalesReview = hasQuantity && hasCountry && hasProductEvidence;
  const confirmedSignals = [
    hasQuantity ? "Quantity or order plan provided" : "",
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
