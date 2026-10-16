# M4 Signed Document Observation Boundary

Date: 2026-10-13 (Asia/Shanghai).
Status: E8 local preparation verified; not activated or applied to retained/hosted services.

## Decision

Extend the [E7 human-review contract](2026-10-12-console-m4-document-human-review.md) with an
independent document byte-observation prerequisite for authenticated approval. This completes
E7's missing signing prerequisite only; reviewer forms, counted review projection and readiness
integration are still required. Earlier source/evidence and publication boundaries remain intact.

Migration 32 exposes authenticated source/propose/submit/review wrappers over the existing private
commands. APPROVE requires both the E7 qualifying rights/scope sources and explicit human
declarations, plus a valid document-specific observation. EDIT/REJECT accept no observation and
retain their existing atomic correction/rejection behavior. No anonymous/service grants or
human-only approval bypass are added.

The separately default-off `CONSOLE_DOCUMENT_REVIEW_ENABLED` inspector requires current
owner/reviewer access and a document-specific key. It reads the pending candidate, current original
and all-known-evidence snapshots; downloads and structurally checks the complete unchanged PDF;
then rechecks the actor/role and both snapshots before signing. Ordinary private downloads remain
available to existing reader roles and never issue approval tokens. Failure responses carry no
document-observation header. The response remains attachment-only, private/no-store/noindex.

`document-v1` is a fixed 15-field HMAC-SHA256 token binding key, actor, authority adoption,
candidate, document, SKU, revision, candidate/original/evidence digests, issue/expiry seconds and
nonce. It lasts at most five minutes. Node and database validators enforce the same canonical
identifiers and bounds. The document key table/environment names are separate from media signing;
the migration creates no key and the environment example leaves key fields empty.

At approval, database authority/role checks precede receipt replay. New approvals revalidate the
pending original/evidence snapshot, actor/adoption, key lifetime, signature and token expiry.
A unique nonce is consumed atomically with the human decision and current pointer. Failed nonce
consumption rolls back the complete decision/event/receipt/current operation. The private immutable
observation ledger and command payload retain a token digest, never the raw token or signing key.

Exact completed receipts remain historical results after expiry/key disable, but require the same
actor, payload and current role. They are not fresh approval-validity assertions. The historical
`pi_document_review_observed` boolean survives key rotation and must be combined with current human
evidence validity in future application DTOs. An open successor must remain separately visible;
an older approved pointer cannot hide unfinished review.

## Trust Limits And Verification

Observation proves the trusted inspector checked matching bytes at that moment. It does not prove
that a human read/understood the PDF, that the document is technically true, that it is malware-free,
or that its file can never change. Human declarations and qualifying sources remain independent.
Upload completions remain `not_attested`; no document rights flag, technical field, compatibility,
publication or public-download permission is promoted by observation alone.

The [E8 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e8-signed-document-observation)
records 32 embedded SQL suites / 1,828 assertions, actual Node-to-SQL signature parity, exact
source replay/rollback, 44 application tests and trace-only built-handler checks. Synthetic keys,
Auth/Storage metadata and mocked SDK transport are not native provider or owner acceptance.

The first normal-mode HTTP check encountered an unavailable local provider and failed its expected
400 assertion with 503. Read-only checks subsequently proved port 54321 free and ECONNREFUSED;
the existing explicit provider-absent mode passed. No service was stopped to create that condition.
This proves unavailable-provider refusal, not live Auth/Storage. Native providers, multi-connection
races and complete native CLI type generation remain unverified for the E batch.

E1-E8 remain local/uncommitted/unapplied and outside the fulfilled B/C/D CI authorization.
No real upload/key, feature activation, Docker/WSL change, retained/hosted migration, external write,
merge/deployment or rule override occurred. Before application, reversal is a reviewed source
change; after application, preserve originals, sources and decisions and correct forward.

Next implement strict application command forms, counted current/open review DTOs, readiness and
the reviewer UI, then obtain exact-batch native acceptance authorization. Real 15AK evidence,
human acceptance, verified preview/QA/publication and full Console V1 remain incomplete.
