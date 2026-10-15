# Console Editor UI Fixture

This standalone Next app imports the real Console forms, navigation and CSS. All identities, values
and sources are synthetic. It contains no database connection, Auth session or working-mode adoption.
Its command endpoint only probes browser headers and always returns `ok: false`. It is not shipped
as a route in the main application and must never be deployed or exposed through a tunnel.

## Technical Library Fixture

`http://127.0.0.1:3901/console/documents` opens the synthetic global library. Use the SKU link to
open reference registration, forward versions and PDF-original controls. Query examples include
`?role=viewer`, `?role=publisher`, `?stale=1`, `?empty=1`, `?many=1&page=2` and `?long=1`.
The fixture has no PDF upload endpoint, Auth or persistence. Never enter real evidence or files.

`npm run console:documents:ui:test` runs ten groups with intercepted synthetic responses and an
in-memory PDF. It verifies source pairs/null unknowns, version binding, retry identity, own pending
recovery, mismatched upload receipts, role/stale states, navigation guards, pagination, keyboard
focus and six viewport widths (1440, 1280, 1024, 768, 390, 360). Eight screenshots and `result.json`
are written to ignored `.tmp/console-document-ui/`. Non-loopback requests and page errors fail the
run. These checks do not prove native Auth/Storage, persistence, trusted observation or human review.

## Running The Fixture

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

## Technical Library Fixture

`http://127.0.0.1:3901/console/documents` and the synthetic SKU
`/console/products/a4000000-0000-4000-8000-000000000001/documents` render the counted library and
metadata/version/upload controls. Queries include `?role=viewer`, `?role=publisher`, `?stale=1`,
`?empty=1`, `?many=1&page=2` and `?long=1`. There is no Auth, database or stored-original connection.
Manual uploads or inspection cannot persist or read real files; do not enter private information.

Run `npm run console:documents:ui:test` with the Playwright/Edge setup above. Fourteen synthetic
groups cover forms, retries, provenance, pending recovery, counted pagination, readonly/stale states,
unsaved changes, keyboard focus, six viewport widths and download-only PDF inspection. Response
identity/page/length checks, cancellation, retry, exact downloaded bytes and temporary URL cleanup
are tested with intercepted responses. Ten screenshots/result JSON are written under ignored
`.tmp/console-document-ui/`. This is not native provider or human evidence acceptance.

## Document Review Fixture

`http://127.0.0.1:3901/console/products/a4000000-0000-4000-8000-000000000001/documents/a4000000-0000-4000-8000-000000000103`
renders the real review workbench with TEST-ONLY DTOs. Queries include `?role=viewer`, `?role=editor`,
`?role=reviewer`, `?state=draft`, `?state=approved`, `?state=successor`, `?state=stale`, `?state=missing`,
`?many=1&source_page=2&history_page=2` and `?long=1`. No real evidence or persisted decision is created.

Run `npm run console:documents:review:ui:test` with the same Playwright/Edge setup. Fourteen groups
exercise strict role controls, sources, proposals, submissions, explicit decisions, inspection and
expiry, failure/reload, unsaved counted pagination and six widths. Eight screenshots and a sanitized
`report.json` are retained under `.tmp/console-document-review-ui/`. All mutations/downloads are
intercepted; other external requests fail. Synthetic token signing is not native SQL acceptance.
The manual fixture has no command/inspection service; do not submit real private information.

## Document Readiness Fixture

`http://127.0.0.1:3901/console/readiness` renders the actual readiness workspace with synthetic
counted rows. GET filters/pagination work without a database. `?enabled=false` exercises the old
column layout; non-working rows retain their counts without an unavailable document link.
`/console/document-readiness` renders the product summary; `?state=empty` and `?state=reviewed`
show unrecorded and reviewed cases without claiming product publication readiness.

Run `npm run console:documents:readiness:ui:test` with the same Playwright/Edge setup. Five groups
cover six widths, stable row height, filters, pagination, missing/reviewed states and keyboard
navigation. Twelve screenshots and `report.json` are written under `.tmp/console-document-readiness-ui/`.
External and mutation requests are blocked. These counts do not prove native provider or real
document readiness; no real source, file, decision or product is changed.
