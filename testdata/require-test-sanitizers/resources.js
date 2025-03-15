// @ts-check
Deno.test({
  name: "disables the resource sanitizer",
  fn: () => {},
  sanitizeResources: false,
});
