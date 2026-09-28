import Link from "next/link";

export const metadata = { title: "Page Not Found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Page not found</h1>
      <Link href="/">Return to ArcFort Weld</Link>
    </main>
  );
}
