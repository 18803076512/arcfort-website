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
