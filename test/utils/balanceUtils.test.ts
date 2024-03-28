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
  it("should format value smaller than 1 in $", () => {
    const result = formatDisplayBalance("100000", 4, { symbol: "" });
    console.log(result);
    expect(result).toEqual("$0.00");
  });
  it("should format small value correctly in $", () => {
    const result = formatDisplayBalance("1000000000000000000", 4, {
      symbol: "",
    });
    console.log(result);
    expect(result).toEqual("$1.00");
  });
  it("should format 1000 value to $", () => {
    const result = formatDisplayBalance("1200000000000000000000", 4, {
      symbol: "",
    });
    console.log(result);
    expect(result).toEqual("$1,200.00");
  });
  it("should format 1000000 value to $ M", () => {
    const result = formatDisplayBalance("1200000000000000000000000", 4, {
      symbol: "",
    });
    console.log(result);
    expect(result).toEqual("$1.2 M");
  });
  it("should format 1000000000 value to $ B", () => {
    const result = formatDisplayBalance("1200000000000000000000000000", 4, {
      symbol: "",
    });
    console.log(result);
    expect(result).toEqual("$1.2 B");
  });
  it("should format return value in REEF", () => {
    const result = formatDisplayBalance("1200000000000000000000000000", 4, {
      symbol: "REEF",
    });
    console.log(result);
    expect(result).toEqual("1.2 B REEF");
  });
  it("should format return value in DOLPHIN", () => {
    const result = formatDisplayBalance("120000000000000000000", 4, {
      symbol: "DOLPHIN",
    });
    console.log(result);
    expect(result).toEqual("120.00 DOLPHIN");
  });
  it("should format upto 8 decimals", () => {
    const result = formatDisplayBalance(BigNumber.from("10"), 8);
    console.log(result);
    expect(result).toEqual("0.00000001");
  });
  it("should give price of 130 REEFs in $", () => {
    const result = formatDisplayBalance("130000000000000000000", 4, {
      price: 0.0023,
    });
    console.log(result);
    expect(result).toEqual("$0.30");
  });
});
