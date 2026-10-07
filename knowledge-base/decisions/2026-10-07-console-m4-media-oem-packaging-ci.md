# M4 Media, OEM And Packaging CI Authorization

Date: 2026-10-07
Status: owner-authorized review, commit and push; candidate CI pending.

## Exact Scope

The owner explicitly answered the combined B11-B16, C1-C4 and D1-D4 question with approval to
review, commit and push this batch to `18803076512/arcfort-website`, branch
`codex/v2-industrial-brand-system`, for disposable isolated CI only, including explicit OEM and
packaging acceptance. This replaces the unanswered earlier B11-B16/C1-C4 question. It supersedes
only the pending-authorization status in the [D4 preparation](2026-10-06-console-m4-disposable-packaging-acceptance.md)
and its linked earlier checkpoints, not their historical execution evidence or technical safeguards.

PR #130 was independently read back as OPEN, targeting main, with this exact head branch at
`c190456df9609397859c2767bd13c3cf10d22068`. The existing green checks belong to that old head and
do not prove this batch. The branch's Vercel deployment-disable setting remains unchanged.

## Execution Boundary

Only the existing disposable GitHub database job adds `--oem --packaging` to the normal local
acceptance command. The normal package command and application defaults stay off. No ambient
feature/provider override is added. The runner still verifies target identity, local sockets,
container ports, invite-only Auth and a pristine exact-source baseline before test writes.

All new successful review scenarios use synthetic DRAFT identities and TEST-ONLY evidence.
Native Auth, Storage, SQL, observed contention, persisted forms and retained source rows must pass
on the actual candidate; fixture or embedded success cannot replace those checks.

This approval includes no merge, deployment, hosted database change, retained-local migration,
reset, import or Docker repair. No actual product fact, commercial policy or media right is
confirmed. No repository rule is overridden. Unrun or failing native gates remain unverified.
Before release completion, record the exact candidate/run and actual results in the M4 runbook.
Full V1, technical documents and the real 15AK verified-preview/QA/publication workflow remain open.
