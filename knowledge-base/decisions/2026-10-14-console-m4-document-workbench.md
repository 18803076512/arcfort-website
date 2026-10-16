# M4 Counted Document Review Workbench

Date: 2026-10-14 (Asia/Shanghai).
Status: E9 local preparation verified; default-off, uncommitted and unapplied.

## Decision

Extend the [E8 observation contract](2026-10-13-console-m4-document-observation.md) with strict
application commands, counted exact-document reads and human review controls. This completes that
record's application-form/read prerequisite only. It does not make Supabase the public source,
activate a feature, establish product publication readiness or replace native provider acceptance.

Source, proposal, submission and review inputs accept exact keys and bounded values. Unknown source
dates/revisions remain null. Source class, level, basis and dimension must agree. Only owners/editors
propose; owners/editors/reviewers register evidence and submit; owners/reviewers decide. Existing
current-role checks, actor-scoped request receipts and independent exact-local opt-in are retained.
The application flag is not a database permission boundary: migration 32's authenticated wrappers
remain governed by their SQL role/authority checks independently of that flag. No migration or key
has been applied/provisioned in retained or hosted environments.

Migration 33 exposes a reader-only exact-document RPC with independently counted 25-row source and
history pages. Selected evidence for latest/current candidates is returned separately (at most 40
distinct sources), so pagination cannot hide an approval's provenance. It returns no object path,
signing token/key, raw private snapshot, receipt payload or actor PII. Count, identity, sequence,
duplicate, source eligibility and snapshot inconsistencies fail the application projection.

Current approval, latest proposal and open work are separate. Document `reviewed` requires a fresh
current human approval AND historical trusted byte observation AND no open latest candidate. This
is a document rights/scope state, not a confirmed technical fact or product-ready/public-download
state. Later evidence/original changes invalidate current approval without deleting observation or
decision history. An old approval cannot hide an open successor.

The SQL read checks original/evidence digests before and after projection. The application repeats
the bounded read, compares normalized DTOs and rechecks current actor/roles before returning it.
These checks detect observed drift; they are not a claim of one atomic snapshot across nested SQL,
separate HTTP calls or a future mutation. Mutations retain the stricter E7/E8 exact-snapshot guards.

## Human Interaction

The private SKU document route uses the existing Console navigation, error, unsaved-input and
command-retry patterns. Evidence and history pagination preserve unsaved selections. Dirty evidence
and dirty proposals cannot be submitted as each other. Stale commands require deliberate reload.
Reader-only roles never get human decision forms; editors cannot approve a pending review.

APPROVE requires qualifying frozen rights/scope sources, conflict resolution when applicable,
complete signed original inspection and three explicit human declarations. The observation stays
in React memory; expiry, closing inspection or changing decision clears it and the declarations.
Expired structural command inputs remain parseable for exact historical receipt replay; SQL owns
whether a new approval is valid. No token is put in URLs, DOM text, web storage or reports.

EDIT records an atomic unconfirmed successor for the same document. REJECT can close stale work
without approving unavailable originals. Neither carries an observation or approval declaration.
Ordinary library/download labels no longer claim every recorded version is still pending review.
Native radio/checkbox appearance and 44px evidence targets preserve visible selections. All bands
remain unframed; wide evidence/history tables scroll inside their labeled regions on small screens.

## Evidence And Limits

The [E9 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e9-counted-document-review-workbench)
records 33 migrations, 32 embedded suites / 1,852 assertions, actual SQL-to-DTO checks, source replay,
rollback and generated public-member parity. Application/transport tests, 14 new plus 14 existing
browser groups, final built HTTP boundaries, traced handlers, lint/typecheck and public SEO/performance
checks pass. The browser fixture uses real React components with synthetic DTOs and mocked commands;
it does not prove persisted Auth/PostgREST/Storage, actual human review or multi-connection races.

Local provider absence was proven by free port 54321 and ECONNREFUSED, not by stopping a service.
Provider-absent HTTP validation is explicitly scoped to refusal behavior. Native provider acceptance,
complete native CLI type generation, product-level document readiness integration, real 15AK evidence,
verified preview/QA/publication and full V1 remain incomplete.

No real source, technical/compatibility/commercial fact, media right or publication changed. No
push/CI/merge/deployment, retained/hosted write, key provision, feature activation or Docker/WSL
operation occurred. Prior B/C/D approval does not cover E1-E9. Reversal before application is a
reviewed source change; after application, preserve immutable evidence and decisions and correct
forward. Next prepare document readiness and native isolated acceptance, then obtain exact-batch CI
authorization. No repository rule is overridden.
