import { siteConfig } from "./site.ts";

type ProductCommercialTerms = {
  moq: string;
  leadTime: string;
};

// These exact legacy defaults describe company guidance, not an approved SKU-specific promise.
// Preserve every other value so this public projection cannot replace custom order terms.
export function getPublicProductCommercialTerms({
  moq,
  leadTime,
}: ProductCommercialTerms): ProductCommercialTerms {
  return {
    moq: moq === "Small trial orders accepted" ? siteConfig.moqPolicy : moq,
    leadTime:
      leadTime === "7-20 working days for regular orders" ? siteConfig.regularLeadTime : leadTime,
  };
}
