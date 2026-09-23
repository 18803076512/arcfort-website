import { FileText, History, ListChecks } from "lucide-react";
import { ConsoleLink } from "./ConsoleLink";

export function ProductWorkingNav({
  id,
  active,
}: {
  id: string;
  active?: "edit" | "review" | "history";
}) {
  return (
    <nav className="console-working-nav" aria-label="Product working views">
      <ConsoleLink href={`/console/products/${id}`} className="console-action">
        Evidence overview
      </ConsoleLink>
      <ConsoleLink
        href={`/console/products/${id}/edit`}
        className="console-action"
        aria-current={active === "edit" ? "page" : undefined}
      >
        <FileText size={18} aria-hidden="true" />
        Product copy
      </ConsoleLink>
      <ConsoleLink
        href={`/console/products/${id}/review`}
        className="console-action"
        aria-current={active === "review" ? "page" : undefined}
      >
        <ListChecks size={18} aria-hidden="true" />
        Technical review
      </ConsoleLink>
      <ConsoleLink
        href={`/console/products/${id}/history`}
        className="console-action"
        aria-current={active === "history" ? "page" : undefined}
      >
        <History size={18} aria-hidden="true" />
        History
      </ConsoleLink>
    </nav>
  );
}
