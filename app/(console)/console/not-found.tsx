import { ConsoleLink } from "@/components/console/ConsoleLink";

import { AuthPanel } from "@/components/console/AuthPanel";

export default function ConsoleNotFound() {
  return (
    <AuthPanel title="Page Not Found">
      <ConsoleLink href="/console">Return to Console</ConsoleLink>
    </AuthPanel>
  );
}
