Deno.test("`no-test-sanitizers` rule should support TestContext.step", async (t) => {
  await t.step("outer", async (t) => {
    await t.step({
      sanitizeExit: false,
      name: "This step disables Exit sanitizer",
      fn: () => {},
    });
  });
});
