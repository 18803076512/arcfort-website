# Product Intelligence Validation Reproducibility

Reviewed: 2026-09-03
Scope: Product Intelligence Console V1 Milestone 1 validation tooling, not a data-authority change.

## Locked Tools Are Part Of The Evidence

Run `npm ci` before generating Supabase types or comparing generated files. Having a lockfile in Git
does not prove the currently installed formatter matches it. On 2026-09-02, Prettier `3.9.6` and locked
`3.8.4` produced different helper-type layout for the same CLI schema output. The locked formatter
resolved drift without changing any table, column, function or domain type.

Do not hand-edit a generated schema to imitate CI output. Reinstall locked dependencies, regenerate,
review the diff and run `npm run console:db:types:check` against the migrated database.

## Minimal Cross-Platform Lock Repair

A successful Windows install is not proof that Linux clean install will pass. Optional native/WASM
dependency trees must remain complete in the committed npm lockfile.

When repairing a missing optional-dependency tree:

1. Preserve the committed `package.json` and `package-lock.json` together in an isolated directory.
2. Use the reviewed npm version and `install --package-lock-only --ignore-scripts --include=optional`.
3. Compare package versions and additions against the original lock; reject unrelated upgrades.
4. Verify a real clean install and CI on the target operating system, not only a dry-run.

Discarding the lock and resolving only from `package.json` can upgrade unrelated semver ranges. It
is not an acceptable substitute for a narrowly scoped optional-dependency repair.

## Three Different Environment Claims

- Static validation proves repository contracts, not PostgreSQL behavior.
- An isolated local Supabase stack on a Linux CI runner can prove migrations, pgTAP, generated types
  and repeated exact-row shadow parity for the tested commit. Record the run and commit together.
- Hosted staging parity requires the named authorized Supabase project, a reviewed dry-run and real
  remote evidence. A green local-stack job never grants hosted, production or publishing approval.

For every schema/importer change, repeat reset, all current pgTAP assertions, type drift validation
and two exact-row imports. Do not preserve a green label while changing the candidate beneath it.
Keep public CSV/TypeScript sources canonical throughout shadow migration.

## Evidence And Handoff

The Product Intelligence REST client must distinguish modern opaque Supabase secret keys from
legacy service-role JWTs. Modern `sb_secret_` keys go in `apikey` only; sending them as Bearer JWTs is
not the supported transport. Legacy JWTs retain both headers. Keep the existing server-only
environment variable compatible with both and test GET, PATCH and RPC requests without a real key or
network request. See [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

Owner authorization, browser Dashboard login, CLI login and project API credentials are separate
states. An unauthenticated 401 from the expected endpoint proves reachability only. The operator
must verify the named project using authenticated metadata before migrations; never treat a project
reference or a green local test as access credentials. Keep local staging files ignored by Git and
the explicit write flag off until the reviewed operation is ready.

On Windows, a PowerShell execution-policy error for a helper `.ps1` is not a Supabase authentication
failure: the CLI may never have started. Inspect the installed `supabase/dist/supabase.js` launcher to
resolve its native package, then invoke the verified `.exe` directly or from a local `.cmd` helper.
Do not weaken machine/user execution policy or permanently trust a publisher just to run this login.
The owner enters browser verification codes locally; no token belongs in logs or chat.

A later Windows probe found the CLI exiting with a non-interactive error in the launched console.
Using `--agent no` and explicit `CON` streams produced a login link, but did not prove an active
verification prompt or successful login; the owner still could not see the browser. A live shell
process, a browser process or HTTP 200 for the sign-in page is not authentication evidence.

When automatic browser login is unusable, let the owner create a personal access token in the
official account settings and enter it only into a local masked prompt. Pass it to the CLI using a
temporary process environment variable, never a command argument, transcript or repository file.
Clear the variable in `finally`. Native CLI credential storage can still fall back to a local
plaintext credential file when its secure store is unavailable; do not promise encryption without
checking that behavior. Verify access through a read-only lookup of the exact authorized project,
not merely the login success message. See the
[official CLI login reference](https://supabase.com/docs/reference/cli/supabase-login).

On 2026-09-03 the local token login succeeded, but the first Windows PowerShell helper displayed a
false failure. The native CLI emitted a non-fatal missing-project-link diagnostic on stderr while
returning valid project JSON with exit code zero. Windows PowerShell's `ErrorActionPreference=Stop`
turned that stderr into a terminating `NativeCommandError`, even with stderr redirected. The old
behavior was reproduced with a read-only query; the corrected lookup passed in Windows PowerShell.

For these native CLI calls only, collect output with non-terminating error handling, capture the
exit code immediately, then restore strict PowerShell handling. Always reject a nonzero code,
invalid JSON or a mismatched target. Keep diagnostics credential-free and clear temporary token
variables in `finally`. Do not relink a database just to silence a login-time warning, and do not
request another token when an independent authenticated lookup already succeeds.

Destination replacement requires fresh owner approval even when the project name stays the same.
Keep the superseded destination as historical evidence, update current local URL/reference together,
leave writes disabled and never reuse its project API key. The current scoped decision is
`knowledge-base/decisions/2026-09-03-product-intelligence-staging-replacement.md`.

The dated results, exact commit/run, Windows Docker limitation and owner project-creation steps are
maintained in `docs/operations/product-intelligence-console-milestone-1.md`. Approval and phase gates
remain in `knowledge-base/decisions/2026-08-30-product-intelligence-console-v1-foundation.md`.
No technical specification, image right, compatibility state or publication gate changes because a
toolchain test passes.

## Hosted Inspection Is Not A Test Runner

The installed CLI requires `--linked` together with `--project-ref` for explicit hosted SQL and
migration operations. This avoids relying on a stale persistent link. `db query` still performs
provider connection preflight, including possible temporary login-role initialization and local
cache writes, even when the supplied SQL is read-only.

A 2026-09-03 rollback-only probe against the authorized empty staging project returned only the last
of two SELECT result sets. Consequently, `db query --file <pgtap-file>` with exit code zero is not
proof that every TAP assertion passed. Require complete TAP results, assertion totals and failure
status from a proper test runner; retain the distinction between 74 CI assertions and unexecuted
hosted tests. Never weaken a release gate because a transport omits earlier results.

Use `db push --dry-run --skip-vault` with an explicit reviewed staging reference to inspect schema
scope without synchronizing unrelated Vault secrets. A successful dry-run is a preview, not an
applied migration. Inspect existing relations, functions, migration history, users and buckets before
applying; any unexpected state requires review, not an automatic reset. Record provider-verified
metadata separately from owner-reported plan/management information.

The official CLI `2.116.0` implementation confirms that `test db --linked` still runs pg_prove in
Docker, while local `db query` forces the extended query protocol. A hosted multi-statement result
observation therefore cannot be reused as proof of local query behavior. Relevant source:
[test runner](https://github.com/supabase/cli/blob/v2.116.0/apps/cli/src/legacy/shared/legacy-test-db.handler.ts)
and [query connection](https://github.com/supabase/cli/blob/v2.116.0/apps/cli/src/legacy/shared/legacy-db-connection.sql-pg.layer.ts).

The repository SQL-report adapter leaves pgTAP's assertion functions intact. It replaces only the
reviewed final `finish()` projection with suite/hash/plan/execution/failure/diagnostic reporting and
retains ROLLBACK. See [pgTAP's implementation](https://github.com/theory/pgtap/blob/main/sql/pgtap.sql.in)
for the counter and `finish(false)` contract. Missing/malformed version evidence, absent reports, partial
counts and failures must fail closed. Counters are not a substitute for source review: this adapter
must never execute arbitrary uploaded SQL.

Validate the adapter in the isolated CI stack alongside the original pg_prove runner, including
passing, deliberately failing and count-mismatch probes. Only the expected assertion-error type
may satisfy a negative probe; a connection error is not evidence of correct failure detection.
The new runner's real PostgreSQL contract was subsequently proven at
`202c189f1f062fa20fff8219aca3a0aba66f1c79` in
[isolated run 33714502709](https://github.com/18803076512/arcfort-website/actions/runs/33714502709).
The original runner and the new SQL path each passed 74 assertions on pgTAP `1.3.3`, including the
new runner's real positive, failing-assertion and plan-mismatch self-checks. Type parity and both
17-table shadow imports also passed. This closes the isolated SQL contract check only: the hosted
Management API transport still needs explicit-target execution after staging prerequisites pass.

The target-only organization endpoint returned HTTP 403 after a successful authenticated project
check. Its [official contract](https://supabase.com/docs/reference/api/v1-get-an-organization)
separates organization-read access from project access. Keep the owner's Free-plan statement as
owner evidence until the plan is independently visible; do not expand access or repeatedly request
tokens to resolve a billing-metadata gap.
