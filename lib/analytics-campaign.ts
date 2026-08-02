export const analyticsCampaignQueryKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

const campaignValuePattern = /^[a-z0-9][a-z0-9_-]{0,79}$/i;

type AnalyticsPageLocationInput = {
  href: string;
  origin: string;
  pathname: string;
};

export function buildAnalyticsPageLocation({ href, origin, pathname }: AnalyticsPageLocationInput) {
  const pagePath = pathname.startsWith("/") ? pathname.split(/[?#]/, 1)[0] : "/";
  const pageUrl = new URL(pagePath, `${origin}/`);
  const currentUrl = new URL(href, `${origin}/`);

  for (const key of analyticsCampaignQueryKeys) {
    const value = currentUrl.searchParams.get(key)?.trim();

    if (value && campaignValuePattern.test(value)) {
      pageUrl.searchParams.set(key, value);
    }
  }

  return pageUrl.toString();
}
