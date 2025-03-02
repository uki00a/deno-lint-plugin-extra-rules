import { extractLintIgnoreDirectives } from "./comment.ts";

import { assertEquals } from "@std/assert/equals";
import { assertObjectMatch } from "@std/assert/object-match";
import { assertStrictEquals } from "@std/assert/strict-equals";

Deno.test("extractLintIgnoreDirectives", () => {
  const directives = [
    ...extractLintIgnoreDirectives(
      `// deno-lint-ignore-file no-console -- This file is not published to JSR
console.info("foo");

// deno-lint-ignore no-unused-vars prefer-const -- ok
let a = 123;

// deno-lint-ignore no-unused-vars
const abc = "foo";
`,
    ),
  ];
  assertEquals(directives, [
    {
      kind: "file",
      reason: "This file is not published to JSR",
    },
    {
      kind: "line",
      reason: "ok",
    },
    {
      kind: "line",
      reason: undefined,
    },
  ]);
});
