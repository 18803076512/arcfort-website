import type { SourceAttribution } from "./source-attribution.ts";

const knownSourceLabels: Record<string, string> = {
  industry_directory: "Industrial directory referral",
  linkedin: "LinkedIn",
  outreach_email: "Distributor outreach email",
  pdf: "PDF or offline sourcing guide",
  whatsapp: "WhatsApp business contact",
};

function cleanSummaryValue(value: string) {
  return value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 120);
}

function externalReferrerHost(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (!hostname || hostname === "arcfortweld.com" || hostname.endsWith(".arcfortweld.com")) {
      return "";
    }

    return hostname;
  } catch {
    return "";
  }
}

export type RfqLeadSourceSummary = {
  label: string;
  details: string[];
};

export function buildRfqLeadSourceSummary(
  attribution: SourceAttribution,
  sourcePath: string,
): RfqLeadSourceSummary {
  const source = cleanSummaryValue(attribution.utmSource).toLowerCase();
  const medium = cleanSummaryValue(attribution.utmMedium);
  const campaign = cleanSummaryValue(attribution.utmCampaign);
  const content = cleanSummaryValue(attribution.utmContent);
  const landingPage = cleanSummaryValue(attribution.landingPage || sourcePath) || "/rfq";
  const referrerHost = externalReferrerHost(attribution.referrer);
  const details = [
    medium ? `Medium: ${medium}` : "",
    campaign ? `Campaign: ${campaign}` : "",
    content ? `Content: ${content}` : "",
    `Entry: ${landingPage}`,
  ].filter(Boolean);

  if (source) {
    return {
      label: knownSourceLabels[source] ?? `Campaign source: ${source}`,
      details,
    };
  }

  if (referrerHost) {
    return {
      label: `Referral: ${referrerHost}`,
      details,
    };
  }

  return {
    label: "Direct or unattributed inquiry",
    details,
  };
}
