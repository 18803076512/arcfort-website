import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";

export function HomeInquiryCta() {
  return (
    <section
      data-nosnippet
      data-snippet-region="home-inquiry-cta"
      aria-labelledby="home-inquiry-title"
      className="bg-arc-navy py-16 text-white sm:py-20"
    >
      <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-slate-300">Start a Product Inquiry</p>
          <h2
            id="home-inquiry-title"
            className="mt-3 max-w-4xl font-display text-3xl font-black leading-tight text-white sm:text-5xl"
          >
            Tell us what you need to source, match or customize.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            Send the product name, model, size, quantity and available drawing or sample photo. The
            ArcFort Weld team will review the quotation scope and available options.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:gap-6">
            <a
              href={buildEmailHref({ subject: "ArcFort Weld product inquiry" })}
              className="break-all font-semibold transition hover:text-white"
            >
              {siteConfig.email}
            </a>
            <a href={buildWhatsAppHref()} className="font-semibold transition hover:text-white">
              WhatsApp {siteConfig.whatsapp}
            </a>
          </div>
        </div>
        <ButtonLink href="/rfq" className="w-full lg:w-auto">
          Request a Quote
        </ButtonLink>
      </Container>
    </section>
  );
}
