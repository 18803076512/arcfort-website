import Link from "next/link";
import { siteConfig } from "@/lib/content/site";

export function StickyContactBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 w-full max-w-[100vw] overflow-hidden border-t border-white/20 bg-arc-midnight/95 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 text-white shadow-industrial backdrop-blur md:inset-x-auto md:bottom-6 md:right-6 md:border md:px-0 md:py-0"
      aria-label="Quick inquiry contacts"
    >
      <div className="mx-auto grid w-full max-w-xl grid-cols-[repeat(2,minmax(0,1fr))] gap-2 sm:grid-cols-[repeat(3,minmax(0,1fr))] md:w-44 md:grid-cols-1 md:gap-0">
        <Link
          href="/rfq"
          className="inline-flex min-h-12 min-w-0 items-center justify-center overflow-hidden bg-arc-signal px-2 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-arc-midnight transition hover:bg-white sm:px-3 sm:text-xs sm:tracking-[0.12em] md:min-h-12"
        >
          Quote
        </Link>
        <a
          href={siteConfig.whatsappHref}
          className="inline-flex min-h-12 min-w-0 items-center justify-center overflow-hidden border border-white/15 px-2 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-white transition hover:border-arc-signal hover:text-arc-signal sm:px-3 sm:text-xs sm:tracking-[0.12em] md:min-h-12 md:border-x-0"
        >
          WhatsApp
        </a>
        <a
          href={siteConfig.emailHref}
          className="hidden min-h-12 min-w-0 items-center justify-center overflow-hidden border border-white/15 px-2 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-white transition hover:border-arc-signal hover:text-arc-signal sm:inline-flex sm:px-3 sm:text-xs sm:tracking-[0.12em] md:min-h-12 md:border-x-0 md:border-b-0"
        >
          Email
        </a>
      </div>
    </div>
  );
}
