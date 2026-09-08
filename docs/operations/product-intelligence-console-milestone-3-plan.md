# Console M3 - 15AK Editing And Human Verification Plan

Date: 2026-09-08
Status: Proposed; implementation and staging mutation approval pending.

## Objective And Boundary

Deliver the next approved-architecture capability: create a draft product without editing website
page code, edit product/variant working data, propose technical revisions with source evidence, and
let an authorized human approve, edit or reject an exact value. Do not substitute another read-only
dashboard for this workflow. M3 is not media publishing, website deployment or the completed V1.

The [V1 architecture](../product-intelligence-console-v1-architecture.md) places editing/review in
M3, compatibility/media/documents in M4, preview/release in M5 and the full real-data pilot in M6.
The [M2 acceptance](product-intelligence-console-milestone-2.md#2026-09-08-real-owner-browser-acceptance)
now proves actual owner reads and logout isolation. It does not authorize product writes.

Recommended destination remains local development and disposable CI first. Hosted execution, after
a migration preview and separate approval, is limited to staging `fdsvzuqixppsakukkrsf`. Public
products, URLs, RFQ, site configuration, Auth/SMTP and the undeployed HTTPS entrance stay unchanged.

## Inspected Implementation And Gaps

| Existing surface                                                   | Reuse                                                                                  | Gap before writes                                                                                       |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `lib/console/server.ts`, `access.ts`, `security.ts`                | Fresh authenticated identity/current roles, caller-session client, exact-origin checks | Explicit command authorization, bounded form validation and database-enforced editable scope            |
| `products`, `product_variants`                                     | Stable UUID/SKU/slug, lifecycle guards, audit triggers                                 | Working-copy ownership, revision tokens, product copy fields and atomic create/update commands          |
| `technical_values`, `technical_value_evidence`, `evidence_sources` | Subject, field, value/unit, evidence, five verification statuses                       | Explicit revision lineage/current-value selection and protected original evidence                       |
| `verification_events`                                              | Immutable human decisions and actor attribution                                        | Atomic decision plus value mutation; stale-review prevention and duplicate-submit handling              |
| Workflow guard migration `202608310005`                            | Qualified Level A evidence, reviewer-only confirmation, immutable confirmed values     | Current approve/edit lookup is timestamp-based; reject/conflict resolution needs exact revision binding |
| `scripts/console/apply-shadow-catalog.ts`                          | Deterministic 17-table import and exact parity                                         | Upserts occur before parity checks and can overwrite unconfirmed human changes; no editable-scope guard |
| `pi_variant_readiness`, `lib/console/catalog.ts`                   | Real blocker counts and paginated read models                                          | Historical/rejected/superseded revisions must not count as current data or satisfy critical fields      |
| Existing read-only product screens                                 | Stable navigation, no-store/noindex, scoped tables                                     | Draft form, evidence review, conflict comparison and paginated product history                          |

Important source constraints: `products` does not currently contain editable descriptive copy;
`raw_snapshot` must not become the new content store. New non-shadow variants must start in DRAFT;
existing INGESTED records must not be reset to DRAFT through an invalid lifecycle transition.

## Decisions Requiring Approval

Approval of this proposal must identify the following choices. It is not approval to confirm any
actual technical value, write to hosted staging, merge or deploy.

| ID   | Recommended default                                                                 | Consequence                                                                                                                           |
| ---- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| M3-A | Controlled 15AK working-data adoption, no public-source cutover                     | Four existing SKU identities become editable only after an explicit adoption operation; other shadow records stay read-only           |
| M3-B | Freeze the legacy full shadow replay before the first adopted edit                  | Prevent CSV upserts from erasing work; later repository changes become comparison/import proposals, never a blind replay              |
| M3-C | Typed database commands, revision checks and append-only decisions                  | Save/review is atomic, stale changes fail visibly, and original values/evidence survive                                               |
| M3-D | Owner/editor draft editing; owner/reviewer human decisions                          | Existing roles are reused, no accounts or permissions are granted; editor cannot confirm, viewer/publisher cannot write this workflow |
| M3-E | Implement in local/disposable CI only until hosted execution is separately approved | Additive migration files may be prepared and tested; no remote migration, adoption or real-data mutation yet                          |

The alternative of a disconnected browser/CSV-only editor would avoid a database transition but not
deliver the requested central workflow. A whole-catalog cutover has a larger scope than the evidence
supports. The recommended pilot keeps database working data and the immutable public snapshot
distinct; they are different lifecycle stages, not competing independently edited public catalogs.

## Pilot Scope

Use exact canonical identifiers, not fuzzy family-name matching:

| SKU            | Stable public slug       |
| -------------- | ------------------------ |
| AF-MIG-CT-0004 | mig-contact-tip-m6-0-8mm |
| AF-MIG-CT-0005 | mig-contact-tip-m6-1-0mm |
| AF-MIG-TH-0007 | mig-tip-holder-for-mb15  |
| AF-MIG-GN-0008 | mig-gas-nozzle-for-mb15  |

These are the four products referenced by `data/intake/15ak-technical-confirmation.csv`, not newly
confirmed products. Retain their 15 original technical references. In particular, holder connection
sides and nozzle profile-specific openings are distinct scopes. Do not combine three nozzle profiles
into one confirmed SKU dimension or infer compatibility from a 15AK label.

M3 also needs a real create-draft path, initially restricted to the MIG/MAG pilot category. Require
an owner-supplied identity/source; automatically suggested SKU and slug are identifiers only and
must be checked against all existing records. Synthetic CI examples must never be seeded into
hosted staging as real products. Additional categories and existing-SKU adoption need a later scope.

## Working Authority And Import Protection

1. Before adoption, keep all existing shadows and public repository files unchanged. Add explicit
   database working-scope/authority state, off by default. Capture the accepted repository revision,
   exact IDs, source hashes, actor, reason and time in the adoption record.
2. Adoption is an owner-only command, not a boolean field on an ordinary product form. It must lock
   the affected scope, check exact parity and absence of an active import, and retain baseline
   snapshots. Preserve IDs, current lifecycle and every original evidence record. Changing
   `is_shadow` alone is not sufficient authority or protection.
3. Before any adopted edit is allowed, enforce a database-level prohibition on legacy catalog replay
   in working mode. A script preflight is helpful but not sufficient: direct service-role upserts,
   shared evidence/category rows, racing imports and partial batches must not evade the guard.
   Adoption/import synchronization must be transactional and tested, not an in-memory UI flag.
4. Fail the entire legacy replay before it changes catalog rows after activation; do not skip
   edited rows and call partial parity a success. Preserve the pre-adoption M1 double-import tests
   on fresh disposable databases and add post-adoption replay-denial/no-change tests separately.
5. Future CSV changes for the adopted scope are read-only diffs/proposals until an explicit merge
   workflow exists. Non-pilot public maintenance can continue in Git, but the old full database
   replay stays frozen. No automatic back-sync from mutable drafts into public TypeScript/CSV.
6. Public `content/products.ts`, static routes, metadata, schema, sitemap and RFQ keep consuming
   the last reviewed repository projection. M5 defines approved snapshot export; do not add a
   public runtime database query in M3.

## Commands And Data Contract

Prepare additive, versioned migrations; never edit the five already-applied migrations. Reuse
relational product/fact/evidence tables, adding only explicit working ownership, revision/lineage,
review state, bounded copy fields and command receipts needed by this workflow. Regenerate types.

Commands must use the authenticated caller, not a service key. Atomic database functions check
current roles and allowed scope independently of the page/handler. Restrict direct writes to the
affected columns/tables so the command contract cannot be bypassed through PostgREST. Where a
security-definer function is necessary, lock search_path, qualify objects, restrict EXECUTE and
enforce identity/scope inside the function; retain forced RLS and test each privileged boundary.

| Command                    | Mutable input                                                                                           | Required result                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Create draft               | Proposed SKU/slug, English/optional Chinese name, category/type, source reference, draft copy           | One atomic product/variant identity, DRAFT/non-public, unresolved verification, audit and receipt |
| Save product draft         | Allowlisted names, draft summary/description/applications, unconfirmed model wording, expected revision | Updated working copy only; old revision retained; stable existing IDs/SKU/slug/category unchanged |
| Propose technical revision | Exact subject and field scope, candidate value/unit, source IDs/locations, reason, expected revision    | New unconfirmed revision linked to its predecessor; no rewrite of catalog values or evidence      |
| Submit for review          | Exact candidate revision and source evidence versions                                                   | Explicit pending human review, never automatic confirmation                                       |
| Approve                    | Exact revision, qualifying source references, reviewer reason                                           | Atomic decision plus confirmation attribution only when all evidence/scope/conflict gates pass    |
| Edit during review         | Replacement proposal and reason                                                                         | New unconfirmed revision returned for explicit review; editing is not approval                    |
| Reject                     | Exact revision and reason                                                                               | Immutable reject event; candidate remains inspectable but cannot feed current/confirmed readiness |

Use explicit draft review state separate from the five factual verification statuses; do not invent
a sixth verification status for rejected or superseded rows. Bind human decisions to the exact
candidate value and evidence revision, not merely entity ID or a timestamp. M3 must preserve current
valid facts while a replacement is pending, and expose conflicting candidates as blockers. A
conflicting source is never silently superseded; resolution needs exact-item Level A evidence and
a human reason. Known publication-time invalidation of withdrawn evidence must remain intact.

Revision/concurrency checks apply to both product copy and evidence relationships. A stale edit or
approval returns a conflict with a reload/compare path, not last-write-wins. An idempotency receipt
is scoped to actor, command and request ID, with a payload digest: replaying the same request returns
the recorded result; changing the payload under that ID fails. Server-derived actor/time and bounded
safe errors prevent forged attribution or leaked SQL/private evidence.

Reference classification requires a real matching source: official OEM evidence for OEM_REFERENCE,
an applicable standard for STANDARD_REFERENCE, and exact-item qualifying Level A evidence plus
human decision for CONFIRMED. Missing evidence stays NEEDS_FACTORY_CONFIRMATION. A company catalog,
generated text, copied reviewer name or current date cannot fill the gate. Original source files,
source content and imported raw snapshots remain immutable; corrected sources get new records.

No technical value enters ordinary marketing copy as an independent confirmed fact. Do not expose
freeform lifecycle, approval, `confirmed_by`, `confirmed_at`, `is_shadow`, legacy-status, publication,
ownership or role controls on product forms. M3 does not advance a product to READY_FOR_PUBLISH.

## Operator Experience

- Reuse the Console shell and add working-scope/draft distinctions to the existing product list.
- A New Product action opens a short identity/source form. Product detail exposes draft editing
  only for allowed records, plus technical evidence and paginated history.
- The technical review view shows original reference, proposed value, unit/profile/connection side,
  source/reviewer requirements and differences together. On mobile, stack comparison sections;
  do not compress long provenance into narrow table columns.
- Require explicit Save and review actions, clear field errors and an unsaved-change warning. Keep
  entered values on validation/network failure; do not store private drafts in localStorage.
- Keep native full-document navigation where possible; add client state only for unsaved forms,
  pending submission and useful comparison. Retain accessible labels/focus and 44px controls.
- Audit history exposes a minimal authorized change projection, not complete `raw_snapshot`,
  arbitrary audit payloads, private file paths, buyer data or credentials.
- Evidence references can be entered without a file upload. Private-original upload, rights review,
  download signing and compatibility/media editing remain M4; no fake upload success is permitted.

## Implementation Batches And File Surface

1. **M3.1 Authority and atomic commands:** new `supabase/migrations/*` and database tests; domain
   contracts under `lib/domain/catalog/`; importer guard and regenerated Supabase types. Prove
   pre-adoption parity, immutable source retention and post-adoption replay denial before UI writes.
2. **M3.2 Draft product creation/editing:** authenticated commands under `lib/console/`, private
   handlers/pages under `app/(console)/console/`, reusable forms under `components/console/` and
   scoped Console CSS. No category consolidation, public slugs or family auto-mapping.
3. **M3.3 Technical proposal/review:** add revision comparison, explicit approve/edit/reject and
   source-context history; update read models/readiness for active versus superseded/rejected facts.
4. **M3.4 Acceptance:** focused scripts under `scripts/console/`, isolated database/browser fixtures,
   existing `.github/workflows/quality.yml` gates, README/runbooks and a dated decision only after
   owner approval. Stop before any hosted migration or real-data adoption without its own preview.

No heavy UI/CMS dependency is expected. A schema/authority/permission change outside this contract
requires plan revision before execution, not a hidden expansion inside an editor component.

## Acceptance Evidence

| Requirement              | Proof needed                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Create without page code | Browser create/save/reload returns exactly one draft product and variant; no public route/sitemap change                                       |
| Stable identity          | Entire-catalog unique SKU/slug constraints; concurrent duplicate attempts; existing IDs/routes unmodified                                      |
| Atomicity                | Failed evidence link/review rolls back the whole command and has no partial confirmation                                                       |
| Concurrency/idempotency  | Two-tab stale write/review denied; duplicate submit has one result/event; changed payload cannot reuse receipt                                 |
| Authority                | Unadopted/non-pilot/direct-table writes denied; post-activation importer, service-role replay and import/adoption races cannot overwrite edits |
| Human review             | Approve/edit/reject demonstrated; missing/Level D/wrong-subject/stale/conflicting evidence cannot become CONFIRMED                             |
| Provenance               | Old values, source revisions and decisions remain readable; rejected/superseded references neither disappear nor satisfy current readiness     |
| Scope                    | Holder sides and nozzle profiles remain distinct; similar names never map candidates or confirm compatibility                                  |
| Authorization/privacy    | Anonymous/viewer/editor-as-reviewer/revoked roles denied at handler and database; no tokens/raw payload/private paths leak                     |
| UX                       | Validation, failure recovery, unsaved changes, keyboard and 360/390/768/1440px flows; no horizontal page overflow                              |
| Regression               | All existing M1/M2 tests, lint, typecheck, build, SEO/routes/schema, RFQ and performance budgets remain passing                                |

Run full migration reset, all pgTAP/negative controls, generated-type checks, two pre-adoption imports,
new post-adoption command tests and actual isolated browser review. Synthetic successful approval
proves the workflow only; it does not confirm any real ArcFort specification. Hosted acceptance later
must use owner-supplied facts and must not create test customer/product evidence.

## Recovery, Missing Inputs And Next Action

Disable the new mutation feature to return to read-only operation; preserve database drafts,
originals, decisions and audit. Restore code through reviewed commits. Do not unfreeze imports, reset
the database, flip adopted rows back to shadow, or overwrite drafts as a rollback. Public pages stay
on their previous snapshot. Database reversal needs a separately reviewed forward recovery/export.

Missing now: M3-A through M3-E approval; Level A identity/measurements/drawings and exact scoped
technical evidence for the real pilot. These facts are not prerequisites for writing tested local
workflow code after approval, but they are prerequisites for real confirmation and M6 completion.
Exact-image rights/media and publication gates remain unresolved in their later milestones.

Next action: owner reviews M3-A through M3-E for local implementation and isolated tests. This plan
does not itself activate writing, change an authority flag or authorize a staging migration/adoption.
