import Image from "next/image";
import { getDisplayEligibleProductImageAssets } from "@/lib/content/product-images";
import type { ProductImageStatus } from "@/lib/content/schemas";

type ProductVisualProps = {
  sku: string;
  slug: string;
  label: string;
  mainImage?: string;
  imageStatus?: ProductImageStatus;
  compact?: boolean;
  denseMobile?: boolean;
};

export function ProductVisual({
  sku,
  slug,
  label,
  mainImage,
  imageStatus,
  compact = false,
  denseMobile = false,
}: ProductVisualProps) {
  const hasReviewedImage = imageStatus === "own_photo" || imageStatus === "supplier_photo";
  const [mainAsset] = hasReviewedImage
    ? getDisplayEligibleProductImageAssets({
        sku,
        slug,
        mainImage: mainImage ?? "",
        galleryImages: [],
        imageStatus,
      })
    : [];
  const shouldRenderImage = Boolean(mainAsset);
  const visualClass = compact ? "aspect-[8/9]" : "aspect-[5/4]";

  if (shouldRenderImage && mainAsset) {
    return (
      <div data-nosnippet data-snippet-region="product-visual" className="bg-white">
        <div className={`relative ${visualClass}`}>
          <Image
            src={mainAsset.publicPath}
            alt={mainAsset.altText}
            fill
            sizes={
              denseMobile
                ? "(min-width: 1280px) 22vw, (min-width: 640px) 46vw, 46vw"
                : compact
                  ? "(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                  : "(min-width: 1024px) 45vw, 100vw"
            }
            className={`object-contain transition duration-300 group-hover:scale-[1.02] ${
              denseMobile ? "p-3 sm:p-7" : "p-6 sm:p-8"
            }`}
            quality={88}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      data-nosnippet
      data-snippet-region="product-visual"
      className={`relative flex ${visualClass} items-center justify-center border-b border-arc-line bg-arc-frost p-5`}
    >
      <div className="max-w-xs text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center border border-arc-midnight bg-white font-display text-sm font-black text-arc-midnight">
          {label}
        </span>
        <p className="mt-4 font-display text-lg font-black leading-tight text-arc-midnight">
          Product image pending
        </p>
        <p className="mt-2 text-sm leading-5 text-slate-500">
          Request the current product reference.
        </p>
      </div>
    </div>
  );
}
