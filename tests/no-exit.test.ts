import { assertObjectMatch } from "@std/assert/object-match";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createPlugin } from "../plugin.ts";
import type { TestCase } from "./shared.ts";
import { runLintPlugin } from "./shared.ts";

Deno.test("no-env-to-object", async (t) => {
  const plugin = createPlugin();
  const tests: Array<TestCase> = [
    {
      filename: "deno-exit.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/no-exit",
          message: "`Deno.exit()` should be used sparingly.",
        },
      ],
    },
    {
      filename: "process-exit.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/no-exit",
          message: "`process.exit()` should be used sparingly.",
        },
      ],
    },
  ];
  for (const { filename, expected } of tests) {
    await t.step(filename, async () => {
      const diagnostics = await runLintPlugin(
        plugin,
        `no-exit/${filename}`,
      );
      for (let i = 0; i < expected.length; i++) {
        assertObjectMatch(diagnostics[i], expected[i]);
      }
      assertStrictEquals(
        diagnostics.length,
        expected.length,
      );
    });
  }
});
