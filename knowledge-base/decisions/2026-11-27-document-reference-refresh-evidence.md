# Document Reference Refresh Evidence

Date: 2026-11-27. Scope: isolated Console acceptance diagnostics and causal interpretation.

## Evidence

PR #175's first native job recorded a persisted second document reference, its local success
message and a stale rendered reference table after the unchanged locator wait failed. A correlated
RSC request received HTTP 200 headers and then `ERR_ABORTED`. The unchanged failed-job retry and
main acceptance passed; the original cancellation initiator remains unresolved.

A separate local production fixture imported the unchanged `DocumentLibrary` and command hook,
with synthetic persisted-file rows and the actual command parser. Thirty-two bounded cases all
passed, including direct traffic, the existing command forwarding harness and controlled stream
tails/overlap. Sixty-four exact row waits passed across 64 RSC 200 responses, 40 aborted requests
and 24 finished requests. Successful controls demonstrate that this network signature alone is
insufficient to identify an unapplied refresh. They do not establish equivalence to native Auth,
RLS, Storage, the complete outer workflow or the historical failure. System Chromium 154 differs
from the pinned native browser. Retain the synthetic fixture's setup/console/instrumentation limits.

## Diagnostic Contract

- Preserve the real first-reference, receipt replay and second-version sequence, exact row
  assertion, functional timeout, commands and application navigation. No test-side reload or
  repeated write is added.
- Reference/version failure capture begins with a synchronous, detached traffic snapshot before
  asynchronous database/UI probes. Wait start/end and callback observation times share the existing
  monotonic observer clock; they do not establish wire timing or causal order by themselves.
- Successful references emit a bounded completion observation only after the original exact-row,
  action and prior-version assertions pass. This supplies a native healthy-flow baseline while
  keeping diagnostic logging failures separate from the functional result.
- Retain bounded request-correlated response MIME categories and RSC-header presence, plus bounded
  router/console categories. Raw URLs, identifiers, headers, message bodies, cookies, tokens and
  console text are excluded from reports.
- Passive CDP navigation distinguishes cross-document navigation from history/fragment changes.
  Setup and cleanup each have a finite diagnostic budget, and late completion cannot revive
  listeners or mutate a closed report. Diagnostic failure preserves the original functional error.
- Real navigation probes could not reliably deliver outgoing pagehide through the attempted
  bridges. DOM lifecycle capabilities remain explicitly unavailable. No lifecycle injection ships,
  and missing events cannot establish that no pagehide occurred.
- The successful controlled cases do not justify removing the stale-row assertion, interpreting
  all aborts as harmless or declaring the historical problem fixed. Choose a runtime repair only
  when evidence identifies the failing boundary.

## Verification And Remaining Work

Require privacy/bounds/correlation/frozen-snapshot and partial/late/stalled CDP cleanup regressions,
a real local navigation/MIME probe, applicable static/build checks and the existing complete native
isolated CI workflow. Public data, application behavior, provider settings and publication gates
remain unchanged. A local image pull reached physical disk limits before creating a database;
record that boundary separately from native acceptance. Only task-created image tags were removed.

Retain exact source/commit, run/attempt, failed and passing observations. A future failure's MIME,
navigation/category and frozen rejection membership can narrow the cause; a passing run establishes
only that run. See [the reproducibility record](../technical/console-validation-reproducibility.md)
and the preserved PR #175 run `45911834825` for the prior failure/recovery boundary.
