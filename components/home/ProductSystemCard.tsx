import Image from "next/image";
import Link from "next/link";

type ProductSystemCardProps = {
  href: string;
  title: string;
  range: string;
  image: string;
  alt: string;
};

export function ProductSystemCard({ href, title, range, image, alt }: ProductSystemCardProps) {
  return (
    <article className="group h-full overflow-hidden rounded-md border border-arc-line bg-white transition hover:border-slate-300 hover:shadow-industrial">
      <Link href={href} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 100vw"
            className="object-contain p-7 transition duration-300 group-hover:scale-[1.025] sm:p-9"
          />
        </div>
        <div className="flex flex-1 items-end justify-between gap-5 border-t border-arc-line px-5 py-5 sm:px-6 sm:py-6">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-black leading-tight text-arc-midnight sm:text-2xl">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{range}</p>
          </div>
          <span
            aria-hidden="true"
            className="shrink-0 text-xl text-arc-blue transition group-hover:translate-x-1 group-hover:text-arc-signal"
          >
            &rarr;
          </span>
        </div>
      </Link>
    </article>
  );
}
