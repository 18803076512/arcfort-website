# M4 Document Readiness Integration

Date: 2026-10-14 (Asia/Shanghai).
Status: E10 local preparation verified; default-off, uncommitted and unapplied.

## Decision

Extend the [E9 workbench](2026-10-14-console-m4-document-workbench.md) with product-level document
readiness. This replaces only E9's deferred readiness integration, not its evidence or activation
boundaries. The [E1 immutable reference/version decision](2026-10-11-console-m4-document-reference-intake.md)
remains authoritative: naming a prior version never silently supersedes or approves it.

Every registered version is independently unresolved until it has a current original snapshot,
valid human rights/scope approval, historical signed byte observation and no open latest proposal.
Original or source drift invalidates current approval without deleting its history. Historical key
disable does not erase a completed observation. A rejected successor does not repair an invalid
current approval; an open successor blocks even while the prior approval is otherwise still valid.

Migration 34 derives seven counts per SKU: registered, reviewed, unresolved, original unavailable,
open review, invalid current approval and unresolved conflict. Cause counts can overlap; reviewed
plus unresolved must equal registered. An unreviewed version with a recorded contradiction remains
visible as a conflict. Zero registered documents remains an explicit zero, not proof of review and
not a new universal mandatory-document rule. Required document classes need a separate evidence-
backed policy, not inference from the absence of a row.

Unresolved documents add exactly one blocker family to the existing twenty-column readiness view.
The nine-metric dashboard contract stays unchanged; unresolved documents exclude a SKU from the
derived verified count. A separate trigger refuses entry/update into VERIFIED, READY_FOR_PUBLISH,
QA_PASSED or PUBLISHED while any registered document is unresolved. It neither rewrites lifecycle
history nor automatically publishes, demotes or confirms a product. Technical, compatibility,
media, OEM, packaging, SEO and release gates remain separate and unchanged. Document review's
`publication_ready` remains false.

## Read And UI Boundary

Views remain security-invoker with authenticated-only grants and underlying reader RLS. Narrow
boolean helpers check current authenticated Console access; service and anonymous claims do not
gain access. No migration data write, key provisioning, permission expansion or public endpoint is
introduced. The application review flag is not a database permission switch: SQL guards continue
to apply after migration independently of whether the optional UI is enabled.

Default-off application integration uses a separate extended readiness view, exact server counts,
stable SKU/ID ordering and 25-row server pagination/filtering. Malformed counts, partial pages,
duplicates, wrong identities and post-read access revocation fail closed. Document navigation is
offered only for current working SKUs; other records retain their counts without a dead-end link.
The product overview and readiness list reuse the existing Console components and unframed layout.
The document table column has a stable minimum width and contained horizontal scrolling on mobile.

Readiness is a current database snapshot projection, not a fresh download of every PDF and not a
publication authorization token. Native multi-connection and provider behavior still require the
isolated acceptance batch. Human document review does not establish every technical statement in
that PDF or replace exact-SKU technical verification.

## Evidence And Reversal

The [E10 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e10-document-readiness-integration)
records 34 embedded migrations, 32 suites / 1,881 assertions, generated public-member parity,
actual SQL-to-application count parsing, two source replays and exact rollback. Seven new readiness
unit groups, the broader 63-test application run, 22 guard/type tests, five browser groups across
six widths, final build/HTTP boundaries, lint/typecheck and public SEO/performance checks pass.
All data is synthetic or rolled back; no real evidence, document right or product fact changed.

Local preparation is PASS_WITH_WARNINGS; activation/external release is BLOCKED. Native Auth,
PostgREST, Storage, persisted browser decisions, concurrent races, full native CLI type generation
and real 15AK evidence remain unproven. E1-E10 are outside fulfilled B/C/D push/CI authorization.
No retained/hosted migration, actual upload/key, feature activation, push, CI, merge, deployment or
Docker/WSL operation occurred. Unapplied code can be reversed by a reviewed source change. After
application, preserve immutable history and correct forward. No repository rule is overridden.

Next prepare real disposable document acceptance, then obtain exact E-batch review/commit/push/CI
authority before external execution. Full V1, verified preview, release QA and the real 15AK
publication pilot remain required, not replaced by this local readiness milestone.
