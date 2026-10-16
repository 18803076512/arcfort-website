"use client";

import { useMemo, useState } from "react";
import { useRfqList } from "@/components/rfq/useRfqList";
import { trackAnalyticsEvent } from "@/lib/analytics-events";
import {
  addRfqListItem,
  getRfqListItemKey,
  maxRfqItems,
  removeRfqListItem,
  type RfqListItem,
} from "@/lib/rfq-list";

type AddToRfqButtonProps = {
  item: RfqListItem;
  variant?: "detail" | "compact" | "card";
};

const variantClasses = {
  detail:
    "inline-flex min-h-12 w-full items-center justify-center rounded border border-arc-blue px-5 py-3 text-sm font-bold transition sm:w-auto",
  compact:
    "inline-flex min-h-11 shrink-0 items-center justify-center rounded border border-arc-blue px-3 py-2 text-sm font-bold transition",
  card: "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded border border-arc-blue text-xl font-bold transition",
} as const;

export function AddToRfqButton({ item, variant = "detail" }: AddToRfqButtonProps) {
  const items = useRfqList();
  const [announcement, setAnnouncement] = useState("");
  const itemKey = getRfqListItemKey(item);
  const isAdded = useMemo(
    () => items.some((currentItem) => getRfqListItemKey(currentItem) === itemKey),
    [itemKey, items],
  );
  const isFull = !isAdded && items.length >= maxRfqItems;

  function handleClick() {
    if (isFull) {
      setAnnouncement(`Your RFQ list can contain up to ${maxRfqItems} products.`);
      return;
    }

    if (isAdded) {
      removeRfqListItem(item);
      setAnnouncement(`${item.name} removed from your RFQ list.`);
      trackAnalyticsEvent("rfq_list_remove", {
        item_name: item.name,
        item_sku: item.sku,
      });
      return;
    }

    const nextItems = addRfqListItem(item);
    setAnnouncement(`${item.name} added to your RFQ list.`);
    trackAnalyticsEvent("rfq_list_add", {
      item_name: item.name,
      item_sku: item.sku,
      item_count: nextItems.length,
    });
  }

  const label =
    variant === "card"
      ? isFull
        ? "!"
        : isAdded
          ? "-"
          : "+"
      : isFull
        ? "RFQ List Full"
        : variant === "compact"
          ? isAdded
            ? "Added"
            : "Add to RFQ"
          : isAdded
            ? "Added to RFQ"
            : "Add to RFQ";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isFull}
        aria-pressed={isAdded}
        aria-label={
          isFull
            ? `RFQ list is full. Remove a product before adding ${item.name}`
            : isAdded
              ? `Remove ${item.name} from RFQ list`
              : `Add ${item.name} to RFQ list`
        }
        title={
          isFull
            ? "RFQ list is full"
            : isAdded
              ? `Remove ${item.name} from RFQ list`
              : `Add ${item.name} to RFQ list`
        }
        className={`${variantClasses[variant]} ${
          isFull
            ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-500"
            : isAdded
              ? "border-arc-midnight bg-arc-midnight text-white hover:bg-arc-blue"
              : "bg-white text-arc-blue hover:bg-arc-blue hover:text-white"
        }`}
      >
        {label}
      </button>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}
