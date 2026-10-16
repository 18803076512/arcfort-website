import ts from "typescript";

// Normalize generator layout and optional terminators through the TypeScript syntax tree.
export function databaseTypeContract(source: string) {
  const parsed = ts.createSourceFile("database.types.ts", source, ts.ScriptTarget.Latest, true);
  const diagnostics = (parsed as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] })
    .parseDiagnostics;
  if (diagnostics.length) throw new Error("Generated database types contain invalid TypeScript.");
  return ts
    .createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed })
    .printFile(parsed);
}
