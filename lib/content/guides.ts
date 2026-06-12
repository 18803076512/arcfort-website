import { guides } from "@/content/guides";

export function getAllGuides() {
  return guides;
}

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
