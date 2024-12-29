export function createPlugin(onError) {
  const plugin = {
    name: "deno-lint-plugin-extra-rules",
    rules: {
      "no-env-to-object": {
        create: (_ctx) => {
          const visitor = {
            "CallExpression > MemberExpression": (node) => {
              if (node.object.type !== "MemberExpression") return;
              if (node.property.type !== "Identifier") return;
              if (node.property.name !== "toObject") return;

              const child = node.object;
              if (child.object.type !== "Identifier") return;
              if (child.object.name !== "Deno") return;
              if (child.property.type !== "Identifier") return;

              onError(new Error("Deno.env.toObject found"));
            },
          };
          return visitor;
        },
      },
    },
  };
  return plugin;
}
