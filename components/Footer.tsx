import Link from "next/link";
import { productCategories } from "@/lib/product-categories";
import { applications, companyLinks, contactMethods } from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="bg-arc-midnight text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_0.8fr_1fr] lg:px-8">
        <div>
          <div className="font-display text-3xl font-black">ARCFORT</div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            Industrial Welding & Cutting Solutions for distributors, importers, OEM buyers,
            industrial users, and repair workshops.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Products
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

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Applications
          </h2>
          <div className="mt-4 grid gap-2">
            {applications.map((application) => (
              <span key={application} className="text-sm text-slate-300">
                {application}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Company
          </h2>
          <div className="mt-4 grid gap-2">
            {companyLinks.map((link) => (
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
            Contact
          </h2>
          <div className="mt-4 grid gap-3">
            {contactMethods.map((method) => (
              <Link key={method.label} href={method.href} className="group text-sm">
                <span className="block font-bold uppercase tracking-[0.14em] text-slate-400">
                  {method.label}
                </span>
                <span className="mt-1 block text-slate-300 group-hover:text-white">
                  {method.value}
                </span>
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
