import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden bg-arc-midnight text-white"
    >
      <Image
        src="/images/site/arcfort-hero-welding-workshop.png"
        alt="Representative welding equipment, torches and consumables in an industrial work setting"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover object-[66%_center] sm:object-[62%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-arc-midnight/75" aria-hidden="true" />

      <Container className="home-hero-layout flex items-center py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-slate-200">
            ArcFort Weld | Welding & Cutting Technology
          </p>
          <h1 id="home-hero-title" className="display-title mt-5 text-white">
            Engineered for Welding.
            <span className="mt-2 block">Built for Industry.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-xl sm:leading-8">
            Professional welding machines, cutting equipment, torch parts and consumables for
            industrial users, distributors and OEM partners.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/products" className="w-full sm:w-auto">
              Explore Products
            </ButtonLink>
            <ButtonLink href="/rfq" variant="onDark" className="w-full sm:w-auto">
              Request a Quote
            </ButtonLink>
          </div>
        </div>
      </Container>

      <div
        data-nosnippet
        className="caption-text absolute bottom-4 right-5 !text-white/70 sm:bottom-6 sm:right-8"
      >
        Representative industrial product visual
      </div>
    </section>
  );
}
