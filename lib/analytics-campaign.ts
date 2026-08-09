import { sanitizeCampaignValue, sanitizeSourcePath } from "./source-attribution.ts";

export const analyticsCampaignQueryKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type AnalyticsPageLocationInput = {
  href: string;
  origin: string;
  pathname: string;
};

export function buildAnalyticsPageLocation({ href, origin, pathname }: AnalyticsPageLocationInput) {
  const pagePath = sanitizeSourcePath(pathname, "/");
  const pageUrl = new URL(pagePath, `${origin}/`);
  const currentUrl = new URL(href, `${origin}/`);

  for (const key of analyticsCampaignQueryKeys) {
    const value = sanitizeCampaignValue(currentUrl.searchParams.get(key));

    if (value) {
      pageUrl.searchParams.set(key, value);
    }
  }

  return pageUrl.toString();
}
