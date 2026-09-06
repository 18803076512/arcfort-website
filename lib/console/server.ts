import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getConsoleConfig } from "./config";
import { checkInviteOnlyProvider, createConsoleClient } from "./client";
import { checkConsoleAccess } from "./access";
import { isConsoleEntrance } from "./entrance";

export const getConsoleContext = cache(async () => {
  const config = getConsoleConfig();
  if (config.status !== "ready") return { status: config.status } as const;
  if (!(await isConsoleEntrance(await headers(), config.config)))
    return { status: "invalid" } as const;
  if (!(await checkInviteOnlyProvider(config.config))) return { status: "unavailable" } as const;
  const store = await cookies();
  const client = createConsoleClient(config.config, {
    getAll: () => store.getAll(),
    setAll: () => {
      // Middleware owns refresh writes; Server Components cannot write response cookies.
    },
  });
  return { ...(await checkConsoleAccess(client)), client };
});

export async function requireConsoleAccess() {
  const context = await getConsoleContext();
  if (context.status !== "authorized") redirect(`/console/login?state=${context.status}`);
  return context;
}
