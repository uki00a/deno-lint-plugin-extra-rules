import { assertEquals } from "@std/assert/equals";
import type { LintIgnoreDirective } from "./comment.ts";
import { parseLintIgnoreDirective } from "./comment.ts";

interface TestCase {
  description: string;
  given: string;
  expected: LintIgnoreDirective | null;
}

Deno.test("parseLintIgnoreDirective", async (t) => {
  const dummyRange: [number, number] = [0, 0];
  for (
    const tc of [
      {
        description: "A deno-lint-ignore directive with the reason",
        given: " deno-lint-ignore  no-console   -- This is valid.",
        expected: {
          directive: "deno-lint-ignore",
          reason: "This is valid.",
          rules: ["no-console"],
        },
      },
      {
        description: "A deno-lint-ignore-file directive with the reason",
        given:
          " deno-lint-ignore-file no-console   no-unused-vars   --  This is also valid.  ",
        expected: {
          directive: "deno-lint-ignore-file",
          reason: "This is also valid.",
          rules: ["no-console", "no-unused-vars"],
        },
      },
      {
        description: "A deno-lint-ignore-file directive without rules",
        given: " deno-lint-ignore-file -- Disable all rules",
        expected: {
          directive: "deno-lint-ignore-file",
          reason: "Disable all rules",
          rules: [],
        },
      },
      {
        description: "A deno-lint-ignore directive without rules",
        given: " deno-lint-ignore -- Disable all rules for the next line",
        expected: {
          directive: "deno-lint-ignore",
          reason: "Disable all rules for the next line",
          rules: [],
        },
      },
      {
        description:
          "A deno-lint-ignore directive without the reason and rules",
        given: " deno-lint-ignore    ",
        expected: {
          directive: "deno-lint-ignore",
          reason: undefined,
          rules: [],
        },
      },
      {
        description: "An invalid directive",
        given: " deno-lint-ignorea no-console -- foo",
        expected: null,
      },
    ] satisfies Array<TestCase>
  ) {
    await t.step(tc.description, () => {
      const actual = parseLintIgnoreDirective({
        type: "Line",
        value: tc.given,
        range: dummyRange,
      });
      assertEquals(actual, tc.expected);
    });
  }
});
