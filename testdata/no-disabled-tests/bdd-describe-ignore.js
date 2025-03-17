// @ts-check
import { describe, it } from "@std/testing/bdd";

describe.ignore("This suite is ignored", () => {
  it("is not executed", () => {
    throw new Error("Failed");
  });
});
