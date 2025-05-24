import {
  makeHintForLintIgnoreDirective,
  parseLintIgnoreDirective,
} from "./internal/comment.ts";

// NOTE: `@category` tag is recognized by `deno doc` (https://github.com/denoland/deno_doc/blob/0.169.0/js/types.d.ts#L236)
/**
 * Lint rules provided by this plugin.
 */
export interface LintRules {
  /**
   * Disallows disabling test sanitiziers
   * @category Deno, Testing
   *
   * @example
   * 🙅‍♂️ Incorrect
   * ```typescript
   * Deno.test({
   *   name: "Incorrect",
   *   fn: async () => {
   *     const file = await Deno.open("README.md");
   *     // ...
   *   },
   *   sanitizeResources: false, // Invalid - the sanitizer should be enabled.
   * });
   * ```
   *
   * @example
   * 🙆‍♂️ Correct
   * ```typescript
   * Deno.test({
   *   name: "Correct",
   *   fn: async () => {
   *     using f = await Deno.open("README.md");
   *     // ...
   *   },
   * });
   * ````
   */
  "require-test-sanitizers": Deno.lint.Rule;

  /**
   * Disallows disabling a lint rule without the reason
   * @category Deno, Comment
   *
   * @example
   * 🙅‍♂️ Incorrect
   * ```typescript
   * // deno-lint-ignore no-console
   * console.info("foo");
   * ```
   * @example
   * 🙆‍♂️ Correct
   * ```typescript
   * // deno-lint-ignore no-console -- Specify the reason.
   * console.info("foo");
   * ````
   */
  "no-deno-lint-ignore-without-reason": Deno.lint.Rule;

  /**
   * Disallows disabling tests
   * @category Deno, Node.js, Testing, std
   * @see This rule was ported from {@link https://github.com/jest-community/eslint-plugin-jest eslint-plugin-jest}.
   *
   * @example
   * 🙅‍♂️ Incorrect
   * ```typescript
   * Deno.test.ignore("This test case is ignored.", () => {
   *   // ...
   * });
   * ```
   *
   * @example
   * 🙆‍♂️ Correct
   * ```typescript
   * Deno.test("This test case is not ignored.", () => {
   *   // ...
   * });
   * ````
   */
  "no-disabled-tests": Deno.lint.Rule;

  /**
   * Disallows the use of `Deno.env.toObject()`
   * @category Deno, Security
   *
   * @example
   * 🙅‍♂️ Incorrect
   * ```typescript
   * const env = Deno.env.toObject();
   * env["DENO_DIR"];
   * env["FOO"];
   * ```
   * @example
   * 🙆‍♂️ Correct
   * ```typescript
   * Deno.env.get("DENO_DIR");
   * Deno.env.get("FOO");
   * ```
   */
  "no-env-to-object": Deno.lint.Rule;

  /**
   * Disallows the use of `Deno.exit()` and `process.exit()`
   * @category Deno, Node.js
   */
  "no-exit": Deno.lint.Rule;

  /**
   * Encourages the use of `node:assert/strict` rather than `node:assert`
   * @category Node.js, Testing
   *
   * @example
   * 🙅‍♂️ Incorrect
   * ```typescript
   * import assert from "node:assert";
   * ```
   *
   * @example
   * 🙆‍♂️ Correct
   * ```typescript
   * import assert from "node:assert/strict";
   * ```
   */
  "prefer-node-assert-strict": Deno.lint.Rule;

  /**
   * Disallows the use of invalid `expect()`
   * @category std, Testing
   * @see This rule was ported from {@link https://github.com/jest-community/eslint-plugin-jest eslint-plugin-jest}.
   *
   * @example
   * 🙅‍♂️ Incorrect
   * ```typescript
   * import { expect } from "@std/expect";
   * expect("foo").toStrictEqual; // Invalid - `toStrictEqual()` is not called.
   * expect(1); // Invalid - A matcher is not called.
   * ```
   * @example
   * 🙆‍♂️ Correct
   * ```typescript
   * import { expect } from "@std/expect";
   * expect(1).toBe(1);
   * ```
   */
  "valid-expect": Deno.lint.Rule;
}

const kIgnore = "ignore";
const kSkip = "skip";
const kCallExpressionForDenoTestSelector =
  "CallExpression[callee.type=MemberExpression][callee.object.name=Deno][callee.property.name=test]";

export function createPlugin(): Deno.lint.Plugin {
  const plugin: Deno.lint.Plugin = {
    name: "deno-lint-plugin-extra-rules",
    rules: {
      "require-test-sanitizers": {
        create: (ctx) => {
          const kCallExpressionForDenoTestSelector =
            "CallExpression[callee.type=MemberExpression][callee.object.name=Deno][callee.property.name=test]";
          const visitor = {
            [kCallExpressionForDenoTestSelector]: (
              node: Deno.lint.CallExpression,
            ) => {
              // This callback looks for `Deno.test` with test sanitizers disabled.
              const testOptionsArg = node.arguments.find((x) =>
                x.type === "ObjectExpression"
              );
              if (testOptionsArg == null) return;
              for (const property of testOptionsArg.properties) {
                if (property.type !== "Property") continue;
                if (property.key.type !== "Identifier") continue;
                if (!testSanitizerOptions.includes(property.key.name)) continue;

                if (property.value.type !== "Literal") continue;
                if (property.value.value !== false) continue;
                ctx.report({
                  node: property,
                  message: "Disabling test sanitizers should be avoided.",
                  hint: `\`${property.key.name}: false\` should be removed.`,
                });
              }
            },
            [`${kCallExpressionForDenoTestSelector} CallExpression[callee.type=MemberExpression][callee.property.name=step][arguments.length=1]`]:
              (
                node: Deno.lint.CallExpression,
              ) => {
                // This callback looks for `Deno.TestContext#step` with test sanitizers disabled.
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.object.type !== "Identifier") return;
                const maybeTestContext = node.callee.object;

                // Checks if `node` is actually a call to `TestContext#step`.
                const ancestors = ctx.sourceCode.getAncestors(node);
                const isCallExpressionForTestContextStep =
                  null != ancestors.findLast(
                    (maybeCallExpression, i) => {
                      // NOTE: `ancestors[ancestors.length - 1]` references `node` itself.
                      const isLastNode = i === ancestors.length - 1;
                      if (isLastNode) return false;

                      if (maybeCallExpression.type !== "CallExpression") {
                        return false;
                      }
                      if (
                        maybeCallExpression.callee.type !== "MemberExpression"
                      ) return false;
                      if (
                        maybeCallExpression.callee.property.type !==
                          "Identifier"
                      ) return false;
                      switch (maybeCallExpression.callee.property.name) {
                        case "test":
                          // `Deno.test()`
                          if (
                            maybeCallExpression.callee.object.type !==
                              "Identifier"
                          ) return false;
                          if (
                            maybeCallExpression.callee.object.name !== "Deno"
                          ) return false;
                          break; // `maybeCallExpression` is a `Deno.test()` call
                        case "step":
                          break; // `maybeCallExpression` is a `Deno.TestContext#step` call.
                        default:
                          return false;
                      }

                      // A function argument passed to `Deno.test()` or `Deno.TestContext#step`.
                      const testFnArg = maybeCallExpression.arguments.find((
                        x,
                      ) => x.type === "ArrowFunctionExpression");
                      if (testFnArg == null) return false;

                      if (testFnArg.params.length === 0) return false;
                      const [testContextParam] = testFnArg.params;
                      if (testContextParam.type !== "Identifier") return false;
                      return testContextParam.name === maybeTestContext.name;
                    },
                  );
                if (!isCallExpressionForTestContextStep) return;

                const [testStepDefinitionArg] = node.arguments;
                if (testStepDefinitionArg == null) return;
                if (testStepDefinitionArg.type !== "ObjectExpression") return;

                for (const property of testStepDefinitionArg.properties) {
                  if (property.type !== "Property") continue;
                  if (property.key.type !== "Identifier") continue;
                  if (!testSanitizerOptions.includes(property.key.name)) {
                    continue;
                  }

                  if (property.value.type !== "Literal") continue;
                  if (property.value.value !== false) continue;
                  ctx.report({
                    node: property,
                    message: "Disabling test sanitizers should be avoided.",
                    hint: `\`${property.key.name}: false\` should be removed.`,
                  });
                }
              },
          };
          return visitor;
        },
      },
      "no-deno-lint-ignore-without-reason": {
        create: (ctx) => {
          const visitor = {
            Program: () => {
              // TODO: Use `Deno.lint.Program.comments`. Currently it seems that it is not reset with each file run.
              for (const comment of ctx.sourceCode.getAllComments()) {
                if (comment.type !== "Line") continue;
                const maybeDirective = parseLintIgnoreDirective(comment);
                if (maybeDirective == null) continue;
                if (!maybeDirective.reason) {
                  ctx.report({
                    node: comment,
                    message:
                      `Requires the reason for \`${maybeDirective.directive}\` directive`,
                    hint: makeHintForLintIgnoreDirective(maybeDirective),
                  });
                }
              }
            },
          };
          return visitor;
        },
      },
      "no-disabled-tests": {
        create: (ctx) => {
          const message = "A test case should not be disabled.";
          const visitor = {
            [kCallExpressionForDenoTestSelector]: (
              node: Deno.lint.CallExpression,
            ) => {
              // This callback looks for `Deno.test()` with `ignore: true`.
              const optionsArg = node.arguments.find((arg) =>
                arg.type === "ObjectExpression"
              );
              if (optionsArg?.type !== "ObjectExpression") return;
              const ignoreOptionProperty = optionsArg.properties.find((
                property,
              ) =>
                property.type === "Property" &&
                property.key.type === "Identifier" &&
                property.key.name === kIgnore
              );
              if (ignoreOptionProperty?.type !== "Property") return;
              if (
                ignoreOptionProperty.value.type !== "Literal" ||
                ignoreOptionProperty.value.value !== false
              ) {
                ctx.report({
                  node: ignoreOptionProperty,
                  message,
                });
              }
            },
            [`CallExpression[callee.type=MemberExpression][callee.object.type=MemberExpression][callee.property.name=${kIgnore}][callee.object.property.name=test][callee.object.object.name=Deno]`]:
              (node: Deno.lint.CallExpression) => {
                // This callback looks for `Deno.test.ignore()`.
                ctx.report({ node, message });
              },
            "CallExpression[callee.name=test][arguments.length=3]": (
              node: Deno.lint.CallExpression,
            ) => {
              // This callback looks for `node:test`'s `test()` with `skip: true`.
              const optionsArg = node.arguments[1];
              if (optionsArg?.type !== "ObjectExpression") return;
              const skipOption = optionsArg.properties.find((property) =>
                property.type === "Property" &&
                property.key.type === "Identifier" &&
                property.key.name === kSkip
              );
              if (skipOption?.type !== "Property") return;
              if (
                skipOption.value.type === "Literal" &&
                skipOption.value.value === false
              ) return;
              ctx.report({
                node: skipOption,
                message,
              });
            },
            "CallExpression[callee.type=MemberExpression][callee.object.name=test]":
              (node: Deno.lint.CallExpression) => {
                // This callback looks for `test.{ignore,skip}()` which is supported by `@std/testing/bdd` and `node:test`.
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.property.type !== "Identifier") return;
                const calledMethod = node.callee.property.name;
                if (calledMethod !== kSkip && calledMethod !== kIgnore) return;
                ctx.report({ node: node.callee.property, message });
              },
            "CallExpression[callee.type=MemberExpression][callee.object.name=describe]":
              (node: Deno.lint.CallExpression) => {
                // This callback looks for `describe.{skip,ignore}` which is supported by `@std/testing/bdd` and `node:test`.
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.property.type !== "Identifier") return;
                const calledMethod = node.callee.property.name;
                if (calledMethod !== kSkip && calledMethod !== kIgnore) return;
                ctx.report({ node: node.callee.property, message });
              },
            "CallExpression[callee.type=MemberExpression][callee.object.name=it]":
              (node: Deno.lint.CallExpression) => {
                // This callback looks for `it.{skip,ignore}()` which is supported by `@std/testing/bdd` and `node:test`.
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.property.type !== "Identifier") return;
                const calledMethod = node.callee.property.name;
                if (calledMethod !== kSkip && calledMethod !== kIgnore) return;
                ctx.report({ node: node.callee.property, message });
              },
          };
          return visitor;
        },
      },
      "no-env-to-object": {
        create: (ctx) => {
          const visitor = {
            "CallExpression > MemberExpression[property.name=toObject][object.type=MemberExpression][object.object.name=Deno]":
              (
                node: Deno.lint.MemberExpression,
              ) => {
                ctx.report({
                  node,
                  message:
                    "`Deno.env.toObject()` requires full `--allow-env` permission.",
                  hint: "Recommended to use `Deno.env.get()` or similar.",
                });
              },
          };
          return visitor;
        },
      },
      "no-exit": {
        create: (ctx) => {
          const visitor = {
            "CallExpression.callee[type=MemberExpression][object.name=Deno][property.name=exit]":
              (
                node: Deno.lint.MemberExpression,
              ) => {
                ctx.report({
                  node,
                  message: "`Deno.exit()` should be used sparingly.",
                });
              },
            "CallExpression.callee[type=MemberExpression][object.name=process][property.name=exit]":
              (
                node: Deno.lint.MemberExpression,
              ) => {
                ctx.report({
                  node,
                  message: "`process.exit()` should be used sparingly.",
                });
              },
          };
          return visitor;
        },
      },
      "prefer-node-assert-strict": {
        create: (ctx) => {
          const visitor = {
            "ImportDeclaration[source.value=node:assert]": (
              node: Deno.lint.ImportDeclaration,
            ) => {
              ctx.report({
                node,
                message:
                  "`node:assert/strict` should be used instead of `node:assert`.",
                fix: (fixer) => {
                  return fixer.replaceText(node.source, `"node:assert/strict"`);
                },
              });
            },
          };
          return visitor;
        },
      },
      "valid-expect": {
        create: (ctx) => {
          const visitor = {
            "CallExpression[callee.name=expect]": (
              node: Deno.lint.CallExpression,
            ) => {
              const parent = node.parent;
              if (parent?.type !== "MemberExpression") {
                // Example: `expect(123);`
                return ctx.report({
                  node,
                  message: "A matcher is not specified.",
                });
              }

              const grandParent = parent.parent;
              if (grandParent?.type !== "CallExpression") {
                // Example: `example(123).toStrictEqual;`
                return ctx.report({
                  node: parent.property,
                  message: "The matcher is not called.",
                });
              }
            },
          };
          return visitor;
        },
      },
    } satisfies LintRules,
  };
  return plugin;
}

const testSanitizerOptions: Array<string> = [
  "sanitizeResources",
  "sanitizeOps",
  "sanitizeExit",
] satisfies Array<keyof Deno.TestDefinition>;
