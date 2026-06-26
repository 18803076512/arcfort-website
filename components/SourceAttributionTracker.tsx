"use client";

import { useEffect } from "react";
import {
  emptySourceAttribution,
  sourceAttributionStorageKey,
  utmParamMap,
  type SourceAttribution,
} from "@/lib/source-attribution";

function readStoredAttribution() {
  try {
    const rawValue = window.sessionStorage.getItem(sourceAttributionStorageKey);
    return rawValue ? (JSON.parse(rawValue) as Partial<SourceAttribution>) : null;
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
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const searchParams = new URLSearchParams(window.location.search);
    const storedAttribution = readStoredAttribution();
    const nextAttribution: SourceAttribution = {
      ...emptySourceAttribution(),
      ...storedAttribution,
    };

    if (!nextAttribution.landingPage) {
      nextAttribution.landingPage = currentPath;
    }

    if (!nextAttribution.referrer && document.referrer) {
      nextAttribution.referrer = document.referrer;
    }

    let hasFreshUtm = false;

    for (const [field, param] of Object.entries(utmParamMap)) {
      const value = searchParams.get(param)?.trim();

      if (value) {
        nextAttribution[field as keyof typeof utmParamMap] = value.slice(0, 160);
        hasFreshUtm = true;
      }
    }

    if (!storedAttribution || hasFreshUtm) {
      writeStoredAttribution(nextAttribution);
    }
  }, []);

  return null;
}

