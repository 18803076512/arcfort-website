export const rfqStorageConflictColumn = "reference";
export const rfqStorageInsertPreference = "resolution=ignore-duplicates,return=minimal";
export const rfqStorageObjectUpsertHeader = "true";

export function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function buildRfqStorageObjectUrl(supabaseUrl: string, bucket: string, objectPath: string) {
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  return `${normalizeSupabaseUrl(supabaseUrl)}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;
}

export function buildRfqStorageUpsertUrl(supabaseUrl: string, table: string) {
  return `${normalizeSupabaseUrl(supabaseUrl)}/rest/v1/${encodeURIComponent(table)}?on_conflict=${encodeURIComponent(rfqStorageConflictColumn)}`;
}
