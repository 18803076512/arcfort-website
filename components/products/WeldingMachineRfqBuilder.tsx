"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics-events";
import {
  buildWeldingMachineRfqHref,
  weldingMachineAccessoryOptions,
  weldingMachineArrangementOptions,
  weldingMachineDocumentOptions,
  weldingMachinePackingOptions,
  weldingMachineProcessOptions,
} from "@/lib/welding-machine-rfq-builder";

export function WeldingMachineRfqBuilder() {
  const router = useRouter();
  const interactionTrackedRef = useRef(false);
  const [processes, setProcesses] = useState<string[]>([]);
  const [application, setApplication] = useState("");
  const [electricalInput, setElectricalInput] = useState("");
  const [arrangement, setArrangement] = useState<string>(weldingMachineArrangementOptions[0]);
  const [accessories, setAccessories] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [destination, setDestination] = useState("");
  const [quantity, setQuantity] = useState("");
  const [packing, setPacking] = useState<string>(weldingMachinePackingOptions[0]);

  function trackStart() {
    if (interactionTrackedRef.current) {
      return;
    }

    const tracked = trackAnalyticsEvent("machine_rfq_builder_start", {
      location: "welding_machines_category",
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

    trackAnalyticsEvent("machine_rfq_builder_continue", {
      process_count: processes.length,
      accessory_count: accessories.length,
      document_count: documents.length,
      has_application: Boolean(application.trim()),
      has_electrical_input: Boolean(electricalInput.trim()),
      has_destination: Boolean(destination.trim()),
      has_quantity: Boolean(quantity.trim()),
      arrangement_mode: arrangement,
      packing_mode: packing,
    });

    router.push(
      buildWeldingMachineRfqHref({
        processes,
        application,
        electricalInput,
        arrangement,
        accessories,
        documents,
        destination,
        quantity,
        packing,
      }),
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={trackStart}
      data-hide-sticky-contact-when-visible
      className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">RFQ Builder</p>
          <h3 className="mt-3 font-display text-2xl font-black leading-tight text-arc-midnight">
            Prepare a welding machine sourcing brief
          </h3>
        </div>
        <p className="max-w-sm text-xs font-semibold leading-5 text-slate-600">
          Buyer requirements organize the RFQ; the proposed model and technical data remain subject
          to document review.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <fieldset className="lg:col-span-2">
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Required welding or cutting process
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {weldingMachineProcessOptions.map((process) => (
              <label
                key={process}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-slate-200 bg-arc-frost px-3 py-2 text-xs font-semibold leading-5 text-slate-700 transition hover:border-arc-blue"
              >
                <input
                  type="checkbox"
                  checked={processes.includes(process)}
                  onChange={() => toggleSelection(process, setProcesses)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-arc-blue focus:ring-arc-blue"
                />
                <span>{process}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor="machine-application" className="block">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Application and work requirement
          </span>
          <textarea
            id="machine-application"
            rows={3}
            maxLength={240}
            value={application}
            onChange={(event) => setApplication(event.target.value)}
            placeholder="Describe material, work type, workshop use or distributor market requirement"
            className="mt-2 block w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </label>

        <div>
          <label
            htmlFor="machine-electrical-input"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Destination electrical input, if documented
          </label>
          <input
            id="machine-electrical-input"
            type="text"
            maxLength={160}
            value={electricalInput}
            onChange={(event) => setElectricalInput(event.target.value)}
            placeholder="Enter voltage, frequency and phase only from the site requirement"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Leave blank when unknown. ArcFort Weld will request confirmation before model selection.
          </p>
        </div>

        <div>
          <label
            htmlFor="machine-arrangement"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Preferred equipment arrangement
          </label>
          <select
            id="machine-arrangement"
            value={arrangement}
            onChange={(event) => setArrangement(event.target.value)}
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {weldingMachineArrangementOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="machine-destination"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Destination country
          </label>
          <input
            id="machine-destination"
            type="text"
            maxLength={120}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Country where the equipment will be installed or sold"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <fieldset className="lg:col-span-2">
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Accessories to include or quote separately
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {weldingMachineAccessoryOptions.map((accessory) => (
              <label
                key={accessory}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-slate-200 bg-arc-frost px-3 py-2 text-xs font-semibold leading-5 text-slate-700 transition hover:border-arc-blue"
              >
                <input
                  type="checkbox"
                  checked={accessories.includes(accessory)}
                  onChange={() => toggleSelection(accessory, setAccessories)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-arc-blue focus:ring-arc-blue"
                />
                <span>{accessory}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="lg:col-span-2">
          <legend className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Documents requested for the proposed model
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {weldingMachineDocumentOptions.map((document) => (
              <label
                key={document}
                className="flex min-h-12 cursor-pointer items-center gap-3 border border-slate-200 bg-arc-frost px-3 py-2 text-xs font-semibold leading-5 text-slate-700 transition hover:border-arc-blue"
              >
                <input
                  type="checkbox"
                  checked={documents.includes(document)}
                  onChange={() => toggleSelection(document, setDocuments)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-arc-blue focus:ring-arc-blue"
                />
                <span>{document}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="machine-quantity"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Quantity or trial-order plan
          </label>
          <input
            id="machine-quantity"
            type="text"
            maxLength={120}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Example: 2 trial units / 20 units for distributor review"
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          />
        </div>

        <div>
          <label
            htmlFor="machine-packing"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
          >
            Packing or OEM requirement
          </label>
          <select
            id="machine-packing"
            value={packing}
            onChange={(event) => setPacking(event.target.value)}
            className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
          >
            {weldingMachinePackingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 border-l-4 border-arc-signal bg-arc-frost p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
          Technical confirmation boundary
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          This brief records buyer requirements only. Output ratings, duty cycle, interfaces,
          included accessories and compliance documents must be confirmed for the exact proposed
          model before quotation and order approval.
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
