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

const campaignValuePattern = /^[a-z0-9][a-z0-9_-]{0,79}$/i;

export const utmParamMap: Record<
  Exclude<SourceAttributionField, "landingPage" | "referrer">,
  string
> = {
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

export function sanitizeCampaignValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.replace(/[\r\n\t]+/g, " ").trim();
  return campaignValuePattern.test(normalizedValue) ? normalizedValue : "";
}

export function sanitizeSourcePath(value: unknown, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalizedValue = value.replace(/[\r\n\t\0]+/g, " ").trim();
  const pathname = normalizedValue.split(/[?#]/, 1)[0];

  if (
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname.includes("\\") ||
    pathname.length > 240
  ) {
    return fallback;
  }

  return pathname;
}

export function sanitizeReferrerOrigin(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin.slice(0, 240) : "";
  } catch {
    return "";
  }
}

export function sanitizeSourceAttribution(
  attribution: Partial<SourceAttribution> | null | undefined,
): SourceAttribution {
  return {
    landingPage: sanitizeSourcePath(attribution?.landingPage),
    referrer: sanitizeReferrerOrigin(attribution?.referrer),
    utmSource: sanitizeCampaignValue(attribution?.utmSource),
    utmMedium: sanitizeCampaignValue(attribution?.utmMedium),
    utmCampaign: sanitizeCampaignValue(attribution?.utmCampaign),
    utmTerm: sanitizeCampaignValue(attribution?.utmTerm),
    utmContent: sanitizeCampaignValue(attribution?.utmContent),
  };
}
