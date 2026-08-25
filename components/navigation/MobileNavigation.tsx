import Link from "next/link";
import { AutoClosingDetails } from "@/components/AutoClosingDetails";
import { RfqListLink } from "@/components/rfq/RfqListLink";
import { mobilePrimaryNavigation, productNavigationGroups } from "@/lib/content/site-navigation";

export function MobileNavigation() {
  return (
    <AutoClosingDetails className="group relative shrink-0 xl:hidden">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-arc-line px-3 text-sm font-bold text-arc-midnight transition hover:border-arc-blue hover:text-arc-blue">
        <span className="flex w-4 flex-col gap-1" aria-hidden="true">
          <span className="h-px w-4 bg-current" />
          <span className="h-px w-4 bg-current" />
          <span className="h-px w-4 bg-current" />
        </span>
        Menu
      </summary>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-[4.25rem] top-[5.25rem] z-50 hidden overflow-y-auto rounded-panel border border-arc-line bg-white p-4 shadow-menu group-open:block sm:inset-x-6 sm:p-6 md:bottom-4"
      >
        <div className="flex items-center justify-between gap-4 border-b border-arc-line pb-4">
          <p className="section-eyebrow">Product Systems</p>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center text-sm font-bold text-arc-blue"
          >
            View all{" "}
            <span className="ml-2" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 py-4 sm:grid-cols-3">
          {productNavigationGroups.map((group) => (
            <Link
              key={group.href}
              href={group.href}
              className="flex min-h-11 items-center border-b border-slate-100 py-2 text-sm font-bold text-arc-midnight transition hover:text-arc-blue"
            >
              {group.title}
            </Link>
          ))}
        </div>
        <div className="grid gap-x-5 border-t border-arc-line py-3 sm:grid-cols-2">
          {mobilePrimaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center border-b border-slate-100 text-sm font-semibold text-slate-700 transition hover:text-arc-blue"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <RfqListLink variant="menu" label="Request a Quote" />
          <Link href="/contact" className="button-base button-secondary w-full">
            Contact Sales
          </Link>
        </div>
      </nav>
    </AutoClosingDetails>
  );
}
