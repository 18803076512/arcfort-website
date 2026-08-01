import Link from "next/link";

export type BreadcrumbLink = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbLink[];
  inverse?: boolean;
};

export function Breadcrumbs({ items, inverse = false }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={inverse ? "text-sm text-slate-300" : "text-sm text-slate-500"}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {index > 0 ? (
                <span className={inverse ? "text-white/40" : "text-slate-300"}>/</span>
              ) : null}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className={`inline-flex min-h-8 items-center break-words font-semibold ${
                    inverse
                      ? "text-white hover:text-arc-signal"
                      : "text-arc-blue hover:text-arc-midnight"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={inverse ? "break-words text-slate-300" : "break-words text-slate-600"}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
