import { siteConfig } from "@/lib/content/site";

type BrandLockupProps = {
  inverse?: boolean;
  compact?: boolean;
};

export function BrandLockup({ inverse = false, compact = false }: BrandLockupProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-sm border font-display font-black ${
          compact ? "h-10 w-10 text-sm" : "h-11 w-11 text-base"
        } ${
          inverse
            ? "border-white/30 bg-white text-arc-midnight"
            : "border-arc-midnight bg-arc-midnight text-white"
        }`}
      >
        AF
        <span className="absolute inset-x-0 bottom-0 h-1 bg-arc-signal" aria-hidden="true" />
      </span>
      <span className="min-w-0 leading-none">
        <span
          className={`block truncate font-display text-xl font-black sm:text-2xl ${
            inverse ? "text-white" : "text-arc-midnight"
          }`}
        >
          {siteConfig.shortName}
        </span>
        <span
          className={`mt-1.5 hidden truncate text-xs font-bold uppercase sm:block ${
            inverse ? "text-slate-300" : "text-arc-blue"
          }`}
        >
          Welding & Cutting Technology
        </span>
      </span>
    </span>
  );
}
