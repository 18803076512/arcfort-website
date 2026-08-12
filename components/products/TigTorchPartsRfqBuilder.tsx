"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics-events";
import {
  buildTigRfqHref,
  tigAssemblyOptions,
  tigPackingOptions,
  tigPartOptions,
} from "@/lib/tig-rfq-builder";

type TorchFamilyOption = {
  name: string;
  documentedComponents: string[];
};

type TigTorchPartsRfqBuilderProps = {
  torchFamilies: TorchFamilyOption[];
};

export function TigTorchPartsRfqBuilder({ torchFamilies }: TigTorchPartsRfqBuilderProps) {
  const router = useRouter();
  const interactionTrackedRef = useRef(false);
  const [torchFamily, setTorchFamily] = useState("");
  const [assemblyArrangement, setAssemblyArrangement] = useState<string>(tigAssemblyOptions[0]);
  const [components, setComponents] = useState<string[]>([]);
  const [tungstenReference, setTungstenReference] = useState("");
  const [partReference, setPartReference] = useState("");
  const [quantity, setQuantity] = useState("");
  const [packing, setPacking] = useState<string>(tigPackingOptions[0]);

  function trackStart() {
    if (interactionTrackedRef.current) {
      return;
    }

    const tracked = trackAnalyticsEvent("tig_rfq_builder_start", {
      location: "tig_category",
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

    trackAnalyticsEvent("tig_rfq_builder_continue", {
      torch_family: selectedFamily,
      assembly_arrangement: assemblyArrangement,
      component_count: components.length,
      has_tungsten_reference: Boolean(tungstenReference.trim()),
      has_part_reference: Boolean(partReference.trim()),
      has_quantity: Boolean(quantity.trim()),
      packing_mode: packing,
    });

    router.push(
      buildTigRfqHref({
        torchFamily: selectedFamily,
        assemblyArrangement,
        components,
        tungstenReference,
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
            Prepare a TIG torch parts inquiry
          </h3>
        </div>
        <p className="text-xs font-semibold leading-5 text-slate-600">
          Selections organize the RFQ; they do not confirm fit.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label
            htmlFor="tig-torch-family"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Torch series or model
          </label>
          <select
            id="tig-torch-family"
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
              : "Leave unknown when the label is missing, then attach complete-torch and connection photos."}
          </p>
        </div>

        <div>
          <label
            htmlFor="tig-assembly-arrangement"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Front-end arrangement
          </label>
          <select
            id="tig-assembly-arrangement"
            value={assemblyArrangement}
            onChange={(event) => setAssemblyArrangement(event.target.value)}
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {tigAssemblyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="mt-2 min-h-10 text-xs leading-5 text-slate-600">
            Cup number alone does not show whether the torch uses a standard collet body or gas
            lens.
          </p>
        </div>

        <fieldset className="lg:col-span-2">
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Parts needed
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tigPartOptions.map((component) => (
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
            htmlFor="tig-tungsten-reference"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Tungsten diameter, if documented
          </label>
          <input
            id="tig-tungsten-reference"
            type="text"
            maxLength={80}
            value={tungstenReference}
            onChange={(event) => setTungstenReference(event.target.value)}
            placeholder="Enter the package, drawing or measured reference"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <div>
          <label
            htmlFor="tig-part-reference"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Cup number or visible part reference
          </label>
          <input
            id="tig-part-reference"
            type="text"
            maxLength={160}
            value={partReference}
            onChange={(event) => setPartReference(event.target.value)}
            placeholder="Copy only the marking visible on the current part"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <div>
          <label
            htmlFor="tig-required-quantity"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Quantity or trial-order plan
          </label>
          <input
            id="tig-required-quantity"
            type="text"
            maxLength={120}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Example: 100 cups and 50 gas lenses"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <div>
          <label
            htmlFor="tig-packing-requirement"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Packing requirement
          </label>
          <select
            id="tig-packing-requirement"
            value={packing}
            onChange={(event) => setPacking(event.target.value)}
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {tigPackingOptions.map((option) => (
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
          Attach the complete torch and label first. Then show the cup, body or gas lens, collet,
          tungsten and back cap in removal order, plus clear thread and connection views.
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
