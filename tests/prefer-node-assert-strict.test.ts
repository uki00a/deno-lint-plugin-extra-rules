import { assertObjectMatch } from "@std/assert/object-match";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createPlugin } from "../plugin.ts";
import type { TestCase } from "./shared.ts";
import { runLintPlugin } from "./shared.ts";

Deno.test("prefer-node-assert-strict", async (t) => {
  const plugin = createPlugin();
  const tests: Array<TestCase> = [
    {
      filename: "ok.js",
      expected: [],
    },
    {
      filename: "ng.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/prefer-node-assert-strict",
          message:
            "`node:assert/strict` should be used instead of `node:assert`.",
        },
      ],
    },
  ];
  for (const { filename, expected } of tests) {
    await t.step(filename, async () => {
      const diagnostics = await runLintPlugin(
        plugin,
        `prefer-node-assert-strict/${filename}`,
      );
      assertStrictEquals(diagnostics.length, expected.length);
      for (let i = 0; i < expected.length; i++) {
        assertObjectMatch(diagnostics[i], expected[i]);
      }
    });
  }
});
