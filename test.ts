import { assertObjectMatch } from "@std/assert/object-match";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createPlugin } from "./plugin.ts";

interface TestCase {
  filename: string;
  expected: Array<Partial<Deno.lint.Diagnostic>>;
}

async function runLintPlugin(
  plugin: Deno.lint.Plugin,
  filename: string,
): Promise<Array<Deno.lint.Diagnostic>> {
  const path = `./testdata/${filename}`;
  const content = await Deno.readTextFile(path);
  return Deno.lint.runPlugin(
    plugin,
    path,
    content,
  );
}

Deno.test("no-env-to-object", async (t) => {
  const plugin = createPlugin();
  const tests: Array<TestCase> = [
    {
      filename: "ng.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/no-env-to-object",
          message:
            "`Deno.env.toObject()` requires full `--allow-env` permission.",
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
        `no-env-to-object/${filename}`,
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

Deno.test("no-test-sanitizers", async (t) => {
  const plugin = createPlugin();
  const tests: Array<TestCase> = [
    {
      filename: "resources.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/no-test-sanitizers",
          message: "Disabling test sanitizers should be avoided.",
          hint: "`sanitizeResources: true` should be removed.",
        },
      ],
    },
    {
      filename: "ops.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/no-test-sanitizers",
          message: "Disabling test sanitizers should be avoided.",
          hint: "`sanitizeOps: true` should be removed.",
        },
      ],
    },
    {
      filename: "name-options-fn.js",
      expected: [
        {
          id: "deno-lint-plugin-extra-rules/no-test-sanitizers",
          message: "Disabling test sanitizers should be avoided.",
          hint: "`sanitizeOps: true` should be removed.",
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
        `no-test-sanitizers/${filename}`,
      );
      for (let i = 0; i < expected.length; i++) {
        assertObjectMatch(diagnostics[i], expected[i]);
      }
      assertStrictEquals(diagnostics.length, expected.length);
    });
  }
});

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
