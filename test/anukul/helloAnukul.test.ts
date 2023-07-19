import { describe, it, expect } from "vitest";
import { helloAnukul } from "../../src/anukul/anukul";

describe("helloAnukul", () => {
  it("should return hello anukul", () => {
    const result = helloAnukul();
    expect(result).toEqual("hello anukul");
  });
});
