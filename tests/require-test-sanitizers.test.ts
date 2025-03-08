import { assertObjectMatch } from "@std/assert/object-match";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createPlugin } from "../plugin.ts";
import type { TestCase } from "./shared.ts";
import { runLintPlugin } from "./shared.ts";

Deno.test("require-test-sanitizers", async (t) => {
  const plugin = createPlugin();
  const tests: Array<TestCase> = [
    {
      filename: "resources.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/require-test-sanitizers",
          message: "Disabling test sanitizers should be avoided.",
          hint: "`sanitizeResources: false` should be removed.",
        },
      ],
    },
    {
      filename: "ops.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/require-test-sanitizers",
          message: "Disabling test sanitizers should be avoided.",
          hint: "`sanitizeOps: false` should be removed.",
        },
      ],
    },
    {
      filename: "name-options-fn.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/require-test-sanitizers",
          message: "Disabling test sanitizers should be avoided.",
          hint: "`sanitizeOps: false` should be removed.",
        },
      ],
    },
    {
      filename: "test-context-step.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/require-test-sanitizers",
          message: "Disabling test sanitizers should be avoided.",
          hint: "`sanitizeExit: false` should be removed.",
        },
      ],
    },
    {
      filename: "ok.js",
      expected: [],
    },
  ];
  for (const { filename, expected } of tests) {
    await t.step(filename, async () => {
      const diagnostics = await runLintPlugin(
        plugin,
        `require-test-sanitizers/${filename}`,
      );
      for (let i = 0; i < expected.length; i++) {
        assertObjectMatch(diagnostics[i], expected[i]);
      }
      assertStrictEquals(diagnostics.length, expected.length);
    });
  }
});
