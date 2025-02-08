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
});
