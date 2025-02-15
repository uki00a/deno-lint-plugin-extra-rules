export function createPlugin(): Deno.lint.Plugin {
  const plugin: Deno.lint.Plugin = {
    name: "deno-lint-plugin-extra-rules",
    rules: {
      /**
       * @description Disallows disabling test sanitiziers
       * @category Testing
       */
      "no-test-sanitizers": {
        create: (ctx) => {
          const visitor = {
            "CallExpression[callee.type=MemberExpression][callee.object.name=Deno][callee.property.name=test]":
              (
                node: Deno.lint.CallExpression,
              ) => {
                const testOptionsArg = node.arguments.find((x) =>
                  x.type === "ObjectExpression"
                );
                if (testOptionsArg == null) return;
                const sanitizerOptions: Array<string> = [
                  "sanitizeResources",
                  "sanitizeOps",
                  "sanitizeExit",
                ] satisfies Array<keyof Deno.TestDefinition>;
                for (const property of testOptionsArg.properties) {
                  if (property.type !== "Property") continue;
                  if (property.key.type !== "Identifier") continue;
                  if (!sanitizerOptions.includes(property.key.name)) continue;

                  if (property.value.type !== "Literal") continue;
                  if (property.value.value !== false) continue;
                  ctx.report({
                    node: property,
                    message: "Disabling test sanitizers should be avoided.",
                    hint: `\`${property.key.name}: true\` should be removed.`,
                  });
                }
              },
          };
          return visitor;
        },
      },
      /**
       * @description Disallows the use of `Deno.env.toObject()`
       * @category Security
       */
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
      /**
       * @description Encourages the use of `node:assert/strict` rather than `node:assert`
       * @category Testing
       */
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
      /**
       * @description Disallows the use of invalid `expect()`
       * @category Testing
       * @see This rule was ported from {@link https://github.com/jest-community/eslint-plugin-jest}.
       */
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
    },
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
