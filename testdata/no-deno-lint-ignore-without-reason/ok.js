// @ts-check
// deno-lint-ignore-file prefer-const  --  Intentionally disabled.

// deno-lint-ignore-file  no-console  -- This should be allowed.
console.info("This is ok.");

function main() {
  // deno-lint-ignore  -- This should also be allowed.
  const b = "foo";
}
main();
