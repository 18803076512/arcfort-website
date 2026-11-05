# Packaging Editor Hydration Readiness

Date: 2026-11-05
Status: local candidate; no production or native database acceptance.

## Evidence and decision

The packaging workbench derives applicable evidence from controlled package description, count,
unit and original ID. A delayed Console JavaScript load leaves the old server-rendered fields
editable before React hydrates them; a later hydration can replace such edits with the initial
state and make exact-match evidence disappear. A synthetic browser negative control reproduced the
editable window while holding four Console scripts.

Keep the workbench server rendered, but initialize its own `hydrated` state to false and set it true
in the component's effect. While false, disable the proposal and decision fieldsets, record selection,
reload, action buttons and source-entry fieldset. Show a short status message. This component-local
signal tracks the actual workbench hydration, without disabling the protected Console layout's
navigation or native sign-out form. The server HTML and first client render match.

The isolated browser positive control delayed the same four scripts, observed disabled controls,
then verified editable controls and retained controlled values after hydration. The standard
synthetic packaging browser suite passed 14 groups and six responsive widths. Native sidebar
navigation passed with JavaScript disabled. These fixture checks
block external and business mutation requests and do not prove native Auth, database reads or writes,
human evidence review or production behavior.

This guard addresses input before component hydration. It does not address a document upload that
completed a POST and then waited on `router.refresh()`; that is a separate post-mutation issue.

## Reversal condition

Remove or change the guard only after a controlled delayed-JavaScript test proves pre-hydration edits
cannot be lost, including record and source controls, and the normal packaging browser suite passes.
Keep native navigation and sign-out usable when JavaScript is unavailable.
