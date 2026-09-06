type DownloadCardProps = {
  title: string;
  type: string;
  href: string;
  description: string;
  note: string;
  actionLabel?: string;
};

export function DownloadCard({
  title,
  type,
  href,
  description,
  note,
  actionLabel,
}: DownloadCardProps) {
  return (
    <article className="grid gap-5 border-t border-arc-line py-7 sm:grid-cols-[5rem_1fr_auto] sm:items-start sm:gap-7">
      <div
        data-nosnippet
        className="flex h-12 w-16 items-center justify-center bg-arc-midnight text-xs font-black uppercase text-white"
      >
        {type}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-xl font-black leading-tight text-arc-midnight sm:text-2xl">
          {title}
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
        <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{note}</p>
      </div>
      <a
        href={href}
        download
        className="button-base button-secondary w-full whitespace-nowrap sm:w-auto"
        aria-label={`Download ${title} as ${type}`}
      >
        {actionLabel ?? `Download ${type}`}
      </a>
    </article>
  );
}
