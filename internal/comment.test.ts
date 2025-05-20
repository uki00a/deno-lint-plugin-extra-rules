import { assertEquals } from "@std/assert/equals";
import type { LintIgnoreDirective } from "./comment.ts";
import { parseLintIgnoreDirective } from "./comment.ts";

interface TestCase {
  description: string;
  given: Deno.lint.LineComment;
  expected: LintIgnoreDirective | null;
}

Deno.test("parseLintIgnoreDirective", async (t) => {
  const dummyRange = [0, 0];
  for (
    const tc: TestCase of [
      {
        description: "A deno-lint-ignore directive with the reason",
        given: {
          type: "Line",
          value: " deno-lint-ignore  no-console   -- This is valid.",
          range: dummyRange,
        },
        expected: {
          directive: "deno-lint-ignore",
          reason: "This is valid.",
          rules: ["no-console"],
        },
      },
      {
        description: "A deno-lint-ignore-file directive with the reason",
        given: {
          type: "Line",
          value:
            " deno-lint-ignore-file no-console   no-unused-vars   --  This is also valid.  ",
          range: dummyRange,
        },
        expected: {
          directive: "deno-lint-ignore-file",
          reason: "This is also valid.",
          rules: ["no-console", "no-unused-vars"],
        },
      },
      {
        description: "A deno-lint-ignore-file directive without rules",
        given: {
          type: "Line",
          value: " deno-lint-ignore-file -- Disable all rules",
          range: dummyRange,
        },
        expected: {
          directive: "deno-lint-ignore-file",
          reason: "Disable all rules",
          rules: [],
        },
      },
      {
        description: "A deno-lint-ignore directive without rules",
        given: {
          type: "Line",
          value: " deno-lint-ignore -- Disable all rules for the next line",
          range: dummyRange,
        },
        expected: {
          directive: "deno-lint-ignore",
          reason: "Disable all rules for the next line",
          rules: [],
        },
      },
      {
        description:
          "A deno-lint-ignore directive without the reason and rules",
        given: {
          type: "Line",
          value: " deno-lint-ignore    ",
          range: dummyRange,
        },
        expected: {
          directive: "deno-lint-ignore",
          reason: undefined,
          rules: [],
        },
      },
      {
        description: "An invalid directive",
        given: {
          type: "Line",
          value: " deno-lint-ignorea no-console -- foo",
          range: dummyRange,
        },
        expected: null,
      },
    ]
  ) {
    await t.step(tc.description, () => {
      const actual = parseLintIgnoreDirective(tc.given);
      assertEquals(actual, tc.expected);
    });
  }
});
