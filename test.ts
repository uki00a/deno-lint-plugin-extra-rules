import { createPlugin } from "./plugin.ts";

async function runLintPlugin(plugin, filename) {
  const path = `./testdata/${filename}`;
  const content = await Deno.readTextFile(path);
  return Deno[Deno.internal].runLintPlugin(
    plugin,
    path,
    content,
  );
}

Deno.test("plugin", async (t) => {
  await t.step("no-env-to-object", async () => {
    let error;
    const plugin = createPlugin({
      onError: (_error) => {
        if (error) throw new Error("Unexpected state");
        error = _error;
      },
    });
    await runLintPlugin(plugin, "no-env-to-object.js");
    if (
      !(error instanceof Error) || error.message !== "Deno.env.toObject found"
    ) {
      throw new Error("An unexpected error dectected");
    }
  });
});
