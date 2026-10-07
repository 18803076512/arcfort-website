export const originalInspectionPath = "/console/originals/inspect";
export const originalInspectionMessage =
  "The stored original could not be checked. Reload and try again.";

export type OriginalInspectionFailure = {
  ok: false;
  code: "42501" | "22023" | "40001" | "54000" | "unavailable";
  message: string;
};

export function originalInspectionFailure(
  code: OriginalInspectionFailure["code"] = "unavailable",
): OriginalInspectionFailure {
  return { ok: false, code, message: originalInspectionMessage };
}
