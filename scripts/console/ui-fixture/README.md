# Console Editor UI Fixture

This standalone Next app imports the real Console forms, navigation and CSS. All identities, values
and sources are synthetic. It contains no database connection, Auth session or working-mode adoption.
Its command endpoint only probes browser headers and always returns `ok: false`. It is not shipped
as a route in the main application and must never be deployed or exposed through a tunnel.

From the repository root, after installing the normal dependencies:

```bash
npm run console:ui:dev
```

Open `http://127.0.0.1:3901/console/products/new` or
`http://127.0.0.1:3901/console/products/10000000-0000-4000-8000-000000000001/review`.
For review states, use `?state=pending&conflict=1`, `?role=viewer` or `?role=editor`.
Saving manually cannot persist a product; this fixture is for layout/interaction inspection only.

The optional browser runner needs an available Playwright installation and browser. Neither is a
root production dependency. Set `PLAYWRIGHT_MODULE_PATH` to an existing Playwright package when it
is not locally resolvable, and `PLAYWRIGHT_CHANNEL=msedge` to use installed Edge. Then run:

```bash
npm run console:ui:test
```

The runner only visits fixed loopback port 3901. It checks the fixture's noindex header and intercepts
commands with synthetic responses. Ten scenarios test retry identity, errors, unsaved changes,
explicit review actions, source-save interlocks, readonly controls and six viewport widths. It writes
results and thirteen screenshots under ignored `.tmp/console-ui/`. Generated build/type output is
also isolated under `.tmp/console-ui-next/`; only those generated files are excluded from lint.

This does not prove real Supabase authentication, PostgREST queries, persistence, RLS, two-connection
locking or hosted readiness. Run the actual isolated database/browser acceptance separately. Never
enter real company evidence, credentials or buyer information into this fixture.

## Media Inspection Fixture

`http://127.0.0.1:3901/console/media` renders the real M4-A workspace with synthetic coverage and
asset metadata. It can filter its fixed dataset and open two existing public catalog-reference
images; it never asserts that those files belong to the synthetic SKU or share a real file hash.
The fixture-only image route permits exactly those two filenames and reads no private originals.

Run `npm run console:media:ui:test` with the same Playwright/Edge setup. It checks GET-only filters,
tabs, empty/duplicate/missing states, image loading, keyboard order and ten desktop/mobile screenshots
under `.tmp/console-media-ui/`. This result is not Auth, RLS, PostgREST or persistent mapping evidence.

## Compatibility Fixture

`http://127.0.0.1:3901/console/products/10000000-0000-4000-8000-000000000001/compatibility`
renders the real compatibility workbench with synthetic sources and relationships. Query examples:
`?root=new`, `?identity=missing`, `?state=pending&conflict=1`, `?role=viewer`, `?role=reviewer`,
`?state=pending&basis=catalog` and `?state=pending&evidence=unbound`.

Run `npm run console:compatibility:ui:test` with the same Playwright/Edge setup. Eleven groups cover
exact payloads, retries, unsaved input, explicit decisions, source scopes and retention, role-aware
controls, target/history pagination, keyboard access and six responsive widths. Eighteen screenshots
and a result report are written under ignored `.tmp/console-compatibility-ui/`. Non-loopback requests
are blocked. Unexpected console warnings/errors fail the run; explicit 503/409 command-test responses
are classified separately. All command responses are synthetic interceptions, not database acceptance. The real
application route additionally requires the default-off compatibility flag and authenticated access.

## Original Intake Fixture

`http://127.0.0.1:3901/console/products/10000000-0000-4000-8000-000000000001/originals`
renders the original intake form and history with synthetic data. Use `?role=viewer`,
`?role=publisher`, `?role=editor`, `?role=reviewer`, `?state=pending` or `?state=stale` to inspect
permissions and history states. The fixture has no original upload endpoint or Storage connection;
manual submission cannot persist a file. Never select real private originals here.

Run `npm run console:originals:ui:test` with the same Playwright/Edge setup. The runner generates a
synthetic raster in memory and intercepts all upload responses. It checks unchanged raw bytes and
metadata, stable retry identities, changed-source identities, sanitized failures, pending-review
feedback, keyboard/unsaved-input behavior and role states. Six screenshots (1440, 1280, 1024, 768,
390 and 360 pixels) and `result.json` are written under ignored `.tmp/console-original-ui/`.
Non-loopback requests are blocked. This is component/transport evidence, not Auth, RLS, stored-file
readback, trusted byte attestation or human rights/match approval.

The runner also checks an explicitly synthetic HttpOnly cookie scoped to `/console`: it accompanies
the form POST to `/console/originals`, remains unreadable to page JavaScript and is absent from a
negative-control request to the removed `/api/console/originals` path. No real login cookie is used.
