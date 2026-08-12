import { RfqListLink } from "@/components/rfq/RfqListLink";
import { buildEmailHref, buildWhatsAppHref } from "@/lib/content/site";

export function StickyContactBar() {
  return (
    <nav
      data-sticky-contact-bar
      className="fixed inset-x-0 bottom-0 z-50 w-full max-w-[100vw] overflow-hidden border-t border-white/20 bg-arc-midnight/95 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 text-white shadow-industrial backdrop-blur md:hidden"
      aria-label="Quick inquiry contacts"
    >
      <div
        data-nosnippet
        data-snippet-region="sticky-contact"
        className="mx-auto grid w-full max-w-xl grid-cols-[repeat(2,minmax(0,1fr))] gap-2 sm:grid-cols-[repeat(3,minmax(0,1fr))]"
      >
        <RfqListLink variant="sticky" label="Quote" />
        <a
          href={buildWhatsAppHref()}
          aria-label="Send an ArcFort Weld product inquiry by WhatsApp"
          className="inline-flex min-h-12 min-w-0 items-center justify-center overflow-hidden border border-white/15 px-2 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-white transition hover:border-arc-signal hover:text-arc-signal sm:px-3 sm:text-xs sm:tracking-[0.12em]"
        >
          WhatsApp
        </a>
        <a
          href={buildEmailHref({ subject: "ArcFort Weld mobile website inquiry" })}
          aria-label="Send an ArcFort Weld product inquiry by email"
          className="hidden min-h-12 min-w-0 items-center justify-center overflow-hidden border border-white/15 px-2 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-white transition hover:border-arc-signal hover:text-arc-signal sm:inline-flex sm:px-3 sm:text-xs sm:tracking-[0.12em]"
        >
          Email
        </a>
      </div>
    </nav>
  );
}
