Deno.test({
  name: "disables the ops sanitizer",
  fn: () => {},
  sanitizeOps: false,
});
