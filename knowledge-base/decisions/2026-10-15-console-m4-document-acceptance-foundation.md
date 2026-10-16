# M4 Document Acceptance Foundation

Date: 2026-10-15 (Asia/Shanghai).
Status: E11a local test infrastructure complete; native document acceptance remains incomplete.

## Decision

Continue the [E10 readiness decision](2026-10-14-console-m4-document-readiness.md) with the
minimum shared infrastructure needed for real disposable document acceptance. This does not
supersede any evidence, activation or publication gate. No production implementation changes.

The media acceptance test fixture omitted thirteen document baseline counters added in E1-E8.
The failure was reproduced: three of six media observer tests failed before provisioning. Keep
the independent expected fixture complete; never weaken the actual pristine-baseline assertion
to accommodate a stale test. A nonempty or missing ledger must continue to refuse writes.

Prepare one opt-in joint provisioning operation after one complete pristine-baseline check.
Generate independent random IDs and 32-byte secrets for the media and document domains, insert
both in one transaction using existing psql stdin transport, and retain the original media-only
wrapper. A second independently pristine-checked provisioning call would reject the first key as
preexisting state. Domain-specific builders must not accept arbitrary table names.

Disable only keys created by that operation. Attempt every owned key even if one fails; clear
all returned secret references and suppress provider error text. Successful provisioning requires
an exact ID receipt on disable. After failed provisioning, no matching row is acceptable because
the insert transaction may have rolled back; unexpected output is not verified cleanup. JavaScript
string reference clearing does not promise memory zeroization; the source random-byte buffers are
filled with zero. No keys are written to files or command arguments.

The owned browser server may accept separate document options only through its explicit feature
object. It rejects reuse of the media key ID or secret. Both domains' IDs and secrets are removed
from the build environment; ambient document flags and secrets remain excluded. Document PDFs do
not implicitly enable raster-original or media-review features.

Do not expose `--documents` or wire the joint helper into the integrated runner until the complete
native document workflow and independent ledger assertions are present. Tests now explicitly
require that switch to fail before any host/provider access. An enabled feature is not a passed
acceptance test, and changing this guard requires completing that workflow, not deleting coverage.

## Evidence And Reversal

The [E11a runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e11a-document-acceptance-foundation)
records the focused unit run, actual in-memory SQL builders and late-failure rollback, all 34
migrations / 32 suites / 1,881 pgTAP assertions, complete public-member parity, exact source replays
and rollback. No retained or hosted database, Docker/WSL service, real signing key or original file
was modified. No application UI, canonical data, public SEO or RFQ contract changed.

Local foundation: PASS_WITH_WARNINGS. Native document acceptance and external activation/release:
BLOCKED. Real Auth/PostgREST/Storage, persisted browser decisions and refresh, concurrent races,
full native CLI generation and real 15AK rights/facts are still unproven. Prior B/C/D authorization
is fulfilled and does not cover E1-E11a commit/push/CI, migration, activation, merge or deployment.
Reversal is a reviewed source-only change; no deployed or retained state needs rollback. No rule
override occurred.

Next complete the actual document browser/ledger harness, then obtain exact E-batch CI authority.
The full V1 and real 15AK preview/QA/publication workflow remain required.
