import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { getConsoleConfig } from "@/lib/console/config";
import { consoleWorkingEnabled } from "@/lib/console/working-config";
import { checkInviteOnlyProvider, createConsoleClient } from "@/lib/console/client";
import {
  executeConsoleCommand,
  isConsoleCommandOrigin,
  readConsoleCommand,
} from "@/lib/console/commands";
import { commandError, type CommandResult } from "@/lib/domain/catalog/commands";
import { consolePrivateHeaders } from "@/lib/console/security";

export async function POST(request: NextRequest) {
  const settings = getConsoleConfig();
  if (
    !consoleWorkingEnabled() ||
    settings.status !== "ready" ||
    !isConsoleCommandOrigin(request.headers, settings.config.origin)
  )
    return NextResponse.json(
      { ok: false, code: "42501", message: commandError("42501") },
      { status: 403, headers: consolePrivateHeaders },
    );
  const updates: { name: string; value: string; options: CookieOptions }[] = [];
  const finish = (result: CommandResult, status: number) => {
    const response = NextResponse.json(result, { status, headers: consolePrivateHeaders });
    for (const cookie of updates) response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  };
  if (!(await checkInviteOnlyProvider(settings.config)))
    return finish({ ok: false, code: "unavailable", message: commandError() }, 503);
  try {
    const input = await readConsoleCommand(request);
    const client = createConsoleClient(settings.config, {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        updates.push(...values);
        for (const value of values) request.cookies.set(value.name, value.value);
      },
    });
    const result = await executeConsoleCommand(client, input);
    const status = result.ok
      ? 200
      : result.code === "42501"
        ? 403
        : result.code === "40001" || result.code === "23505"
          ? 409
          : result.code === "unavailable"
            ? 503
            : 422;
    return finish(result, status);
  } catch {
    return finish({ ok: false, code: "22023", message: commandError("22023") }, 400);
  }
}
