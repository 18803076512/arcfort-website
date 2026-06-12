import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductByRoute,
  getProductPath,
  getRelatedProducts,
  mockProducts,
  productSpecFields,
} from "@/lib/mock-products";

type ProductPageParams = {
  category: string;
  slug: string;
};

type ProductPageProps = {
  params: Promise<ProductPageParams>;
};

export function generateStaticParams() {
  return mockProducts.map((product) => ({
    category: product.categorySlug,
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const product = getProductByRoute(category, slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | ${product.category}`,
    description: product.shortDescription,
    alternates: {
      canonical: getProductPath(product),
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      type: "website",
      url: getProductPath(product),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { category, slug } = await params;
  const product = getProductByRoute(category, slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);
  const productUrl = `https://arcfortweld.com${getProductPath(product)}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    mpn: product.specs["OEM Number"],
    category: product.category,
    description: product.shortDescription,
    image: `${productUrl}#placeholder-image`,
    brand: {
      "@type": "Brand",
      name: "ARCFORT",
    },
    additionalProperty: productSpecFields.map((field) => ({
      "@type": "PropertyValue",
      name: field,
      value: product.specs[field],
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <section className="bg-arc-midnight py-8 text-white sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm font-semibold text-slate-300">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li className="text-arc-signal">/</li>
              <li>
                <Link href="/products" className="hover:text-white">
                  Products
                </Link>
              </li>
              <li className="text-arc-signal">/</li>
              <li className="text-slate-200">{product.category}</li>
              <li className="text-arc-signal">/</li>
              <li aria-current="page" className="text-white">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <div className="flex aspect-square items-center justify-center border border-slate-200 bg-[linear-gradient(135deg,#eef3f8_0%,#c7d7e7_52%,#6f879f_100%)] p-6 shadow-sm">
              <div className="flex h-full w-full items-center justify-center border border-white/70 bg-white/35">
                <div className="text-center">
                  <div className="font-display text-5xl font-black text-arc-navy">
                    {product.category.split(" ")[0]}
                  </div>
                  <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-blue">
                    Product Image Placeholder
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {["Front", "Detail", "Package"].map((label) => (
                <div
                  key={label}
                  className="flex aspect-square items-center justify-center border border-slate-200 bg-arc-frost text-xs font-bold uppercase tracking-[0.12em] text-arc-blue"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              {product.category}
            </p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="border border-slate-200 bg-slate-50 p-4">
                <span className="block font-bold uppercase tracking-[0.14em] text-slate-500">
                  SKU
                </span>
                <span className="mt-1 block font-semibold text-arc-midnight">{product.sku}</span>
              </div>
              <div className="border border-slate-200 bg-slate-50 p-4">
                <span className="block font-bold uppercase tracking-[0.14em] text-slate-500">
                  Category
                </span>
                <span className="mt-1 block font-semibold text-arc-midnight">
                  {product.category}
                </span>
              </div>
            </div>
            <p className="mt-6 text-lg leading-8 text-slate-600">{product.shortDescription}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-arc-midnight"
              >
                Request Quote
              </Link>
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center border border-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-arc-blue transition hover:bg-arc-frost"
              >
                Add to RFQ
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-arc-signal px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-arc-midnight transition hover:bg-arc-midnight hover:text-white"
              >
                WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-12 sm:py-16" aria-labelledby="specifications">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="specifications" className="font-display text-3xl font-black text-arc-midnight">
            Specifications
          </h2>
          <div className="mt-6 overflow-hidden border border-slate-200 bg-white shadow-sm">
            <dl className="grid sm:grid-cols-2">
              {productSpecFields.map((field) => (
                <div
                  key={field}
                  className="grid grid-cols-[0.9fr_1.1fr] border-b border-slate-200 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
                >
                  <dt className="bg-slate-50 px-4 py-4 text-sm font-bold text-arc-midnight">
                    {field}
                  </dt>
                  <dd className="px-4 py-4 text-sm leading-6 text-slate-700">
                    {product.specs[field]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article className="border border-slate-200 p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Product Description
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{product.productDescription}</p>
          </article>
          <article className="border border-slate-200 p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Compatibility Information
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {product.compatibilityInformation}
            </p>
          </article>
          <article className="border border-slate-200 p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Packaging & Delivery
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{product.packagingDelivery}</p>
          </article>
        </div>
      </section>

      <section className="bg-arc-midnight py-12 text-white sm:py-16" id="catalog-download">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              PDF Catalog
            </p>
            <h2 className="mt-3 font-display text-3xl font-black">Need catalog files?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Catalog download is represented as a mock CTA for now. Final PDF assets can be added
              when official catalog files are ready.
            </p>
          </div>
          <Link
            href="/rfq"
            className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white"
          >
            PDF Catalog Download
          </Link>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16" aria-labelledby="related-products">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="related-products" className="font-display text-3xl font-black text-arc-midnight">
            Related Products
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.sku}
                href={getProductPath(relatedProduct)}
                className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                  {relatedProduct.category}
                </p>
                <h3 className="mt-3 font-display text-xl font-black text-arc-midnight">
                  {relatedProduct.name}
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">{relatedProduct.sku}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {relatedProduct.shortDescription}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-12 sm:py-16" aria-labelledby="faq">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 id="faq" className="font-display text-3xl font-black text-arc-midnight">
            FAQ
          </h2>
          <div className="mt-8 divide-y divide-slate-200 border border-slate-200 bg-white">
            {product.faqs.map((item) => (
              <article key={item.question} className="p-6">
                <h3 className="font-bold text-arc-midnight">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
