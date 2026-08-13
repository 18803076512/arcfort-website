"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics-events";
import {
  buildOemRfqHref,
  getOemRfqReadiness,
  oemDestinationRegionOptions,
  oemEvidenceOptions,
  oemPackingOptions,
  oemProductScopeOptions,
  oemProjectStageOptions,
  oemQuantityPlanOptions,
  oemServiceOptions,
} from "@/lib/oem-rfq-builder";

const readinessLabels: Record<string, string> = {
  product_scope: "product scope",
  oem_service: "OEM service",
  evidence: "available evidence",
  quantity: "quantity plan",
  destination: "destination market",
};

export function OemRfqBuilder() {
  const router = useRouter();
  const interactionTrackedRef = useRef(false);
  const [productScopes, setProductScopes] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [projectStage, setProjectStage] = useState<string>(oemProjectStageOptions[0]);
  const [quantity, setQuantity] = useState<string>(oemQuantityPlanOptions[0]);
  const [destinationMarket, setDestinationMarket] = useState<string>(
    oemDestinationRegionOptions[0],
  );
  const [packing, setPacking] = useState<string>(oemPackingOptions[0]);
  const readiness = getOemRfqReadiness({
    productScopes,
    services,
    evidence,
    projectStage,
    quantity,
    destinationMarket,
    packing,
  });

  function trackStart() {
    if (interactionTrackedRef.current) {
      return;
    }

    const tracked = trackAnalyticsEvent("oem_rfq_builder_start", {
      location: "oem_service",
    });

    if (tracked) {
      interactionTrackedRef.current = true;
    }
  }

  function toggleSelection(
    value: string,
    currentValues: string[],
    setValues: (values: string[]) => void,
  ) {
    trackStart();
    setValues(
      currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    trackAnalyticsEvent("oem_rfq_builder_continue", {
      product_scope_count: productScopes.length,
      oem_service_count: services.length,
      evidence_count: evidence.length,
      project_stage: projectStage,
      packing_mode: packing,
      has_quantity: quantity !== oemQuantityPlanOptions[0],
      has_destination: destinationMarket !== oemDestinationRegionOptions[0],
      readiness_count: readiness.completeCount,
    });

    router.push(
      buildOemRfqHref({
        productScopes,
        services,
        evidence,
        projectStage,
        quantity,
        destinationMarket,
        packing,
      }),
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={trackStart}
      className="border border-slate-200 bg-white shadow-industrial"
    >
      <div className="grid gap-5 border-b border-slate-200 bg-arc-midnight p-5 text-white sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
            OEM RFQ Builder
          </p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight">
            Organize your private-label project.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Select only what is known now. Upload product lists, drawings, samples and artwork on
            the RFQ form for technical and commercial review.
          </p>
        </div>
        <div aria-live="polite" className="min-w-52 border-l-4 border-arc-signal bg-white/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
            RFQ preparation
          </p>
          <p className="mt-2 font-display text-3xl font-black text-white">
            {readiness.completeCount}/{readiness.totalCount}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {readiness.isComplete
              ? "Key buyer inputs are organized. Files still require review."
              : `Add ${readiness.missingKeys.map((key) => readinessLabels[key]).join(", ")}.`}
          </p>
        </div>
      </div>

      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-2">
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            1. Product scope
          </legend>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Select one family or build a mixed distributor range.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {oemProductScopeOptions.map((option) => (
              <label
                key={option}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-slate-200 bg-arc-frost px-3 py-2 text-xs font-semibold leading-5 text-slate-700 transition hover:border-arc-blue"
              >
                <input
                  type="checkbox"
                  checked={productScopes.includes(option)}
                  onChange={() => toggleSelection(option, productScopes, setProductScopes)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-arc-blue focus:ring-arc-blue"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            2. OEM services
          </legend>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Final feasibility depends on product, artwork and quantity.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {oemServiceOptions.map((option) => (
              <label
                key={option}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-slate-200 bg-arc-frost px-3 py-2 text-xs font-semibold leading-5 text-slate-700 transition hover:border-arc-blue"
              >
                <input
                  type="checkbox"
                  checked={services.includes(option)}
                  onChange={() => toggleSelection(option, services, setServices)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-arc-blue focus:ring-arc-blue"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="lg:col-span-2">
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            3. Evidence available
          </legend>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Select files or physical references that can support product and artwork review.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {oemEvidenceOptions.map((option) => (
              <label
                key={option}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-slate-200 bg-arc-frost px-3 py-2 text-xs font-semibold leading-5 text-slate-700 transition hover:border-arc-blue"
              >
                <input
                  type="checkbox"
                  checked={evidence.includes(option)}
                  onChange={() => toggleSelection(option, evidence, setEvidence)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-arc-blue focus:ring-arc-blue"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="oem-project-stage"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue"
          >
            4. Project stage
          </label>
          <select
            id="oem-project-stage"
            value={projectStage}
            onChange={(event) => setProjectStage(event.target.value)}
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {oemProjectStageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="oem-packing"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue"
          >
            5. Packing approach
          </label>
          <select
            id="oem-packing"
            value={packing}
            onChange={(event) => setPacking(event.target.value)}
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {oemPackingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="oem-quantity"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue"
          >
            6. Quantity or trial-order plan
          </label>
          <select
            id="oem-quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {oemQuantityPlanOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="oem-destination"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-arc-blue"
          >
            7. Destination region
          </label>
          <select
            id="oem-destination"
            value={destinationMarket}
            onChange={(event) => setDestinationMarket(event.target.value)}
            className="mt-3 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {oemDestinationRegionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 border-t border-slate-200 bg-arc-frost p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <p className="text-xs leading-6 text-slate-600">
          This tool prepares the RFQ only. It does not confirm product fit, artwork acceptance, MOQ,
          price or production feasibility.
        </p>
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center bg-arc-blue px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight sm:w-auto"
        >
          Continue to OEM RFQ
        </button>
      </div>
    </form>
  );
}
