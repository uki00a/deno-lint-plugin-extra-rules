import { assertObjectMatch } from "@std/assert/object-match";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createPlugin } from "../plugin.ts";
import type { TestCase } from "./shared.ts";
import { runLintPlugin } from "./shared.ts";

Deno.test("no-deno-lint-ignore-wthout-reason", async (t) => {
  const plugin = createPlugin();
  const id = "deno-lint-plugin-extra-rules/no-deno-lint-ignore-wthout-reason";
  const tests: Array<TestCase> = [
    {
      filename: "ng.js",
      expected: [
        {
          id,
          message: "Requires the reason for `deno-lint-ignore-file` directive",
          hint:
            "// deno-lint-ignore-file no-console -- specify the reason for ignoring",
        },
        {
          id,
          message: "Requires the reason for `deno-lint-ignore` directive",
          hint:
            "// deno-lint-ignore no-unused-vars prefer-const -- specify the reason for ignoring",
        },
        {
          id,
          message: "Requires the reason for `deno-lint-ignore` directive",
          hint:
            "// deno-lint-ignore no-unused-vars -- specify the reason for ignoring",
        },
      ],
    },
    {
      filename: "ok.js",
      expected: [],
    },
  ];
  for (const tc of tests) {
    await t.step(tc.filename, async () => {
      const diagnostics = await runLintPlugin(
        plugin,
        `no-deno-lint-ignore-wthout-reason/${tc.filename}`,
      );
      for (let i = 0; i < tc.expected.length; i++) {
        assertObjectMatch(diagnostics[i], tc.expected[i]);
      }
      assertStrictEquals(
        diagnostics.length,
        tc.expected.length,
      );
    });
  }
});
