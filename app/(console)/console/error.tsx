"use client";

import { ConsoleLink } from "@/components/console/ConsoleLink";

export default function ConsoleError({ reset }: { reset: () => void }) {
  return (
    <main className="console-auth">
      <h1>Console Unavailable</h1>
      <p>This request could not be completed. Refresh the page or sign in again.</p>
      <button className="console-button" onClick={reset}>
        Try Again
      </button>
      <ConsoleLink href="/console/login">Return to Sign In</ConsoleLink>
    </main>
  );
}
