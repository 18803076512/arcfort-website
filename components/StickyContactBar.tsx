import Link from "next/link";
import { siteConfig } from "@/lib/content/site";

export function StickyContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/20 bg-arc-midnight/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 text-white shadow-industrial backdrop-blur md:inset-x-auto md:bottom-6 md:right-6 md:border md:px-0 md:py-0">
      <div className="grid grid-cols-3 gap-2 md:w-44 md:grid-cols-1 md:gap-0">
        <Link
          href="/rfq"
          className="inline-flex min-h-11 items-center justify-center bg-arc-signal px-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-arc-midnight transition hover:bg-white sm:px-3 sm:tracking-[0.12em] md:min-h-12"
        >
          RFQ
        </Link>
        <a
          href={siteConfig.whatsappHref}
          className="inline-flex min-h-11 items-center justify-center border border-white/15 px-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:border-arc-signal hover:text-arc-signal sm:px-3 sm:tracking-[0.12em] md:min-h-12 md:border-x-0"
        >
          WhatsApp
        </a>
        <a
          href={siteConfig.emailHref}
          className="inline-flex min-h-11 items-center justify-center border border-white/15 px-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:border-arc-signal hover:text-arc-signal sm:px-3 sm:tracking-[0.12em] md:min-h-12 md:border-x-0 md:border-b-0"
        >
          Email
        </a>
      </div>
    </div>
  );
}
