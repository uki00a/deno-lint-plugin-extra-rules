export function createPlugin(): Deno.lint.Plugin {
  const plugin: Deno.lint.Plugin = {
    name: "deno-lint-plugin-extra-rules",
    rules: {
      "no-env-to-object": {
        create: (ctx) => {
          const visitor = {
            "CallExpression > MemberExpression": (
              node: Deno.lint.MemberExpression,
            ) => {
              if (node.object.type !== "MemberExpression") return;
              if (node.property.type !== "Identifier") return;
              if (node.property.name !== "toObject") return;

              const child = node.object;
              if (child.object.type !== "Identifier") return;
              if (child.object.name !== "Deno") return;
              if (child.property.type !== "Identifier") return;

              ctx.report({
                node,
                message: "`Deno.env.toObject()` requires full `--allow-env`",
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
