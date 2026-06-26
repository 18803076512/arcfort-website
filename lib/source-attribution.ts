export const sourceAttributionStorageKey = "arcfort_source_attribution";

export const sourceAttributionFields = [
  "landingPage",
  "referrer",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
] as const;

export type SourceAttributionField = (typeof sourceAttributionFields)[number];
export type SourceAttribution = Record<SourceAttributionField, string>;

export const utmParamMap: Record<Exclude<SourceAttributionField, "landingPage" | "referrer">, string> = {
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmTerm: "utm_term",
  utmContent: "utm_content",
};

export function emptySourceAttribution(): SourceAttribution {
  return {
    landingPage: "",
    referrer: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
  };
}

