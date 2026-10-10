import Link from "next/link";
import { Container } from "@/components/ui/Container";

type PageSectionNavItem = {
  href: `#${string}`;
  label: string;
};

type PageSectionNavProps = {
  ariaLabel: string;
  items: readonly PageSectionNavItem[];
};

export function PageSectionNav({ ariaLabel, items }: PageSectionNavProps) {
  return (
    <nav
      data-nosnippet
      aria-label={ariaLabel}
      className="sticky top-[var(--header-height)] z-30 border-b border-arc-line bg-white/95 backdrop-blur"
    >
      <Container className="overflow-x-auto">
        <div className="flex min-w-max gap-7 py-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-slate-600 transition hover:text-arc-blue"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Container>
    </nav>
  );
}
