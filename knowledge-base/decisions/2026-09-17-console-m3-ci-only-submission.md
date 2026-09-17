# M3 CI-Only Submission Authorization

Date: 2026-09-17
Status: owner-approved review, commit and push; candidate verification pending.

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
