export function createRfqReference(date = new Date(), randomValue = crypto.randomUUID()) {
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = randomValue
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `AF-RFQ-${datePart}-${randomPart}`;
}
