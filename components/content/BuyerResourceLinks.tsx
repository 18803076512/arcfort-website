import Link from "next/link";
import type { BuyerResourceLink } from "@/lib/content/schemas";

type BuyerResourceLinksProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  links: BuyerResourceLink[];
};

export function BuyerResourceLinks({
  id,
  eyebrow,
  title,
  description,
  links,
}: BuyerResourceLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section id={id} className="scroll-mt-28 border-y border-slate-200 bg-white py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{description}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex min-w-0 flex-col border border-slate-200 bg-arc-frost p-5 transition hover:border-arc-blue hover:bg-white hover:shadow-industrial sm:p-6"
            >
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                {link.label}
              </span>
              <h3 className="mt-3 font-display text-2xl font-black leading-tight text-arc-midnight group-hover:text-arc-blue">
                {link.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{link.description}</p>
              <span className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                {link.actionLabel}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
