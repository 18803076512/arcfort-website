"use client";

import { FormEvent, useMemo, useState } from "react";

type FormValues = {
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  country: string;
  productRequirements: string;
  quantity: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues | "upload", string>>;

const initialValues: FormValues = {
  name: "",
  company: "",
  email: "",
  whatsapp: "",
  country: "",
  productRequirements: "",
  quantity: "",
  message: "",
};

const requiredFields: Array<keyof FormValues> = [
  "name",
  "company",
  "email",
  "country",
  "productRequirements",
  "quantity",
  "message",
];

const fieldLabels: Record<keyof FormValues, string> = {
  name: "Name",
  company: "Company",
  email: "Email",
  whatsapp: "WhatsApp",
  country: "Country",
  productRequirements: "Product Requirements",
  quantity: "Quantity",
  message: "Message",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RfqForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadName, setUploadName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function updateValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setIsSubmitted(false);
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    requiredFields.forEach((field) => {
      if (!values[field].trim()) {
        nextErrors[field] = `${fieldLabels[field]} is required.`;
      }
    });

    if (values.email.trim() && !emailPattern.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    const quantityValue = Number(values.quantity);
    if (values.quantity.trim() && (!Number.isFinite(quantityValue) || quantityValue <= 0)) {
      nextErrors.quantity = "Quantity must be greater than 0.";
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setIsSubmitted(false);
      return;
    }

    setValues(initialValues);
    setUploadName("");
    setFileInputKey((current) => current + 1);
    setIsSubmitted(true);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {isSubmitted ? (
        <div
          role="status"
          className="mb-6 border-l-4 border-arc-signal bg-arc-frost p-4 text-sm font-semibold leading-6 text-arc-midnight"
        >
          Thank you. Your RFQ has been received. ARCFORT will review your request and respond with
          quotation, MOQ and delivery options.
        </div>
      ) : null}

      {hasErrors ? (
        <div
          role="alert"
          className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700"
        >
          Please complete the required fields before submitting your inquiry.
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Name"
          required
          value={values.name}
          error={errors.name}
          placeholder="Your name"
          onChange={(value) => updateValue("name", value)}
        />
        <Field
          id="company"
          label="Company"
          required
          value={values.company}
          error={errors.company}
          placeholder="Company name"
          onChange={(value) => updateValue("company", value)}
        />
        <Field
          id="email"
          label="Email"
          required
          type="email"
          value={values.email}
          error={errors.email}
          placeholder="name@company.com"
          onChange={(value) => updateValue("email", value)}
        />
        <Field
          id="whatsapp"
          label="WhatsApp"
          value={values.whatsapp}
          error={errors.whatsapp}
          placeholder="+1 000 000 0000"
          onChange={(value) => updateValue("whatsapp", value)}
        />
        <Field
          id="country"
          label="Country"
          required
          value={values.country}
          error={errors.country}
          placeholder="Destination market"
          onChange={(value) => updateValue("country", value)}
        />
        <Field
          id="quantity"
          label="Quantity"
          required
          type="number"
          value={values.quantity}
          error={errors.quantity}
          placeholder="Estimated order quantity"
          onChange={(value) => updateValue("quantity", value)}
        />
      </div>

      <label className="mt-5 block" htmlFor="productRequirements">
        <span className="text-sm font-bold text-arc-midnight">
          Product Requirements <span className="text-red-600">*</span>
        </span>
        <textarea
          id="productRequirements"
          rows={5}
          value={values.productRequirements}
          onChange={(event) => updateValue("productRequirements", event.target.value)}
          placeholder="Product names, part numbers, torch models, materials, sizes, OEM references..."
          aria-invalid={Boolean(errors.productRequirements)}
          aria-describedby={errors.productRequirements ? "productRequirements-error" : undefined}
          className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
        />
        {errors.productRequirements ? (
          <span id="productRequirements-error" className="mt-2 block text-sm text-red-600">
            {errors.productRequirements}
          </span>
        ) : null}
      </label>

      <label className="mt-5 block" htmlFor="message">
        <span className="text-sm font-bold text-arc-midnight">
          Message <span className="text-red-600">*</span>
        </span>
        <textarea
          id="message"
          rows={5}
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          placeholder="Tell us your delivery schedule, target market, packaging needs, and quotation details."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
        />
        {errors.message ? (
          <span id="message-error" className="mt-2 block text-sm text-red-600">
            {errors.message}
          </span>
        ) : null}
      </label>

      <label className="mt-5 block" htmlFor="upload">
        <span className="text-sm font-bold text-arc-midnight">
          Drawing / Product List / PDF Upload
        </span>
        <input
          key={fileInputKey}
          id="upload"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
          onChange={(event) => {
            setUploadName(event.target.files?.[0]?.name ?? "");
            setIsSubmitted(false);
          }}
          className="mt-2 w-full border border-slate-300 bg-slate-50 text-sm text-slate-700 file:mr-4 file:border-0 file:bg-arc-blue file:px-4 file:py-3 file:text-sm file:font-bold file:uppercase file:tracking-[0.12em] file:text-white hover:file:bg-arc-midnight"
        />
        <span className="mt-2 block text-xs leading-5 text-slate-500">
          Accepted formats: PDF, Word, Excel, CSV, JPG and PNG. Front-end only for now.
        </span>
        {uploadName ? (
          <span className="mt-2 block text-sm font-semibold text-arc-blue">
            Selected file: {uploadName}
          </span>
        ) : null}
      </label>

      <button
        type="submit"
        className="mt-7 w-full bg-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-arc-midnight sm:w-auto"
      >
        Submit RFQ
      </button>
    </form>
  );
}

type FieldProps = {
  id: keyof FormValues;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  required?: boolean;
  type?: "text" | "email" | "number";
};

function Field({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  type = "text",
}: FieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-bold text-arc-midnight">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        min={type === "number" ? 1 : undefined}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
      />
      {error ? (
        <span id={`${id}-error`} className="mt-2 block text-sm text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
