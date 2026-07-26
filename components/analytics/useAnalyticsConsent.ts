"use client";

import { useEffect, useState } from "react";
import {
  type AnalyticsConsentState,
  readAnalyticsConsent,
  subscribeToAnalyticsConsent,
} from "@/lib/analytics-consent";

export function useAnalyticsConsent() {
  const [consent, setConsent] = useState<AnalyticsConsentState>("unset");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConsent(readAnalyticsConsent());
    setLoaded(true);

    return subscribeToAnalyticsConsent((nextConsent) => {
      setConsent(nextConsent);
      setLoaded(true);
    });
  }, []);

  return { consent, loaded };
}
