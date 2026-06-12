import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/applications", label: "Applications" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/rfq", label: "RFQ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center bg-arc-midnight font-display text-lg font-black text-arc-signal">
            AF
          </span>
          <span className="leading-tight">
            <span className="block font-display text-2xl font-black tracking-normal text-arc-midnight">
              ARCFORT
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
              Welding & Cutting
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-arc-frost hover:text-arc-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
