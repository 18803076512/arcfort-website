"use client";

import Link from "next/link";
import { useRfqList } from "@/components/rfq/useRfqList";

type RfqListLinkProps = {
  label?: string;
  variant?: "header" | "menu" | "sticky";
};

const variantClasses = {
  header:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded bg-arc-signal px-4 text-sm font-bold text-white transition hover:bg-arc-copper",
  menu: "flex min-h-12 items-center justify-between rounded bg-arc-signal px-4 text-sm font-bold text-white transition hover:bg-arc-copper",
  sticky:
    "inline-flex min-h-12 min-w-0 items-center justify-center gap-2 overflow-hidden bg-arc-signal px-2 text-center text-sm font-bold text-white transition hover:bg-arc-copper sm:px-3",
} as const;

const countClasses = {
  header: "bg-white/15 text-white",
  menu: "bg-white/15 text-white",
  sticky: "bg-arc-midnight text-white",
} as const;

export function RfqListLink({ label = "RFQ List", variant = "header" }: RfqListLinkProps) {
  const items = useRfqList();
  const hasSelectedProducts = items.length > 0;

  return (
    <Link
      href={hasSelectedProducts ? "/rfq#selected-products" : "/rfq"}
      className={variantClasses[variant]}
      aria-label={
        hasSelectedProducts
          ? `${label}, ${items.length} selected product${items.length === 1 ? "" : "s"}`
          : label
      }
    >
      <span>{label}</span>
      {hasSelectedProducts ? (
        <span
          className={`inline-flex h-5 min-w-5 items-center justify-center px-1 text-[10px] font-black ${countClasses[variant]}`}
          aria-hidden="true"
          data-rfq-count
        >
          {items.length}
        </span>
      ) : null}
    </Link>
  );
}
