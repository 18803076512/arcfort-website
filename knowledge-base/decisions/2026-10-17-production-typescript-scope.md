# Production TypeScript And Isolated Test Dependencies

Date: 2026-10-17 (Asia/Shanghai).
Status: owner-authorized scoped repair; local negative/positive build verified; fresh CI pending.

## Evidence

PR 130 merged as `4ea67a0c2c10277d6a6c4defbb6a41afe1495921` after complete CI passed. Vercel
deployment `dpl_4C9eFRRbG5a7SFi3u9CCkw8NUivN` failed during typechecking, not compilation.
After owner login, the actual provider log showed a missing Playwright type import at
`scripts/console/test-browser-server-smoke.ts:20:22`. The root tsconfig included test scripts, but
the deployment installs only root dependencies. CI had installed the isolated browser runtime
before build, concealing the difference. An isolated source copy without nested test dependencies
reproduced that exact error with the original Next configuration.

## Decision

Use `typescript.tsconfigPath` in Next to select `tsconfig.build.json`, extending the unchanged
strict root configuration and excluding only `scripts` in addition to `node_modules`. All other
source roots and Next-generated route types stay included. Imported files still receive normal
TypeScript checking; an application import cannot bypass checks merely because its target is
excluded as a root. Do not set `ignoreBuildErrors`, stub missing packages or add test runtimes to
production dependencies. The existing inherited Next plugin remains present in parsed options;
Next 15 may emit an informational plugin suggestion for an extending configuration.

Keep `npm run typecheck` on the complete root configuration, after installing isolated browser
types in CI. Add a scope regression proving compiler-option parity, every non-script root's
inclusion, test-script retention in complete checking, and a deliberate in-memory application
type error. Its `--root-only` mode refuses installed browser/SQL runtimes. Run that mode and the
actual production build immediately after root `npm ci`, before any isolated test install.
Preserve subsequent full lint/typecheck, generated-data drift, hydration, package, SEO, performance
and native database acceptance gates. Generated-data checks must show no drift after the build.

## Scope, Authorization And Reversal

The owner explicitly authorized this fix on `18803076512/arcfort-website`, development branch
`codex/v2-industrial-brand-system`, a follow-up PR, full CI, then main merge and the existing Vercel
production deployment. No database migration, Console activation, paid service, account permission,
DNS or product-evidence change is part of this repair. Existing publication gates are unchanged.
This is not an override of repository rules.

Rollback is a reviewed source revert; no database reversal is needed. Reverting before changing
the dependency/build contract would restore the reproduced build failure. If directories change,
update the scope test so application roots cannot disappear silently. Do not relax checks to make
a deployment green. Provider success and actual public-domain checks remain separate release gates.

## Local Verification

The original full Next build fails with the same missing Playwright module in a secret-free source
copy containing root dependencies only. The repaired Next build completes with 96 static outputs.
The regression's strict type-error control passes, as do full repository typecheck and lint
(ignored local `.tmp/**` artifacts excluded). No retained database or original dependency tree is
modified. The root dependency directory is linked into the copy; clean CI must independently run
`npm ci`. Local build evidence is not a claim of successful deployment.
