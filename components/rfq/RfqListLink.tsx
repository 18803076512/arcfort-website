"use client";

import Link from "next/link";
import { useRfqList } from "@/components/rfq/useRfqList";

type RfqListLinkProps = {
  label?: string;
  variant?: "header" | "menu" | "sticky";
};

const variantClasses = {
  header:
    "ml-2 inline-flex min-h-11 items-center justify-center gap-2 bg-arc-blue px-4 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-arc-midnight",
  menu: "flex min-h-12 items-center justify-between bg-arc-blue px-3 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-arc-midnight",
  sticky:
    "inline-flex min-h-12 min-w-0 items-center justify-center gap-2 overflow-hidden bg-arc-signal px-2 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-arc-midnight transition hover:bg-white sm:px-3 sm:text-xs sm:tracking-[0.12em] md:min-h-12",
} as const;

const countClasses = {
  header: "bg-white/15 text-white",
  menu: "bg-white/15 text-white",
  sticky: "bg-arc-midnight text-white",
} as const;

export function RfqListLink({ label = "RFQ List", variant = "header" }: RfqListLinkProps) {
  const items = useRfqList();

  return (
    <Link
      href="/rfq#selected-products"
      className={variantClasses[variant]}
      aria-label={`${label}, ${items.length} selected product${items.length === 1 ? "" : "s"}`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex h-5 min-w-5 items-center justify-center px-1 text-[10px] font-black ${countClasses[variant]}`}
        aria-hidden="true"
        data-rfq-count
      >
        {items.length}
      </span>
    </Link>
  );
}
