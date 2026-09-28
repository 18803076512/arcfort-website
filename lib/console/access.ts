import type { ConsoleClient } from "./client.ts";

export const consoleRoles = ["owner", "editor", "reviewer", "publisher", "viewer"] as const;
export type ConsoleRole = (typeof consoleRoles)[number];
export type ConsoleAccess =
  | { status: "authorized"; userId: string; roles: ConsoleRole[] }
  | { status: "unauthenticated" | "no_role" | "unavailable" };

export async function checkConsoleAccess(client: ConsoleClient): Promise<ConsoleAccess> {
  try {
    const { data, error } = await client.auth.getUser();
    if (error)
      return { status: !error.status || error.status >= 500 ? "unavailable" : "unauthenticated" };
    if (!data.user || !data.user.email_confirmed_at) return { status: "unauthenticated" };
    const roles = await client
      .from("console_user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .is("revoked_at", null);
    if (roles.error) return { status: "unavailable" };
    const active = roles.data.map((row) => row.role).filter((role) => consoleRoles.includes(role));
    if (!active.length) return { status: "no_role" };
    return { status: "authorized", userId: data.user.id, roles: active };
  } catch {
    return { status: "unavailable" };
  }
}
