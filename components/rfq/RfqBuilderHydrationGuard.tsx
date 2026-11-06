"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

type RfqBuilderHydrationGuardProps = {
  children: ReactNode;
};

export function RfqBuilderHydrationGuard({ children }: RfqBuilderHydrationGuardProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-200 px-5 py-2 text-xs leading-5 text-slate-600">
        <span role="status">{ready ? "RFQ builder ready." : "Preparing RFQ builder."}</span>
        <Link
          href="/rfq"
          prefetch={false}
          className="font-bold text-arc-blue underline-offset-2 hover:underline"
        >
          Open direct RFQ form
        </Link>
      </div>
      <fieldset disabled={!ready} aria-busy={!ready} className="contents">
        <legend className="sr-only">RFQ builder inputs</legend>
        {children}
      </fieldset>
    </>
  );
}
