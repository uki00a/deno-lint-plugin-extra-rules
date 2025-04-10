import { assertObjectMatch } from "@std/assert/object-match";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createPlugin } from "../plugin.ts";
import type { TestCase } from "./shared.ts";
import { runLintPlugin } from "./shared.ts";

Deno.test("valid-expect", async (t) => {
  const plugin = createPlugin();
  const tests: Array<TestCase> = [
    {
      filename: "ok.js",
      expected: [],
    },
    {
      filename: "matcher-not-specified.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/valid-expect",
          message: "A matcher is not specified.",
        },
      ],
    },
    {
      filename: "matcher-not-called.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/valid-expect",
          message: "The matcher is not called.",
          range: [66, 79],
        },
      ],
    },
  ];
  for (const { filename, expected } of tests) {
    await t.step(filename, async () => {
      const diagnostics = await runLintPlugin(
        plugin,
        `valid-expect/${filename}`,
      );
      assertStrictEquals(diagnostics.length, expected.length);
      for (let i = 0; i < expected.length; i++) {
        assertObjectMatch(diagnostics[i], expected[i]);
      }
    });
  }
});
