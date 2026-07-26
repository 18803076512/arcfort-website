export type AnalyticsConsentChoice = "granted" | "denied";
export type AnalyticsConsentState = AnalyticsConsentChoice | "unset";

export const analyticsConsentStorageKey = "arcfort_analytics_consent";
export const analyticsConsentChangeEvent = "arcfort:analytics-consent-change";

function isAnalyticsConsentChoice(value: unknown): value is AnalyticsConsentChoice {
  return value === "granted" || value === "denied";
}

export function readAnalyticsConsent(): AnalyticsConsentState {
  if (typeof window === "undefined") {
    return "unset";
  }

  try {
    const value = window.localStorage.getItem(analyticsConsentStorageKey);
    return isAnalyticsConsentChoice(value) ? value : "unset";
  } catch {
    return "unset";
  }
}

export function writeAnalyticsConsent(choice: AnalyticsConsentChoice) {
  if (typeof window === "undefined") {
    return;
  }

  let effectiveChoice: AnalyticsConsentChoice = "denied";

  try {
    window.localStorage.setItem(analyticsConsentStorageKey, choice);
    effectiveChoice =
      window.localStorage.getItem(analyticsConsentStorageKey) === choice ? choice : "denied";
  } catch {
    // A blocked storage API keeps analytics disabled by default.
  }

  window.dispatchEvent(
    new CustomEvent<AnalyticsConsentChoice>(analyticsConsentChangeEvent, {
      detail: effectiveChoice,
    }),
  );
}

export function subscribeToAnalyticsConsent(listener: (state: AnalyticsConsentState) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleConsentChange(event: Event) {
    const choice = (event as CustomEvent<AnalyticsConsentChoice>).detail;
    listener(isAnalyticsConsentChoice(choice) ? choice : readAnalyticsConsent());
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === analyticsConsentStorageKey) {
      listener(readAnalyticsConsent());
    }
  }

  window.addEventListener(analyticsConsentChangeEvent, handleConsentChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(analyticsConsentChangeEvent, handleConsentChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function isAnalyticsConsentGranted() {
  return readAnalyticsConsent() === "granted";
}
