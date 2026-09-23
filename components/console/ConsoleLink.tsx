import type { ComponentProps } from "react";

// Private navigation uses document requests so every transition rechecks the session and RLS.
// A client Router Cache entry must never become the authority after logout or role revocation.
export function ConsoleLink(props: ComponentProps<"a">) {
  return <a {...props} />;
}
