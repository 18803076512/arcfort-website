# Console Media Inspection Boundary

Reviewed: 2026-09-24

The M4-A media workbench is a read-only view of governed database metadata. It does not replace
[product image governance](product-image-governance.md), approve rights or change the repository's
public source authority. See the [implementation and checks](../../docs/operations/product-intelligence-console-milestone-4.md).

## Keep Claims Distinct

- A mapping is not proof of file existence, correct geometry, usage permission or exact-SKU fit.
- Missing typed detail views are not cured by a general gallery/front/45-degree assignment.
- A current recorded asset approval is not a new reviewer decision and must not be treated as a
  per-SKU match for all products sharing that asset. The future write/review model needs immutable
  exact-variant bindings before it can support publication safely.
- Equal recorded hashes are metadata evidence of duplication, not a fresh byte comparison. Unknown
  hashes are not evidence of uniqueness. A same-name or similar-looking image is not a duplicate test.
- Safe reference paths may open existing local public images. Private bucket/path/source values
  must not become browser links or enter DTOs, analytics or public reports.

## Counted Page Reads

Product/asset pages are server-paginated. Related mapping and duplicate queries must be scoped to
the visible IDs/hashes and independently paginated, because embedding a large relation can silently
hit provider row limits. Validate counts, unique IDs and completeness; fail closed on observed drift
or a resource bound instead of reporting a false missing image. This is still not transaction-wide
snapshot isolation. Mutable review commands will need version/digest checks at decision time.

Real authorization and PostgREST behavior require fresh disposable-stack tests. A synthetic browser
fixture proves component interaction/layout only; a real SDK with mocked HTTP proves request shape
and projection only. Never reset or replay an adopted catalog to rerun a disposable test.

## Exact-Scope Intake Preparation

On 2026-09-26, local migration 13 prepared immutable source bindings for a specific SKU, image,
role and separate usage-rights/product-match dimension. See the
[media evidence decision](../decisions/2026-09-26-console-m4-media-evidence.md).
It does not add upload, mapping or approval controls to the workbench, verify original bytes, or
change any existing media status. All read-only inspection limitations above still apply.

On 2026-09-27, the [original-intake foundation](../decisions/2026-09-27-console-m4-original-intake.md)
adds private upload ledgers, scoped Storage policy candidates and a server-only actual-byte validator.
It is not yet connected to Storage upload/readback or an owner interface. The SQL completion remains
explicitly `not_attested`; the standalone validator does not authenticate a stored object or approve
rights/match. Existing public originals and geometry are unchanged.

The same-day [B8 upload integration](../decisions/2026-09-27-console-m4-original-upload.md) connects
authenticated standard upload, exact stored-byte readback and a SKU intake/history form behind an
independent default-off flag. Its local transport and UI tests are synthetic; real Auth/Storage
acceptance remains outstanding. Direct RPC completion still cannot attest bytes, and a received
original is neither an approved mapping nor evidence of rights or product match. No retained/hosted
schema, original image or public registry changed.

B9 corrects the original endpoint's [session cookie scope](../decisions/2026-09-27-console-m4-original-cookie-scope.md):
`/console/originals` receives the existing private Console cookie while only that exact streaming
path skips the middleware body clone. Browser cookie delivery and compiled route coverage are now
checked; neither establishes real Storage acceptance or upgrades media evidence.

## Stored Originals Before Human Review

Reviewed: 2026-10-04. The local [B11 inspector](../decisions/2026-10-04-console-m4-stored-original-inspection.md)
re-reads private completed originals by exact SKU/asset identity and compares actual raster bytes
with their manifest. It returns unchanged bytes through authenticated private HTTP, not a Storage
URL. Temporary browser blob previews/downloads are inspection only; they cannot confirm rights,
product match, mapping or publication. Preserve the separate SQL `not_attested` boundary.

B1-B10 real isolated acceptance passed on September 28. That historical result does not prove the
new inspector: its current local SDK and browser tests use mocked/synthetic transport. Fresh
authorized disposable-provider acceptance remains necessary before activation or human media review.

## Mapping Drafts Are Not Effective Images

Reviewed: 2026-10-04. The local [B12 mapping foundation](../decisions/2026-10-04-console-m4-media-mapping-drafts.md)
binds immutable proposals to one SKU/role/slot, one exact completed original and separately scoped
rights/match sources. Submission freezes a current content digest; omission cannot hide a known
contradiction. Recorded object identity is not byte attestation, and evidence counts do not approve
an image. Existing effective mappings, global asset states and public registries remain unchanged.

The open-proposal lifecycle guard is not complete readiness/dashboard integration or a retroactive
demotion. Before activation, implement current/effective mapping reads and explicit human
APPROVE/EDIT/REJECT with stored-original inspection and both evidence dimensions. Embedded metadata
fixtures, including those using real SKU identities, are not real Storage or owner approval evidence.

## Private Human Review Foundation

Reviewed: 2026-10-04. [B13](../decisions/2026-10-04-console-m4-media-mapping-review.md) adds exact
pending-snapshot human decisions, separate rights/match declarations and current/effective/readiness
SQL views. EDIT preserves conflict and history; REJECT retains the preceding mapping; an invalid
current approval does not restore legacy silently. Approved private originals remain unavailable
for public/search output, with global asset and original public mapping rows unchanged.

These are private commands with synthetic SQL validation, not an activated reviewer interface or
byte-attested approval. An inspection declaration cannot prove that a read/download took place.
Before granting application mutation access, bind actual private byte revalidation to the exact
review observation and verify human controls plus real Auth/Storage/concurrency in a disposable stack.

## Application Observations Are Not Human Or Public Approval

Reviewed: 2026-10-04. The local [B14 command integration](../decisions/2026-10-04-console-m4-observed-media-commands.md)
prepares a separately disabled pending-mapping inspector and authenticated review wrappers. A
short-lived server signature binds actual byte processing to the exact actor/adoption/candidate/
original snapshot; database verification refuses copied declarations, stale snapshots and nonce
reuse. The ledger retains a token digest, not signing material or a replayable raw token.

No real key is provisioned, migration applied or reviewer UI activated. Byte processing is not
proof a human inspected the image or independently confirmed rights/match. Historical observation
and current evidence validity remain separate; future reviewer/preview/QA projections need both.
Keep original completion `not_attested`, private output unavailable for publication, and native/
provider/concurrency acceptance outstanding. Embedded signatures and synthetic rights records do
not confirm real 15AK images or finish the pilot.

## Local Reviewer Workbench

Reviewed: 2026-10-04. The [B15 workbench decision](../decisions/2026-10-04-console-m4-media-mapping-workbench.md)
connects counted exact-SKU original/source/current/history reads to explicit propose/submit/review
controls, while retaining independent default-off boundaries. Include unselected contradictions;
detectable same-head review drift must fail closed. Bounded reads are not an atomic snapshot.

Display current validity and matching historical observation separately. SQL-only internal approval
without observation is not full application approval; invalid current proof cannot restore legacy.
Private originals never become public/search-eligible merely through mapping approval. Keep browser
tokens in memory and clear acknowledgements on close, failure, context change and expiry. Fresh
inspection does not renew a human declaration automatically. Source creation requires latest-record
reload before decisions and never approves or selects that source automatically.

Fourteen synthetic browser groups and seven SDK/domain read groups validate local UI only. Real
native/Auth/Storage/concurrency acceptance, real 15AK evidence and separately authorized activation,
public output, preview/QA/publication remain outstanding. No retained/hosted data or original geometry
was changed, and no signing key was provisioned.

## Disposable Native Acceptance Is A Separate Gate

Reviewed: 2026-10-05. The [B16 preparation](../decisions/2026-10-05-console-m4-disposable-media-acceptance.md)
extends the guarded real-service runner with media forms/observations/review, exact fixture counts,
observed transaction contention and unchanged-source/no-publication checks. An ephemeral random key
may be provisioned only after the full pristine target check; keep it out of the build, browser,
CLI arguments and artifacts, then disable it even on failure. A lost provisioning response requires
an exact-ID disable attempt, not an assumption of rollback or removal of other work.

Local guard, embedded SQL and no-provider browser success is not native acceptance. New real-service
scenarios remain unrun and require fresh exact-batch CI permission. Keep preserved Docker/WSL data,
hosted providers and all real 15AK evidence untouched. Synthetic declarations cannot approve a real
image or complete the product pilot. Preserve independent activation and public-output gates.

## Sequential Rehearsal Before Native Execution

Reviewed: 2026-10-05. The [B16 review follow-up](../../docs/operations/product-intelligence-console-milestone-4.md#b16-review-follow-up)
executes the actual domain parser, server signer and SQL wrappers with simulated actors and object
metadata inside one rollback-only in-memory transaction. Reuse the exact key insert/disable SQL,
but retain transaction ownership in the caller. Require a pristine baseline before key generation
and exact full-row source parity after rollback, not only matching record counts.

Synthetic evidence dates must follow the validator's execution UTC date; a fixed local-calendar
date can be in the future before UTC midnight. This fixture correction does not change factual
evidence dates or the actual-source validation policy. A passing sequential ledger/history rehearsal
is not original-byte inspection, human product evidence, real provider or multi-connection proof.
