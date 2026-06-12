import { TO_BE_CONFIRMED } from "@/lib/content/schemas";

export const siteConfig = {
  name: "ARCFORT Welding & Cutting Solutions",
  shortName: "ARCFORT",
  legalName: "Renqiu Ailesen Welding Technology Co., Ltd.",
  tagline: "Industrial Welding & Cutting Solutions",
  url: "https://arcfortweld.com",
  description:
    "Industrial welding and cutting product content system for distributors, importers, OEM buyers, industrial users and repair workshops.",
  email: TO_BE_CONFIRMED,
  whatsapp: TO_BE_CONFIRMED,
  sameAs: [] as string[],
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
