import { assertObjectMatch } from "@std/assert/object-match";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createPlugin } from "./plugin.ts";

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

Deno.test("plugin", async (t) => {
  await t.step("no-env-to-object", async () => {
    const plugin = createPlugin();
    const diagnostics = await runLintPlugin(plugin, "no-env-to-object.js");
    assertObjectMatch(diagnostics[0], {
      id: "deno-lint-plugin-extra-rules/no-env-to-object",
      message: "`Deno.env.toObject()` requires full `--allow-env` permission.",
    });
    assertStrictEquals(diagnostics.length, 1);
  });

  await t.step("no-test-sanitizers", async (t) => {
    const plugin = createPlugin();
    const tests: Array<
      { filename: string; expected: Array<Partial<Deno.lint.Diagnostic>> }
    > = [
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
});
