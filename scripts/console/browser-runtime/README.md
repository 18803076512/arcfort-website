# Isolated Browser Runtime

Test-only Playwright and its core are pinned to 1.62.1. They are not root application dependencies
and do not ship to the public website. Both packages have registry integrity records in the lockfile.

Run `npm ci --ignore-scripts` from this directory. For Linux disposable CI, run
`npx playwright install --with-deps chromium` here. An installed Edge can be selected locally with
`PLAYWRIGHT_CHANNEL=msedge`; do not change browser security settings or use personal profiles.

From the repository root, the following commands require `CI=true`:

- `npm run console:browser:test:smoke`: builds and starts real Next, then checks the real browser's
  unavailable-provider state and HTTP refusal. Port 54321 must be unused. No authentication or
  database persistence is tested and no credentials are submitted.
- `npm run console:working:test:local`: runs the complete disposable database harness, then ten
  database-backed browser scenarios. Do not call `runWorkingBrowser` as a hosted/account workflow.

`npm run console:browser:test:guards` checks environment isolation, env-file refusal, occupied-port
refusal and private response assertions without Next, a browser or a provider.

The full harness uses synthetic accounts held only in memory, separate browser contexts, real
form login and unmodified successful command responses. Browser requests outside the exact local
origin are aborted. Production Next is built with an allowlisted process environment and refuses
all four automatically loaded production `.env` filenames. Existing files are never moved or erased.
Only the public local Supabase key is passed to the server; service/email/analytics credentials and
runtime overrides are excluded. Test processes close their own browser and server in `finally`.

After real full execution, `.tmp/console-working-browser/<run-id>/` contains a bounded result and
twelve synthetic-only screenshots across 360/390/768/1440px. No storageState, HAR, trace, raw response,
account credentials or personal browser profile is written. A FAIL report is not acceptance proof.
The smoke test produces console results only, not fabricated database screenshots.

See [M3 acceptance evidence](../../../docs/operations/console-m3-isolated-acceptance.md). The
September 17 local run passed ten persisted browser scenarios and independent final retention;
its overall exit code was unavailable after a later reboot. Candidate `e5c23e31` subsequently passed
[clean CI](https://github.com/18803076512/arcfort-website/actions/runs/35284287968), including all ten
browser scenarios, full-run completion and source retention. Do not rerun imports or reset the
retained adopted database to recreate historical output. This is not hosted or publication approval.
