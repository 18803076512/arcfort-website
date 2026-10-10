import { ConsoleReadError } from "./catalog.ts";

export type CountedRows<T> = { data: T[] | null; count: number | null; error: unknown };

// Count every scoped row, including when a provider returns less than the requested range.
// Multiple requests are not a transactional snapshot; drift fails closed where detectable.
export async function readAllConsoleRows<T>(
  fetchPage: (start: number, end: number) => PromiseLike<CountedRows<T>>,
  key: (row: T) => string,
  maximum = 10000,
) {
  const items: T[] = [];
  const seen = new Set<string>();
  let total: number | undefined;
  do {
    const result = await fetchPage(items.length, items.length + 249);
    if (
      result.error ||
      !result.data ||
      !Number.isSafeInteger(result.count) ||
      result.count! < 0 ||
      result.count! > maximum ||
      (total !== undefined && result.count !== total)
    )
      throw new ConsoleReadError();
    total = result.count!;
    const keys = result.data.map(key);
    if (
      keys.some((id) => !id || seen.has(id)) ||
      new Set(keys).size !== keys.length ||
      (!result.data.length && items.length < total) ||
      items.length + result.data.length > total
    )
      throw new ConsoleReadError();
    keys.forEach((id) => seen.add(id));
    items.push(...result.data);
  } while (items.length < total);
  return items;
}
