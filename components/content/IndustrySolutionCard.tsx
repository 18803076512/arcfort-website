import Image from "next/image";
import Link from "next/link";
import type { ApplicationPage } from "@/lib/content/schemas";

type IndustrySolutionCardProps = {
  application: ApplicationPage;
  image?: {
    src: string;
    alt: string;
  };
};

export function IndustrySolutionCard({ application, image }: IndustrySolutionCardProps) {
  return (
    <article className="group h-full overflow-hidden rounded-md border border-arc-line bg-white transition hover:border-slate-300 hover:shadow-industrial">
      <Link href={`/applications/${application.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] border-b border-arc-line bg-white">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 100vw"
              className="object-contain p-7 transition duration-300 group-hover:scale-[1.025]"
              quality={88}
            />
          ) : (
            <div
              data-nosnippet
              className="flex h-full items-center justify-center bg-arc-frost p-8 text-center"
            >
              <div>
                <span className="mx-auto flex h-12 w-12 items-center justify-center border border-arc-midnight bg-white font-display font-black text-arc-midnight">
                  AF
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-600">
                  Related product visual available during inquiry review
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="caption text-arc-blue">{application.industries.slice(0, 2).join(" / ")}</p>
          <h2 className="mt-3 font-display text-2xl font-black leading-tight text-arc-midnight">
            {application.title}
          </h2>
          <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{application.description}</p>
          <span className="mt-6 inline-flex min-h-11 items-center border-t border-arc-line pt-4 text-sm font-bold text-arc-blue transition group-hover:text-arc-copper">
            View industry solution{" "}
            <span className="ml-2" aria-hidden="true">
              &rarr;
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}
