# M3 Local Command And UI Boundary

Date: 2026-09-10
Status: implemented locally; hosted execution and full M3 acceptance remain unapproved/unproven.

This extends the [technical revision decision](2026-09-09-console-m3-technical-revisions.md) under
the existing M3-A through M3-E local-only approval. It does not change public catalog authority,
confirm facts, authorize adoption or replace the existing Auth/provider gates.

## Decision

Expose only typed caller-session commands through authenticated SQL wrappers and a default-off
same-origin JSON handler. Local working mode requires exact app/database loopbacks; a hosted or
tunnel read-only configuration must never become writable from the new flag alone. The database
independently requires current roles and adopted scope. Application configuration is not RLS proof.

Keep copy, technical comparison, source references and minimal paginated history in Console.
Retain input and request identity on failure, warn on unsaved navigation and disable interacting
forms while a source save is pending. Never infer approval from editing, a source-class selector,
successful HTTP transport, generated copy or a synthetic browser response.

The no-referrer JSON origin exception requires exact Host, custom command header, opaque origin and
same-origin/cors/empty Fetch Metadata. Native form navigation rules stay unchanged. The browser
probe and negative header tests cover this transport distinction, not authentication. Fail closed
on malformed/oversized input and expose bounded command-specific metadata, not provider/SQL text.

## Evidence And Consequences

Migration 9 and 24 additional SQL assertions supplement the prior database tests; all 240 assertions
pass in the embedded engine with official public-type parity. Eight command-contract groups and ten
synthetic browser scenarios pass. The fixture uses real components and CSS, without credentials or
database writes. Its thirteen screenshots are UI evidence only. The exact commands and limits live
in the [M3 implementation record](../../docs/operations/product-intelligence-console-milestone-3.md).

Real Auth/PostgREST, concurrent transactions and persisted browser workflow remain required. Do not
use a mocked save, typed query or WASM result as proof of a live writable Console. No real source,
technical confirmation, media rights, compatibility or publication state changed.

## Recovery And Next Action

Disable local working mode without erasing working data. Preserve adoption, original sources,
revisions, decisions and receipts; use reviewed forward recovery after any future adoption.
Next prepare and run the full isolated database-backed browser/concurrency matrix. Request exact
hosted migration/adoption authorization only after those gates pass; never reopen M2 owner setup.
