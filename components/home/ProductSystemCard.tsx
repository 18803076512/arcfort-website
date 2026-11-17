import Image from "next/image";
import Link from "next/link";

type ProductSystemCardProps = {
  href: string;
  title: string;
  range: string;
  image: string;
  alt: string;
  compact?: boolean;
};

export function ProductSystemCard({
  href,
  title,
  range,
  image,
  alt,
  compact = false,
}: ProductSystemCardProps) {
  return (
    <article className="group h-full overflow-hidden rounded-md border border-arc-line bg-white transition hover:border-slate-300 hover:shadow-industrial">
      <Link
        href={href}
        className={`grid h-full min-h-20 items-center p-3 ${compact ? "grid-cols-1 gap-2 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-3" : "grid-cols-[5rem_minmax(0,1fr)] gap-3 md:flex md:flex-col md:gap-0 md:p-0"}`}
      >
        <div
          className={`relative aspect-square overflow-hidden bg-white ${compact ? "hidden w-20 sm:block" : "w-20 md:aspect-[4/3] md:w-full"}`}
        >
          <Image
            src={image}
            alt={alt}
            fill
            sizes={compact ? "80px" : "(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 80px"}
            className={`object-contain p-1 ${compact ? "" : "md:p-7 lg:p-8"}`}
          />
        </div>
        <div
          className={`flex min-w-0 items-center justify-between gap-3 ${compact ? "" : "md:w-full md:flex-1 md:items-end md:border-t md:border-arc-line md:px-5 md:py-5 lg:px-6 lg:py-6"}`}
        >
          <div className="min-w-0">
            <h3
              className={`font-display font-black leading-tight text-arc-midnight ${compact ? "text-base sm:text-lg" : "text-lg md:text-xl lg:text-2xl"}`}
            >
              {title}
            </h3>
            <p
              className={`mt-1 text-sm leading-5 text-slate-600 ${compact ? "hidden sm:block" : ""}`}
            >
              {range}
            </p>
          </div>
          <span
            aria-hidden="true"
            className={`shrink-0 text-xl text-arc-blue transition group-hover:translate-x-1 group-hover:text-arc-signal ${compact ? "hidden sm:inline" : ""}`}
          >
            &rarr;
          </span>
        </div>
      </Link>
    </article>
  );
}
