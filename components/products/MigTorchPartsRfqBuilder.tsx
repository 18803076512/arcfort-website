"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics-events";
import {
  buildMigRfqHref,
  migPackingOptions,
  migPartOptions,
  migTorchArrangementOptions,
} from "@/lib/mig-rfq-builder";

type TorchFamilyOption = {
  name: string;
  documentedComponents: string[];
};

type MigTorchPartsRfqBuilderProps = {
  torchFamilies: TorchFamilyOption[];
};

export function MigTorchPartsRfqBuilder({ torchFamilies }: MigTorchPartsRfqBuilderProps) {
  const router = useRouter();
  const interactionTrackedRef = useRef(false);
  const [torchFamily, setTorchFamily] = useState("");
  const [torchArrangement, setTorchArrangement] = useState<string>(migTorchArrangementOptions[0]);
  const [components, setComponents] = useState<string[]>([]);
  const [wireReference, setWireReference] = useState("");
  const [partReference, setPartReference] = useState("");
  const [quantity, setQuantity] = useState("");
  const [packing, setPacking] = useState<string>(migPackingOptions[0]);

  function trackStart() {
    if (interactionTrackedRef.current) {
      return;
    }

    const tracked = trackAnalyticsEvent("mig_rfq_builder_start", {
      location: "mig_category",
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

    trackAnalyticsEvent("mig_rfq_builder_continue", {
      torch_family: selectedFamily,
      torch_arrangement: torchArrangement,
      component_count: components.length,
      has_wire_reference: Boolean(wireReference.trim()),
      has_part_reference: Boolean(partReference.trim()),
      has_quantity: Boolean(quantity.trim()),
      packing_mode: packing,
    });

    router.push(
      buildMigRfqHref({
        torchFamily: selectedFamily,
        torchArrangement,
        components,
        wireReference,
        partReference,
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
            Prepare a MIG/MAG torch parts inquiry
          </h3>
        </div>
        <p className="text-xs font-semibold leading-5 text-slate-600">
          Selections organize the RFQ; they do not confirm fit.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label
            htmlFor="mig-torch-family"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Catalog series or torch model
          </label>
          <select
            id="mig-torch-family"
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
              : "Leave unknown when the label is missing, then attach the complete torch and its connections."}
          </p>
        </div>

        <div>
          <label
            htmlFor="mig-torch-arrangement"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Torch or cooling arrangement
          </label>
          <select
            id="mig-torch-arrangement"
            value={torchArrangement}
            onChange={(event) => setTorchArrangement(event.target.value)}
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {migTorchArrangementOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="mt-2 min-h-10 text-xs leading-5 text-slate-600">
            Similar series names can still use different front-end stacks, cooling paths or rear
            connections.
          </p>
        </div>

        <fieldset className="lg:col-span-2">
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Parts needed
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {migPartOptions.map((component) => (
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
            htmlFor="mig-wire-reference"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Welding wire diameter, if documented
          </label>
          <input
            id="mig-wire-reference"
            type="text"
            maxLength={100}
            value={wireReference}
            onChange={(event) => setWireReference(event.target.value)}
            placeholder="Copy the tip marking, wire package or drawing value"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <div>
          <label
            htmlFor="mig-part-reference"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Visible part, drawing or OEM reference
          </label>
          <input
            id="mig-part-reference"
            type="text"
            maxLength={180}
            value={partReference}
            onChange={(event) => setPartReference(event.target.value)}
            placeholder="Copy only the reference visible in buyer evidence"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <div>
          <label
            htmlFor="mig-required-quantity"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Quantity or trial-order plan
          </label>
          <input
            id="mig-required-quantity"
            type="text"
            maxLength={120}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Example: 1,000 tips and 200 nozzles"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <div>
          <label
            htmlFor="mig-packing-requirement"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Packing requirement
          </label>
          <select
            id="mig-packing-requirement"
            value={packing}
            onChange={(event) => setPacking(event.target.value)}
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {migPackingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 border-l-4 border-arc-signal bg-arc-frost p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
          Evidence for compatibility review
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Attach the complete torch and model label first. Then show the nozzle, diffuser or holder,
          contact tip and insulator in removal order, plus liner ends and rear connections when
          included.
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
