import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionHistoryBoundary } from "@/components/console/SessionHistoryBoundary";
import "./console.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: { default: "Product Intelligence | ArcFort Weld", template: "%s | ArcFort Console" },
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
};

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="console-root">
      <SessionHistoryBoundary />
      {children}
    </div>
  );
}
