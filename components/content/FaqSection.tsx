import type { FaqItem } from "@/lib/content/schemas";

type FaqSectionProps = {
  items: FaqItem[];
  title?: string;
};

export function FaqSection({ items, title = "FAQ" }: FaqSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-2xl font-black text-arc-midnight">{title}</h2>
      <div className="mt-5 divide-y divide-slate-100">
        {items.map((item) => (
          <article key={item.question} className="py-5 first:pt-0 last:pb-0">
            <h3 className="text-base font-bold text-arc-midnight">{item.question}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
