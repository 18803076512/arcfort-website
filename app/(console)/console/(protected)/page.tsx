import { redirect } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";

export default async function ConsoleHome() {
  await requireConsoleAccess();
  redirect("/console/dashboard");
}
