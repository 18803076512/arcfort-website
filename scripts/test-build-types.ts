import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import ts from "typescript";

const root = process.cwd();
function parseConfig(name: string) {
  const path = resolve(root, name);
  const read = ts.readConfigFile(path, ts.sys.readFile);
  assert.equal(read.error, undefined, `${name} must be readable`);
  const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, root, undefined, path);
  assert.deepEqual(parsed.errors, [], `${name} must parse without errors`);
  return parsed;
}

const full = parseConfig("tsconfig.json");
const build = parseConfig("tsconfig.build.json");
const fullFiles = new Set(full.fileNames.map((file) => resolve(file)));
const buildFiles = new Set(build.fileNames.map((file) => resolve(file)));
const isScript = (file: string) => relative(root, file).startsWith(`scripts${sep}`);

assert.equal(build.options.strict, true, "Application build must remain strict");
assert.equal(build.options.noEmit, true);
const { configFilePath: fullPath, ...fullOptions } = full.options;
const { configFilePath: buildPath, ...buildOptions } = build.options;
assert.notEqual(fullPath, buildPath);
assert.deepEqual(buildOptions, fullOptions, "Do not weaken compiler options for production");
assert.ok(fullFiles.has(resolve("scripts/console/test-browser-server-smoke.ts")));
assert.ok(fullFiles.has(resolve("scripts/test-public-hydration.ts")));
assert.ok(fullFiles.has(resolve("scripts/test-build-types.ts")));
for (const file of fullFiles) {
  assert.equal(
    buildFiles.has(file),
    !isScript(file),
    `Unexpected build scope: ${relative(root, file)}`,
  );
}
for (const file of buildFiles) {
  assert.ok(fullFiles.has(file), `Application file missing from complete typecheck: ${file}`);
}
for (const file of [
  "app/(public)/page.tsx",
  "app/(console)/console/login/page.tsx",
  "middleware.ts",
  "next.config.ts",
]) {
  assert.ok(buildFiles.has(resolve(file)), `Build must check ${file}`);
}
if (process.argv.includes("--root-only")) {
  for (const runtime of ["browser-runtime", "sql-runtime"]) {
    assert.equal(
      existsSync(resolve("scripts/console", runtime, "node_modules")),
      false,
      `Root-only regression must run before installing ${runtime}`,
    );
  }
}

// Inject a deliberate error in memory only: narrowing roots must not hide application type errors.
const probe = resolve("lib/content/site.ts");
assert.ok(buildFiles.has(probe));
const host = ts.createCompilerHost(build.options);
const getSourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
  const source = getSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile);
  if (source && resolve(file) === probe) {
    return ts.createSourceFile(
      file,
      `${source.text}\nconst __buildTypeProbe: string = 42;\n`,
      languageVersion,
      true,
    );
  }
  return source;
};
const program = ts.createProgram(build.fileNames, build.options, host);
assert.ok(
  program.getSemanticDiagnostics(program.getSourceFile(probe)).some((item) => item.code === 2322),
  "Application type error must still fail under the production config",
);
console.log(
  `Build type scope passed: ${buildFiles.size} application roots; complete typecheck retains ${fullFiles.size - buildFiles.size} script roots; strict negative control passed.`,
);
