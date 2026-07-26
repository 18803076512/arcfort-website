import { applications } from "@/content/applications";

export function getAllApplications() {
  return applications;
}

export function getApplicationBySlug(slug: string) {
  return applications.find((application) => application.slug === slug);
}

export function getApplicationsByCategory(categorySlug: string, limit = 3) {
  return applications
    .filter((application) => application.relatedCategorySlugs.includes(categorySlug))
    .slice(0, limit);
}

export function getApplicationsForProduct(productSlug: string, categorySlug: string, limit = 3) {
  return applications
    .map((application) => ({
      application,
      relevance: application.relatedProductSlugs.includes(productSlug)
        ? 2
        : application.relatedCategorySlugs.includes(categorySlug)
          ? 1
          : 0,
    }))
    .filter((item) => item.relevance > 0)
    .sort((left, right) => right.relevance - left.relevance)
    .slice(0, limit)
    .map((item) => item.application);
}
