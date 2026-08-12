"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { buildAnalyticsPageLocation } from "@/lib/analytics-campaign";
import { useAnalyticsConsent } from "@/components/analytics/useAnalyticsConsent";
import {
  type AnalyticsConsentSettings,
  type AnalyticsEventParams,
  analyticsReadyEvent,
  trackAnalyticsEvent,
  trackAnalyticsPageView,
} from "@/lib/analytics-events";
import { writeAnalyticsConsent } from "@/lib/analytics-consent";

const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
const analyticsConfigured = Boolean(gaId && /^G-[A-Z0-9]+$/i.test(gaId));

const deniedConsent: AnalyticsConsentSettings = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

const analyticsOnlyConsent: AnalyticsConsentSettings = {
  ...deniedConsent,
  analytics_storage: "granted",
};

const downloadAssets: Record<string, { eventName: string; assetKey: string }> = {
  "/downloads/arcfort-distributor-sourcing-guide.pdf": {
    eventName: "buyer_tool_download_click",
    assetKey: "distributor_sourcing_guide",
  },
  "/downloads/renqiu-ailesen-welding-catalog.pdf": {
    eventName: "catalog_download_click",
    assetKey: "welding_catalog",
  },
  "/downloads/arcfort-public-product-list.csv": {
    eventName: "buyer_tool_download_click",
    assetKey: "public_product_list",
  },
  "/downloads/arcfort-rfq-template.csv": {
    eventName: "buyer_tool_download_click",
    assetKey: "rfq_template",
  },
  "/downloads/arcfort-oem-project-brief.xlsx": {
    eventName: "buyer_tool_download_click",
    assetKey: "oem_project_brief",
  },
};

type TrackedLinkEvent = {
  eventName: string;
  params: AnalyticsEventParams;
};

const embeddedRfqDestinations: Record<string, string> = {
  "#distributor-rfq-form": "embedded_distributor_rfq",
  "#contact-inquiry-form": "embedded_contact_rfq",
};

function getTrackedLinkEvent(href: string): TrackedLinkEvent | null {
  if (href.startsWith("mailto:")) {
    return {
      eventName: "contact_email_click",
      params: { contact_method: "email" },
    };
  }

  if (href.includes("wa.me") || href.includes("whatsapp")) {
    return {
      eventName: "contact_whatsapp_click",
      params: { contact_method: "whatsapp" },
    };
  }

  try {
    const url = new URL(href, window.location.origin);

    const embeddedRfqDestination = embeddedRfqDestinations[url.hash];

    if (
      url.origin === window.location.origin &&
      (url.pathname === "/rfq" || embeddedRfqDestination)
    ) {
      return {
        eventName: "rfq_link_click",
        params: {
          destination: embeddedRfqDestination ?? "rfq_page",
        },
      };
    }

    const download = downloadAssets[url.pathname];

    if (url.origin === window.location.origin && download) {
      return {
        eventName: download.eventName,
        params: {
          asset_key: download.assetKey,
          file_type: url.pathname.split(".").at(-1) ?? "file",
        },
      };
    }
  } catch {
    return null;
  }

  return null;
}

function getLinkPlacement(anchor: HTMLAnchorElement) {
  if (anchor.closest("[data-sticky-contact-bar]")) {
    return "sticky_contact";
  }

  if (anchor.closest("header")) {
    return "header";
  }

  if (anchor.closest("footer")) {
    return "footer";
  }

  if (anchor.closest("aside")) {
    return "sidebar";
  }

  if (anchor.closest("nav")) {
    return "navigation";
  }

  return "page_content";
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];

  if (!window.gtag) {
    window.gtag = ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    }) as NonNullable<typeof window.gtag>;
  }

  return window.gtag;
}

function AnalyticsConsentBanner() {
  return (
    <aside
      aria-label="Analytics preferences"
      className="fixed inset-x-3 bottom-20 z-[60] border border-slate-300 bg-white p-4 shadow-industrial sm:p-5 md:bottom-6 md:left-6 md:right-auto md:max-w-xl"
    >
      <p className="font-display text-lg font-black text-arc-midnight">Optional analytics</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Allow anonymous page and inquiry-path measurement. RFQ names, email addresses, phone
        numbers, messages and uploaded files are never sent to analytics.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => writeAnalyticsConsent("granted")}
          className="inline-flex min-h-11 items-center justify-center bg-arc-blue px-5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-arc-midnight"
        >
          Allow Analytics
        </button>
        <button
          type="button"
          onClick={() => writeAnalyticsConsent("denied")}
          className="inline-flex min-h-11 items-center justify-center border border-slate-300 px-5 text-sm font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:border-arc-blue hover:text-arc-blue"
        >
          Decline
        </button>
        <Link
          href="/privacy"
          className="inline-flex min-h-11 items-center justify-center px-3 text-sm font-bold text-arc-blue hover:text-arc-midnight"
        >
          Privacy notice
        </Link>
      </div>
    </aside>
  );
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { consent, loaded: consentLoaded } = useAnalyticsConsent();
  const initializedRef = useRef(false);
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!analyticsConfigured || !gaId) {
      return;
    }

    if (consent !== "granted") {
      if (initializedRef.current && window.gtag) {
        window.gtag("consent", "update", deniedConsent);
      }

      lastTrackedPathRef.current = null;
      return;
    }

    const gtag = ensureGtag();
    const pagePath = pathname.startsWith("/") ? pathname.split(/[?#]/, 1)[0] : "/";

    if (!initializedRef.current) {
      gtag("consent", "default", deniedConsent);
      gtag("consent", "update", analyticsOnlyConsent);
      gtag("js", new Date());
      initializedRef.current = true;
    } else {
      gtag("consent", "update", analyticsOnlyConsent);
    }

    gtag("config", gaId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      page_location: buildAnalyticsPageLocation({
        href: window.location.href,
        origin: window.location.origin,
        pathname: pagePath,
      }),
      page_path: pagePath,
      page_title: document.title,
      send_page_view: false,
    });

    window.dispatchEvent(new Event(analyticsReadyEvent));

    if (lastTrackedPathRef.current !== pathname) {
      const tracked = trackAnalyticsPageView(pathname);

      if (tracked) {
        lastTrackedPathRef.current = pathname;
      }
    }
  }, [consent, pathname]);

  useEffect(() => {
    if (!analyticsConfigured) {
      return;
    }

    function handleTrackedLinkClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href) {
        return;
      }

      const trackedEvent = getTrackedLinkEvent(href);

      if (!trackedEvent) {
        return;
      }

      trackAnalyticsEvent(trackedEvent.eventName, {
        ...trackedEvent.params,
        link_placement: getLinkPlacement(anchor),
        page_path: window.location.pathname,
      });
    }

    document.addEventListener("click", handleTrackedLinkClick);

    return () => document.removeEventListener("click", handleTrackedLinkClick);
  }, []);

  if (!analyticsConfigured) {
    return null;
  }

  return (
    <>
      {consentLoaded && consent === "unset" ? <AnalyticsConsentBanner /> : null}
      {consent === "granted" && gaId ? (
        <Script
          id="arcfort-ga4-library"
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
