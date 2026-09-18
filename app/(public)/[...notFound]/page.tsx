import { notFound } from "next/navigation";

// Unknown public URLs use the public 404 shell, not the shared root fallback.
export default function PublicUnknownPage() {
  notFound();
}
