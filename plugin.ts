const kDenoNS = "Deno";
export function createPlugin(): Deno.lint.Plugin {
  const plugin: Deno.lint.Plugin = {
    name: "deno-lint-plugin-extra-rules",
    rules: {
      "no-test-sanitizers": {
        /** @category Testing */
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
      "no-env-to-object": {
        /** @category Security */
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
    },
  };
  return plugin;
}
