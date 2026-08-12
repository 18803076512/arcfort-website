"use client";

import Link from "next/link";
import { buildEmailHref, buildWhatsAppHref } from "@/lib/content/site";

const recoveryEmailHref = buildEmailHref({
  subject: "ArcFort Weld sourcing inquiry",
  message:
    "Hello ArcFort Weld, the website could not load, so I am sending my sourcing inquiry directly.\n\nProduct or model:\nQuantity:\nDestination country:\nReference or drawing:",
});
const recoveryWhatsAppHref = buildWhatsAppHref({
  message:
    "Hello ArcFort Weld, the website could not load. I would like to request a quotation. Product/model: [add details]. Quantity: [add details]. Destination: [add country].",
});

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <head>
        <title>Page Error | ArcFort Weld</title>
        <meta name="robots" content="noindex, follow" />
      </head>
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          background: "#071524",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
          }}
        >
          <section style={{ width: "100%", maxWidth: 760 }}>
            <div
              style={{
                borderLeft: "4px solid #f6b445",
                background: "#0b2341",
                padding: "32px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#f6b445",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                ArcFort Weld
              </p>
              <h1 style={{ margin: "16px 0 0", fontSize: 36, lineHeight: 1.15 }}>
                The website needs to reload.
              </h1>
              <p style={{ margin: "20px 0 0", color: "#cbd5e1", lineHeight: 1.7 }}>
                Try loading the website again. If the issue continues, contact the sales team and
                send your product list, drawing or product photos directly.
              </p>
              {error.digest ? (
                <p
                  style={{
                    margin: "16px 0 0",
                    color: "#94a3b8",
                    fontSize: 12,
                    overflowWrap: "anywhere",
                  }}
                >
                  Support reference: {error.digest}
                </p>
              ) : null}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    minHeight: 48,
                    border: 0,
                    background: "#f6b445",
                    color: "#071524",
                    padding: "0 22px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  style={{
                    minHeight: 48,
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #64748b",
                    color: "#ffffff",
                    padding: "0 22px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Home
                </Link>
                <a
                  href={recoveryEmailHref}
                  style={{
                    minHeight: 48,
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #64748b",
                    color: "#ffffff",
                    padding: "0 22px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Email Sales
                </a>
                <a
                  href={recoveryWhatsAppHref}
                  style={{
                    minHeight: 48,
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #64748b",
                    color: "#ffffff",
                    padding: "0 22px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
