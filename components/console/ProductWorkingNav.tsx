import { FileText, History, ListChecks, GitCompareArrows, Images } from "lucide-react";
import { ConsoleLink } from "./ConsoleLink";

export function ProductWorkingNav({
  id,
  active,
  compatibility = false,
  originals = false,
}: {
  id: string;
  active?: "edit" | "review" | "history" | "compatibility" | "originals";
  compatibility?: boolean;
  originals?: boolean;
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
      {compatibility && (
        <ConsoleLink
          href={`/console/products/${id}/compatibility`}
          className="console-action"
          aria-current={active === "compatibility" ? "page" : undefined}
        >
          <GitCompareArrows size={18} aria-hidden="true" />
          Compatibility
        </ConsoleLink>
      )}
      {originals && (
        <ConsoleLink
          href={`/console/products/${id}/originals`}
          className="console-action"
          aria-current={active === "originals" ? "page" : undefined}
        >
          <Images size={18} aria-hidden="true" />
          Original images
        </ConsoleLink>
      )}
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
