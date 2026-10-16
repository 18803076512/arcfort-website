# PR 130 Website Code Release Gate

Date: 2026-10-16 (Asia/Shanghai).
Status: `PASS_WITH_WARNINGS` for the reviewed website-code candidate only.
Product evidence approval, Console activation and full V1 completion are not granted by this gate.

Latest external outcome, verified 2026-10-17: merge and main CI passed, but Vercel deployment failed.
Website release/live acceptance is `BLOCKED`; see the dated follow-up below. The pre-merge gate
above is historical code evidence, not a successful deployment claim.

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

## Merge And Failed Deployment Follow-Up

Executed 2026-10-16; external state revalidated 2026-10-17 (Asia/Shanghai).

1. Documentation head `98875f1fbe539a69d04ba532fabaafe4a5bb82c0` passed both jobs in
   [run 38892905692](https://github.com/18803076512/arcfort-website/actions/runs/38892905692).
   Database logs again prove 32 suites / 1,881 assertions, 55 real database-backed browser scenarios,
   120 delayed history modules and the document/OEM/packaging acceptance summaries.
2. Immediately before merge, head/base were unchanged, all current checks were successful and PR
   state was CLEAN/MERGEABLE. The normal `--merge --match-head-commit` command merged
   [PR 130](https://github.com/18803076512/arcfort-website/pull/130) at 2026-10-16 11:30:55 UTC.
   No admin bypass, auto-merge, branch deletion or force push was used.
3. Merge SHA is `4ea67a0c2c10277d6a6c4defbb6a41afe1495921`; fetched `origin/main` has no file-tree
   difference from the tested documentation head. Its independent
   [main run 38894287382](https://github.com/18803076512/arcfort-website/actions/runs/38894287382)
   passed both jobs. Native logs confirm all 55 scenarios and all three opt-ins again.
4. Vercel automatically attempted Production deployment `dpl_4C9eFRRbG5a7SFi3u9CCkw8NUivN`,
   GitHub deployment `7117884289`, for that exact merge. It failed at 2026-10-16 11:32:28 UTC.
   [Provider detail](https://vercel.com/liangchenhuis-projects/arcfort-website/4C9eFRRbG5a7SFi3u9CCkw8NUivN)
   requires account login. The GitHub status provides no specific build error, only a command to
   inspect provider logs. No root cause is claimed from the failure flag alone.
5. On revalidation the Production list contains no newer attempt. The prior successful baseline
   remains deployment `5888116506` at `5d06a1140830714ca9c492ec751e9281d9fd3ac4`. Direct requests to
   the public domain return 200 for `/`, `/products`, `/rfq`, `/robots.txt` and `/sitemap.xml`;
   `/console/login` returns 404 and robots lacks the new candidate's Console disallow entry.
   These observations establish continued public availability, not a successful new release.
6. RFQ read-only status reports email/buyer confirmation/attachment delivery configured, BotID
   Basic and idempotency retained, storage readiness false and distributed rate limiting false.
   This matches the pre-merge baseline; no submission, email delivery or mailbox placement was tested.

The in-app Vercel page redirects to login; local CLI/session/token checks did not find a usable
Vercel session. Opening an optional page-provided plugin was denied by the browser approval gate
because its unspecified permissions could expand access. It was not opened, installed or worked
around. The ordinary login page is retained for owner handoff; a sanitized Build Logs error is an
alternative. Do not send passwords, tokens or OTPs into chat.

No runtime code was changed speculatively, no repeated deploy was triggered, and no DNS, account,
permission, email, analytics, Storage or database setting was changed. The website-only merge did
not run SQL, reset Docker/WSL, touch retained data, enable Console or approve product evidence.
The ignored `.tmp/pr130-live-smoke.mts` helper is prepared but NOT_RUN: failed deployment cannot be
validated as if it were the new public website. No new screenshot/live-layout pass is claimed.

Next action: obtain the actual build-error log, diagnose the exact failing contract, prepare a
scoped tested correction if needed, and independently verify the resulting deployment and domain.
Any new code fix requires current checks and the exact external-write boundary; the old PR is now
closed. Full Console V1, real 15AK and M5/M6 remain incomplete.

## Verified Cause And Authorized Repair

On 2026-10-17 the owner completed ordinary Vercel login. The existing deployment page was inspected
read-only, without the denied optional plugin or new permissions. Next 15.5.22 compiled successfully,
then its typecheck failed at `scripts/console/test-browser-server-smoke.ts:20:22` because
`./browser-runtime/node_modules/playwright/index.js` was unavailable. Root `npm ci` does not install
that isolated test runtime. Earlier CI installed it before build and therefore masked the failure.

The owner explicitly authorized a narrow fix, commit/push on the same development branch, a
follow-up PR, merge to main after full CI, and the existing Vercel production deployment. This
does not authorize database migration, Console activation, cost or permission changes.

The [build-scope decision](../../knowledge-base/decisions/2026-10-17-production-typescript-scope.md)
retains strict application checking and complete test-script checking. CI now builds with root
dependencies before installing isolated test dependencies. In a secret-free ignored source copy
with only root dependencies, the original Next build reproduced the exact provider error and the
repaired build passed (96 static outputs). The in-memory application type-error negative control
also passed. Full local typecheck and repository lint excluding ignored `.tmp/**` passed.
Local logs: `.tmp/root-only-build-MzSJI4/verification.json` and its negative/positive build logs.
The copy links the existing root node_modules, so it is not a fresh npm install; clean Linux CI
provides that independent installation gate. Its nested-workspace tracing warning is local-only.

Fresh repair-head CI, merge and successful production/live verification are still pending.
The earlier login handoff and failed release above are historical, not the current diagnosis.
