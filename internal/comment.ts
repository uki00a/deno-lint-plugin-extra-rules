export interface LintIgnoreDirective {
  directive: "deno-lint-ignore" | "deno-lint-ignore-file";
  reason?: string;
  rules: Array<string>;
}

const kLintIgnoreDirectiveReasonSeparator = "--";

export function parseLintIgnoreDirective(
  comment: Deno.lint.LineComment,
): LintIgnoreDirective | null {
  const match = /^deno-lint-ignore(-file)?\s+(.*)$/.exec(
    comment.value.trimStart(),
  );
  if (match == null) return null;
  const directive = match[1] == null
    ? "deno-lint-ignore"
    : "deno-lint-ignore-file";
  if (match[2] == null) {
    return { directive, reason: undefined, rules: [] };
  }
  const indexOfSeparator = match[2].indexOf(
    kLintIgnoreDirectiveReasonSeparator,
  );
  const reason = indexOfSeparator === -1 ? undefined : match[2].slice(
    indexOfSeparator + kLintIgnoreDirectiveReasonSeparator.length,
  ).trim();
  const rules = (
    indexOfSeparator === -1
      ? match[2].trim()
      : match[2].slice(0, indexOfSeparator).trim()
  ).split(/\s+/).filter(Boolean);
  return { directive, reason, rules };
}

export function makeHintForLintIgnoreDirective(
  { directive, rules }: LintIgnoreDirective,
): string {
  return `// ${directive} ${
    rules.length === 0 ? "" : rules.join(" ") + " "
  }${kLintIgnoreDirectiveReasonSeparator} specify the reason for ignoring`;
}
