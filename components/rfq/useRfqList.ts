"use client";

import { useEffect, useState } from "react";
import {
  readRfqList,
  rfqListChangedEvent,
  rfqListStorageKey,
  type RfqListItem,
} from "@/lib/rfq-list";

export function useRfqList() {
  const [items, setItems] = useState<RfqListItem[]>([]);

  useEffect(() => {
    function syncItems() {
      setItems(readRfqList());
    }

    function handleStorage(event: StorageEvent) {
      if (!event.key || event.key === rfqListStorageKey) {
        syncItems();
      }
    }

    syncItems();
    window.addEventListener(rfqListChangedEvent, syncItems);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(rfqListChangedEvent, syncItems);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return items;
}
