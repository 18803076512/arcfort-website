# M3 Browser Acceptance Evidence

Date: 2026-09-11
Status: harness implemented; unavailable-provider smoke passed; database-backed acceptance pending.

This extends the [disposable acceptance separation](2026-09-11-console-m3-isolated-acceptance.md).
No public authority, publication gate or external-write approval changes.

Browser acceptance uses the actual production Next build, form login, caller cookies, command HTTP
route and fresh database read models. Synthetic browser response fixtures remain separate UI proof.
The full runner must not fulfill a successful command response or load stored personal sessions.
Successful mutations are checked independently by reading the persisted draft, technical scope,
decision history and reviewer attribution. A stale browser must not overwrite current data.

Use only synthetic new-product evidence. Keep credentials in memory; prohibit storageState, traces,
HAR files and raw response logs. Permit only same-origin browser traffic. Build/start the test server
with a minimal local environment and refuse automatically loaded `.env` files or an occupied port.
Close only processes created by this run. Playwright stays in an independently locked test package.

An unavailable-provider smoke can prove production build/start, private responses, browser-origin
behavior and refusal of writes. It cannot prove authentication, successful mutation or review. That
distinction remains mandatory even when the smoke passes. Current bounded evidence and remaining
environment limitation live in the [acceptance runbook](../../docs/operations/console-m3-isolated-acceptance.md).
