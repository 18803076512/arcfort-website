export const rfqListStorageKey = "arcfort-rfq-products-v1";
export const rfqListChangedEvent = "arcfort:rfq-list-changed";

export type RfqListItem = {
  sku: string;
  name: string;
  category: string;
  categorySlug: string;
  slug: string;
  requestedQuantity?: string;
  buyerReference?: string;
};

export const maxRfqItems = 50;
export const rfqLineItemFieldLimits = {
  requestedQuantity: 80,
  buyerReference: 240,
} as const;

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeSlug(value: unknown) {
  const slug = normalizeText(value, 120);
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : "";
}

function normalizeEditableText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]+/g, " ").slice(0, maxLength)
    : "";
}

function normalizeRfqListItem(value: unknown): RfqListItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<RfqListItem>;
  const item = {
    sku: normalizeText(candidate.sku, 80),
    name: normalizeText(candidate.name, 160),
    category: normalizeText(candidate.category, 120),
    categorySlug: normalizeSlug(candidate.categorySlug),
    slug: normalizeSlug(candidate.slug),
    requestedQuantity: normalizeEditableText(
      candidate.requestedQuantity,
      rfqLineItemFieldLimits.requestedQuantity,
    ),
    buyerReference: normalizeEditableText(
      candidate.buyerReference,
      rfqLineItemFieldLimits.buyerReference,
    ),
  };

  return item.sku && item.name && item.category && item.categorySlug && item.slug ? item : null;
}

export function getRfqListItemKey(item: Pick<RfqListItem, "categorySlug" | "slug">) {
  return `${item.categorySlug}/${item.slug}`;
}

function normalizeRfqList(values: unknown[]) {
  const uniqueItems = new Map<string, RfqListItem>();

  for (const value of values) {
    const item = normalizeRfqListItem(value);

    if (item) {
      uniqueItems.set(getRfqListItemKey(item), item);
    }
  }

  return Array.from(uniqueItems.values()).slice(0, maxRfqItems);
}

export function readRfqListSnapshot(): { readable: boolean; items: RfqListItem[] } {
  if (typeof window === "undefined") {
    return { readable: false, items: [] };
  }

  try {
    const rawValue = window.localStorage.getItem(rfqListStorageKey);
    const parsedValue = rawValue ? (JSON.parse(rawValue) as unknown) : [];

    return {
      readable: Array.isArray(parsedValue),
      items: Array.isArray(parsedValue) ? normalizeRfqList(parsedValue) : [],
    };
  } catch {
    return { readable: false, items: [] };
  }
}

export function readRfqList() {
  return readRfqListSnapshot().items;
}

function writeRfqList(items: RfqListItem[]) {
  const normalizedItems = normalizeRfqList(items);

  if (typeof window === "undefined") {
    return normalizedItems;
  }

  try {
    window.localStorage.setItem(rfqListStorageKey, JSON.stringify(normalizedItems));
  } catch {
    return readRfqList();
  }

  const saved = readRfqListSnapshot();
  if (!saved.readable) {
    return saved.items;
  }

  window.dispatchEvent(new Event(rfqListChangedEvent));
  return saved.items;
}

export function addRfqListItem(item: RfqListItem) {
  const normalizedItem = normalizeRfqListItem(item);

  if (!normalizedItem) {
    return readRfqList();
  }

  const current = readRfqListSnapshot();
  const currentItems = current.items;
  const itemKey = getRfqListItemKey(normalizedItem);

  if (
    !current.readable ||
    currentItems.some((currentItem) => getRfqListItemKey(currentItem) === itemKey)
  ) {
    return currentItems;
  }

  return writeRfqList([...currentItems, normalizedItem]);
}

export function removeRfqListItem(item: Pick<RfqListItem, "categorySlug" | "slug">) {
  const current = readRfqListSnapshot();
  if (!current.readable) {
    return current.items;
  }
  const itemKey = getRfqListItemKey(item);

  return writeRfqList(
    current.items.filter((currentItem) => getRfqListItemKey(currentItem) !== itemKey),
  );
}

export function updateRfqListItem(
  item: Pick<RfqListItem, "categorySlug" | "slug">,
  updates: Pick<RfqListItem, "requestedQuantity" | "buyerReference">,
) {
  const current = readRfqListSnapshot();
  if (!current.readable) {
    return current.items;
  }
  const itemKey = getRfqListItemKey(item);

  return writeRfqList(
    current.items.map((currentItem) =>
      getRfqListItemKey(currentItem) === itemKey
        ? {
            ...currentItem,
            requestedQuantity:
              updates.requestedQuantity === undefined
                ? currentItem.requestedQuantity
                : normalizeEditableText(
                    updates.requestedQuantity,
                    rfqLineItemFieldLimits.requestedQuantity,
                  ),
            buyerReference:
              updates.buyerReference === undefined
                ? currentItem.buyerReference
                : normalizeEditableText(
                    updates.buyerReference,
                    rfqLineItemFieldLimits.buyerReference,
                  ),
          }
        : currentItem,
    ),
  );
}

export function clearRfqList() {
  const current = readRfqListSnapshot();
  if (!current.readable) {
    return current.items;
  }
  return writeRfqList([]);
}

export function formatRfqListItems(items: RfqListItem[]) {
  return items
    .map((item, index) => {
      const details = [
        `${index + 1}. ${item.name}`,
        `SKU: ${item.sku}`,
        `Category: ${item.category}`,
      ];
      const requestedQuantity = item.requestedQuantity?.trim();
      const buyerReference = item.buyerReference?.trim();

      if (requestedQuantity) {
        details.push(`Requested quantity: ${requestedQuantity}`);
      }

      if (buyerReference) {
        details.push(`Buyer reference: ${buyerReference}`);
      }

      return details.join(" | ");
    })
    .join("\n");
}

export function buildRfqProductRequirements(items: RfqListItem[], additionalRequirements: string) {
  const sections: string[] = [];
  const selectedProducts = formatRfqListItems(items);
  const additionalDetails = additionalRequirements.trim();

  if (selectedProducts) {
    sections.push(`Selected products:\n${selectedProducts}`);
  }

  if (additionalDetails) {
    sections.push(
      selectedProducts
        ? `Additional product requirements:\n${additionalDetails}`
        : additionalDetails,
    );
  }

  return sections.join("\n\n");
}
