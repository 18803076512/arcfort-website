import Link from "next/link";
import { AutoClosingDetails } from "@/components/AutoClosingDetails";
import type { NavigationItem } from "@/lib/content/site-navigation";

type NavigationMenuProps = {
  label: string;
  items: NavigationItem[];
};

export function NavigationMenu({ label, items }: NavigationMenuProps) {
  return (
    <AutoClosingDetails className="group relative">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-2.5 text-sm font-semibold text-slate-700 transition hover:text-arc-blue">
        {label}
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rotate-45 border-b border-r border-current transition group-open:rotate-[225deg]"
        />
      </summary>
      <div className="absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-72 -translate-x-1/2 rounded-md border border-arc-line bg-white p-2 shadow-menu">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded px-4 py-3 transition hover:bg-arc-frost"
          >
            <span className="block text-sm font-bold text-arc-midnight">{item.label}</span>
            {item.description ? (
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {item.description}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </AutoClosingDetails>
  );
}
