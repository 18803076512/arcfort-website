import Link from "next/link";

type BuyerPath = {
  href: string;
  title: string;
  description: string;
};

type BuyerPathListProps = {
  items: readonly BuyerPath[];
  inverse?: boolean;
  ariaLabel: string;
};

export function BuyerPathList({ items, inverse = false, ariaLabel }: BuyerPathListProps) {
  const borderClass = inverse ? "border-white/15" : "border-arc-line";
  const itemClass = inverse
    ? "text-white hover:text-arc-signal"
    : "text-arc-midnight hover:text-arc-blue";

  return (
    <nav aria-label={ariaLabel} className="grid gap-x-10 md:grid-cols-2">
      {items.map((item) => {
        const content = (
          <>
            <div className="flex items-start justify-between gap-5">
              <h3
                className={`font-display text-xl font-black leading-tight transition ${itemClass}`}
              >
                {item.title}
              </h3>
              <span className={inverse ? "text-arc-signal" : "text-arc-blue"} aria-hidden="true">
                &rarr;
              </span>
            </div>
            <p
              className={`mt-3 text-sm leading-6 ${inverse ? "text-slate-300" : "text-slate-600"}`}
            >
              {item.description}
            </p>
          </>
        );
        const className = `group border-t py-6 ${borderClass}`;

        return item.href.endsWith(".pdf") || item.href.endsWith(".xlsx") ? (
          <a key={item.href} href={item.href} download className={className}>
            {content}
          </a>
        ) : (
          <Link key={item.href} href={item.href} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
