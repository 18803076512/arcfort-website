# RFQ Attachment Identity And Download Qualifications

Date: 2026-11-26. Scope: the existing RFQ attachment handoff and public product-list download.

## Observed Problems

The old RFQ filename sanitizer replaced every non-ASCII character with a hyphen. Distinct allowed
names such as `正面.jpg` and `背面.jpg` therefore became the same `--.jpg` in email and metadata.
Truncating a complete long filename also removed its extension. Local reproduction establishes an
identity problem, not attachment-byte loss or a historical production-mail failure.

The official product CSV also contained bare `M6` thread cells for CT0004 and CT0005, while their
governed public technical rows already included the catalog/mating-holder confirmation note.

## Contract

- Validate files before naming them. Preserve existing extension, signature, count and size gates.
- Use one shared attachment helper for route metadata, provider payload names and stored objects.
  Each transmitted name has a stable one-based submission prefix, ASCII characters and at most
  120 characters. Reserve space for its allowed extension before shortening the stem.
- Keep a Unicode original-name display label in existing private attachment JSON metadata. Strip
  path components and replace control/format characters; bound the label to 255 Unicode characters
  with a visible ellipsis when shortened. This is a safe display label, not an unchanged raw path.
- Sales and buyer email text and HTML show the original display label and transmitted name together
  when different. Escape both names in HTML. Preserve existing metadata without `originalName`.
- Keep bytes, file order, MIME metadata, stable RFQ reference, provider deadlines, idempotency,
  delivery classification and fallback behavior unchanged. Do not add original labels to logs,
  public URLs, analytics or public reports. Storage retains its private indexed object-path design.
- For the public CSV, append a governed thread row's public note only when its value exactly
  matches the bare source thread and there is exactly one matching public row. Preserve descriptive,
  custom and unmanaged fields verbatim, including TH0007 end roles and independent CT0006 scope.
  This supplements the [existing public qualification decision](2026-11-25-public-product-qualifications.md).

No canonical technical value, evidence status, product identity, image, relationship, database
schema or account/provider setting changes. This adds no confirmed SKU fact.

## Verification And Limits

Use synthetic Chinese, duplicate, long, path/control and HTML-significant names to verify uniqueness,
extension preservation, bytes/order and all four email formats. Reconcile the generated CSV cell by
cell and preserve other downloads. Require applicable RFQ, export, domain, build, lint/type,
performance and secret checks, independent release QA and exact PR/main/Production readbacks.

This maintenance batch sends no real RFQ or email. Local provider-payload checks do not prove how a
mail service or mail client renders the new names. The owner's November 14 matching-reference
receipt remains historical evidence for that separate test; it does not verify this new name
mapping. Recover evidence or arrange a separately authorized test when that distinction matters.

Rollback uses the existing reviewed repository/main deployment workflow. Never restore an
unqualified public value or ambiguous attachment mapping merely to simplify another projection.
