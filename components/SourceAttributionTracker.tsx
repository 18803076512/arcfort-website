"use client";

import { useEffect } from "react";
import {
  emptySourceAttribution,
  sanitizeCampaignValue,
  sanitizeReferrerOrigin,
  sanitizeSourceAttribution,
  sanitizeSourcePath,
  sourceAttributionStorageKey,
  utmParamMap,
  type SourceAttribution,
} from "@/lib/source-attribution";

function readStoredAttribution() {
  try {
    const rawValue = window.sessionStorage.getItem(sourceAttributionStorageKey);
    return rawValue
      ? sanitizeSourceAttribution(JSON.parse(rawValue) as Partial<SourceAttribution>)
      : null;
  } catch {
    return null;
  }
}

function writeStoredAttribution(attribution: SourceAttribution) {
  try {
    window.sessionStorage.setItem(sourceAttributionStorageKey, JSON.stringify(attribution));
  } catch {
    // Ignore restricted storage environments. RFQ can still submit without attribution metadata.
  }
}

export function SourceAttributionTracker() {
  useEffect(() => {
    const currentPath = sanitizeSourcePath(window.location.pathname, "/");
    const currentReferrer = sanitizeReferrerOrigin(document.referrer);
    const searchParams = new URLSearchParams(window.location.search);
    const storedAttribution = readStoredAttribution();
    const nextAttribution: SourceAttribution = {
      ...emptySourceAttribution(),
      ...storedAttribution,
    };

    if (!nextAttribution.landingPage) {
      nextAttribution.landingPage = currentPath;
    }

    if (!nextAttribution.referrer && currentReferrer) {
      nextAttribution.referrer = currentReferrer;
    }

    let hasFreshUtm = false;

    for (const [field, param] of Object.entries(utmParamMap)) {
      const value = sanitizeCampaignValue(searchParams.get(param));

      if (value) {
        nextAttribution[field as keyof typeof utmParamMap] = value;
        hasFreshUtm = true;
      }
    }

    if (hasFreshUtm) {
      nextAttribution.landingPage = currentPath;
      nextAttribution.referrer = currentReferrer || nextAttribution.referrer;
    }

    if (!storedAttribution || hasFreshUtm) {
      writeStoredAttribution(nextAttribution);
    }
  }, []);

  return null;
}
