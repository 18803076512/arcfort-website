export const rfqListStorageKey = "arcfort-rfq-products-v1";
export const rfqListChangedEvent = "arcfort:rfq-list-changed";

export type RfqListItem = {
  sku: string;
  name: string;
  category: string;
  categorySlug: string;
  slug: string;
};

export const maxRfqItems = 50;

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeSlug(value: unknown) {
  const slug = normalizeText(value, 120);
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : "";
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
  };

  return Object.values(item).every(Boolean) ? item : null;
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

export function readRfqList() {
  if (typeof window === "undefined") {
    return [] as RfqListItem[];
  }

  try {
    const rawValue = window.localStorage.getItem(rfqListStorageKey);
    const parsedValue = rawValue ? (JSON.parse(rawValue) as unknown) : [];

    return Array.isArray(parsedValue) ? normalizeRfqList(parsedValue) : [];
  } catch {
    return [];
  }
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

  window.dispatchEvent(new Event(rfqListChangedEvent));
  return normalizedItems;
}

export function addRfqListItem(item: RfqListItem) {
  const normalizedItem = normalizeRfqListItem(item);

  if (!normalizedItem) {
    return readRfqList();
  }

  const currentItems = readRfqList();
  const itemKey = getRfqListItemKey(normalizedItem);

  if (currentItems.some((currentItem) => getRfqListItemKey(currentItem) === itemKey)) {
    return currentItems;
  }

  return writeRfqList([...currentItems, normalizedItem]);
}

export function removeRfqListItem(item: Pick<RfqListItem, "categorySlug" | "slug">) {
  const itemKey = getRfqListItemKey(item);

  return writeRfqList(
    readRfqList().filter((currentItem) => getRfqListItemKey(currentItem) !== itemKey),
  );
}

export function clearRfqList() {
  return writeRfqList([]);
}

export function formatRfqListItems(items: RfqListItem[]) {
  return items
    .map(
      (item, index) => `${index + 1}. ${item.name} | SKU: ${item.sku} | Category: ${item.category}`,
    )
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
