"use client";

import Image from "next/image";
import { useState } from "react";
import {
  getProductImageDisclosureLabel,
  type ProductImageEvidenceState,
} from "@/lib/content/product-image-evidence";
import type { ProductImageAssetRole } from "@/lib/content/schemas";

export type ProductGalleryImage = {
  assetId: string;
  publicPath: string;
  altText: string;
  role: ProductImageAssetRole;
  evidenceState: ProductImageEvidenceState;
};

type ProductGalleryViewerProps = {
  images: ProductGalleryImage[];
  productTitle: string;
};

function getImageDisclosure(image: ProductGalleryImage) {
  return getProductImageDisclosureLabel(image.evidenceState, image.role);
}

export function ProductGalleryViewer({ images, productTitle }: ProductGalleryViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  return (
    <div data-nosnippet data-snippet-region="product-visual">
      <figure className="border border-arc-line bg-white">
        <div className="relative aspect-square bg-white sm:aspect-[5/4] lg:aspect-square">
          <Image
            key={selectedImage.assetId}
            src={selectedImage.publicPath}
            alt={selectedImage.altText}
            fill
            priority={selectedIndex === 0}
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-contain p-6 sm:p-9"
            quality={90}
          />
        </div>
        <figcaption className="flex flex-col gap-2 border-t border-arc-line px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{getImageDisclosure(selectedImage)}</span>
          <a
            href={selectedImage.publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center font-bold text-arc-blue transition hover:text-arc-copper"
          >
            View full image{" "}
            <span className="ml-2" aria-hidden="true">
              &rarr;
            </span>
          </a>
        </figcaption>
      </figure>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={image.assetId}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-pressed={selectedIndex === index}
              aria-label={`Show ${productTitle} ${getImageDisclosure(image).toLowerCase()}`}
              className={`relative aspect-square overflow-hidden border bg-white transition ${
                selectedIndex === index
                  ? "border-arc-blue ring-1 ring-arc-blue"
                  : "border-arc-line hover:border-arc-blue"
              }`}
            >
              <Image
                src={image.publicPath}
                alt=""
                fill
                sizes="(min-width: 1024px) 10vw, 22vw"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
