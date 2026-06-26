"use client";

import Script from "next/script";
import { useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics-events";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

function getTrackedLinkEvent(href: string) {
  if (href.startsWith("mailto:")) {
    return "contact_email_click";
  }

  if (href.includes("wa.me") || href.includes("whatsapp")) {
    return "contact_whatsapp_click";
  }

  if (href === "/rfq" || href.startsWith("/rfq?") || href.includes("arcfortweld.com/rfq")) {
    return "rfq_link_click";
  }

  return null;
}

export function AnalyticsTracker() {
  useEffect(() => {
    if (!gaId) {
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

      const eventName = getTrackedLinkEvent(href);

      if (!eventName) {
        return;
      }

      trackAnalyticsEvent(eventName, {
        link_url: href,
        link_text: anchor.textContent?.trim().slice(0, 120) || "Link",
      });
    }

    document.addEventListener("click", handleTrackedLinkClick);

    return () => document.removeEventListener("click", handleTrackedLinkClick);
  }, []);

  if (!gaId) {
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script
        id="arcfort-ga4"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', ${JSON.stringify(gaId)}, { send_page_view: true });
          `,
        }}
      />
    </>
  );
}
