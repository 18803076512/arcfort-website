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
