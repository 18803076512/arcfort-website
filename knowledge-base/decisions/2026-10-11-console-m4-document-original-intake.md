# M4 Private Document Original Intake

Date: 2026-10-11
Status: E2 local preparation verified; no retained/hosted migration or application upload endpoint.

## Immutable Attachment

Extend [E1 document references](2026-10-11-console-m4-document-reference-intake.md) with immutable
`document_upload_intents` and `document_upload_completions`. Do not change the E1 document, entity
link or provenance row when attaching a file. Their original `file_inspection: not_performed`
describes E1 intake; later observations must be separately recorded, never overwrite that history.

One unchanged exact-SKU reference can reserve one PDF original, bound to its complete reference
digest and current working identity. The actor-scoped request receipt retries the same intent/path;
a different file requires a new reference version. Another operator cannot complete that actor's
intent. Existing current receipts retry at the 100-new-intents-per-actor/24-hour limit. This is not
a global file-storage quota or a resumable protocol. Incomplete intents/objects remain retained;
no automatic cleanup is authorized.

Only `pi-technical-evidence/working-documents/<actor>/<intent>/original.pdf` receives new restrictive
Storage policies. Authenticated inserts require the creator's current incomplete intent; managed
update/move/delete are denied. Existing evidence/image policies and buckets are unchanged. The
Storage uploader is not proof of legal ownership. No new service key or direct caller/service
binding/ledger write is granted. Begin/complete remain private; the sole public function is a
read-only write-permission predicate for RLS. Database administrators can bypass these controls.

Completion checks exact object path, owner, declared size and MIME, retaining the original Storage
object/version/metadata. It deliberately records `byte_verification: not_attested`: a database
Storage row, page count and supplied hash do not prove physical bytes. It creates no document-rights,
human-review, technical, compatibility, readiness or publication state. No actual Storage API call
or object upload is made by applying the migration or running the embedded fixture.

## PDF Byte Check

Use pinned MIT `pdf-lib` 1.17.1, not a handwritten PDF parser. The lockfile adds five packages and
does not update existing versions. The library accepts byte arrays and exposes encryption status
and page structure; its load options control invalid-object handling and metadata updates.
[PDFDocument API](https://pdf-lib.js.org/docs/api/classes/pdfdocument),
[load options](https://pdf-lib.js.org/docs/api/interfaces/loadoptions).

The server-only validator checks the exact filename, extension/MIME, declared/actual size and PDF
header/end marker, then sends unchanged bytes to a disposable Node parser process. It hashes and
returns the original buffer, never saves, re-encodes, repairs or changes a PDF. Limits: 25 MiB,
200 pages, 14,400-point page dimensions, 15-second/8,192-read input bound, ten-second parser deadline,
50,000 indirect objects, 250,000 visited entries and 64 traversal depth. Two whole-file validations
may run concurrently in one process; further requests fail closed. This is not distributed limiting.

The parser rejects encryption, forms, scripts, embedded files, launch/remote actions and rich media
through parsed object names/dictionaries, including compressed objects. Ordinary URI link data is
not fetched or executed. It performs structural parsing, not full rendering, OCR, text extraction,
malware clearance, signature verification or a guarantee that every font/image/content stream will
render. Rejected originals are not automatically flattened, stripped or rewritten to pass.

The child receives only fixed `NODE_ENV` and Windows `SystemRoot` when needed, no inherited project
credentials or Node options. It opens no visible window, receives binary stdin and returns only a
bounded page-count result. Stderr/provider/content diagnostics are not exposed. The parent kills
on cancellation/deadline and waits for child close before settling. See Node's
[spawn contract](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options).
A 128 MiB V8 old-space limit is **not** a total RSS/ArrayBuffer limit or OS filesystem/network
sandbox. Do not claim hard whole-process memory isolation or use this as a public upload service.

## Evidence And Next Gate

The [E2 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e2-private-pdf-original-foundation)
owns exact checks: 69 new SQL assertions, six real-byte/process test groups and simulated Storage
metadata linkage for four 15AK identities plus one synthetic draft. These are independent proofs;
they are not a real Supabase upload/readback. The current npm advisory response for only the five
new package versions was empty on October 11; this is a dated lookup, not a security guarantee.

Before application use, add authenticated default-off commands and raw upload/readback, verify
cookie/body-clone/privacy boundaries, and test the child parser asset/dependency in the built
handler. The current website build does not include an upload route using this module, so its
success cannot prove future parser deployment packaging. Request/actor limits and bounded private
inspection must precede human document review; do not directly render arbitrary originals inline.
Trusted stored-byte observation and rights/exact-scope decisions remain separate requirements.

No E1/E2 external submission is authorized by the previous media/OEM/packaging CI approval. No
commit, push, merge, deploy, hosted/retained migration, active configuration or real-product
publication occurred. Reversal is code-only before application, forward records afterwards. Keep
public repository data canonical and retain receipts, objects and audit history. No rule override.
