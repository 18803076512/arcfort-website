import { ConsoleLink } from "@/components/console/ConsoleLink";

import type { ReactNode } from "react";

export function AuthPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="console-auth">
      <ConsoleLink className="console-brand" href="/">
        ArcFort Weld
      </ConsoleLink>
      <h1>{title}</h1>
      {children}
    </main>
  );
}

export function PasswordField({ confirm = false }: { confirm?: boolean }) {
  return (
    <label>
      {confirm ? "Confirm password" : "Password"}
      <input
        name={confirm ? "confirm_password" : "password"}
        type="password"
        required
        minLength={12}
        maxLength={128}
        autoComplete="new-password"
      />
    </label>
  );
}
