import { isAnalyticsConsentGranted } from "@/lib/analytics-consent";
import { buildAnalyticsPageLocation } from "@/lib/analytics-campaign";

type AnalyticsPrimitive = boolean | number | string;

export const analyticsReadyEvent = "arcfort:analytics-ready";

export type AnalyticsItem = {
  item_id?: string;
  item_name?: string;
  item_brand?: string;
  item_category?: string;
};

export type AnalyticsEventParams = Record<string, AnalyticsItem[] | AnalyticsPrimitive | undefined>;

export type AnalyticsConsentSettings = {
  ad_storage: "denied" | "granted";
  ad_user_data: "denied" | "granted";
  ad_personalization: "denied" | "granted";
  analytics_storage: "denied" | "granted";
};

export interface GtagFunction {
  (command: "js", target: Date): void;
  (command: "config", target: string, params?: AnalyticsEventParams): void;
  (command: "event", target: string, params?: AnalyticsEventParams): void;
  (command: "consent", target: "default" | "update", params: AnalyticsConsentSettings): void;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

function sanitizeString(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 240);
}

function sanitizeItems(items: AnalyticsItem[]) {
  return items.slice(0, 20).map((item) => {
    const sanitizedItem: AnalyticsItem = {};

    for (const [key, value] of Object.entries(item)) {
      if (typeof value === "string") {
        sanitizedItem[key as keyof AnalyticsItem] = sanitizeString(value);
      }
    }

    return sanitizedItem;
  });
}

function sanitizeEventParams(params: AnalyticsEventParams) {
  const sanitizedParams: AnalyticsEventParams = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      sanitizedParams[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitizedParams[key] = sanitizeItems(value);
    } else {
      sanitizedParams[key] = value;
    }
  }

  return sanitizedParams;
}

export function trackAnalyticsEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (
    typeof window === "undefined" ||
    typeof window.gtag !== "function" ||
    !isAnalyticsConsentGranted() ||
    !/^[a-z][a-z0-9_]{0,39}$/.test(eventName)
  ) {
    return false;
  }

  window.gtag("event", eventName, sanitizeEventParams(params));
  return true;
}

export function trackAnalyticsPageView(pathname: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const pagePath = pathname.startsWith("/") ? pathname.split(/[?#]/, 1)[0] : "/";

  return trackAnalyticsEvent("page_view", {
    page_path: pagePath,
    page_location: buildAnalyticsPageLocation({
      href: window.location.href,
      origin: window.location.origin,
      pathname: pagePath,
    }),
    page_title: document.title,
  });
}
