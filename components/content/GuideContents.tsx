type GuideContentsItem = {
  href: `#${string}`;
  label: string;
};

type GuideContentsProps = {
  items: readonly GuideContentsItem[];
};

function ContentsList({ items }: GuideContentsProps) {
  return (
    <ol className="divide-y divide-arc-line border-y border-arc-line">
      {items.map((item, index) => (
        <li key={item.href}>
          <a
            href={item.href}
            className="group grid min-h-12 grid-cols-[2rem_1fr] gap-3 py-3 text-sm font-bold leading-6 text-arc-midnight transition hover:text-arc-blue"
          >
            <span className="text-xs font-black text-arc-blue">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{item.label}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export function GuideContents({ items }: GuideContentsProps) {
  return (
    <>
      <details className="group border border-arc-line bg-white lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 marker:hidden">
          <span className="text-sm font-black uppercase text-arc-midnight">Guide Contents</span>
          <span className="text-xs font-bold uppercase text-arc-blue">
            <span className="group-open:hidden">Open</span>
            <span className="hidden group-open:inline">Close</span>
          </span>
        </summary>
        <div className="border-t border-arc-line px-4 pb-4">
          <ContentsList items={items} />
        </div>
      </details>

      <nav
        aria-label="Guide contents"
        className="hidden lg:sticky lg:top-36 lg:block lg:self-start"
      >
        <p className="section-eyebrow">Guide Contents</p>
        <div className="mt-5">
          <ContentsList items={items} />
        </div>
      </nav>
    </>
  );
}
