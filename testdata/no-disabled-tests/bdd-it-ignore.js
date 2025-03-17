// @ts-check
import { describe, it } from "@std/testing/bdd";

describe("contains `it.ignore`", () => {
  it.ignore("is ignored", () => {
    throw new Error("Failed");
  });
});
