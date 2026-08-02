"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { useRfqList } from "@/components/rfq/useRfqList";
import { trackAnalyticsEvent } from "@/lib/analytics-events";
import { siteConfig } from "@/lib/content/site";
import {
  buildRfqProductRequirements,
  clearRfqList,
  removeRfqListItem,
  rfqLineItemFieldLimits,
  type RfqListItem,
  updateRfqListItem,
} from "@/lib/rfq-list";
import {
  emptySourceAttribution,
  sourceAttributionFields,
  sourceAttributionStorageKey,
  type SourceAttribution,
} from "@/lib/source-attribution";
import {
  rfqAllowedFileExtensions,
  rfqFieldLimits,
  type RfqTextValues,
  validateRfqFiles,
  validateRfqTextValues,
} from "@/lib/rfq-constraints";
import {
  getRfqSubmissionFailureMessage,
  isRfqSubmissionAbortError,
  rfqSubmissionTimeoutMs,
  rfqSubmissionTimeoutSeconds,
} from "@/lib/rfq-client";

type RfqFormValues = RfqTextValues;

type FormErrorKey = keyof RfqFormValues | "attachments" | "submission";
type FormErrors = Partial<Record<FormErrorKey, string>>;

type RfqResponse = {
  ok: boolean;
  stored?: boolean;
  backendConfigured?: boolean;
  storageDeliveryComplete?: boolean;
  attachmentsStored?: boolean;
  storageAttachmentCount?: number;
  emailConfigured?: boolean;
  emailDelivered?: boolean;
  emailRecipient?: string;
  emailAttachmentCount?: number;
  buyerConfirmationDelivered?: boolean;
  reference?: string;
  message?: string;
  errors?: FormErrors;
};

const initialValues: RfqFormValues = {
  name: "",
  company: "",
  email: "",
  whatsapp: "",
  country: "",
  productRequirements: "",
  quantity: "",
  message: "",
};

const rfqQuickTemplates = [
  {
    title: "Mixed consumables list",
    description: "For distributors buying several welding torch consumables together.",
    productRequirements:
      "Mixed welding consumables inquiry: MIG/MAG torch parts, TIG torch parts, plasma cutting consumables or welding accessories. Please review by product list, photo, drawing or reference part.",
    quantity: "Mixed order / quantity to be confirmed",
    message:
      "Please quote available items, MOQ, lead time, export packing options and shipment from Tianjin Port.",
  },
  {
    title: "OEM packaging request",
    description: "For private label, logo or carton design discussion.",
    productRequirements:
      "OEM welding product inquiry. Products, logo artwork, label requirement, carton design and packaging details can be provided for review.",
    quantity: "Quantity depends on MOQ and packaging requirement",
    message:
      "Please confirm OEM packaging options, MOQ policy, lead time and what artwork files are required.",
  },
  {
    title: "Replacement part check",
    description: "For matching by drawing, current part or model reference.",
    productRequirements:
      "Replacement welding part inquiry. Compatibility should be confirmed by sample photo, drawing, torch model, machine model or existing reference part.",
    quantity: "Small trial order first, repeat order after confirmation",
    message:
      "Please review fit, material, size and packaging details after the reference information is provided.",
  },
  {
    title: "Machine and accessory inquiry",
    description: "For welding machines, cutting machines and workshop accessories.",
    productRequirements:
      "Welding machine, cutting machine or welding accessory inquiry. Required process, application, accessories and destination country can be provided for quotation review.",
    quantity: "Quantity to be confirmed",
    message:
      "Please confirm available models, accessory scope, packing, payment terms and delivery options.",
  },
] as const;

const clientRequiredFields: Array<keyof RfqFormValues> = ["name", "company", "email", "country"];

function focusFirstInvalidField(nextErrors: FormErrors) {
  const firstField = (Object.keys(nextErrors) as FormErrorKey[]).find(
    (field) => field !== "submission",
  );

  if (!firstField) {
    return;
  }

  window.requestAnimationFrame(() => {
    const field = document.getElementById(firstField);

    if (!field) {
      return;
    }

    field.focus({ preventScroll: true });
    field.scrollIntoView({ block: "center", inline: "nearest" });
  });
}

function createFileSummary(files: File[]) {
  if (files.length === 0) {
    return "No attachment selected";
  }

  return files.map((file) => file.name).join(", ");
}

function createFallbackExcerpt(value: string, limit: number) {
  const trimmedValue = value.trim();

  if (trimmedValue.length <= limit) {
    return trimmedValue;
  }

  return `${trimmedValue.slice(0, limit).trimEnd()}\n[Additional details shortened. Please paste the full list or attach it.]`;
}

function getStoredSourceAttribution(): SourceAttribution {
  try {
    const rawValue = window.sessionStorage.getItem(sourceAttributionStorageKey);
    const parsedValue = rawValue ? (JSON.parse(rawValue) as Partial<SourceAttribution>) : {};

    return {
      ...emptySourceAttribution(),
      ...parsedValue,
    };
  } catch {
    return emptySourceAttribution();
  }
}

type RfqFormProps = {
  initialProduct?: string;
};

export function RfqForm({ initialProduct = "" }: RfqFormProps) {
  const [values, setValues] = useState<RfqFormValues>({
    ...initialValues,
    productRequirements: initialProduct,
  });
  const [website, setWebsite] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<RfqResponse | null>(null);
  const [failedReference, setFailedReference] = useState("");
  const [submittedRequirements, setSubmittedRequirements] = useState("");
  const selectedProducts = useRfqList();
  const hasCompleteLineItemQuantities =
    selectedProducts.length > 0 &&
    selectedProducts.every((item) => Boolean(item.requestedQuantity?.trim()));
  const quantityForSubmission =
    values.quantity.trim() ||
    (hasCompleteLineItemQuantities ? "See selected product line quantities" : "");

  const fileSummary = useMemo(() => createFileSummary(attachments), [attachments]);

  useEffect(() => {
    if (selectedProducts.length === 0) {
      return;
    }

    setErrors((currentErrors) => {
      if (!currentErrors.productRequirements && !currentErrors.submission) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        productRequirements: undefined,
        submission: undefined,
      };
    });
    setFailedReference("");
  }, [selectedProducts.length]);

  function updateValue(field: keyof RfqFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
      submission: undefined,
    }));
    setFailedReference("");
  }

  function applyQuickTemplate(template: (typeof rfqQuickTemplates)[number]) {
    setValues((currentValues) => {
      const currentRequirements = currentValues.productRequirements.trim();

      return {
        ...currentValues,
        productRequirements: currentRequirements
          ? `${currentRequirements}\n\n${template.productRequirements}`
          : template.productRequirements,
        quantity: currentValues.quantity.trim() ? currentValues.quantity : template.quantity,
        message: currentValues.message.trim() ? currentValues.message : template.message,
      };
    });
    setErrors((currentErrors) => ({
      ...currentErrors,
      productRequirements: undefined,
      quantity: undefined,
      message: undefined,
      submission: undefined,
    }));
    setFailedReference("");
  }

  function validateForm() {
    const requiredFields = hasCompleteLineItemQuantities
      ? clientRequiredFields
      : [...clientRequiredFields, "quantity" as const];
    const nextErrors: FormErrors = validateRfqTextValues(
      {
        ...values,
        quantity: quantityForSubmission,
      },
      requiredFields,
    );

    if (selectedProducts.length === 0 && !values.productRequirements.trim()) {
      nextErrors.productRequirements =
        "Add at least one product to your RFQ list or describe the products you need.";
    }

    const combinedRequirements = buildRfqProductRequirements(
      selectedProducts,
      values.productRequirements,
    );

    if (combinedRequirements.length > rfqFieldLimits.productRequirements) {
      nextErrors.productRequirements =
        "The combined product list and requirements are too long. Remove a few items or attach the full list as a CSV, Excel or PDF file.";
    }

    const fileError = validateRfqFiles(attachments);

    if (fileError) {
      nextErrors.attachments = fileError;
    }

    setErrors(nextErrors);
    focusFirstInvalidField(nextErrors);
    return nextErrors;
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    setAttachments(selectedFiles);
    setErrors((currentErrors) => ({
      ...currentErrors,
      attachments: undefined,
      submission: undefined,
    }));
    setFailedReference("");
  }

  function handleRemoveSelectedProduct(item: RfqListItem) {
    removeRfqListItem(item);
    setErrors((currentErrors) => ({
      ...currentErrors,
      productRequirements: undefined,
      submission: undefined,
    }));
    setFailedReference("");
    trackAnalyticsEvent("rfq_list_remove", {
      item_name: item.name,
      item_sku: item.sku,
      location: "rfq_form",
    });
  }

  function handleLineItemChange(
    item: RfqListItem,
    field: "requestedQuantity" | "buyerReference",
    value: string,
  ) {
    updateRfqListItem(item, { [field]: value });
    setErrors((currentErrors) => ({
      ...currentErrors,
      quantity: undefined,
      submission: undefined,
    }));
    setFailedReference("");
  }

  function handleClearSelectedProducts() {
    clearRfqList();
    setErrors((currentErrors) => ({
      ...currentErrors,
      productRequirements: undefined,
      submission: undefined,
    }));
    setFailedReference("");
    trackAnalyticsEvent("rfq_list_clear", {
      item_count: selectedProducts.length,
      location: "rfq_form",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      trackAnalyticsEvent("rfq_validation_error", {
        error_count: Object.keys(validationErrors).length,
        attachment_count: attachments.length,
        selected_product_count: selectedProducts.length,
      });
      return;
    }

    const productRequirements = buildRfqProductRequirements(
      selectedProducts,
      values.productRequirements,
    );

    setIsSubmitting(true);
    setErrors((currentErrors) => ({
      ...currentErrors,
      submission: undefined,
    }));
    setFailedReference("");
    trackAnalyticsEvent("rfq_submit_start", {
      attachment_count: attachments.length,
      selected_product_count: selectedProducts.length,
      has_additional_requirements: Boolean(values.productRequirements.trim()),
    });

    const formData = new FormData();
    const sourceAttribution = getStoredSourceAttribution();

    formData.append("name", values.name);
    formData.append("company", values.company);
    formData.append("email", values.email);
    formData.append("whatsapp", values.whatsapp);
    formData.append("country", values.country);
    formData.append("productRequirements", productRequirements);
    formData.append("quantity", quantityForSubmission);
    formData.append("message", values.message);
    formData.append("website", website);
    formData.append("startedAt", String(startedAt));
    formData.append("sourcePath", window.location.pathname + window.location.search);

    for (const field of sourceAttributionFields) {
      formData.append(field, sourceAttribution[field]);
    }

    for (const file of attachments) {
      formData.append("attachments", file);
    }

    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(
      () => requestController.abort(),
      rfqSubmissionTimeoutMs,
    );

    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        body: formData,
        signal: requestController.signal,
      });
      const result = (await response.json()) as RfqResponse;

      if (!response.ok || !result.ok) {
        const responseErrors =
          result.errors ??
          ({
            submission:
              result.message ??
              "Automated RFQ delivery is unavailable. Please use email or WhatsApp.",
          } satisfies FormErrors);

        setFailedReference(result.reference ?? "");
        setErrors(responseErrors);
        focusFirstInvalidField(responseErrors);
        trackAnalyticsEvent("rfq_submit_error", {
          failure_stage: "server_response",
          http_status: response.status,
          server_validation_error: Boolean(result.errors),
          attachment_count: attachments.length,
          selected_product_count: selectedProducts.length,
        });
        return;
      }

      const analyticsItems = selectedProducts.map((item) => ({
        item_id: item.sku,
        item_name: item.name,
        item_brand: "ArcFort Weld",
        item_category: item.category,
      }));

      setSubmittedRequirements(productRequirements);
      setSubmissionResult(result);
      setIsSubmitted(true);
      clearRfqList();
      trackAnalyticsEvent("rfq_submit_success", {
        email_delivered: Boolean(result.emailDelivered),
        buyer_confirmation_delivered: Boolean(result.buyerConfirmationDelivered),
        attachment_count: result.emailAttachmentCount ?? 0,
        selected_product_count: selectedProducts.length,
        backend_configured: Boolean(result.backendConfigured),
        stored: Boolean(result.stored),
        storage_delivery_complete: Boolean(result.storageDeliveryComplete),
        attachments_stored: Boolean(result.attachmentsStored),
        delivery_channel:
          result.emailDelivered && result.stored
            ? "email_and_storage"
            : result.emailDelivered
              ? "email"
              : "storage",
      });
      trackAnalyticsEvent("generate_lead", {
        lead_source: selectedProducts.length > 0 ? "rfq_shortlist" : "rfq_form",
        items: analyticsItems.length > 0 ? analyticsItems : undefined,
      });
    } catch (error) {
      const timedOut = isRfqSubmissionAbortError(error);

      setFailedReference("");
      setErrors({
        submission: getRfqSubmissionFailureMessage(error),
      });
      trackAnalyticsEvent("rfq_submit_error", {
        failure_stage: timedOut ? "request_timeout" : "network_or_parse",
        timeout_seconds: timedOut ? rfqSubmissionTimeoutSeconds : undefined,
        attachment_count: attachments.length,
        selected_product_count: selectedProducts.length,
      });
    } finally {
      window.clearTimeout(requestTimeout);
      setIsSubmitting(false);
    }
  }

  const fallbackRequirements = createFallbackExcerpt(
    buildRfqProductRequirements(selectedProducts, values.productRequirements),
    2400,
  );
  const fallbackAdditionalMessage = createFallbackExcerpt(values.message, 800);
  const fallbackSubject = encodeURIComponent(
    failedReference
      ? `ArcFort Weld RFQ ${failedReference} - ${values.company || "Buyer Inquiry"}`
      : `ArcFort Weld RFQ - ${values.company || "Buyer Inquiry"}`,
  );
  const fallbackMessage = [
    ...(failedReference ? [`RFQ Reference: ${failedReference}`, ""] : []),
    `Name: ${values.name || "Not provided"}`,
    `Company: ${values.company || "Not provided"}`,
    `Email: ${values.email || "Not provided"}`,
    `WhatsApp: ${values.whatsapp || "Not provided"}`,
    `Country: ${values.country || "Not provided"}`,
    `Quantity: ${quantityForSubmission || "Not provided"}`,
    "",
    "Product Requirements:",
    fallbackRequirements || "Not provided",
    "",
    "Message:",
    fallbackAdditionalMessage || "No additional message.",
  ].join("\n");
  const fallbackEmailHref = `${siteConfig.emailHref}?subject=${fallbackSubject}&body=${encodeURIComponent(fallbackMessage)}`;
  const fallbackWhatsappHref = `${siteConfig.whatsappHref}?text=${encodeURIComponent(fallbackMessage)}`;

  if (isSubmitted) {
    const submittedProductRequirements =
      submittedRequirements || values.productRequirements || "Product details sent with RFQ.";

    return (
      <div className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="border-l-4 border-arc-signal bg-arc-frost p-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-arc-blue">
            Inquiry Received
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
            Thank you for your inquiry.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {submissionResult?.emailDelivered
              ? "Your RFQ has been sent to the ArcFort Weld sales email for follow-up."
              : "Your RFQ has been securely recorded for sales follow-up."}
          </p>
          {submissionResult?.reference ? (
            <p className="mt-3 text-sm font-bold text-arc-midnight">
              RFQ Reference: {submissionResult.reference}
            </p>
          ) : null}
          {submissionResult?.emailDelivered && submissionResult.emailAttachmentCount ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Attachments included in email: {submissionResult.emailAttachmentCount}
            </p>
          ) : null}
          {!submissionResult?.emailDelivered &&
          submissionResult?.attachmentsStored &&
          submissionResult.storageAttachmentCount ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Attachments stored with this inquiry: {submissionResult.storageAttachmentCount}
            </p>
          ) : null}
          {submissionResult?.buyerConfirmationDelivered ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              A confirmation copy has also been sent to {values.email}.
            </p>
          ) : null}
        </div>
        <div className="mt-6 grid gap-4 text-sm text-slate-700">
          <p>
            <span className="font-bold text-arc-midnight">Company:</span> {values.company}
          </p>
          <p>
            <span className="font-bold text-arc-midnight">Email:</span> {values.email}
          </p>
          <div>
            <span className="font-bold text-arc-midnight">Products:</span>
            <p className="mt-1 whitespace-pre-line leading-6">{submittedProductRequirements}</p>
          </div>
          <p>
            <span className="font-bold text-arc-midnight">Attachments:</span> {fileSummary}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setValues(initialValues);
            setAttachments([]);
            setErrors({});
            setSubmissionResult(null);
            setFailedReference("");
            setSubmittedRequirements("");
            setIsSubmitted(false);
          }}
          className="mt-6 bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
        >
          Submit Another RFQ
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <label className="sr-only" htmlFor="website">
        Website
      </label>
      <input
        id="website"
        name="website"
        type="text"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        autoComplete="off"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
      />
      {errors.submission ? (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-950"
        >
          <p className="font-black">Automated delivery needs your attention.</p>
          <p className="mt-2 leading-6">{errors.submission}</p>
          {failedReference ? (
            <p className="mt-2 font-bold">RFQ Reference: {failedReference}</p>
          ) : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              href={fallbackEmailHref}
              className="inline-flex min-h-11 items-center justify-center border border-red-300 bg-white px-4 font-bold transition hover:border-red-700"
            >
              Email {siteConfig.email}
            </a>
            <a
              href={fallbackWhatsappHref}
              className="inline-flex min-h-11 items-center justify-center border border-red-300 bg-white px-4 font-bold transition hover:border-red-700"
            >
              WhatsApp {siteConfig.whatsapp}
            </a>
          </div>
        </div>
      ) : null}
      <section
        id="selected-products"
        className="mb-6 scroll-mt-32 border-y-4 border-arc-signal bg-arc-midnight p-4 text-white sm:p-5"
        aria-labelledby="selected-products-title"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2
                id="selected-products-title"
                className="font-display text-2xl font-black text-white"
              >
                Selected Products
              </h2>
              <span className="inline-flex h-7 min-w-7 items-center justify-center bg-arc-signal px-2 text-xs font-black text-arc-midnight">
                {selectedProducts.length}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Build one inquiry from several product pages. Add quantity and a model, size or
              drawing reference for each line when available; SKU and category details are included
              automatically.
            </p>
          </div>
          {selectedProducts.length > 0 ? (
            <button
              type="button"
              onClick={handleClearSelectedProducts}
              className="min-h-10 self-start border border-white/30 px-3 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:border-arc-signal hover:text-arc-signal"
            >
              Clear List
            </button>
          ) : null}
        </div>

        {selectedProducts.length > 0 ? (
          <div className="mt-5 divide-y divide-white/15 border-y border-white/15">
            {selectedProducts.map((item) => (
              <div
                key={`${item.categorySlug}/${item.slug}`}
                className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-[minmax(12rem,0.8fr)_minmax(9rem,0.35fr)_minmax(14rem,0.65fr)_auto] lg:items-end"
              >
                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <Link
                    href={`/products/${item.categorySlug}/${item.slug}`}
                    className="break-words font-bold text-white transition hover:text-arc-signal"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 break-words text-xs leading-5 text-slate-300">
                    SKU: {item.sku} | {item.category}
                  </p>
                </div>
                <label
                  htmlFor={`line-quantity-${item.categorySlug}-${item.slug}`}
                  className="block min-w-0"
                >
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-300">
                    Quantity / Unit
                  </span>
                  <input
                    id={`line-quantity-${item.categorySlug}-${item.slug}`}
                    type="text"
                    value={item.requestedQuantity ?? ""}
                    maxLength={rfqLineItemFieldLimits.requestedQuantity}
                    placeholder="500 pcs"
                    onChange={(event) =>
                      handleLineItemChange(item, "requestedQuantity", event.target.value)
                    }
                    className="mt-2 min-h-11 w-full border-white/20 bg-white/10 text-sm text-white placeholder:text-slate-400 focus:border-arc-signal focus:ring-arc-signal"
                  />
                </label>
                <label
                  htmlFor={`line-reference-${item.categorySlug}-${item.slug}`}
                  className="block min-w-0"
                >
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-300">
                    Variant / Model / Reference
                  </span>
                  <input
                    id={`line-reference-${item.categorySlug}-${item.slug}`}
                    type="text"
                    value={item.buyerReference ?? ""}
                    maxLength={rfqLineItemFieldLimits.buyerReference}
                    placeholder="M6 1.0 mm / drawing item 2"
                    onChange={(event) =>
                      handleLineItemChange(item, "buyerReference", event.target.value)
                    }
                    className="mt-2 min-h-11 w-full border-white/20 bg-white/10 text-sm text-white placeholder:text-slate-400 focus:border-arc-signal focus:ring-arc-signal"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveSelectedProduct(item)}
                  className="min-h-11 w-full border border-white/25 px-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-200 transition hover:border-arc-signal hover:text-arc-signal sm:w-auto lg:shrink-0"
                  aria-label={`Remove ${item.name} from RFQ list`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3 border-t border-white/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-300">
              No products selected yet. You can still enter your requirements manually below.
            </p>
            <Link
              href="/products"
              className="inline-flex min-h-10 self-start items-center justify-center bg-arc-signal px-4 text-xs font-bold uppercase tracking-[0.1em] text-arc-midnight transition hover:bg-white sm:shrink-0"
            >
              Browse Products
            </Link>
          </div>
        )}
      </section>
      <details className="group mb-6 border border-slate-200 bg-arc-frost">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 p-4 marker:hidden sm:p-5">
          <span className="min-w-0">
            <span className="block font-display text-xl font-black text-arc-midnight">
              Quick RFQ starters
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-600">
              Optional guidance for common buying scenarios.
            </span>
          </span>
          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-arc-blue">
            <span className="group-open:hidden">Open</span>
            <span className="hidden group-open:inline">Close</span>
          </span>
        </summary>
        <div className="border-t border-slate-200 p-4 sm:p-5">
          <p className="text-sm leading-6 text-slate-600">
            Choose a scenario to prefill product requirements, then edit the details before
            submitting.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {rfqQuickTemplates.map((template) => (
              <button
                key={template.title}
                type="button"
                onClick={() => applyQuickTemplate(template)}
                className="min-h-24 border border-slate-200 bg-white p-4 text-left transition hover:border-arc-blue hover:bg-slate-50"
              >
                <span className="block text-sm font-black text-arc-midnight">{template.title}</span>
                <span className="mt-2 block text-xs font-semibold leading-5 text-slate-600">
                  {template.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </details>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="name"
          label="Name"
          value={values.name}
          error={errors.name}
          required
          autoComplete="name"
          placeholder="Your full name"
          onChange={(value) => updateValue("name", value)}
        />
        <FormField
          id="company"
          label="Company"
          value={values.company}
          error={errors.company}
          required
          autoComplete="organization"
          placeholder="Company name"
          onChange={(value) => updateValue("company", value)}
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          value={values.email}
          error={errors.email}
          required
          autoComplete="email"
          placeholder="name@company.com"
          onChange={(value) => updateValue("email", value)}
        />
        <FormField
          id="whatsapp"
          label="WhatsApp"
          value={values.whatsapp}
          error={errors.whatsapp}
          autoComplete="tel"
          placeholder="+1 000 000 0000"
          onChange={(value) => updateValue("whatsapp", value)}
        />
        <FormField
          id="country"
          label="Country"
          value={values.country}
          error={errors.country}
          required
          autoComplete="country-name"
          placeholder="Destination country"
          onChange={(value) => updateValue("country", value)}
        />
        <FormField
          id="quantity"
          label="Overall Quantity / Order Plan"
          value={values.quantity}
          error={errors.quantity}
          required={!hasCompleteLineItemQuantities}
          placeholder={
            hasCompleteLineItemQuantities
              ? "Optional summary; line quantities are listed above"
              : "Example: 500 pcs / mixed order"
          }
          onChange={(value) => updateValue("quantity", value)}
        />
      </div>

      <label htmlFor="productRequirements" className="mt-5 block">
        <span className="text-sm font-bold text-arc-midnight">
          {selectedProducts.length > 0 ? "Additional Product Requirements" : "Product Requirements"}{" "}
          {selectedProducts.length === 0 ? (
            <span className="text-arc-copper">*</span>
          ) : (
            <span className="font-normal text-slate-500">(optional)</span>
          )}
        </span>
        <textarea
          id="productRequirements"
          name="productRequirements"
          rows={5}
          maxLength={rfqFieldLimits.productRequirements}
          value={values.productRequirements}
          onChange={(event) => updateValue("productRequirements", event.target.value)}
          placeholder={
            selectedProducts.length > 0
              ? "Add size, material, torch model, compatibility, packaging or OEM requirements for the selected products."
              : "Product names, part numbers, torch models, material, size, thread, compatible brand or OEM number."
          }
          className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
          required={selectedProducts.length === 0}
          aria-required={selectedProducts.length === 0}
          aria-invalid={Boolean(errors.productRequirements)}
          aria-describedby={errors.productRequirements ? "productRequirements-error" : undefined}
        />
        {errors.productRequirements ? (
          <p id="productRequirements-error" className="mt-2 text-sm font-semibold text-red-700">
            {errors.productRequirements}
          </p>
        ) : null}
      </label>

      <label htmlFor="message" className="mt-5 block">
        <span className="text-sm font-bold text-arc-midnight">Message</span>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={rfqFieldLimits.message}
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          placeholder="Packaging requirement, target market, delivery schedule, OEM request or additional notes."
          className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
        />
      </label>

      <div className="mt-5">
        <label htmlFor="attachments" className="block">
          <span className="text-sm font-bold text-arc-midnight">
            Drawing / Product List / PDF Upload
          </span>
          <input
            id="attachments"
            name="attachments"
            type="file"
            multiple
            accept={rfqAllowedFileExtensions.join(",")}
            onChange={handleFiles}
            className="mt-2 block w-full cursor-pointer border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 file:mb-2 file:block file:border-0 file:bg-arc-blue file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.08em] file:text-white hover:border-arc-blue sm:file:mb-0 sm:file:mr-4 sm:file:inline-block sm:file:px-4 sm:file:text-sm sm:file:tracking-[0.12em]"
            aria-invalid={Boolean(errors.attachments)}
            aria-describedby="attachments-help"
          />
        </label>
        <p id="attachments-help" className="mt-2 text-xs leading-5 text-slate-500">
          Accepted: PDF, Excel, CSV, Word, JPG and PNG. Maximum 5 files and 4 MB total. File type,
          size and content signature are checked before delivery. Send larger files by email or
          WhatsApp.
        </p>
        {errors.attachments ? (
          <p className="mt-2 text-sm font-semibold text-red-700">{errors.attachments}</p>
        ) : null}
        {attachments.length > 0 ? (
          <div className="mt-3 border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            {fileSummary}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-describedby="rfq-submit-status"
          className="inline-flex min-h-12 w-full items-center justify-center bg-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-arc-midnight disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto sm:tracking-[0.16em]"
        >
          {isSubmitting ? "Submitting..." : "Submit RFQ"}
        </button>
        <p
          id="rfq-submit-status"
          role="status"
          aria-live="polite"
          className="text-xs leading-5 text-slate-500"
        >
          {isSubmitting
            ? `Securely sending your inquiry. This can take up to ${rfqSubmissionTimeoutSeconds} seconds; keep this page open.`
            : "Your inquiry is validated before submission. Large or sensitive files can also be sent directly by email after initial contact."}
        </p>
      </div>
    </form>
  );
}

type FormFieldProps = {
  id: keyof RfqFormValues;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "email";
  required?: boolean;
  autoComplete?: string;
  placeholder: string;
};

function FormField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  autoComplete,
  placeholder,
}: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-bold text-arc-midnight">
        {label} {required ? <span className="text-arc-copper">*</span> : null}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        maxLength={rfqFieldLimits[id]}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-2 min-h-12 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
        required={required}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </label>
  );
}
