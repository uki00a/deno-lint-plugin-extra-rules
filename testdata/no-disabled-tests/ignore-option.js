// @ts-check
Deno.test({
  name: "This uses `ignore: true`",
  ignore: true,
  fn: () => {
    throw new Error("failed");
  },
});
