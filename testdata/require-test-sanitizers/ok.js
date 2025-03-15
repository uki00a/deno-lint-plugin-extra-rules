// @ts-check
Deno.test(function foo() {
});

Deno.test({
  name: "sanitizers are enabled explicitly",
  sanitizeResources: true,
  sanitizeOps: true,
  sanitizeExit: true,
  fn: () => {},
});
