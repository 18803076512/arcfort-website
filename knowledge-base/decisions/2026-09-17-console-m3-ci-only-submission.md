# M3 CI-Only Submission Authorization

Date: 2026-09-17
Status: executed; candidate `e5c23e31` passes clean CI (reviewed 2026-09-18).

After local browser and retention checks passed, the owner explicitly approved reviewing M3,
committing it and pushing to `18803076512/arcfort-website`, branch
`codex/v2-industrial-brand-system`, for CI only. This resolves the prior CI-write authorization gate.
It does not authorize merge, preview/production deployment, hosted migration/adoption, account or
provider settings changes, product confirmation, publication, or another local database switch.

Read-only GitHub CLI inspection confirmed PR #130 is OPEN against `main`, its head is this branch
at `a3a36ed65dbbd57ccb9664a280ff5ff8a85a6ac3`, and auto-merge is absent. Existing checks show that
earlier pushes triggered Vercel preview deployments. Therefore the candidate includes `vercel.json`
with `git.deploymentEnabled` false for this exact branch only. Unspecified branches, including
`main`, retain the provider default. This scoped guard implements the owner's explicit no-deployment
restriction; no Vercel account/API setting is changed. See the
[official Git configuration contract](https://vercel.com/docs/project-configuration/git-configuration).

Review the M3 migrations, application boundaries, tests, nested locks, workflow and operation records
before staging. Exclude ignored helpers, database backups, local reports, credentials and unrelated
user changes. Use a normal non-force push to the exact branch. Verify the resulting remote SHA,
PR CI jobs and absence of a new Vercel deployment before reporting the outcome. Never treat a
successful push or a prior green CI run as current candidate acceptance.

Rollback of code/configuration requires a reviewed follow-up commit. Do not reset retained adopted
data. Re-enabling this branch's automatic deployments is a separate explicit release decision.

## Execution Evidence

The 85-file reviewed candidate was committed as `e5c23e31f9b34c7e10801c444167ecb3501da670` and
normally pushed to the exact branch. [Run 35284287968](https://github.com/18803076512/arcfort-website/actions/runs/35284287968)
passed website quality and the complete isolated database/M2/M3 sequence, including all ten M3
browser scenarios and final source retention. The watch process exited 0.

Readback at 2026-09-17 23:00:56 UTC verifies that SHA, PR OPEN with no auto-merge, zero GitHub
deployments and no Vercel commit status/check. No merge, hosted mutation or deployment was performed.
The [acceptance record](../../docs/operations/console-m3-isolated-acceptance.md#september-18-clean-ci-acceptance)
owns the exact gate results and remaining local-only/pilot limits. Documentation-only follow-up
commits remain within this same CI-only authorization and require verification for their new SHA.
