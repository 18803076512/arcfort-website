"use client";

import { useEffect, useRef } from "react";
import { useAnalyticsConsent } from "@/components/analytics/useAnalyticsConsent";
import { analyticsReadyEvent, trackAnalyticsEvent } from "@/lib/analytics-events";

type ProductCatalogTrackerProps = {
  hasQuery: boolean;
  queryLength: number;
  categorySlug: string;
  resultCount: number;
  pageNumber: number;
};

function getQueryLengthGroup(queryLength: number) {
  if (queryLength <= 0) {
    return "none";
  }

  if (queryLength <= 10) {
    return "1-10";
  }

  if (queryLength <= 30) {
    return "11-30";
  }

  return "31-100";
}

export function ProductCatalogTracker({
  hasQuery,
  queryLength,
  categorySlug,
  resultCount,
  pageNumber,
}: ProductCatalogTrackerProps) {
  const { consent } = useAnalyticsConsent();
  const trackedKeyRef = useRef("");

  useEffect(() => {
    if (consent !== "granted") {
      return;
    }

    const trackingKey = [hasQuery, queryLength, categorySlug, resultCount, pageNumber].join(":");

    if (trackedKeyRef.current === trackingKey) {
      return;
    }

    function trackProductSearch() {
      if (trackedKeyRef.current === trackingKey) {
        return;
      }

      const tracked = trackAnalyticsEvent("product_catalog_search", {
        search_mode:
          hasQuery && categorySlug ? "query_and_category" : hasQuery ? "query" : "category_or_page",
        query_length_group: getQueryLengthGroup(queryLength),
        category_slug: categorySlug || "all",
        result_count: resultCount,
        page_number: pageNumber,
      });

      if (tracked) {
        trackedKeyRef.current = trackingKey;
      }
    }

    trackProductSearch();
    window.addEventListener(analyticsReadyEvent, trackProductSearch);

    return () => window.removeEventListener(analyticsReadyEvent, trackProductSearch);
  }, [categorySlug, consent, hasQuery, pageNumber, queryLength, resultCount]);

  return null;
}
