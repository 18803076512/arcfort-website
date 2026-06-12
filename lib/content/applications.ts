import { applications } from "@/content/applications";

export function getAllApplications() {
  return applications;
}

export function getApplicationBySlug(slug: string) {
  return applications.find((application) => application.slug === slug);
}
