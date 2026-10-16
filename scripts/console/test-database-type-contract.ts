import assert from "node:assert/strict";
import { databaseTypeContract } from "./database-type-contract.ts";

const compact =
  "type Database = { public: { Functions: { upload: { Args: { name: string }; Returns: boolean }; }; }; };";
const expanded = `// Generated database schema
type Database = {
  public: {
    Functions: {
      upload: {
        Args: { name: string };
        Returns: boolean;
      };
    };
  };
};`;
assert.equal(databaseTypeContract(compact), databaseTypeContract(expanded));
assert.equal(
  databaseTypeContract(expanded),
  databaseTypeContract(expanded.replaceAll("\n", "\r\n")),
);
for (const changed of [
  compact.replace("name: string", "name?: string"),
  compact.replace("name: string", "name: number"),
  compact.replace("name: string", "path: string"),
  compact.replace("boolean", "boolean | null"),
  compact.replace("boolean", "boolean[]"),
  compact.replace("public:", "private:"),
  compact.replace("}; }; };", "}; extra: { Args: never; Returns: string }; }; };"),
])
  assert.notEqual(databaseTypeContract(compact), databaseTypeContract(changed));
assert.notEqual(
  databaseTypeContract('type State = "needs review";'),
  databaseTypeContract('type State = "needsreview";'),
);
assert.notEqual(
  databaseTypeContract('export const Constants = { roles: ["owner"] } as const;'),
  databaseTypeContract('export const Constants = { roles: ["viewer"] } as const;'),
);
assert.notEqual(
  databaseTypeContract(compact),
  databaseTypeContract(compact + " type Extra = string;"),
);
assert.throws(() => databaseTypeContract('type Invalid = "unterminated'));
assert.throws(() => databaseTypeContract("type Invalid = { field: string;"));
assert.notEqual(
  databaseTypeContract("type T = keyof A;"),
  databaseTypeContract("type T = readonly A[];"),
);
console.log(
  "Database type contract: syntax-tree formatting normalized; all schema types and constants remain strict.",
);
