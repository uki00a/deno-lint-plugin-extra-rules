// @ts-check
import { test } from "node:test";

Deno.test({
  name: "This is ok",
  ignore: false,
  fn: () => {},
});

test("This is also ok", { skip: false }, () => {
});
