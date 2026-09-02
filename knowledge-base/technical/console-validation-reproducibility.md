# Product Intelligence Validation Reproducibility

Reviewed: 2026-09-02
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

The dated results, exact commit/run, Windows Docker limitation and owner project-creation steps are
maintained in `docs/operations/product-intelligence-console-milestone-1.md`. Approval and phase gates
remain in `knowledge-base/decisions/2026-08-30-product-intelligence-console-v1-foundation.md`.
No technical specification, image right, compatibility state or publication gate changes because a
toolchain test passes.
