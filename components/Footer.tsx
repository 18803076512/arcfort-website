import Link from "next/link";
import { productCategories } from "@/lib/product-categories";

const links = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/rfq", label: "RFQ" },
];

export function Footer() {
  return (
    <footer className="bg-arc-midnight text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
        <div>
          <div className="font-display text-3xl font-black">ARCFORT</div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            Industrial Welding & Cutting Solutions for distributors, importers, OEM buyers,
            industrial users, and repair workshops.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Navigation
          </h2>
          <div className="mt-4 grid gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Product Lines
          </h2>
          <div className="mt-4 grid gap-2">
            {productCategories.map((category) => (
              <Link
                key={category.name}
                href="/products"
                className="text-sm text-slate-300 hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs uppercase tracking-[0.16em] text-slate-400">
        (c) 2026 ARCFORT Welding & Cutting Solutions
      </div>
    </footer>
  );
}
