# M4 Document CI And Release Authorization

Date: 2026-10-15 (Asia/Shanghai).
Status: owner authorized; candidate review and fresh native CI required before release.

## Scope

The owner answered the E1-E11 review/commit/push/isolated-CI question with permission to merge,
deploy and modify. A follow-up identified repository `18803076512/arcfort-website`, PR 130,
target `main`, possible production website deployment and database/Console activation boundaries.
The owner replied that all were permitted. This supersedes the earlier CI-only restriction for
this batch, not the factual publication rules or any destructive-operation prohibition.

First review the complete E1-E11 candidate, commit and push only
`codex/v2-industrial-brand-system`, and run disposable CI with explicit
`--oem --packaging --documents`. Retain branch deployment suppression. Prior B/C/D checks do not
prove this new candidate. The [E11b preparation](2026-10-15-console-m4-native-document-acceptance.md)
remains historical evidence, not a native pass.

Only consider PR 130 merge to `main` and the existing website deployment after current checks and
the applicable release gate pass. Before any database write or Console activation, independently
identify the exact project/environment, applied migrations, retained data and rollback conditions.
Do not infer a target from an arbitrary credential. Broad permission does not authorize reset,
deletion, replacement of retained local data, paid services or fabrication of evidence.

## Evidence And Reversal

CI uses synthetic non-sensitive fixtures in an ephemeral runner, including independent disposable
observer keys. No real rights, technical facts or 15AK approval are supplied by these fixtures.
No application feature flag or secret is enabled by the workflow edit. No hosted/retained migration
is included in the initial push. Before release, rollback remains a reviewed source change; after
database application preserve immutable history and correct forward.

Native results, actual commit, merge/deployment and any environment-specific action must be recorded
separately after they occur. Authorization is not evidence that any of them succeeded.
