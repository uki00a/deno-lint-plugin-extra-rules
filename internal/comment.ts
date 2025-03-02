interface LintIgnoreDirective {
  kind: "line" | "file";
  reason?: string;
  range: Deno.lint.Range;
}

export function extractLintIgnoreDirectives(
  source: string,
): Iterable<LintIgnoreDirective> {
  const matches = source.matchAll(
    /^[ \t]*\/\/[ \t]*deno-lint-ignore(-file)?(.*)$/gm,
  );
  function* makeLintIgnoreDirectivesIterator(
    matches: Iterable<RegExpExecArray>,
  ): Iterable<LintIgnoreDirective> {
    for (const match of matches) {
      const [, reason] = (match[2] ?? "").split("--");
      const index = match.input.indexOf("/", match.index);
      yield {
        kind: match[1] === "-file" ? "file" : "line",
        reason: reason?.trim(),
        range: [index, match.index + match[0].length],
      };
    }
  }
  return makeLintIgnoreDirectivesIterator(matches);
}
