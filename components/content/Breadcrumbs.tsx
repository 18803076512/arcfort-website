import Link from "next/link";

export type BreadcrumbLink = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbLink[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span className="text-slate-300">/</span> : null}
              {item.href && !isCurrent ? (
                <Link href={item.href} className="font-semibold text-arc-blue hover:text-arc-midnight">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? "page" : undefined} className="text-slate-600">
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
