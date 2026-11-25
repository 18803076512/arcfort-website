"use client";

import { useEffect } from "react";
import {
  resolveSourceAttributionArrival,
  sanitizeSourceAttribution,
  sourceAttributionStorageKey,
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
    const { attribution, shouldPersist } = resolveSourceAttributionArrival({
      search: window.location.search,
      pathname: window.location.pathname,
      referrer: document.referrer,
      storedAttribution: readStoredAttribution(),
    });

    if (shouldPersist) {
      writeStoredAttribution(attribution);
    }
  }, []);

  return null;
}
