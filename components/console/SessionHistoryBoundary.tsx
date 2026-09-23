"use client";

import { useEffect } from "react";

export function SessionHistoryBoundary() {
  useEffect(() => {
    const recheck = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", recheck);
    return () => window.removeEventListener("pageshow", recheck);
  }, []);
  return null;
}
