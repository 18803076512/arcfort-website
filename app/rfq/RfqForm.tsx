"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

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

const requiredFields: Array<keyof RfqFormValues> = [
  "name",
  "company",
  "email",
  "country",
  "productRequirements",
  "quantity",
];

const allowedFileExtensions = [".pdf", ".xlsx", ".xls", ".csv", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
const maxFiles = 5;
const maxFileSize = 10 * 1024 * 1024;

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

type RfqFormProps = {
  initialProduct?: string;
};

export function RfqForm({ initialProduct = "" }: RfqFormProps) {
  const [values, setValues] = useState<RfqFormValues>({
    ...initialValues,
    productRequirements: initialProduct,
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<RfqResponse | null>(null);

  const fileSummary = useMemo(() => createFileSummary(attachments), [attachments]);

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

  function validateForm() {
    const nextErrors: FormErrors = {};

    for (const field of requiredFields) {
      if (!values[field].trim()) {
        nextErrors[field] = "This field is required.";
      }
    }

    if (values.email.trim() && !validateEmail(values.email.trim())) {
      nextErrors.email = "Please enter a valid business email address.";
    }

    if (attachments.length > maxFiles) {
      nextErrors.attachments = `Please upload no more than ${maxFiles} files.`;
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
    return Object.keys(nextErrors).length === 0;
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    setAttachments(selectedFiles);
    setErrors((currentErrors) => ({
      ...currentErrors,
      attachments: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("company", values.company);
    formData.append("email", values.email);
    formData.append("whatsapp", values.whatsapp);
    formData.append("country", values.country);
    formData.append("productRequirements", values.productRequirements);
    formData.append("quantity", values.quantity);
    formData.append("message", values.message);

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
        return;
      }

      setSubmissionResult(result);
      setIsSubmitted(true);
    } catch {
      setErrors({
        productRequirements: "RFQ submission failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
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
            {submissionResult?.stored
              ? "Your RFQ has been submitted for follow-up."
              : "Your RFQ passed validation. Backend storage is not configured yet, so Supabase environment variables must be added before production launch."}
          </p>
        </div>
        <div className="mt-6 grid gap-4 text-sm text-slate-700">
          <p>
            <span className="font-bold text-arc-midnight">Company:</span> {values.company}
          </p>
          <p>
            <span className="font-bold text-arc-midnight">Email:</span> {values.email}
          </p>
          <p>
            <span className="font-bold text-arc-midnight">Products:</span>{" "}
            {values.productRequirements}
          </p>
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
    <form onSubmit={handleSubmit} noValidate className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
          Product Requirements <span className="text-arc-copper">*</span>
        </span>
        <textarea
          id="productRequirements"
          rows={5}
          value={values.productRequirements}
          onChange={(event) => updateValue("productRequirements", event.target.value)}
          placeholder="Product names, part numbers, torch models, material, size, thread, compatible brand or OEM number."
          className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
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
            className="mt-2 block w-full cursor-pointer border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 file:mr-4 file:border-0 file:bg-arc-blue file:px-4 file:py-2 file:text-sm file:font-bold file:uppercase file:tracking-[0.12em] file:text-white hover:border-arc-blue"
            aria-invalid={Boolean(errors.attachments)}
            aria-describedby="attachments-help"
          />
        </label>
        <p id="attachments-help" className="mt-2 text-xs leading-5 text-slate-500">
          Accepted: PDF, Excel, CSV, Word, JPG and PNG. Maximum 5 files, 10 MB each.
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
          className="inline-flex items-center justify-center bg-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-arc-midnight disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Submitting..." : "Submit RFQ"}
        </button>
        <p className="text-xs leading-5 text-slate-500">
          No real API keys, email passwords or database credentials are included.
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
        className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
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
