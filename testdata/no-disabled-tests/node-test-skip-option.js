// @ts-check
import { test } from "node:test";

test("This test is skipped", { skip: true }, () => {
  throw new Error("Failed");
});
