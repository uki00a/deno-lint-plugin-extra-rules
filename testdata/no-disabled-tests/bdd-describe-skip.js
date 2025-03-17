// @ts-check
import { describe, it } from "@std/testing/bdd";

describe.skip("This suite should be skipped", () => {
  it("is not executed", () => {
    throw new Error("Failed");
  });
});
