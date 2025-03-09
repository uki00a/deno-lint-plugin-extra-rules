// NOTE: `@category` tag is recognized by `deno doc` (https://github.com/denoland/deno_doc/blob/0.169.0/js/types.d.ts#L236)
/**
 * @description Lint rules provided by this plugin.
 */
export interface LintRules {
  /**
   * @description Disallows disabling test sanitiziers
   * @category Testing
   */
  "require-test-sanitizers": Deno.lint.Rule;

  /**
   * @description Disallows the use of `Deno.env.toObject()`
   * @category Security
   */
  "no-env-to-object": Deno.lint.Rule;

  /**
   * @description Disallows the use of `Deno.exit()`
   * @category Deno
   */
  "no-exit": Deno.lint.Rule;

  /**
   * @description Encourages the use of `node:assert/strict` rather than `node:assert`
   * @category Testing
   */
  "prefer-node-assert-strict": Deno.lint.Rule;

  /**
   * @description Disallows the use of invalid `expect()`
   * @category Testing
   * @see This rule was ported from {@link https://github.com/jest-community/eslint-plugin-jest}.
   */
  "valid-expect": Deno.lint.Rule;
}

export function createPlugin(): Deno.lint.Plugin {
  const plugin: Deno.lint.Plugin = {
    name: "deno-lint-plugin-extra-rules",
    rules: {
      "require-test-sanitizers": {
        create: (ctx) => {
          const callExpressionForDenoTestSelector =
            "CallExpression[callee.type=MemberExpression][callee.object.name=Deno][callee.property.name=test]";
          const visitor = {
            [callExpressionForDenoTestSelector]: (
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
            [`${callExpressionForDenoTestSelector} CallExpression[callee.type=MemberExpression][callee.property.name=step][arguments.length=1]`]:
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
              const parent = getParentNode(ctx, node);
              if (parent?.type !== "MemberExpression") {
                // Example: `expect(123);`
                return ctx.report({
                  node,
                  message: "A matcher is not specified.",
                });
              }

              const grandParent = getParentNode(ctx, parent);
              if (grandParent?.type !== "CallExpression") {
                // Example: `example(123).toStrictEqual;`
                return ctx.report({
                  node,
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

function getParentNode(
  ctx: Deno.lint.RuleContext,
  node: Deno.lint.Node,
): Deno.lint.Node | null {
  const ancestors = ctx.sourceCode.getAncestors(node);
  return ancestors[ancestors.length - 1] ?? null;
}

const testSanitizerOptions: Array<string> = [
  "sanitizeResources",
  "sanitizeOps",
  "sanitizeExit",
] satisfies Array<keyof Deno.TestDefinition>;
