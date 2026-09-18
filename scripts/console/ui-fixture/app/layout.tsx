import "../../../../app/globals.css";
import "../../../../app/(console)/console/console.css";
import { ConsoleLink } from "../../../../components/console/ConsoleLink";

export const metadata = { title: "Console UI fixture", robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="console-root">
        <div className="console-workspace">
          <aside className="console-sidebar">
            <ConsoleLink className="console-brand" href="/console/products/new">
              ArcFort Weld
            </ConsoleLink>
            <span className="console-caption">Product Intelligence</span>
            <nav aria-label="Console">
              <ConsoleLink href="/console/products/new">Products</ConsoleLink>
              <ConsoleLink href="/console/products/10000000-0000-4000-8000-000000000001/review">
                Technical Data
              </ConsoleLink>
            </nav>
            <div className="console-session">Synthetic UI fixture</div>
          </aside>
          <main className="console-main">
            <p className="console-environment">
              UI fixture / Synthetic data / No database connection
            </p>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
