"use client";

import { useAnalyticsConsent } from "@/components/analytics/useAnalyticsConsent";
import { writeAnalyticsConsent } from "@/lib/analytics-consent";

type AnalyticsConsentSettingsProps = {
  analyticsAvailable: boolean;
};

export function AnalyticsConsentSettings({ analyticsAvailable }: AnalyticsConsentSettingsProps) {
  const { consent, loaded } = useAnalyticsConsent();

  if (!analyticsAvailable) {
    return (
      <p data-analytics-available="false" className="mt-3 text-sm leading-7 text-slate-600">
        Optional analytics is currently inactive on this website.
      </p>
    );
  }

  const statusLabel = !loaded
    ? "Loading preference"
    : consent === "granted"
      ? "Analytics allowed"
      : consent === "denied"
        ? "Analytics declined"
        : "No preference selected";

  return (
    <div data-analytics-available="true" className="mt-4 border border-slate-200 bg-arc-frost p-4">
      <p className="text-sm font-bold text-arc-midnight">Current status: {statusLabel}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
          className="inline-flex min-h-11 items-center justify-center border border-slate-300 bg-white px-5 text-sm font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:border-arc-blue hover:text-arc-blue"
        >
          Disable Analytics
        </button>
      </div>
    </div>
  );
}
