import {
  FileText,
  History,
  ListChecks,
  GitCompareArrows,
  Images,
  ImagePlus,
  Hash,
  Package,
} from "lucide-react";
import { ConsoleLink } from "./ConsoleLink";
import { consoleOemEnabled, consolePackagingEnabled } from "../../lib/console/working-config";

export function ProductWorkingNav({
  id,
  active,
  compatibility = false,
  originals = false,
  media = false,
  oem = consoleOemEnabled(),
  packaging = consolePackagingEnabled(),
}: {
  id: string;
  active?:
    | "edit"
    | "review"
    | "history"
    | "compatibility"
    | "originals"
    | "media"
    | "oem"
    | "packaging";
  compatibility?: boolean;
  originals?: boolean;
  media?: boolean;
  oem?: boolean;
  packaging?: boolean;
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
      {oem && (
        <ConsoleLink
          href={`/console/products/${id}/oem`}
          className="console-action"
          aria-current={active === "oem" ? "page" : undefined}
        >
          <Hash size={18} aria-hidden="true" />
          OEM references
        </ConsoleLink>
      )}
      {packaging && (
        <ConsoleLink
          href={`/console/products/${id}/packaging`}
          className="console-action"
          aria-current={active === "packaging" ? "page" : undefined}
        >
          <Package size={18} aria-hidden="true" />
          Packaging
        </ConsoleLink>
      )}
      {media && (
        <ConsoleLink
          href={`/console/products/${id}/media`}
          className="console-action"
          aria-current={active === "media" ? "page" : undefined}
        >
          <ImagePlus size={18} aria-hidden="true" />
          Image mappings
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
