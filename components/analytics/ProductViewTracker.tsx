"use client";

import { useEffect, useRef } from "react";
import { useAnalyticsConsent } from "@/components/analytics/useAnalyticsConsent";
import { analyticsReadyEvent, trackAnalyticsEvent } from "@/lib/analytics-events";

type ProductViewTrackerProps = {
  sku: string;
  name: string;
  category: string;
};

export function ProductViewTracker({ sku, name, category }: ProductViewTrackerProps) {
  const { consent } = useAnalyticsConsent();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current || consent !== "granted") {
      return;
    }

    function trackProductView() {
      if (trackedRef.current) {
        return;
      }

      const tracked = trackAnalyticsEvent("view_item", {
        items: [
          {
            item_id: sku,
            item_name: name,
            item_brand: "ArcFort Weld",
            item_category: category,
          },
        ],
      });

      if (tracked) {
        trackedRef.current = true;
      }
    }

    trackProductView();
    window.addEventListener(analyticsReadyEvent, trackProductView);

    return () => window.removeEventListener(analyticsReadyEvent, trackProductView);
  }, [category, consent, name, sku]);

  return null;
}
