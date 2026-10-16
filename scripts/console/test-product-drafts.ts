import assert from "node:assert/strict";
import {
  DRAFT_LIMITS,
  draftCommandError,
  validateProductDraftCopy,
} from "../../lib/domain/catalog/drafts.ts";

const valid = {
  name_en: "Draft tip",
  name_zh: "",
  model: "",
  summary: "",
  description: "",
  applications: "",
};
assert.equal(validateProductDraftCopy(valid).valid, true);
for (const value of [
  null,
  [],
  "draft",
  { ...valid, name_en: " \n\t" },
  { ...valid, sku: "AF-MIG-CT-9999" },
  { ...valid, confirmed_by: "someone" },
  { ...valid, lifecycle: "PUBLISHED" },
  { ...valid, description: {} },
]) {
  assert.equal(validateProductDraftCopy(value).valid, false);
}
for (const [field, maximum] of Object.entries(DRAFT_LIMITS)) {
  assert.equal(validateProductDraftCopy({ ...valid, [field]: "x".repeat(maximum) }).valid, true);
  assert.equal(
    validateProductDraftCopy({ ...valid, [field]: "x".repeat(maximum + 1) }).valid,
    false,
  );
}
assert.equal(validateProductDraftCopy({ ...valid, summary: undefined }).valid, false);
assert.match(draftCommandError("40001"), /Reload/i);
assert.match(draftCommandError("42501"), /permission/);
assert.equal(draftCommandError("private SQL content"), draftCommandError(undefined));
assert.equal(draftCommandError("toString"), draftCommandError(undefined));
console.log(
  "Product draft contracts passed: field allowlist, bounds, required name and safe errors.",
);
