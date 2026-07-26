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
  type RfqListItem,
} from "@/lib/rfq-list";
import {
  emptySourceAttribution,
  sourceAttributionFields,
  sourceAttributionStorageKey,
  type SourceAttribution,
} from "@/lib/source-attribution";

type RfqFormValues = {
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  country: string;
  productRequirements: string;
  quantity: string;
  message: string;
};

type FormErrorKey = keyof RfqFormValues | "attachments";
type FormErrors = Partial<Record<FormErrorKey, string>>;

type RfqResponse = {
  ok: boolean;
  stored?: boolean;
  backendConfigured?: boolean;
  emailConfigured?: boolean;
  emailDelivered?: boolean;
  emailRecipient?: string;
  emailAttachmentCount?: number;
  buyerConfirmationDelivered?: boolean;
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

const requiredFields: Array<keyof RfqFormValues> = [
  "name",
  "company",
  "email",
  "country",
  "quantity",
];

const allowedFileExtensions = [
  ".pdf",
  ".xlsx",
  ".xls",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
];
const maxFiles = 5;
const maxFileSize = 10 * 1024 * 1024;
const maxTotalFileSize = 25 * 1024 * 1024;

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function createFileSummary(files: File[]) {
  if (files.length === 0) {
    return "No attachment selected";
  }

  return files.map((file) => file.name).join(", ");
}

function getTotalFileSize(files: File[]) {
  return files.reduce((total, file) => total + file.size, 0);
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
  const [submittedRequirements, setSubmittedRequirements] = useState("");
  const selectedProducts = useRfqList();

  const fileSummary = useMemo(() => createFileSummary(attachments), [attachments]);

  useEffect(() => {
    if (selectedProducts.length === 0) {
      return;
    }

    setErrors((currentErrors) => {
      if (!currentErrors.productRequirements) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        productRequirements: undefined,
      };
    });
  }, [selectedProducts.length]);

  function updateValue(field: keyof RfqFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
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
    }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    for (const field of requiredFields) {
      if (!values[field].trim()) {
        nextErrors[field] = "This field is required.";
      }
    }

    if (selectedProducts.length === 0 && !values.productRequirements.trim()) {
      nextErrors.productRequirements =
        "Add at least one product to your RFQ list or describe the products you need.";
    }

    if (values.email.trim() && !validateEmail(values.email.trim())) {
      nextErrors.email = "Please enter a valid business email address.";
    }

    if (attachments.length > maxFiles) {
      nextErrors.attachments = `Please upload no more than ${maxFiles} files.`;
    }

    if (getTotalFileSize(attachments) > maxTotalFileSize) {
      nextErrors.attachments = "Total attachment size must be 25 MB or smaller.";
    }

    for (const file of attachments) {
      const extension = getFileExtension(file.name);

      if (!allowedFileExtensions.includes(extension)) {
        nextErrors.attachments = "Allowed files: PDF, Excel, CSV, Word, JPG and PNG.";
        break;
      }

      if (file.size > maxFileSize) {
        nextErrors.attachments = "Each attachment must be 10 MB or smaller.";
        break;
      }
    }

    setErrors(nextErrors);
    return nextErrors;
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    setAttachments(selectedFiles);
    setErrors((currentErrors) => ({
      ...currentErrors,
      attachments: undefined,
    }));
  }

  function handleRemoveSelectedProduct(item: RfqListItem) {
    removeRfqListItem(item);
    trackAnalyticsEvent("rfq_list_remove", {
      item_name: item.name,
      item_sku: item.sku,
      location: "rfq_form",
    });
  }

  function handleClearSelectedProducts() {
    clearRfqList();
    trackAnalyticsEvent("rfq_list_clear", {
      item_count: selectedProducts.length,
      location: "rfq_form",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
    formData.append("quantity", values.quantity);
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

    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as RfqResponse;

      if (!response.ok || !result.ok) {
        setErrors(
          result.errors ?? {
            productRequirements: result.message ?? "RFQ submission failed.",
          },
        );
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
      });
      trackAnalyticsEvent("generate_lead", {
        lead_source: selectedProducts.length > 0 ? "rfq_shortlist" : "rfq_form",
        items: analyticsItems.length > 0 ? analyticsItems : undefined,
      });
    } catch {
      setErrors({
        productRequirements: "RFQ submission failed. Please try again.",
      });
      trackAnalyticsEvent("rfq_submit_error", {
        failure_stage: "network_or_parse",
        attachment_count: attachments.length,
        selected_product_count: selectedProducts.length,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    const submittedProductRequirements =
      submittedRequirements || values.productRequirements || "Product details sent with RFQ.";
    const fallbackEmailSubject = encodeURIComponent(`ArcFort Weld RFQ - ${values.company}`);
    const fallbackEmailBody = encodeURIComponent(
      [
        `Name: ${values.name}`,
        `Company: ${values.company}`,
        `Email: ${values.email}`,
        `WhatsApp: ${values.whatsapp || "Not provided"}`,
        `Country: ${values.country}`,
        `Quantity: ${values.quantity}`,
        "",
        "Product Requirements:",
        submittedProductRequirements,
        "",
        "Message:",
        values.message || "No additional message.",
      ].join("\n"),
    );
    const fallbackEmailHref = `${siteConfig.emailHref}?subject=${fallbackEmailSubject}&body=${fallbackEmailBody}`;

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
              : submissionResult?.backendConfigured
                ? "Your RFQ has been submitted for sales follow-up."
                : "Your RFQ passed validation, but server-side email delivery or storage is not configured yet. Please also send your inquiry by email or WhatsApp for sales follow-up."}
          </p>
          {submissionResult?.emailDelivered && submissionResult.emailAttachmentCount ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Attachments included in email: {submissionResult.emailAttachmentCount}
            </p>
          ) : null}
          {submissionResult?.buyerConfirmationDelivered ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              A confirmation copy has also been sent to {values.email}.
            </p>
          ) : null}
        </div>
        {!submissionResult?.backendConfigured ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href={fallbackEmailHref}
              className="border border-slate-200 bg-arc-frost p-4 text-sm font-semibold text-arc-midnight transition hover:border-arc-blue hover:text-arc-blue"
            >
              Email: {submissionResult?.emailRecipient ?? siteConfig.email}
            </a>
            <a
              href={siteConfig.whatsappHref}
              className="border border-slate-200 bg-arc-frost p-4 text-sm font-semibold text-arc-midnight transition hover:border-arc-blue hover:text-arc-blue"
            >
              WhatsApp: {siteConfig.whatsapp}
            </a>
          </div>
        ) : null}
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
              Build one inquiry from several product pages. SKU and category details are added to
              your RFQ automatically.
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
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
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
                <button
                  type="button"
                  onClick={() => handleRemoveSelectedProduct(item)}
                  className="min-h-10 self-start border border-white/25 px-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-200 transition hover:border-arc-signal hover:text-arc-signal sm:shrink-0"
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
      <div className="mb-6 border border-slate-200 bg-arc-frost p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Quick RFQ starters
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose a common buying scenario to prefill product requirements. You can edit the text
              before submitting.
            </p>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
            Buyer Helper
          </p>
        </div>
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
          label="Quantity"
          value={values.quantity}
          error={errors.quantity}
          required
          placeholder="Example: 500 pcs / mixed order"
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
          rows={5}
          value={values.productRequirements}
          onChange={(event) => updateValue("productRequirements", event.target.value)}
          placeholder={
            selectedProducts.length > 0
              ? "Add size, material, torch model, compatibility, packaging or OEM requirements for the selected products."
              : "Product names, part numbers, torch models, material, size, thread, compatible brand or OEM number."
          }
          className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
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
          rows={4}
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
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFiles}
            className="mt-2 block w-full cursor-pointer border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 file:mb-2 file:block file:border-0 file:bg-arc-blue file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.08em] file:text-white hover:border-arc-blue sm:file:mb-0 sm:file:mr-4 sm:file:inline-block sm:file:px-4 sm:file:text-sm sm:file:tracking-[0.12em]"
            aria-invalid={Boolean(errors.attachments)}
            aria-describedby="attachments-help"
          />
        </label>
        <p id="attachments-help" className="mt-2 text-xs leading-5 text-slate-500">
          Accepted: PDF, Excel, CSV, Word, JPG and PNG. Maximum 5 files, 10 MB each, 25 MB total.
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
          className="inline-flex min-h-12 w-full items-center justify-center bg-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-arc-midnight disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto sm:tracking-[0.16em]"
        >
          {isSubmitting ? "Submitting..." : "Submit RFQ"}
        </button>
        <p className="text-xs leading-5 text-slate-500">
          Your inquiry is validated by the website before submission. Large or sensitive files can
          also be sent directly by email after initial contact.
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
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-2 min-h-12 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
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
