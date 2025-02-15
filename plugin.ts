const kDenoNS = "Deno";
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
            "CallExpression": (
              node: Deno.lint.CallExpression,
            ) => {
              const callee = node.callee;
              if (callee.type !== "MemberExpression") return;
              if (callee.object.type !== "Identifier") return;
              if (callee.object.name !== kDenoNS) return;
              if (callee.property.type !== "Identifier") return;
              if (callee.property.name !== "test") return;

              const testOptions = node.arguments.find((x) =>
                x.type === "ObjectExpression"
              );
              if (testOptions == null) return;
              const sanitizerOptions: Array<string> = [
                "sanitizeResources",
                "sanitizeOps",
                "sanitizeExit",
              ] satisfies Array<keyof Deno.TestDefinition>;
              for (const property of testOptions.properties) {
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
            "CallExpression > MemberExpression": (
              node: Deno.lint.MemberExpression,
            ) => {
              if (node.property.type !== "Identifier") return;
              if (node.property.name !== "toObject") return;

              const child = node.object;
              if (child.type !== "MemberExpression") return;
              if (child.object.type !== "Identifier") return;
              if (child.object.name !== kDenoNS) return;
              if (child.property.type !== "Identifier") return;

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
