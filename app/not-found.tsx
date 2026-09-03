import PublicLayout from "@/app/(public)/layout";
import PublicNotFound from "@/components/content/PublicNotFound";

export { metadata } from "@/components/content/PublicNotFound";

export default function NotFound() {
  return (
    <PublicLayout>
      <PublicNotFound />
    </PublicLayout>
  );
}
