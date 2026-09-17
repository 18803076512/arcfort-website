# M3 Isolated Acceptance Runner

Reviewed: 2026-09-17. Status: SQL/types/imports and all ten real browser scenarios pass; final
retention was independently repeated. Overall process exit evidence and current clean CI remain
unproven. Read the latest dated section before using historical recovery steps.

This is the next acceptance batch under the existing M3 local-development approval. It does not
authorize hosted adoption, provider changes, CI dispatch, deployment or real technical confirmation.

## Scope And Entry Points

- `npm run console:working:test:guards`: seven process-free groups for invocation, environment,
  Docker context/container, loopback endpoints, SQL literals and pristine baseline refusal.
- `CI=true npm run console:working:test:local`: real local Supabase Auth/PostgREST commands and
  PostgreSQL connections. The environment assignment shown is POSIX shell syntax for Linux CI.
- `scripts/console/local-acceptance.ts`: fail-closed local transport and lock observation.
- `scripts/console/test-working-isolated.ts`: synthetic sessions, persistence and review assertions.
- `npm run console:browser:test:guards`: four provider-free server/privacy guard groups.
- `CI=true npm run console:browser:test:smoke`: current production Next plus a real browser, with
  no provider listening on 54321. It proves refusal behavior, not login or database writes.
- `scripts/console/test-working-browser.ts`: ten persisted-browser scenarios, invoked by the full
  local runner after its real-service assertions. See the [runtime guide](../../scripts/console/browser-runtime/README.md).

The runner requires exactly `--local`, `CI=true`, the repository project ID, a local Unix socket or
Windows named pipe, the matching running Docker database container, HTTP `127.0.0.1:54321` and
PostgreSQL `127.0.0.1:54322/postgres`. TCP/SSH Docker contexts and ambient provider/database/application
overrides are rejected. Keys come only from local CLI status and remain in process memory. Config
must retain the local mail collector and the provider must report invite-only access.

Before any synthetic account creation, the database must contain exactly 43 imported variants and
zero Auth users, roles, adoptions, working drafts or verification events. An existing database is
never reset by this runner. Exact adoption independently compares all seventeen source tables and
source-file hashes with the current repository projection. Synthetic approvals target newly created
test products only; all original technical-value and variant rows are compared again at the end.

## CI Sequence

The existing database job keeps its migration, pgTAP, type, double-import and M2 Auth/pagination
checks. M2 leaves 1,103 synthetic pagination variants, so the workflow then explicitly resets its
disposable local database, imports the repository twice again and invokes the M3 runner. This reset
is confined to the existing disposable job, not a recovery option for adopted working data.

The runner covers pre-adoption denial, a real legacy-write transaction blocking exact adoption,
post-adoption service replay/reconciliation denial, create/retry/reload, concurrent duplicate
identity, competing saves with stale-revision rejection, minimal history, source-link rollback,
missing/secondary evidence denial, explicit EDIT/APPROVE/REJECT, reviewer attribution, duplicate
approval, stale decision and revoked-role rejection at both command and direct RPC boundaries.

For concurrency, a separate psql session holds the authority row; the runner waits until
`pg_blocking_pids` reports the required callers before releasing it. PostgreSQL documents both held
locks and earlier conflicting waiters as blockers in its
[session-information reference](https://www.postgresql.org/docs/17/functions-info.html#FUNCTIONS-INFO-SESSION).
Failure to observe contention fails the test. Requests, SQL statements and idle transactions have
timeouts; callers are drained after release even on failure. Raw SQL, provider responses, credentials
and session content are not printed. Failures identify only a fixed checkpoint. Failed fixtures are
left for local inspection until the disposable job stops its services with `--no-backup`.

## Database-Backed Browser Extension

The same disposable run now invokes real browser form login, create/retry/reload, two-tab stale save,
copy history, source-free approval refusal, source-bound EDIT, explicit APPROVE/REJECT, technical
history, viewer controls, responsive pages, revoked reviewer and logout rejection. Successful
responses are not mocked: the runner uses actual HTTP and independently reads persisted data.
The browser creates one additional synthetic product; all original source rows are compared again
after browser work. It never approves an imported real-product fact or publishes a product.

`browser-server.ts` builds the current production app, starts only its own loopback server and closes
it after success or failure. Service/email/analytics secrets and runtime overrides are stripped from
the child environment; all automatic production `.env` files and an occupied port cause refusal.
Local synthetic credentials stay in memory, while browser contexts block external requests and
service workers. No personal profile, storageState, trace or HAR is retained. A full successful run
writes a bounded report and twelve synthetic screenshots under `.tmp/console-working-browser/`.

The separately locked `browser-runtime` pins Playwright/core 1.62.1 with registry integrity. CI
installs test types in both jobs and the matching Chromium only in the database job. It then invokes
the integrated runner; the existing 20-minute job limit and previous M1/M2 gates are preserved.

## Evidence And Remaining Gates

The audited change set is the uncommitted acceptance-tool and browser-extension batches on
`codex/v2-industrial-brand-system`, limited to the listed scripts, independent browser runtime,
package/CI wiring and linked documentation. Its intended destination is disposable local testing,
not hosted release.

At the preceding acceptance-tool checkpoint, the seven guard groups, eight command-contract groups, typecheck, focused lint
and existing 240 embedded SQL assertions passed. The official public-type check, two exact source
replays and retention of all fifteen real pilot reference scopes also passed. Formatting, diff
whitespace checks and a 515-text-file secret scan passed; Git emitted only existing LF/CRLF notices.
These were supplemental checks, not a successful run of the new real-service scenarios. Production
build, responsive browser, SEO and RFQ tests were not rerun in that earlier test/documentation-only
batch. The subsequent browser-extension build and smoke evidence is listed below.

The real runner exited nonzero at local preflight. Docker/psql commands were unavailable and neither
54321 nor 54322 was listening. WSL enumeration initially returned `E_ACCESSDENIED`; a separately
permitted read-only elevated check found a registered `docker-desktop` distribution. Attempting to
inspect its Docker CLI failed at VM creation with `HCS_E_SERVICE_NOT_AVAILABLE`. The default Windows
Docker CLI install path was also absent. No virtualization setting was changed, no account, role,
adoption or product was written, and no remote CI run was dispatched.

Read-only environment recheck on September 11: `WslService` is running, but the queried `vmcompute`,
`hns` and Docker service entries were not returned. CIM reports `HypervisorPresent=false`, while
`VMMonitorModeExtensions`, `VirtualizationFirmwareEnabled` and
`SecondLevelAddressTranslationExtensions` are all true. Starting the registered Docker distribution
again returns `HCS_E_SERVICE_NOT_AVAILABLE`, explicitly reporting a missing required feature.
`Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform` cannot run in the current
tool session because Windows requires administrator elevation. The exact optional-feature/boot
configuration is therefore still unverified; do not assume a BIOS change is required. Administrator
diagnosis or an available authorized disposable local environment is needed before the full suite can
advance. No system features, boot settings, services or installations were changed.

September 11 browser-extension checks: four server/privacy guard groups, complete typecheck and
focused lint pass. The real production build + Edge smoke passes: unavailable-provider login state,
no password form/session cookies, same-origin command HTTP 503, cross-origin HTTP 403, private/noindex
headers, zero external requests, and owned-server shutdown/port release. This smoke does not submit
credentials or write to a database. Earlier M3 guards and embedded SQL evidence remain separately
scoped; the added full browser scenarios and their screenshot set have NOT executed successfully.
Clean installation from the browser lockfile, formatting, diff checks and the current 523-text-file
secret scan also pass. The scanner's rules were not changed for synthetic test values.

### September 12 Administrator Diagnosis

Following explicit owner permission for administrator diagnosis and local repair, a read-only
PowerShell 7 helper completed with a verified administrator token and exit code zero. Windows
PowerShell 5 had refused script execution; no execution policy was changed. The bounded local
diagnostic is retained in `.tmp/wsl-admin-diagnostic.json` and the findings are recorded here so
future work does not depend on that temporary artifact.

- Windows 11 Pro build 26200: `VirtualMachinePlatform`, `Microsoft-Windows-Subsystem-Linux`,
  `HypervisorPlatform` and `Microsoft-Hyper-V-All` are `Disabled`.
- Firmware virtualization and VM/SLAT capabilities are enabled; no active hypervisor is detected.
  The successful current-boot query does not explicitly list `hypervisorlaunchtype`. This is not
  evidence that the launch type is `Off` and does not justify changing boot configuration.
- `WslService` is running. The exact `vmcompute`, `hns`, `LxssManager` and `com.docker.service`
  lookups report no service. The two queried servicing/Windows Update reboot indicators are absent.
- WSL 2.7.12.0 and Docker Desktop 4.89.0 are already installed. Docker is a per-user install under
  `%LOCALAPPDATA%\Programs\DockerDesktop`; its CLI reports 29.7.2. Earlier missing-PATH/default-path
  checks did not establish that Docker was uninstalled. Do not reinstall it on that basis.
- Docker context `desktop-linux` points to local named pipe
  `npipe:////./pipe/dockerDesktopLinuxEngine`. A read-only engine query fails because that pipe is
  absent. The real-service/browser acceptance is still not executable.

At the diagnostic checkpoint, the proposed minimum repair was to enable only `VirtualMachinePlatform` with `-NoRestart`, after
specific owner confirmation of component activation, then request a separate restart when needed.
The already installed modern WSL does not require enabling the legacy WSL 1 component; do not enable
full Hyper-V, change firmware/boot settings or reinstall Docker as an initial repair. Microsoft
documents [Virtual Machine Platform activation and the possible restart](https://learn.microsoft.com/en-us/windows/wsl/install#offline-install)
and [the distinction between modern WSL and the legacy optional component](https://learn.microsoft.com/en-us/windows/wsl/basic-commands#install).
Docker documents [the per-user install location](https://docs.docker.com/desktop/setup/install/windows-install/#installation-modes).
After activation/restart, recheck actual feature and engine state and use the existing CLI directory
on the test process PATH only. Do not assume this alone proves successful M3 acceptance.

No component, execution policy, service configuration, boot setting, software installation or
restart was performed during this diagnosis. No remote environment or product data was changed.

### September 12 Authorized Component Activation

The owner subsequently explicitly approved enabling only `VirtualMachinePlatform` without automatic
restart. An administrator-token-verified PowerShell 7 helper executed
`Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart` successfully
and exited zero. It did not use `-All` or request activation of any other feature. Before/after
queries of all optional features identify exactly one changed feature: `VirtualMachinePlatform`,
from `Disabled` to `EnablePending`. The command returns `RestartNeeded=true`; the servicing reboot
indicator is present and no active hypervisor is detected yet.

The helper and bounded result are retained at `.tmp/enable-vmp-no-restart.ps1` and
`.tmp/vmp-enable-result.json`; the local DISM log is `.tmp/vmp-enable-dism.log`. No restart, Docker
reinstall, execution-policy change, boot-setting edit or remote write occurred. The activation
request has completed, but the component is not yet verified operational. Do not repeat activation
while it is pending or claim Docker/M3 acceptance from the successful command.

Next requires an owner-controlled Windows restart after saving other work. On return, independently
verify feature state, hypervisor presence and the existing local Docker engine, then continue the
isolated acceptance sequence. No automatic restart or rollback is authorized. A rollback would
disable this component and must be separately reviewed; no rollback was performed.

Full M3 remains **BLOCKED**: the integrated real-service/browser runner still needs its first
successful isolated run and failure investigation where necessary. Request/cookie and persisted
create/save/review/history browser flows now have executable scenarios, not completed acceptance.
The existing synthetic UI fixture and unavailable-provider smoke cannot substitute for that proof.
Real 15AK Level A evidence, exact-product image rights and later publication gates are unchanged.

Next action: run this exact candidate in an available disposable local Supabase environment, retain
bounded real-service/browser evidence, and resolve actual failures before requesting any hosted
migration/adoption authorization.

## September 13 Post-Restart Checkpoint

### Environment Recovered

The owner reported completing the Windows restart. Independent checks found
`VirtualMachinePlatform` enabled, `HypervisorPresent=true`, and the existing per-user Docker engine
operational at version 29.7.2. No further Windows feature, boot, execution-policy or installation
change was made. Docker's directory was added only to test-process PATH.

Docker startup also failed on stale IPC socket renames. After verifying failed startup had stopped,
the exact directories were renamed intact and empty replacements created. Retained directories:

- `%LOCALAPPDATA%\Docker\run.pre-repair-20260912-1`
- `%LOCALAPPDATA%\Docker\run.pre-repair-20260913-1`
- `%LOCALAPPDATA%\Docker\run.pre-repair-20260913-2`
- `%LOCALAPPDATA%\docker-secrets-engine.pre-repair-20260913-1`

Each source directory was checked to contain only the observed zero-byte IPC entries. No Docker
image, container disk or volume was deleted. The secrets-engine directory contained only its
zero-byte `engine.sock`, not credential files. The failure recurred after a later engine stop;
this is a successful recovery, not a permanent root-cause fix. A workspace-only socket probe
successfully renamed both compressed and uncompressed sockets, so compression was not established
as the cause and Docker folder compression was not changed. Do not repeat quarantine blindly.

The retained Supabase stack initially still ran an old Auth configuration: actual settings returned
`disable_signup=true`, `mailer_autoconfirm=false`, but `external.email=false`. A project-scoped
`supabase stop` without `--no-backup`, followed by `start` with the previously unused services
excluded, retained data and loaded the existing repository configuration. The live settings then
returned `external.email=true`, with signup disabled and autoconfirm false. SMTP remains the local
collector. No hosted Auth or email-provider setting changed.

### Real SQL And Drift Evidence

The original local `postgres` database contained 43 shadow variants, zero Auth users, zero roles and
no working adoption. Four M3 migrations (versions 006 through 009) were previewed and applied locally.
The existing first five migration version records did not prove current object definitions: the
actual SEO UPDATE policy omitted `publisher`, unlike the current migration 005 source.

The original empty-fixture SQL suites could not pass on an already imported 43-product database.
Separate local QA databases preserved that data while testing the original SQL sources:

- `arcfort_m3_qa_20260912`: partial failed schema restore retained, not an acceptance database.
- `arcfort_m3_qa_20260912_b`: rebuilt application schemas from all nine current source migrations;
  240 assertions passed at that checkpoint. Rebuilding `public` removed platform defaults, so this
  result was not treated as proof of identical platform ACLs.
- `arcfort_m3_qa_20260913_c`: copied original schema ownership, ACLs and non-public platform state,
  excluded public rows, and aligned only the SEO policy with migration 005. All 240 assertions and
  positive/failure/count-mismatch controls passed on real pgTAP 1.3.3.

The same reviewed SEO policy was then applied only to the local API database, with product/fact
hashes unchanged. No first-five migration source was edited. CLI-generated types were regenerated
through the existing tool and the complete local type check passed. Two real local imports each
passed exact-row parity for all seventeen source tables before any adoption.

### Failures Found And Fixed

The first actual Auth run created five synthetic accounts and four roles, then failed because a
viewer calling the create RPC before adoption received `55000` instead of `42501`. Both private
command guards now reject unauthorized roles before inspecting/locking adoption state, while
retaining the authority-then-role lock order and locked current-role recheck. The changes are in
unreleased M3 migrations 007/008, and their two function definitions were updated locally without
replaying whole migrations. Migration 009's wrapper grants remain unchanged.

Six new pre-adoption viewer regressions cover create/save/source/propose/submit/review. All six
failed against the pre-fix real database. After the fix, all nine suites / **246 assertions** passed
on the ACL-preserving QA database; embedded tests also passed 246, official public-type parity, two
source replays and all fifteen original pilot-reference scopes. The first five inspected synthetic
Auth fixtures were removed only after diagnosis, before adoption; original row hashes and audit
history were preserved. The runner itself still contains no cleanup/reset path.

The next full run passed real password login, pre-adoption denial, observed import/adoption lock
waiting, and post-adoption legacy-service replay rejection. It created two synthetic drafts, then
failed its duplicate-create contention observation. The observer counted only direct blockers;
it now follows the materialized `pg_blocking_pids` graph from the test lock holder with recursive
`UNION`, scoped to the current database. PostgreSQL documents both held-lock and queued blockers in
its [session-information reference](https://www.postgresql.org/docs/17/functions-info.html#FUNCTIONS-INFO-SESSION).
A same-target diagnostic reproduced the old observation failure, then observed two blocked callers
with the new query; both attempts against the existing synthetic SKU returned `23505`. This proves
the observation correction, not a fresh successful create-race or full runner pass. Timeouts,
required waiter counts and caller draining were not relaxed. Failure checkpoints now distinguish
account creation, role assignment, login and each pre-adoption denial.

### September 13 Pre-Approval State And Gate

The local API database now retains **45 variants, five synthetic Auth users, four roles, one test
adoption, two draft heads and zero verification events**. No real technical value was confirmed and
no publication occurred. Never replay the shadow importer or reset this adopted database.

The complete runner still needs a fresh isolated baseline. A proposed local-only preservation
operation would stop API consumers, rename the failed `postgres` database to
`arcfort_m3_failed_20260913`, create a new `postgres` database from the verified empty QA template,
and retain the existing local platform database ACL/settings. Automatic safety review rejected
this higher-impact database/configuration switch for insufficient specific authorization.
**It has not executed.** Explicit owner approval for that exact operation is pending; no indirect
workaround or database deletion is authorized. The prepared ignored helper is
`.tmp/preserve-m3-failed-database.mjs`, not a general rollback procedure.

Current non-provider checks pass: seven local-target guard groups, four browser-server guard
groups, eight command groups, local mail/layout boundaries, nine-migration validation, SQL-report
contracts, complete typecheck and focused lint. Full browser persistence/screenshots and current
original pg_prove/clean-CI execution remain unproven. No new production build, SEO/RFQ or responsive
acceptance is claimed for this SQL/test-tool repair. No commit, push, remote CI, hosted migration,
hosted adoption, deployment, publication or public-data authority change occurred.

### September 13 Later Revalidation

No explicit owner approval for the database-name/configuration switch arrived during the subsequent
automatic continuations. That operation remains unexecuted. A read-only check reconfirmed the
separate `arcfort_m3_qa_20260913_c` database had zero users, variants, adoptions and verification
events. Completing the original pg_prove runner there was considered as an independent remaining
check; it would not have switched or modified the adopted API database.

After the tool-review quota's stated recovery time, the Docker engine pipe was absent again. The
bounded start at 2026-09-13 11:15 UTC failed with the same `sailor-ingest.sock` rename/access error;
the backend logged its crash at 11:15:46 UTC. The owned failed Desktop startup was stopped with
exit code zero. No further socket directory was moved, no compression/Windows setting was changed,
and no factory reset, volume deletion or database operation was performed. The original pg_prove
run did not execute, so its gate remains unproven.

The successful earlier SQL and partial Auth evidence stays historical and scoped. Current work is
blocked by missing exact switch approval and recurring engine startup failure. Retain all failed
fixtures and the previously recorded schema/evidence results; do not interpret an automatic goal
continuation as the missing owner approval or retry the rejected switch indirectly.

## September 13-14 Authorized Preservation And Browser Diagnostics

This section supersedes the pending-approval/current-state statements above, not their historical
results. The owner explicitly approved preserving the old local `postgres` database as
`arcfort_m3_failed_20260913` and establishing a fresh local `postgres` baseline. See the
[scoped preservation decision](../../knowledge-base/decisions/2026-09-13-console-m3-local-baseline-preservation.md).
Candidate: the M3 worktree on `codex/v2-industrial-brand-system`, based on
`a3a36ed65dbbd57ccb9664a280ff5ff8a85a6ac3`, not a new committed or deployed candidate.

### Preservation Completed

The exact local Docker pipe/project/container were verified. After stopping the six existing API
consumers, two preloaded platform workers still held idle connections. Their exact roles, application
names and backend types were checked; neither corresponding extension nor job/HTTP queue table was
installed. New connections were briefly disabled, only those two known workers were terminated,
and the old database was renamed with connections immediately re-enabled. No unknown client was
terminated and no database was dropped.

The initial helper stopped safely on an OID JSON string/number mismatch, then on the retained worker
connections. A later interruption occurred after the new database and both platform settings existed;
actual state was inspected before completing ACL restoration and restarting the same API consumers.
No failed whole-operation replay or destructive rollback was used. Database-level settings were
handled only in process memory. Final comparisons confirmed matching owner, connection settings,
database ACL and platform setting values, without printing secrets.

The archived database retains 45 variants, five synthetic Auth users, four roles, one adoption,
two draft heads, zero verification events and 7,287 audit events. Its variant/fact hashes matched
after the later diagnostics. The new `postgres` was initially empty of application/Auth/working rows
and was cloned from `arcfort_m3_qa_20260913_c`. Credential-free preservation evidence is retained in
`.tmp/m3-failed-database-preserved.json`. Do not rerun the preservation helper against this new adopted
database, and do not treat this approval as permission for another archive name or a reset.

Docker IPC recovery was needed again. After current process/content/path checks, these additional
zero-byte-socket directories were retained intact and empty originals created:

- `%LOCALAPPDATA%\Docker\run.pre-repair-20260913-3`
- `%LOCALAPPDATA%\docker-secrets-engine.pre-repair-20260913-2`
- `%LOCALAPPDATA%\Docker\run.pre-repair-20260914-1`
- `%LOCALAPPDATA%\docker-secrets-engine.pre-repair-20260914-1`

The September 14 failed startup logged the same error at 2026-09-13 23:13:26 UTC. Its owned startup
process was stopped and awaited before retrying. Existing Docker then started successfully. No
compression, execution-policy, Windows feature, installation, factory-reset or volume change was made.
This remains temporary recovery, not a root-cause fix. A temporary automatic-review quota rejection
delayed a probe; it was retried only after the stated recovery time, with no alternate execution bypass.

### New Direct Evidence

- Original `console:db:test`: **PASS**, `Files=9, Tests=246, Result: PASS`, on the empty new baseline.
- Independent `run-database-sql-tests.ts --local`: **PASS**, nine suites / 246 assertions on pgTAP
  1.3.3, including positive, failing-assertion and count-mismatch runner controls.
- Complete `sync-database-types.ts`: **PASS**, actual local CLI schema matches the generated file.
- Two `apply-local-shadow-catalog.ts` imports: **PASS**, exact row parity across all 17 source tables,
  source revision `f185ebc9ebba`, before adoption.
- `test-working-isolated.ts --local`: **FAIL at browser phase**, after completing its API-phase
  assertions for real sessions, adoption/import locks, replay denial, duplicate-create contention,
  stale-save contention, source-bound EDIT/APPROVE/REJECT, history and editor revocation. Its original
  post-browser retention assertions were not reached; independent retention checks later passed.
- Actual production Next build and three browser form logins/private-cookie checks: **PASS**.
  First browser failure report: `.tmp/console-working-browser/05287c56-6451-4acf-b993-47b77a8c8f7e/result.json`.
- Resumed browser diagnostics: real login and all HTTP rejection checks **PASS**, then failure at
  create/retry/reload. The product was created; do not repeat creation as though nothing happened.
  Report: `.tmp/console-working-browser/894971e6-2903-4622-8b60-15d543f9915d/result.json`.

### Browser Test Repairs

The installed locked Playwright implementation JSON-encodes a malformed string when `data` is a
string and the content type is JSON. The old `"{"` fixture therefore became valid JSON rather than
testing parser rejection. `wire` now sends `Buffer.from(data, "utf8")`. A real before/after probe
changed the malformed anonymous response from 403 to the intended 400; oversized JSON remains 400,
and anonymous/bad-origin/bad-command-header requests remain 403, all with private response headers.
No server validation or expected status was loosened.

The browser created the synthetic product and navigated correctly, but reading the command body
after document replacement failed. Merely moving `response.json()` earlier was still unreliable.
The test's existing route handler now fetches the real same-origin command, retains its response
bytes in a request-keyed WeakMap, and fulfills the browser request with that original response
unchanged. No fabricated response or database mock is involved. APIRequestContext rejection/retry
checks remain direct. The command helper inspects actual browser status/headers and the retained real
body, then discards its map entry. External browser requests remain blocked.

A narrowly scoped existing-receipt diagnostic used the original synthetic create request ID, not a
new product. It passed real status 200, correct edit navigation, response-body/variant identity,
HTTP idempotent retry 200 and persisted edit-field reading after the repair. This is a diagnostic
replay, **not** a fresh creation test or a completed ten-scenario browser run. Temporary synthetic
owner/reviewer/viewer passwords were renewed only for these local sessions and stayed in memory;
hosted/real-owner credentials and roles were not changed.

### Current Gate

Current local `postgres` retains **46 variants, five synthetic Auth users, four roles, one adoption,
three draft heads, three synthetic verification events and zero publish records**. Independent SQL
compared all 43 original variants and 604 original technical facts to the immutable adoption baseline:
both match exactly. The separate archived database still matches its retained counts/hashes.

**BLOCKED for M3 release.** The complete repaired browser suite, responsive screenshots and a fresh
integrated/clean-CI pass are still missing. The existing current and archived adopted databases must
be preserved. The next exact local operation would preserve current `postgres` as
`arcfort_m3_failed_20260914`, then create another empty `postgres` from the same reviewed QA template
and repeat SQL/types/two imports/full M3. That different archive/switch is not covered by the earlier
approval and has not been executed. No hosted write, commit, push, merge, deployment, real product
confirmation or publication occurred. Real 15AK evidence and later V1 phase gates remain unchanged.

## September 14 Second Exact Authorization

The owner subsequently explicitly approved preserving current `postgres` as
`arcfort_m3_failed_20260914` and establishing the next empty local baseline. The
[second authorization](../../knowledge-base/decisions/2026-09-14-console-m3-local-baseline-rerun.md)
resolves the prior pending-approval statements above. Preserve both old databases. No other archive,
hosted operation or publication is authorized.

Before execution, actual state matched 46 variants, five synthetic users, four roles, three drafts,
three verification events, one adoption and zero publication records; the new archive name was absent.
The separate helper `.tmp/preserve-m3-database-20260914.mjs` passed Node syntax checking. It checks
the first archive against its recorded hashes/counts, captures new non-secret checkpoints and keeps
new connections closed until platform settings/ACLs are restored.

After a subsequent interruption the Docker pipe was absent. The preservation helper stopped at
target preflight before any database change. A bounded startup logged the same IPC error at
2026-09-14 04:15:26 UTC. The owned failed Desktop was stopped; current path/content/process checks
preceded intact retention of `%LOCALAPPDATA%\Docker\run.pre-repair-20260914-2` and
`%LOCALAPPDATA%\docker-secrets-engine.pre-repair-20260914-2`, with empty originals recreated.
The first directory held four observed zero-byte IPC entries and the second only zero-byte
`engine.sock`. No database/volume/image or Windows configuration was reset. The database switch and
fresh acceptance are not yet claimed complete at this checkpoint.

## September 14 Second Preservation Result

This section supersedes the pending-execution statements above. The exact second authorized
preservation completed. Both `arcfort_m3_failed_20260913` and `arcfort_m3_failed_20260914` remain
available and unchanged. The second archive retains 46 variants, five synthetic users, four roles,
one adoption, three draft heads, three verification events and 3,685 audit events. The first
archive retains its separately recorded 45 variants and 7,287 audit events.

After database readiness was confirmed, the guarded helper renamed the old local database,
created the new baseline from `arcfort_m3_qa_20260913_c` and restored settings/ACLs. It stopped at
the final connection-enable checkpoint. Read-only inspection found both archives open and the
new database still connection-disabled; only that remaining enable step was completed. The
finalizer verified matching owner/connection limits/settings/ACLs, empty new application/Auth
tables and unchanged archives, then restarted exactly the six original API consumers. No whole
operation replay, dropped database, global-role change or hosted operation was used. Secret
setting values stayed inside PostgreSQL and were not written to a report or log.

Preservation record: `.tmp/m3-preservation-20260914.json`, status `PASS`.
Post-acceptance retention record: `.tmp/m3-retention-20260914.json`, status `PASS`.
Both archive snapshots match the preservation record. The empty template still has no application,
Auth, adoption, draft, verification or audit rows. Current original 43 variants and 604 technical
facts exactly match the full immutable adoption baseline, not merely selected fields. The first
retention-helper attempt hit the default child-process output limit while reading that large
baseline; using the existing runner's bounded 4 MiB limit allowed the complete comparison.

### Fresh Acceptance And Diagnostic Results

| Check                                            | Result and scope                                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Original pg_prove                                | PASS: 9 files, 246 tests on the empty new baseline                                                                       |
| Independent SQL-report path                      | PASS: 9 suites, 246 assertions, pgTAP 1.3.3; positive/failure/count controls                                             |
| Complete local CLI types                         | PASS: generated artifact matches actual migrated local schema                                                            |
| Two pre-adoption imports                         | PASS: exact 17-table parity, source revision `f185ebc9ebba`                                                              |
| Fresh M3 real-service API phase                  | PASS: real Auth, adoption/import contention, duplicates, stale writes, technical decisions/history and editor revocation |
| Fresh M3 browser phase                           | FAIL in final session/logout group; first nine groups completed                                                          |
| Responsive evidence                              | 12 actual screenshots; 360/390/768/1440px edit/review/history; no page overflow                                          |
| Retained-fixture logout diagnostic               | PASS after navigation-wait repair; narrower than a full browser run                                                      |
| Current static/domain regressions                | PASS: 36 selected scripts, full typecheck and full lint                                                                  |
| New clean-stack M2 Auth/pagination and remote CI | NOT RUN; current fixture is adopted and must not be reset                                                                |

The failed fresh browser report is
`.tmp/console-working-browser/39fe69f9-c007-4158-bf09-b59f1de84d82/result.json`. Nine completed
groups prove real login/private cookies, HTTP rejection, new draft/retry/reload, stale-tab input
retention, source-free approval denial, exact-source EDIT, explicit APPROVE, REJECT/history and
viewer/readiness/responsive behavior. All twelve screenshots exist. Visual review of edit-360,
review-390, history-768 and review-1440 found readable controls with no overlap or truncation.
This report remains `FAIL`; the final global page-error/external-request assertions were not
reached, so their zero counts are not claimed from this integrated report.

The targeted diagnostic used the existing synthetic owner and already-revoked reviewer accounts,
renewing only their temporary passwords in memory. It did not reinstate a role or create another
product. It observed revoked HTTP 403/42501 and logout 303 to login, then reproduced an assertion
on the old protected URL while the App Router redirect was still arriving. No English-name editor
was present and cookies were already empty. Waiting for the actual login URL passed, followed by
no editor controls and logged-out command HTTP 403, with private response headers. Technical rows
were unchanged. `scripts/console/test-working-browser.ts` now waits for that navigation and records
specific final-group checkpoints without exposing provider errors or credentials. No application
runtime, expected status, timeout, RLS or permission rule was loosened.

The 36-script report is `.tmp/m3-regressions-20260914.json`. It includes Console domain/drafts/
commands/target/browser/boundary/entrance/config/REST/report/migration/shadow checks, RFQ validation/
email/timeout and all six sourcing builders, product search/series/compatibility/technical/image/
company evidence, and SEO content/built links/images/snippets/performance. Full lint initially
found three explicit `any` annotations in an earlier ignored diagnostic helper; Playwright types
replaced them and full lint passed. Production Next builds passed during both session diagnostics.
Homepage JavaScript is 126.6 KiB / 140 KiB; shared CSS is 9.8 KiB / 15 KiB. No budget was raised.

### Release Gate And Next Exact Action

`status: BLOCKED` for the uncommitted M3 worktree based on `a3a36ed65dbbd57ccb9664a280ff5ff8a85a6ac3`,
destination local acceptance only. The complete repaired integrated run and candidate-specific
clean CI remain missing. Current `postgres` retains 46 variants, five synthetic users, four roles,
one adoption, three draft heads, six verification events, 3,727 audit events and zero publication
records. Editor/reviewer roles remain revoked. Preserve current data, receipts and both archives.

The proposed next exact operation is to preserve current local `postgres` as
`arcfort_m3_failed_20260914_b`, retain both prior archives, create fresh `postgres` from the same
reviewed empty `arcfort_m3_qa_20260913_c` with existing settings/ACLs, then repeat SQL/types/two
imports/full M3 acceptance. **This third switch is not authorized or executed.** Request approval
for it, not for M3-A through M3-E or either completed switch. Stop before that operation. No database
deletion/reset or hosted substitution is permitted. Remote CI/push has its own external-write gate.

Engineering must rerun the repaired full test before `$release-qa` can close M3. Later real-pilot
evidence work belongs to `$technical-verification`, `$product-media-manager` and
`$compatibility-mapping`; no synthetic approval confirms real 15AK data. Docker's recurring IPC
startup issue remains unresolved and needs fresh bounded inspection if it recurs. No commit, push,
merge, hosted migration/adoption/account/provider change, deployment, RFQ submission or publication
occurred. Public products, URLs, SEO and RFQ behavior are unchanged.

## September 17 Docker Recovery Checkpoint

The owner approved a data-preserving all-users Docker installation on September 16. Physical-path
and ordinary-desktop probes established that the old per-user registration/data were isolated in
Codex's MSIX view. The documented `uninstall -keep-data` invocation unexpectedly lost the flag in
its temporary self-relaunch and deleted active disks/settings and WSL registration. This was
disclosed and is not described as a no-delete migration. The latest independent cold backup was
reverified and restored into `C:\Users\admin\DockerDesktopData`; no retained database was reset or
replaced with a fresh fixture.

Docker Desktop 4.91.0.239619 is now installed for all users. Ordinary shortcut startup and two normal
stop/start cycles passed without IPC surgery. Each read-only report proves the original seven
container identities, two volumes, current data, both historical archives, empty template and
43 original variants / 604 technical facts match their pre-repair baselines. Engine/client 29.8.0,
Compose 5.5.1 and Buildx 0.37.0 respond. The native UI shows the running engine and original project.
See the [full evidence and incident record](../../knowledge-base/technical/docker-desktop-recovery.md)
and [approved recovery boundary](../../knowledge-base/decisions/2026-09-17-docker-all-users-recovery.md).

At this first checkpoint, Windows reboot verification was pending and C had only about 2 GB free.
Moving the two retained cold backups to E with full hash verification was requested but not approved.
No M3 fixture switch, full acceptance run, CI dispatch, hosted write or deployment occurred. The
third exact preservation/switch remains unapproved. Do not count Docker data-retention checks as
new M3 browser/CI evidence.

### Subsequent Windows Cold-Start Acceptance

Windows booted at 2026-09-17 04:08:50 UTC, later than installation and both restart checks. The
ordinary desktop shortcut started Docker with no IPC changes; all retained-data comparisons passed
at 04:14:16 UTC in `.tmp/docker-repair-all-users-cold-start-20260917.json`. Fresh `docker` command
discovery resolves to the all-users executable. Autostart remains false by the original setting.
C-drive free space is about 12 GB after startup, and both cold backup data disks remain in place.
No cleanup/backup move produced that observed capacity change. The Docker repair gate is closed;
the third database-switch authorization and full repaired M3 acceptance are still separate gates.

## September 17 Third Preservation And Fresh Browser Acceptance

The owner confirmed the exact third operation in the
[new decision](../../knowledge-base/decisions/2026-09-17-console-m3-third-local-baseline.md).
This supersedes the pending authorization above, not the historical results. The source snapshot
matched `.tmp/m3-retention-20260914.json` before mutation. Current `postgres` was preserved as
`arcfort_m3_failed_20260914_b`; both older archives, all other databases, the empty template and both
Docker cold backup generations were retained.

The initial helper stopped at the settings-restore checkpoint with the new empty database still
closed to connections. Inspection confirmed its ACL/settings were not yet restored, while the new
archive was intact. The bounded finalizer checked that exact state, restored matching original
database ACL/settings, enabled the empty database and restarted only the original six API consumers.
The original STOPPED report remains at `.tmp/m3-preservation-20260917.json`; completed proof is
`.tmp/m3-preservation-finalized-20260917.json`. The first command failure's cause is not established.
This was continuation of the authorized switch, not a new replacement or destructive rollback.

Database settings and permissions must be explicitly compared because cloning a template does not
copy database-level configuration/permissions; see the
[PostgreSQL 17 contract](https://www.postgresql.org/docs/17/sql-createdatabase.html).
Secret setting values stayed inside PostgreSQL. No global role was created or changed.

### Validation Evidence

- Original CLI pg_prove: PASS, 9 suites / 246 assertions.
- Independent SQL report: PASS, 9 suites / 246 assertions, plus positive/failing/count-mismatch controls.
- Complete generated database-type parity: PASS, without rewriting the artifact.
- Two consecutive exact-row shadow imports: PASS across all 17 source tables; batch `f185ebc9ebba`.
- Fresh integrated invocation: `CI=true`, `PLAYWRIGHT_CHANNEL=msedge`,
  `node --experimental-strip-types scripts/console/test-working-isolated.ts --local`.
  Its API prerequisites precede browser execution and fail closed. The new browser report passed
  all ten scenarios, including the repaired final revocation/logout group, with zero page errors
  and zero external requests. No test expectation or application rule was changed in this batch.
- Browser evidence: `.tmp/console-working-browser/6150888d-13fd-4593-a707-22919d6a824b/result.json`.
  Twelve edit/review/history screenshots cover 360/390/768/1440px; all overflow checks passed.
  Representative mobile review, tablet history and desktop edit screenshots were visually inspected.
- The original execution handle was no longer available after a subsequent Windows reboot. No
  captured full-run exit code or pre-reboot cleanup success is claimed. The runner was not replayed
  against its adopted fixtures. Its final original-variant/fact and publication assertions were
  independently repeated read-only and passed; evidence `.tmp/m3-retention-20260917.json` includes
  source hashes, the bounded browser report and this limitation.

Windows booted again at 2026-09-17 08:41:31 UTC. Docker autostart remained false, so the engine was
initially absent. The ordinary installed desktop shortcut started it without IPC changes or reset.
Read-only retention passed at 10:38:33 UTC after this reboot. All three archives and the empty
template match; all original 43 variants and 604 facts match the immutable adoption baseline.
Current synthetic fixture counts are 46 variants, five users, four roles, one adoption, three draft
heads, six verification events, 3,727 audit events and zero publications. Current full-table hashes:
variants `042c56c6dec8c32ca1d74b2960a1c88f`, facts `482c05e24d2bd2e6c0afdd47207a288f`.
These differ legitimately from the archived run because synthetic IDs/timestamps are new.

All 36 selected regression scripts pass in `.tmp/m3-regressions-20260917.json`, including command,
target/privacy, SQL-report/migration, RFQ, evidence, SEO/link/image/snippet and performance checks.
Full TypeScript and ESLint checks also pass. The browser harness successfully built the current
production app before browser execution. Final host inspection found six healthy healthchecks,
REST running without a healthcheck, no listener on acceptance port 3000, both cold-backup data files
at their recorded sizes, and 11,457,011,712 free C-drive bytes. This post-reboot absence of the test
server does not prove its pre-reboot shutdown completed.

### Remaining Gate

Local browser and independently repeated retention checks pass. The overall M3 release remains
**BLOCKED** pending current candidate clean-CI evidence, including a durable full-run completion
result and the separate M2 fixture sequence. No fourth local archive/switch is authorized or needed
merely to reconstruct missing terminal output. Preserve the successful fixture and all archives.
The tested code is the current dirty worktree on `codex/v2-industrial-brand-system`, not a new commit.
No push, CI dispatch, hosted migration/adoption, production change or publication occurred.

Full Console V1, governed media/compatibility/preview/publishing and the real 15AK pilot remain
incomplete. Synthetic approval never confirms the imported real products. The next bounded action
is review of the M3 candidate and exact approval to submit it for clean isolated CI.

## September 17-18 CI-Only Submission Review

The owner subsequently authorized review, commit and push to the existing
`18803076512/arcfort-website` branch `codex/v2-industrial-brand-system` for CI only. See the
[exact decision](../../knowledge-base/decisions/2026-09-17-console-m3-ci-only-submission.md).
This resolves the CI authorization gate above, not the missing execution evidence. PR #130 is open
against `main`, with no auto-merge request. It previously triggered Vercel previews, so `vercel.json`
now disables automatic deployment for this exact branch while leaving other branches unchanged.

Pre-submission review covered the four new migrations, command input/origin/current-role checks,
default-off exact-loopback write gate, evidence/revision/receipt contracts, private projections,
forms/history, nested dependency locks and CI fixture separation. No new blocking code defect was
identified. Existing bounds (200 scopes/source bindings per SKU, serialized pilot commands) remain
explicit pilot limitations rather than a proven 1000-SKU operating claim. Prior migrations, public
product data, RFQ implementation and production configuration are not rewritten.

The 530-file secret scan passed. Local SQL, browser, retention and 36-regression evidence remains
scoped to the tested worktree. The new Vercel configuration is a submission guard, not a deployment.
Commit identity, remote verification and clean-CI results must be recorded after they exist.
