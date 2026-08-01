"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/content/site";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="border-l-4 border-arc-signal bg-arc-midnight px-6 py-8 text-white sm:px-8 sm:py-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Page Recovery
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-black leading-tight sm:text-5xl">
            This page could not be loaded.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            Try the page again or continue through the product center. For an urgent sourcing
            request, contact the ArcFort Weld sales team by email or WhatsApp.
          </p>
          {error.digest ? (
            <p className="mt-4 break-words text-xs leading-5 text-slate-400">
              Support reference: {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 w-full items-center justify-center bg-arc-signal px-6 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white sm:w-auto"
            >
              Try Again
            </button>
            <Link
              href="/products"
              className="inline-flex min-h-12 w-full items-center justify-center border border-white/30 px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
            >
              Product Center
            </Link>
            <Link
              href="/rfq"
              className="inline-flex min-h-12 w-full items-center justify-center border border-white/30 px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
            >
              Send RFQ
            </Link>
          </div>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
          <a
            href={siteConfig.emailHref}
            className="min-w-0 bg-arc-frost p-5 transition hover:bg-white"
          >
            <span className="block text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
              Business Email
            </span>
            <span className="mt-2 block break-words text-sm font-semibold text-arc-midnight">
              {siteConfig.email}
            </span>
          </a>
          <a
            href={siteConfig.whatsappHref}
            className="min-w-0 bg-arc-frost p-5 transition hover:bg-white"
          >
            <span className="block text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
              WhatsApp
            </span>
            <span className="mt-2 block break-words text-sm font-semibold text-arc-midnight">
              {siteConfig.whatsapp}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
