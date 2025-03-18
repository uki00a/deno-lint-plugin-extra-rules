import { assertObjectMatch } from "@std/assert/object-match";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createPlugin } from "../plugin.ts";
import type { TestCase } from "./shared.ts";
import { runLintPlugin } from "./shared.ts";

Deno.test("no-disabled-tests", async (t) => {
  const plugin = createPlugin();
  const expectedDiagnostic: Partial<Deno.lint.Diagnostic> = Object.freeze({
    id: "deno-lint-plugin-extra-rules/no-disabled-tests",
    message: "A test case should not be disabled.",
  });
  const tests: Array<TestCase> = [
    {
      filename: "ignore-option.js",
      expected: [expectedDiagnostic],
    },
    {
      filename: "ignore-method.js",
      expected: [expectedDiagnostic],
    },
    {
      filename: "node-test-skip-option.js",
      expected: [expectedDiagnostic],
    },
    {
      filename: "node-test-skip-method.js",
      expected: [
        {
          ...expectedDiagnostic,
          range: [53, 57],
        },
      ],
    },
    {
      filename: "bdd-describe-skip.js",
      expected: [
        {
          ...expectedDiagnostic,
          range: [72, 76],
        },
      ],
    },
    {
      filename: "bdd-describe-ignore.js",
      expected: [
        {
          ...expectedDiagnostic,
          range: [72, 78],
        },
      ],
    },
    {
      filename: "bdd-it-ignore.js",
      expected: [
        {
          ...expectedDiagnostic,
          range: [109, 115],
        },
      ],
    },
    {
      filename: "bdd-it-skip.js",
      expected: [
        {
          ...expectedDiagnostic,
          range: [107, 111],
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
        `no-disabled-tests/${filename}`,
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
