export const rfqFieldLimits = {
  name: 120,
  company: 160,
  email: 254,
  whatsapp: 80,
  country: 100,
  productRequirements: 8000,
  quantity: 240,
  message: 6000,
} as const;

export type RfqTextField = keyof typeof rfqFieldLimits;
export type RfqTextValues = Record<RfqTextField, string>;

export const rfqRequiredFields: RfqTextField[] = [
  "name",
  "company",
  "email",
  "country",
  "productRequirements",
  "quantity",
];

export const rfqAllowedFileExtensions = [
  ".pdf",
  ".xlsx",
  ".xls",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
] as const;

export const rfqMaxFiles = 5;
export const rfqMaxFileSize = 4 * 1024 * 1024;
export const rfqMaxTotalFileSize = 4 * 1024 * 1024;
export const rfqMaxRequestBodySize = rfqMaxTotalFileSize + 256 * 1024;

type RfqFileLike = {
  name: string;
  size: number;
};

export function validateRfqEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getRfqFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export function getRfqTotalFileSize(files: RfqFileLike[]) {
  return files.reduce((total, file) => total + file.size, 0);
}

export function validateRfqTextValues(values: RfqTextValues, requiredFields = rfqRequiredFields) {
  const errors: Partial<Record<RfqTextField, string>> = {};

  for (const field of requiredFields) {
    if (!values[field].trim()) {
      errors[field] = "This field is required.";
    }
  }

  if (values.email.trim() && !validateRfqEmail(values.email.trim())) {
    errors.email = "Please enter a valid business email address.";
  }

  for (const [field, limit] of Object.entries(rfqFieldLimits) as Array<[RfqTextField, number]>) {
    if (values[field].length > limit) {
      errors[field] = `Please use ${limit.toLocaleString("en-US")} characters or fewer.`;
    }
  }

  return errors;
}

export function validateRfqFiles(files: RfqFileLike[]) {
  if (files.length > rfqMaxFiles) {
    return `Please upload no more than ${rfqMaxFiles} files.`;
  }

  if (getRfqTotalFileSize(files) > rfqMaxTotalFileSize) {
    return "Total attachment size must be 4 MB or smaller.";
  }

  for (const file of files) {
    const extension = getRfqFileExtension(file.name);

    if (
      !rfqAllowedFileExtensions.includes(extension as (typeof rfqAllowedFileExtensions)[number])
    ) {
      return "Allowed files: PDF, Excel, CSV, Word, JPG and PNG.";
    }

    if (file.size > rfqMaxFileSize) {
      return "Each attachment must be 4 MB or smaller.";
    }
  }

  return null;
}
