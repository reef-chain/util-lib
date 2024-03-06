import { formatDisplayBalance } from "../../src/utils/balanceUtils";
import { describe, it, expect } from "vitest";

describe("formatDisplayBalance", () => {
  it("should format value smaller than 1", () => {
    const result = formatDisplayBalance("100000");
    console.log(result);
    expect(result).toEqual("$0.00");
  });
  it("should format small value correctly", () => {
    const result = formatDisplayBalance("1000000000000000000");
    console.log(result);
    expect(result).toEqual("$1.00");
  });
  it("should format 1000 value to k", () => {
    const result = formatDisplayBalance("1200000000000000000000");
    console.log(result);
    expect(result).toEqual("$1,200.00");
  });
  it("should format 1000000 value to M", () => {
    const result = formatDisplayBalance("1200000000000000000000000");
    console.log(result);
    expect(result).toEqual("$1.2 M");
  });
  it("should format 1000000000 value to B", () => {
    const result = formatDisplayBalance("1200000000000000000000000000");
    console.log(result);
    expect(result).toEqual("$1.2 B");
  });
});
