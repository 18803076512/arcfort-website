import { ProductGalleryViewer } from "@/components/content/ProductGalleryViewer";
import type { Product } from "@/lib/content/schemas";
import { getDisplayEligibleProductImageAssets } from "@/lib/content/product-images";

type ProductGalleryProps = {
  product: Product;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = getDisplayEligibleProductImageAssets(product);
  const [mainImage] = images;

  if (!mainImage) {
    return (
      <figure
        data-nosnippet
        data-snippet-region="product-visual"
        className="border border-arc-line bg-arc-frost"
      >
        <div data-nosnippet className="flex aspect-[5/4] items-center justify-center p-8">
          <div className="max-w-sm text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center border border-arc-midnight bg-white font-display text-lg font-black text-arc-midnight">
              AF
            </span>
            <p className="mt-5 font-display text-xl font-black text-arc-midnight">
              Product image available during quotation review
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Send the model, drawing or reference photo so the required product geometry can be
              checked before quotation.
            </p>
          </div>
        </div>
      </figure>
    );
  }

  return (
    <ProductGalleryViewer
      productTitle={product.title}
      images={images.map((image) => ({
        assetId: image.assetId,
        publicPath: image.publicPath,
        altText: image.altText,
        role: image.role,
        contentMatchStatus: image.contentMatchStatus,
        publicationStatus: image.publicationStatus,
      }))}
    />
  );
}
