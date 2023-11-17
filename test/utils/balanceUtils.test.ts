import { BigNumber } from "ethers";
import { formatDisplayBalance } from "../../src/utils/balanceUtils";
import { describe, it, expect } from "vitest";

describe("formatDisplayBalance", () => {
  it("should format value smaller than 1", () => {
    const result = formatDisplayBalance(BigNumber.from("100000"));
    console.log(result);
    expect(result).toEqual("0.0001");
  });
  it("should format small value correctly", () => {
    const result = formatDisplayBalance(BigNumber.from("1000000000000000000"));
    console.log(result);
    expect(result).toEqual("1");
  });
  it("should format 1000 value to k", () => {
    const result = formatDisplayBalance(
      BigNumber.from("1200000000000000000000")
    );
    console.log(result);
    expect(result).toEqual("1.2k");
  });
  it("should format 1000000 value to M", () => {
    const result = formatDisplayBalance(
      BigNumber.from("1200000000000000000000000")
    );
    console.log(result);
    expect(result).toEqual("1.200M");
  });
  it("should format 1000000000 value to B", () => {
    const result = formatDisplayBalance(
      BigNumber.from("1200000000000000000000000000")
    );
    console.log(result);
    expect(result).toEqual("1.200B");
  });
});
