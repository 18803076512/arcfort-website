import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

import { generateTypescript, introspect, sortGeneratorMetadata } from "@supabase/postgrest-typegen";
import { format, resolveConfig } from "prettier";
import ts from "typescript";

function publicMember(source) {
  const ast = ts.createSourceFile("database.types.ts", source, ts.ScriptTarget.Latest, true);
  const database = ast.statements.find(
    (node) => ts.isTypeAliasDeclaration(node) && node.name.text === "Database",
  );
  assert.ok(database && ts.isTypeLiteralNode(database.type));
  const member = database.type.members.find((node) => node.name?.getText(ast) === "public");
  assert.ok(member, "Generated public schema is required");
  return { ast, member };
}

function publicType(source) {
  const { ast, member } = publicMember(source);
  return ts.createPrinter().printNode(ts.EmitHint.Unspecified, member, ast);
}

export async function checkEmbeddedPublicTypes(db, root, { write = false } = {}) {
  const metadata = sortGeneratorMetadata(await introspect(db, { includedSchemas: ["public"] }));
  const filename = `${root}/lib/supabase/database.types.ts`;
  const config = (await resolveConfig(filename)) ?? {};
  const generated = await generateTypescript(metadata, {
    detectOneToOneRelationships: true,
    format: (code) => format(code, { ...config, parser: "typescript", endOfLine: "lf" }),
  });
  let original = await readFile(filename, "utf8");
  if (write) {
    const oldPublic = publicMember(original);
    const newPublic = publicMember(generated);
    const enums = ({ ast, member }) => {
      assert.ok(ts.isTypeLiteralNode(member.type));
      const node = member.type.members.find((item) => item.name?.getText(ast) === "Enums");
      assert.ok(node);
      return ts.createPrinter().printNode(ts.EmitHint.Unspecified, node, ast);
    };
    assert.equal(
      enums(oldPublic),
      enums(newPublic),
      "Enum changes require full CLI generation including Constants.",
    );
    original = await format(
      original.slice(0, oldPublic.member.getStart(oldPublic.ast)) +
        newPublic.member.getText(newPublic.ast) +
        original.slice(oldPublic.member.end),
      { ...config, parser: "typescript", endOfLine: "lf" },
    );
    await writeFile(filename, original);
    console.log(
      "Generated public type member; preserved GraphQL/helpers/enum constants. Full CLI check remains required.",
    );
  }
  assert.equal(
    publicType(generated),
    publicType(original),
    "Embedded public schema differs from committed generated types; do not hand-edit the generated artifact.",
  );
  console.log(
    "Official Supabase generator: complete public schema types match the committed artifact.",
  );
}
