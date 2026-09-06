import { ConsoleLink } from "@/components/console/ConsoleLink";

import type { ReactNode } from "react";
import { requireConsoleAccess } from "@/lib/console/server";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const access = await requireConsoleAccess();
  return (
    <div className="console-workspace">
      <ConsoleLink className="console-skip" href="#console-main">
        Skip to content
      </ConsoleLink>
      <aside className="console-sidebar">
        <ConsoleLink className="console-brand" href="/console/dashboard">
          ArcFort Weld
        </ConsoleLink>
        <p className="console-caption">Product Intelligence</p>
        <nav aria-label="Console">
          <ConsoleLink href="/console/dashboard">Overview</ConsoleLink>
          <ConsoleLink href="/console/products">Products</ConsoleLink>
          <ConsoleLink href="/console/series">Product Series</ConsoleLink>
          <ConsoleLink href="/console/technical-data">Technical Evidence</ConsoleLink>
        </nav>
        <div className="console-session">
          <p>{access.roles.join(", ")}</p>
          <form action="/console/auth/session" method="post">
            <input type="hidden" name="action" value="logout" />
            <button className="console-link">Sign Out</button>
          </form>
        </div>
      </aside>
      <main id="console-main" tabIndex={-1} className="console-main">
        <div className="console-environment">Staging / Read-only shadow catalog</div>
        {children}
      </main>
    </div>
  );
}
