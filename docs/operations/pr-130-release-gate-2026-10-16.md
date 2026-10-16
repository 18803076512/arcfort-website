# PR 130 Website Code Release Gate

Date: 2026-10-16 (Asia/Shanghai).
Status: `PASS_WITH_WARNINGS` for the reviewed website-code candidate only.
Product evidence approval, Console activation and full V1 completion are not granted by this gate.

## Candidate And Destination

- Repository: `18803076512/arcfort-website`, PR 130, `codex/v2-industrial-brand-system` -> `main`.
- Tested head: `2fbead813b1c86dbf7e5591ca04658bd4ad01e94`.
- Base and current production rollback baseline: `5d06a1140830714ca9c492ec751e9281d9fd3ac4`.
- Fresh PR state: open, non-draft, mergeable/CLEAN, both checks successful, zero review threads.
- Whole PR scope: 673 files at this head, including the staged V2 public design and M1-M4 Console;
  this is not an E1-E11-only production change.
- Destination: the existing Vercel website at `https://www.arcfortweld.com`; no new provider/account.
  Last observed Production deployment is `5888116506`, created 2026-08-13, at the base SHA.
- Owner explicitly authorized this PR/main merge and deployment after naming the environment and
  consequences. See the [authorization](../../knowledge-base/decisions/2026-10-15-console-m4-document-ci-authorization.md).
  It does not waive evidence, destructive-operation, credential or paid-service gates.

## Applicable Checks

| Gate                           | Result and evidence                                                                                                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code and deterministic data    | PASS: current quality CI lint/typecheck/build, product/import/evidence/series/compatibility validators, generated-file drift and secret scan.                                                                          |
| Database and private workflows | PASS: native disposable 32 SQL suites / 1,881 assertions, types, repeated 17-table parity, Auth/RLS, 1,103-row pagination, 55 browser scenarios, explicit document/OEM/packaging ledgers and retention.                |
| Public runtime                 | PASS: CI 120 delayed-module loads, zero page errors. Local unchanged-byte old-build negative control fails; repaired build passes.                                                                                     |
| Responsive and interaction     | PASS: local 60 route/width cases at 360/390/768/1024/1280/1440, image/H1/canonical/overflow checks, inspected homepage/product screenshots; 390/1440 keyboard menu and RFQ-selection persistence/removal journeys.     |
| SEO and projection             | PASS: current SEO, built links, image evidence, snippet and performance checks. Public paths/canonicals are retained; held 15AK series redirects to its category and stays out of sitemap. Console is noindex/private. |
| RFQ safety                     | PASS for code regression: current RFQ and builder tests; no `app/api` or `lib/rfq` diff from base. No controlled inquiry was sent; actual inbox placement is not proven.                                               |
| Deployment isolation           | PASS: branch auto-deployment stays disabled; Vercel environment is rejected by Console config; mutations require exact loopback/local provider and explicit flags. SQL files are not applied by website deployment.    |
| Live release verification      | NOT_RUN at gate preparation. Must verify the actual merge/deployment SHA, public domain, routes/assets/headers, robots/sitemap and RFQ readiness after deployment.                                                     |

The source of native results is
[run 38851302412](https://github.com/18803076512/arcfort-website/actions/runs/38851302412), not
earlier partial passes. Native assertion details are retained in the
[M4 acceptance record](product-intelligence-console-milestone-4.md#e1-e11-native-acceptance-passed).
Local evidence: `.tmp/e-release-smoke/report.json`, `.tmp/e-public-journey.json` and
`.tmp/public-hydration/report.json`. They contain synthetic/read-only data and are not CI artifacts.

## Warnings And Boundaries

No blocking code regression was found for the scoped website release. These existing limitations
remain visible and must not be represented as new capabilities or factual approvals:

1. Owner/product-evidence follow-up: 43 structured SKUs, zero strict verified SKUs, 40 existing
   active legacy-reference products and three drafts. Existing reference presentation is retained
   under the migration policy; it does not pass the new-product publication gate. Exact images,
   rights and real 15AK facts remain missing. No blocked series or draft is promoted.
2. Owner/sales follow-up: RFQ sales and buyer inbox placement, DMARC, credential-rotation confirmation,
   analytics conversion and Search Console submission remain separately unverified. No claim of
   successful inquiry delivery, indexing or attribution is permitted.
3. Engineering/owner follow-up: the online Console stays unavailable. Hosted staging has not been
   upgraded to the tested M4 schema, local retained data are not a disposable fixture, and M5/M6
   are unfinished. Database migrations/activation require their own exact preflight.
4. Engineering follow-up: the keyed Fragment is a tested workaround for the bundled React replay
   defect. Remove it only after verifying the bundled upstream correction and rerunning regression.

Canonical product identifiers, real verification states, commercial terms and public data authority
are not changed by this acceptance record. Earlier PR data changes include the already-reviewed TIG
collet-body reference-image correction and explicit legacy asset governance, not exact-SKU approval.

## Execution And Rollback

Next: commit only these evidence records to the authorized branch, require fresh checks for the
resulting head, then re-read head/base/checks and merge only that exact SHA without bypassing branch
protection. Observe the existing main deployment and perform read-only production verification.
Do not run SQL, set Console flags, change DNS/email/analytics/storage permissions, or submit RFQs as
part of the merge command. Do not claim release success from GitHub merge or provider acceptance alone.

If deployment fails, retain the existing production deployment and diagnose the exact failure;
do not use a database reset or broaden provider permissions. If the new public site regresses,
prepare a reviewed source revert of the merge against the recorded baseline, or use the existing
provider rollback only after its exact target and effect are verified. No database rollback is
needed for this website-only action because no migration is included.

At this checkpoint no merge, production deployment, hosted/retained write or activation occurred.
Record actual external outcomes in a dated follow-up, never retroactively infer them from this gate.
