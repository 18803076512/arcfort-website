"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics-events";
import {
  buildPlasmaRfqHref,
  plasmaConsumableOptions,
  plasmaPackingOptions,
} from "@/lib/plasma-rfq-builder";

type TorchFamilyOption = {
  name: string;
  documentedComponents: string[];
};

type PlasmaConsumablesRfqBuilderProps = {
  torchFamilies: TorchFamilyOption[];
};

export function PlasmaConsumablesRfqBuilder({ torchFamilies }: PlasmaConsumablesRfqBuilderProps) {
  const router = useRouter();
  const interactionTrackedRef = useRef(false);
  const [torchFamily, setTorchFamily] = useState("");
  const [components, setComponents] = useState<string[]>([]);
  const [existingReference, setExistingReference] = useState("");
  const [quantity, setQuantity] = useState("");
  const [packing, setPacking] = useState<string>(plasmaPackingOptions[0]);

  function trackStart() {
    if (interactionTrackedRef.current) {
      return;
    }

    const tracked = trackAnalyticsEvent("plasma_rfq_builder_start", {
      location: "plasma_category",
    });

    if (tracked) {
      interactionTrackedRef.current = true;
    }
  }

  function toggleComponent(component: string) {
    trackStart();
    setComponents((currentComponents) =>
      currentComponents.includes(component)
        ? currentComponents.filter((item) => item !== component)
        : [...currentComponents, component],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedFamily = torchFamily || "Unknown / other";

    trackAnalyticsEvent("plasma_rfq_builder_continue", {
      torch_family: selectedFamily,
      component_count: components.length,
      has_existing_reference: Boolean(existingReference.trim()),
      has_quantity: Boolean(quantity.trim()),
      packing_mode: packing,
    });

    router.push(
      buildPlasmaRfqHref({
        torchFamily: selectedFamily,
        components,
        existingReference,
        quantity,
        packing,
      }),
    );
  }

  const selectedFamily = torchFamilies.find((family) => family.name === torchFamily);

  return (
    <form
      onSubmit={handleSubmit}
      onChange={trackStart}
      className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">RFQ Builder</p>
          <h3 className="mt-3 font-display text-2xl font-black leading-tight text-arc-midnight">
            Prepare a plasma consumables inquiry
          </h3>
        </div>
        <p className="text-xs font-semibold leading-5 text-slate-600">
          No exact rating is inferred from your selections.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label
            htmlFor="plasma-torch-family"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Torch family or model
          </label>
          <select
            id="plasma-torch-family"
            value={torchFamily}
            onChange={(event) => setTorchFamily(event.target.value)}
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            <option value="">Unknown / other</option>
            {torchFamilies.map((family) => (
              <option key={family.name} value={family.name}>
                {family.name}
              </option>
            ))}
          </select>
          <p className="mt-2 min-h-10 text-xs leading-5 text-slate-600" aria-live="polite">
            {selectedFamily
              ? `Catalog breakdown includes: ${selectedFamily.documentedComponents.join(", ")}.`
              : "Choose a catalog reference family, or leave unknown and attach photos of the torch label and front end."}
          </p>
        </div>

        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Parts needed
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {plasmaConsumableOptions.map((component) => (
              <label
                key={component}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-slate-200 bg-arc-frost px-3 py-2 text-xs font-semibold leading-5 text-slate-700 transition hover:border-arc-blue"
              >
                <input
                  type="checkbox"
                  checked={components.includes(component)}
                  onChange={() => toggleComponent(component)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-arc-blue focus:ring-arc-blue"
                />
                <span>{component}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="plasma-existing-reference"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Existing part number or marking
          </label>
          <input
            id="plasma-existing-reference"
            type="text"
            maxLength={160}
            value={existingReference}
            onChange={(event) => setExistingReference(event.target.value)}
            placeholder="Enter only what is visible on the current part"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <div>
          <label
            htmlFor="plasma-required-quantity"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Quantity or trial-order plan
          </label>
          <input
            id="plasma-required-quantity"
            type="text"
            maxLength={120}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Example: 100 electrodes and 200 nozzles"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="plasma-packing-requirement"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Packing requirement
          </label>
          <select
            id="plasma-packing-requirement"
            value={packing}
            onChange={(event) => setPacking(event.target.value)}
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {plasmaPackingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 border-l-4 border-arc-signal bg-arc-frost p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
          Before submitting
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Attach the torch label, assembled front end, loose parts in removal order and clear views
          of both ends. ArcFort Weld will review compatibility before quotation.
        </p>
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-arc-blue px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight sm:w-auto"
      >
        Continue to RFQ
      </button>
    </form>
  );
}
