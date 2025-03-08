export interface TestCase {
  filename: string;
  expected: Array<Partial<Deno.lint.Diagnostic>>;
}

export async function runLintPlugin(
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
