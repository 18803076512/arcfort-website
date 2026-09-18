import Link from "next/link";
import { AutoClosingDetails } from "@/components/AutoClosingDetails";
import { productNavigationGroups } from "@/lib/content/site-navigation";

export function ProductMegaMenu() {
  return (
    <AutoClosingDetails className="group static">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-2.5 text-sm font-semibold text-slate-700 transition hover:text-arc-blue">
        Products
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rotate-45 border-b border-r border-current transition group-open:rotate-[225deg]"
        />
      </summary>
      <div
        role="group"
        aria-label="Product systems"
        className="absolute inset-x-0 top-full z-50 border-y border-arc-line bg-white shadow-menu"
      >
        <div className="site-container py-8">
          <div className="flex items-end justify-between gap-8 border-b border-arc-line pb-5">
            <div>
              <p className="section-eyebrow">Product Systems</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Browse welding equipment, torch systems, consumables and industrial accessories by
                process and product family.
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 text-sm font-bold text-arc-blue transition hover:text-arc-copper"
            >
              View all products <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-6 gap-x-6 gap-y-8">
            {productNavigationGroups.map((group) => (
              <div key={group.title} className="min-w-0">
                <Link
                  href={group.href}
                  className="block border-l-2 border-arc-signal pl-3 text-sm font-black text-arc-midnight transition hover:text-arc-blue"
                >
                  {group.title}
                </Link>
                <div className="mt-4 grid gap-1.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded px-3 py-2 text-xs leading-5 text-slate-600 transition hover:bg-arc-frost hover:text-arc-blue"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AutoClosingDetails>
  );
}
