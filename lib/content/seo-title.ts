export const SEO_TITLE_MAX_LENGTH = 60;

export function composeSeoTitle(title: string, brandName: string) {
  const normalizedTitle = title
    .replace(new RegExp(`\\s*\\|\\s*${escapeRegExp(brandName)}\\s*$`, "i"), "")
    .trim();
  const includesBrand = normalizedTitle.toLowerCase().includes(brandName.toLowerCase());
  const brandedTitle = includesBrand ? normalizedTitle : `${normalizedTitle} | ${brandName}`;

  return brandedTitle.length <= SEO_TITLE_MAX_LENGTH ? brandedTitle : normalizedTitle;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
