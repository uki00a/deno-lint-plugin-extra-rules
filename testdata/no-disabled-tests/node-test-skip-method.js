// @ts-check
import { test } from "node:test";

test.skip("This test case is skipped", () => {
  throw new Error("Failed");
});
