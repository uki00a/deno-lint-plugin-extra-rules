// @ts-check
import { describe, it } from "@std/testing/bdd";

describe("contains `it.skip`", () => {
  it.skip("is skipped", () => {
    throw new Error("Failed");
  });
});
