type ProductVisualProps = {
  label: string;
  title: string;
  category: string;
  compact?: boolean;
};

export function ProductVisual({ label, title, category, compact = false }: ProductVisualProps) {
  return (
    <div
      className={`relative overflow-hidden border border-slate-200 bg-arc-midnight text-white ${
        compact ? "aspect-[4/3]" : "aspect-[5/4]"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,35,65,0.98)_0%,rgba(15,76,129,0.88)_52%,rgba(217,230,242,0.32)_100%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute -right-16 -top-16 h-44 w-44 border-[28px] border-white/10" />
      <div className="absolute bottom-0 left-0 h-24 w-full bg-[repeating-linear-gradient(135deg,rgba(246,180,69,0.35)_0,rgba(246,180,69,0.35)_2px,transparent_2px,transparent_14px)]" />
      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex bg-arc-signal px-3 py-1 font-display text-lg font-black text-arc-midnight">
            {label}
          </span>
          <span className="text-right text-xs font-bold uppercase tracking-[0.16em] text-slate-200">
            {category}
          </span>
        </div>
        <div>
          <div className="h-1 w-20 bg-arc-signal" />
          <p className="mt-4 max-w-sm font-display text-2xl font-black leading-tight sm:text-3xl">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
