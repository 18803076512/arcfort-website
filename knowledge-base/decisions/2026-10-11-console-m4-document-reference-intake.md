# M4 Private Technical Document References

Date: 2026-10-11
Status: local E1 preparation verified; not applied to retained or hosted databases.

## Decision

Implement the technical-document part of the approved
[V1 architecture](../../docs/product-intelligence-console-v1-architecture.md) in controlled steps.
E1 reuses `technical_documents` and `entity_documents` for private exact-SKU references and adds
`technical_document_bindings` for immutable provenance. It extends the
[working-authority boundary](2026-09-09-console-m3-working-authority.md), not its activation or
publication permission. Migration 25 was prepared on October 10 and validated on October 11.

A reference records document title/type, declared source class/level, custodian, exact reference,
source location, scope note, issue date, revision label and authenticated intake actor. Unknown
issue dates and revision labels are explicit nulls; intake never substitutes today's date or
invents a revision. Issued date is not a verification date. Class/level pairs retain A/B/C/D
distinctions, but even declared Level A metadata is not inspected evidence or an approved fact.

The command creates one immutable document/link/binding for an explicitly selected working SKU.
A new version may name an unchanged prior reference for that same SKU. It does not overwrite,
automatically supersede, resolve a contradiction or approve the prior version. Multiple candidate
revisions can coexist. Another SKU requires its own declared scope, never a silent reassignment or
additional association to the frozen reference. This is an exact-SKU reference ledger, not yet a
global physical-file/version catalog. Future file deduplication must preserve these distinct scopes.

## File And Evidence Boundary

All E1 documents are `private`, rights `needs_confirmation` and links `reference_only`. Storage
bucket/path, public URL and file hash remain null. `raw_snapshot.file_inspection` is explicitly
`not_performed`. SHA-256 digests bind full document/link rows and SKU identity, not file bytes.
No remote URL is fetched, file is read, PDF is parsed, or download/upload endpoint is added.

Neither a catalog title, company custodian nor a document association creates `evidence_sources`,
technical values, compatibility, verification events, readiness, lifecycle or publication changes.
Document inspection, exact-identity review, rights approval and field-level confirmation remain
separate work. Never treat this metadata as a substitute for the
[15AK evidence workflow](../technical/15ak-technical-evidence-workflow.md).

The existing [raster original intake](2026-09-27-console-m4-original-intake.md) remains unchanged;
do not route PDFs through it or label document metadata as a completed original upload. A later
document-file batch must add bounded validation, immutable private Storage attachment and actual
stored-byte observation before human review. Attachments/corrections must be forward records,
not edits that erase E1 provenance.

## Security And Retention

The private command checks adoption and a current owner/editor/reviewer, with the established
authority-then-role lock order. Request receipts are actor- and payload-scoped; revoked sessions
cannot replay. Mutation capability is transaction/actor-bound and cleared on success. No public RPC,
application flag, role grant or native acceptance opt-in is introduced.

Bindings are forced-RLS, current-console-reader-only and insert-audited. Bound documents, links and
bindings cannot be changed or deleted, including through an internal catalog capability. A bound
document cannot acquire an additional subject, and cascaded truncation cannot erase the ledger.
Full metadata hashes are timezone invariant. Ordinary users and the service role have no direct
binding mutation or private-function execution grant. This is not protection against a database
administrator deliberately disabling guards.

Pristine acceptance now requires zero documents, links and bindings before fixture creation and
checks they remain zero after existing media/OEM/packaging acceptance. Unknown/missing counts fail
closed. These guard additions do not run or authorize document-native acceptance.

## Verification And Reversal

The [E1 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e1-private-technical-document-reference-intake)
owns commands and results. Embedded PostgreSQL proves 79 new SQL assertions and ten synthetic
references across four imported 15AK identities and one created draft, with exact original-data,
audit and receipt rollback. Actors are simulated; no real document or reviewer evidence was added.
Native Auth/PostgREST, concurrent calls, complete CLI type generation and application/browser
workflow acceptance remain unperformed for this batch.

Unapplied E1 code can be reversed as a reviewed code batch. After any separately authorized use,
preserve references, receipts and audit history and correct through forward versions; never reset
retained data to make acceptance pass. Repository public sources remain canonical. No push, merge,
deployment, hosted migration, retained-local mutation or rule override occurred.

Next: implement private document-file intake/inspection and governed human association review,
then the counted Technical Library workbench and separately authorized native acceptance. The
existing B11-B16/C1-C4/D1-D4 CI authorization does not authorize this new E scope. Real 15AK evidence,
verified preview, release QA, publication and all full-V1 completion gates remain required.
