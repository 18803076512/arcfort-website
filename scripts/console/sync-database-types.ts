import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { format, resolveConfig } from "prettier";

const databaseTypesPath = path.resolve("lib", "supabase", "database.types.ts");
const cliScript = path.resolve("node_modules", "supabase", "dist", "supabase.js");
const write = process.argv.includes("--write");

const generatedTypes = execFileSync(
  process.execPath,
  [cliScript, "gen", "types", "typescript", "--local"],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      SUPABASE_TELEMETRY_DISABLED: "1",
    },
  },
);

if (!generatedTypes.includes("export type Database")) {
  throw new Error("Supabase CLI did not return a TypeScript Database definition.");
}

const prettierConfig = (await resolveConfig(databaseTypesPath)) ?? {};
const formattedTypes = await format(generatedTypes, {
  ...prettierConfig,
  filepath: databaseTypesPath,
  parser: "typescript",
  endOfLine: "lf",
});

if (write) {
  await writeFile(databaseTypesPath, formattedTypes, "utf8");
  console.log(
    `Generated ${path.relative(process.cwd(), databaseTypesPath)} from the local schema.`,
  );
  process.exit(0);
}

const committedTypes = (await readFile(databaseTypesPath, "utf8")).replace(/\r\n/g, "\n");
if (committedTypes !== formattedTypes) {
  const committedLines = committedTypes.split("\n");
  const generatedLines = formattedTypes.split("\n");
  const firstChangedLine = generatedLines.findIndex(
    (line, index) => line !== committedLines[index],
  );
  throw new Error(
    `Supabase database types are stale near line ${firstChangedLine + 1}. ` +
      "Run npm run console:db:types against the migrated local database and commit the result.",
  );
}

console.log("Supabase database types match the migrated local schema.");
