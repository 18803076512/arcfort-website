"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics-events";
import {
  buildDistributorRfqHref,
  distributorBuyerProfileOptions,
  distributorEvidenceOptions,
  distributorPackingOptions,
  distributorProductCategoryOptions,
  distributorSourcingStageOptions,
  getDistributorRfqReadiness,
} from "@/lib/distributor-rfq-builder";

const readinessLabels: Record<string, string> = {
  buyer_profile: "buyer profile",
  product_categories: "product categories",
  trial_quantity: "trial quantity",
  destination: "destination market",
  evidence: "available evidence",
};

export function DistributorRfqBuilder() {
  const router = useRouter();
  const interactionTrackedRef = useRef(false);
  const [buyerProfile, setBuyerProfile] = useState("");
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [sourcingStage, setSourcingStage] = useState<string>(distributorSourcingStageOptions[0]);
  const [trialQuantity, setTrialQuantity] = useState("");
  const [repeatPlan, setRepeatPlan] = useState("");
  const [destination, setDestination] = useState("");
  const [packing, setPacking] = useState<string>(distributorPackingOptions[0]);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [currentReferences, setCurrentReferences] = useState("");
  const input = {
    buyerProfile,
    productCategories,
    sourcingStage,
    trialQuantity,
    repeatPlan,
    destination,
    packing,
    evidence,
    currentReferences,
  };
  const readiness = getDistributorRfqReadiness(input);

  function trackStart() {
    if (interactionTrackedRef.current) {
      return;
    }

    const tracked = trackAnalyticsEvent("distributor_rfq_builder_start", {
      location: "distributor_supply",
    });

    if (tracked) {
      interactionTrackedRef.current = true;
    }
  }

  function toggleSelection(
    value: string,
    setValues: (update: (values: string[]) => string[]) => void,
  ) {
    trackStart();
    setValues((values) =>
      values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    trackAnalyticsEvent("distributor_rfq_builder_continue", {
      buyer_profile: buyerProfile || "not_selected",
      category_count: productCategories.length,
      evidence_count: evidence.length,
      sourcing_stage: sourcingStage,
      packing_mode: packing,
      has_trial_quantity: Boolean(trialQuantity.trim()),
      has_repeat_plan: Boolean(repeatPlan.trim()),
      has_destination: Boolean(destination.trim()),
      readiness_count: readiness.completeCount,
    });

    router.push(buildDistributorRfqHref(input));
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={trackStart}
      data-hide-sticky-contact-when-visible
      className="border border-slate-200 bg-white shadow-industrial"
    >
      <div className="grid gap-5 border-b border-slate-200 bg-arc-midnight p-5 text-white sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
            Distributor RFQ Builder
          </p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight">
            Prepare a mixed-product sourcing brief.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Organize a trial order, repeat purchasing program or private-label range before entering
            contact details and uploading the full SKU list.
          </p>
        </div>
        <div aria-live="polite" className="min-w-52 border-l-4 border-arc-signal bg-white/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
            Brief readiness
          </p>
          <p className="mt-2 font-display text-3xl font-black text-white">
            {readiness.completeCount}/{readiness.totalCount}
          </p>
          <p className="mt-1 max-w-64 text-xs leading-5 text-slate-300">
            {readiness.isComplete
              ? "Core purchasing inputs are organized. Product details still require review."
              : `Add ${readiness.missingKeys.map((key) => readinessLabels[key]).join(", ")}.`}
          </p>
        </div>
      </div>

      <div className="grid gap-7 p-5 sm:p-6 lg:grid-cols-2">
        <div>
          <label
            htmlFor="distributor-buyer-profile"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue"
          >
            1. Buyer profile
          </label>
          <select
            id="distributor-buyer-profile"
            value={buyerProfile}
            onChange={(event) => setBuyerProfile(event.target.value)}
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            <option value="">Select buyer type</option>
            {distributorBuyerProfileOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="distributor-sourcing-stage"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue"
          >
            2. Sourcing stage
          </label>
          <select
            id="distributor-sourcing-stage"
            value={sourcingStage}
            onChange={(event) => setSourcingStage(event.target.value)}
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {distributorSourcingStageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="lg:col-span-2">
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            3. Product categories
          </legend>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Select one family or combine several product lines in the same inquiry.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {distributorProductCategoryOptions.map((option) => (
              <label
                key={option}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-slate-200 bg-arc-frost px-3 py-2 text-xs font-semibold leading-5 text-slate-700 transition hover:border-arc-blue"
              >
                <input
                  type="checkbox"
                  checked={productCategories.includes(option)}
                  onChange={() => toggleSelection(option, setProductCategories)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-arc-blue focus:ring-arc-blue"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor="distributor-trial-quantity" className="block">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            4. Trial-order quantity plan
          </span>
          <input
            id="distributor-trial-quantity"
            type="text"
            maxLength={160}
            value={trialQuantity}
            onChange={(event) => setTrialQuantity(event.target.value)}
            placeholder="Example: mixed trial order; line quantities in attached workbook"
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </label>

        <label htmlFor="distributor-repeat-plan" className="block">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            5. Expected repeat purchasing
          </span>
          <input
            id="distributor-repeat-plan"
            type="text"
            maxLength={160}
            value={repeatPlan}
            onChange={(event) => setRepeatPlan(event.target.value)}
            placeholder="Example: quarterly restocking after sample approval"
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </label>

        <label htmlFor="distributor-destination" className="block">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            6. Destination market
          </span>
          <input
            id="distributor-destination"
            type="text"
            maxLength={120}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Destination country or regional market"
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </label>

        <div>
          <label
            htmlFor="distributor-packing"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue"
          >
            7. Packing approach
          </label>
          <select
            id="distributor-packing"
            value={packing}
            onChange={(event) => setPacking(event.target.value)}
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {distributorPackingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="lg:col-span-2">
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            8. Product evidence available
          </legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {distributorEvidenceOptions.map((option) => (
              <label
                key={option}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-slate-200 bg-arc-frost px-3 py-2 text-xs font-semibold leading-5 text-slate-700 transition hover:border-arc-blue"
              >
                <input
                  type="checkbox"
                  checked={evidence.includes(option)}
                  onChange={() => toggleSelection(option, setEvidence)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-arc-blue focus:ring-arc-blue"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor="distributor-current-references" className="block lg:col-span-2">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            9. Current references or matching notes
          </span>
          <textarea
            id="distributor-current-references"
            rows={3}
            maxLength={240}
            value={currentReferences}
            onChange={(event) => setCurrentReferences(event.target.value)}
            placeholder="Add current supplier references, torch or machine models, target items, or note that details are in an attached list"
            className="mt-3 block w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </label>
      </div>

      <div className="grid gap-4 border-t border-slate-200 bg-arc-frost p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs leading-6 text-slate-600">
            This brief records buyer requirements only. It does not confirm product fit,
            specifications, MOQ, price, certification, exclusivity or territory rights.
          </p>
          <a
            href="/downloads/arcfort-distributor-rfq-workbook.xlsx"
            download
            className="mt-2 inline-flex min-h-11 items-center border-b-2 border-arc-blue text-xs font-bold uppercase tracking-[0.12em] text-arc-blue transition hover:border-arc-copper hover:text-arc-copper"
          >
            Download workbook for large SKU lists
          </a>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center bg-arc-blue px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight sm:w-auto"
        >
          Continue to RFQ
        </button>
      </div>
    </form>
  );
}
