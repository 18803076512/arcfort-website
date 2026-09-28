import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";
import { NavigationMenu } from "@/components/navigation/NavigationMenu";
import { ProductMegaMenu } from "@/components/navigation/ProductMegaMenu";
import { RfqListLink } from "@/components/rfq/RfqListLink";
import { resourceNavigation, solutionNavigation } from "@/lib/content/site-navigation";

const navLinkClass =
  "inline-flex min-h-11 items-center px-2.5 text-sm font-semibold text-slate-700 transition hover:text-arc-blue";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-arc-line bg-white">
      <div
        data-nosnippet
        data-snippet-region="site-header-navigation"
        className="site-container relative flex min-h-header items-center justify-between gap-3 sm:gap-5"
      >
        <Link href="/" aria-label="ArcFort Weld homepage" className="min-w-0 shrink xl:shrink-0">
          <BrandLockup />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center xl:flex">
          <ProductMegaMenu />
          <NavigationMenu label="Solutions" items={solutionNavigation} />
          <Link href="/applications" className={navLinkClass}>
            Industries
          </Link>
          <Link href="/oem-service" className={navLinkClass}>
            OEM / ODM
          </Link>
          <Link href="/distributor-supply" className={navLinkClass}>
            Distributors
          </Link>
          <NavigationMenu label="Resources" items={resourceNavigation} />
          <Link href="/about" className={navLinkClass}>
            About
          </Link>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center px-2 text-sm font-bold text-arc-blue transition hover:text-arc-copper"
          >
            Contact
          </Link>
          <RfqListLink label="Request Quote" />
        </div>

        <MobileNavigation />
      </div>
    </header>
  );
}
