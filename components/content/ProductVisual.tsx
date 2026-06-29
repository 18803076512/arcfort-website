import Image from "next/image";
import { hasPublicProductImage } from "@/lib/content/product-images";

type ProductVisualProps = {
  label: string;
  title: string;
  category: string;
  mainImage?: string;
  compact?: boolean;
};

export function ProductVisual({
  label,
  title,
  category,
  mainImage,
  compact = false,
}: ProductVisualProps) {
  const visualTitle = compact ? "Welding & Cutting Consumable" : title;
  const visualCategory = compact ? "RFQ" : category;
  const shouldRenderImage = hasPublicProductImage(mainImage);
  const imageNote = compact
    ? "Photo on request"
    : "Product photo, drawing or model reference can be reviewed before quotation.";
  const imageAlt = `${title} ${category} product image for ArcFort Weld RFQ`;

  if (shouldRenderImage && mainImage) {
    return (
      <figure className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className={`relative bg-white ${compact ? "aspect-[4/3]" : "aspect-[5/4]"}`}>
          <Image
            src={mainImage}
            alt={imageAlt}
            fill
            sizes={compact ? "(min-width: 1024px) 33vw, 100vw" : "(min-width: 1024px) 45vw, 100vw"}
            className="object-contain p-5 sm:p-7"
            priority={!compact}
            quality={88}
          />
        </div>
        <figcaption className="border-t border-slate-200 bg-arc-frost px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="inline-flex shrink-0 bg-arc-signal px-3 py-1 font-display text-base font-black text-arc-midnight">
              {label}
            </span>
            <span className="min-w-0 truncate text-right text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
              {visualCategory}
            </span>
          </div>
          {!compact ? (
            <>
              <p className="mt-3 font-display text-xl font-black leading-tight text-arc-midnight">
                {title}
              </p>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                Product image for sourcing reference. Exact model, size and packaging can be
                confirmed by sample, drawing or RFQ details.
              </p>
            </>
          ) : null}
        </figcaption>
      </figure>
    );
  }

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
            {visualCategory}
          </span>
        </div>
        <div>
          <div className="h-1 w-20 bg-arc-signal" />
          <p className="mt-4 max-w-sm font-display text-xl font-black leading-tight sm:text-2xl">
            {visualTitle}
          </p>
          <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-200">
            {imageNote}
          </p>
        </div>
      </div>
    </div>
  );
}
