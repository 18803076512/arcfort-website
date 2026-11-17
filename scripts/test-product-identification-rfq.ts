import assert from "node:assert/strict";
import { getProductBuyingProfile } from "../lib/content/product-buying-profiles.ts";
import { getProductIdentificationRfqFields } from "../lib/content/product-identification-rfq.ts";
import { arcfortProducts } from "../lib/data/products.ts";
import { rfqFieldLimits } from "../lib/rfq-constraints.ts";
import { buildRfqQuotationReadiness } from "../lib/rfq-qualification.ts";

const expectedIdentification = new Map([
  ["AF-MIG-CT-0004", /mating-holder/],
  ["AF-MIG-CT-0005", /mating-holder/],
  ["AF-MIG-CT-0006", /mating-holder/],
  ["AF-MIG-TH-0007", /Both connection ends.*handedness/],
  ["AF-MIG-GN-0008", /nozzle profile, opening and attachment/],
]);

for (const [sku, requiredQuestion] of expectedIdentification) {
  const product = arcfortProducts.find((entry) => entry.sku === sku);
  assert.ok(product, `Canonical product missing: ${sku}`);
  const fields = getProductIdentificationRfqFields(sku);
  assert.ok(fields);
  assert.match(fields.slice(0, 4).join("\n"), requiredQuestion);
  assert.ok(
    fields.every((field) => field.endsWith(":")),
    "Keep questions unanswered.",
  );
  assert.doesNotMatch(
    fields.join("\n"),
    /\b(?:15AK|MB15|M6|25\s*mm|27\s*mm|0[.]8\s*mm|1[.]0\s*mm|1[.]2\s*mm)\b|compatible with|confirmed specification/i,
    "Identification questions must not seed catalog values or fit conclusions.",
  );
  const prompt = [`Product: ${product.name}`, `SKU: ${sku}`, ...fields].join("\n");
  assert.ok(prompt.length <= rfqFieldLimits.productRequirements);
  const unanswered = buildRfqQuotationReadiness(
    { productRequirements: prompt, quantity: "", country: "", message: "" },
    [],
  );
  assert.equal(unanswered.status, "technical_details_needed");
  assert.ok(!unanswered.confirmedSignals.includes("Quantity or order plan provided"));
  assert.ok(!unanswered.confirmedSignals.includes("Destination country provided"));
  const readyForHumanReview = buildRfqQuotationReadiness(
    { productRequirements: prompt, quantity: "500 pcs", country: "Germany", message: "" },
    [],
  );
  assert.equal(readyForHumanReview.status, "ready_for_sales_review");
  assert.ok(readyForHumanReview.followUpItems.some((item) => /Verify compatibility/.test(item)));
}

for (const sku of ["unknown", "constructor", "AF-MIG-CT-OTHER"]) {
  assert.equal(getProductIdentificationRfqFields(sku), undefined);
}
for (const slug of ["robot-welding-torch", "wire-feeder"]) {
  const product = arcfortProducts.find((entry) => entry.slug === slug);
  const profile = getProductBuyingProfile(slug);
  assert.ok(product && profile);
  assert.equal(getProductIdentificationRfqFields(product.sku), undefined);
  assert.ok(profile.rfqFields.length >= 8, "Retain the existing full buying profile.");
}

console.log(
  "Product identification RFQ: five exact SKUs, unfilled questions, CT0006 boundary and profile fallback passed.",
);
