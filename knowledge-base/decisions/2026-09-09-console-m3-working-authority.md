# M3 Local Working Authority Decision

Date: 2026-09-09
Status: M3-A through M3-E approved for local development and isolated testing only.

## Approval And Scope

The owner replied "Approved" to the specific M3-A through M3-E request: product editing and human
review, local development and isolated tests, no remote database modification or deployment.
This extends the [foundation decision](2026-08-30-product-intelligence-console-v1-foundation.md)
and [M2 boundary](2026-09-03-console-m2-access-boundary.md). The
[M3 plan](../../docs/operations/product-intelligence-console-milestone-3-plan.md) governs the batch.
No public product fact, real confirmation, role grant, SMTP, hosted adoption, merge or release is
authorized by this approval. The earlier M3 approval blocker is resolved; do not ask for it again.

## First Implementation Boundary

M3.1a is the authority barrier, not the completed M3 editor. Migration `202609090006` adds only
private control/ledger/functions and statement triggers. No existing migration, public data table
shape, RPC signature, view, website source, product ID or URL changes.

An immutable operational adoption requires all seventeen source tables to match the complete
reviewed manifest, a matching reconciled batch and source-file hashes, the four exact pilot SKU/slug
pairs, fifteen original technical references, a current authenticated owner and a repository commit.
It records full original rows and a SHA-256 baseline digest. A reference remains a reference.

All relevant catalog/import/release DML statements lock one control row. The adoption updates that
same row, so a waiting statement cannot rely on a stale in-memory flag. An unfinished multi-request
import blocks adoption. After adoption, the legacy importer and direct table writes are blocked,
including service-role upserts, empty statements and TRUNCATE. No ordinary caller receives access
to the private adoption command. Migration `202609090007` subsequently adds a narrowly scoped
private capability for owner/editor draft commands. This is tied to the backend transaction and
actor, not a caller-settable flag. No browser/API endpoint is enabled by this checkpoint.

This private operational function must not be invoked by applying the migration. Hosted adoption
still requires a separate exact-target preview/approval. Do not activate this barrier on staging
before the subsequent editing/review commands and full-stack gates are ready.

## Verification And Limits

An optional, locked, nested test package runs PostgreSQL WASM with pgcrypto and pgTAP in memory.
It does not read credentials, create a TCP listener or connect to hosted services. Minimal synthetic
Auth/storage schemas support SQL testing only, not Supabase authentication acceptance. It is not
part of the website runtime or root dependency lock.

The original 74 SQL assertions, 20 authority assertions and 32 draft-command assertions pass. Negative runner controls, two
real-source 17-table replays, manifest drift/role/unfinished-import rejection, baseline preservation
and post-adoption service-role denial pass. Draft revision/idempotency/atomicity tests also pass.
The official Supabase generator matches the complete committed public-schema type member from
embedded database introspection. Actual Supabase/PostgREST, CLI-wide type generation and
multi-connection transaction races require a fresh full-stack isolated run; the embedded result must
not be relabeled as that evidence. The public column contract is unchanged in the embedded database.

Sources for test tooling: [PGlite extensions](https://pglite.dev/extensions/) and
[PGlite API](https://pglite.dev/docs/api), plus the
[Supabase generator adapter](https://github.com/supabase/postgres-meta/blob/master/src/lib/generators.ts).
These sources do not change product verification rules.

## Draft Command Boundary

Draft copy is stored in typed private revision columns. Public relational products/variants retain
their identities and reflect only working name/model changes; original imported raw snapshots are
never rewritten. This is mutable internal working data, not a second public catalog. A future
read projection must expose only authorized copy/history fields, not complete audit or raw payloads.
Owner/editor commands check current roles even when replaying a receipt. Reviewer alone cannot edit
ordinary product copy; human technical review is a separate later command family.

## Recovery And Next Batch

The default migration leaves the authority ledger empty. Public data continues to use the repository
snapshot, with all real product evidence unchanged. For code recovery, use reviewed commits. If a
future authorized adoption occurs, never reset its marker or replay the old import over the baseline;
preserve the ledger and use an explicitly reviewed forward recovery.

Next: complete exact technical revision/review commands, then M3.2/M3.3
forms and M3.4 full acceptance, under the existing local-only approval. Do not resume email setup or
request another general M3 approval.

Subsequent local batch: [exact technical revisions](2026-09-09-console-m3-technical-revisions.md)
records migration `202609090008`, generated public metadata types and tested review commands. The
earlier 126-assertion result above describes this first checkpoint, not the latest complete test set.
