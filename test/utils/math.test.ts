import { describe, it, expect } from "viit";
import { TokenWithAmount } from "path/to/TokenWithAmount";
// import { TokenWithAmount, BigNumber } from 'ethers';
import { BigNumber } from "ethers";

import {
  transformAmount,
  convert2Normal,
  calculateAmount,
  assertAmount,
  calculateAmountWithPercentage,
  minimumRecieveAmount,
  calculateUsdAmount,
  calculateDeadline,
  calculateBalance,
  calculatePoolSupply,
  removeSupply,
  removePoolTokenShare,
  showRemovePoolTokenShare,
  removeUserPoolSupply,
  convertAmount,
  calculatePoolRatio,
  calculatePoolShare,
  showBalance,
  toBalance,
  toUnits,
  exponentNrSplit,
  noExponents,
  toDecimalPlaces,
  poolRatio,
  ensureAmount,
  getOutputAmount,
  getInputAmount,
  calculateImpactPercentage,
  getHashSumLastNr,
  toHumanAmount,
  formatAmount,
  mean,
  variance,
  std,
  checkMinExistentialReefAmount,
  ensureTokenAmount,
  ensureExistentialReefAmount,
} from "../../src/utils/math";

describe("transformAmount", () => {
  it("should return a string with the desired number of decimal places", () => {
    expect(transformAmount(2, "12.34")).toBe("1234");
    expect(transformAmount(3, "12.345")).toBe("12345");
    expect(transformAmount(2, "12,34")).toBe("1234");
    expect(transformAmount(3, "12,345")).toBe("12345");
    expect(transformAmount(2, "")).toBe("00");
    expect(transformAmount(2, undefined)).toBe("00");
  });
});

describe("assertAmount", () => {
  it("should return a string representation of the amount", () => {
    expect(assertAmount("12.34")).toBe("12.34");
    expect(assertAmount("12,345")).toBe("12,345");
    expect(assertAmount("")).toBe("0");
    expect(assertAmount(undefined)).toBe("0");
  });
});

describe("convert2Normal", () => {
  it("should return a number representation of the amount with the desired number of decimal places", () => {
    expect(convert2Normal(2, "12.34")).toBe(12.34);
    expect(convert2Normal(3, "12.345")).toBe(12.345);
    expect(convert2Normal(2, "12,34")).toBe(12.34);
    expect(convert2Normal(3, "12,345")).toBe(12.345);
    expect(convert2Normal(2, "")).toBe(0);
    expect(convert2Normal(2, undefined)).toBe(0);
  });
});

describe("calculateAmount", () => {
  it("should return a string representation of the calculated amount", () => {
    expect(calculateAmount({ decimals: 2, amount: "12.34" })).toBe("1234");
    expect(calculateAmount({ decimals: 3, amount: "12.345" })).toBe("12345");
    expect(calculateAmount({ decimals: 2, amount: "12,34" })).toBe("1234");
    expect(calculateAmount({ decimals: 3, amount: "12,345" })).toBe("12345");
    expect(calculateAmount({ decimals: 2, amount: "" })).toBe("0");
    expect(calculateAmount({ decimals: 2, amount: undefined })).toBe("0");
  });
});

describe("calculateAmountWithPercentage", () => {
  it("should return the correct amount with percentage deducted", () => {
    const result = calculateAmountWithPercentage(
      { amount: "100", decimals: 2 },
      10
    );
    expect(result).toBe("90.00");
  });

  it("should return 0 if oldAmount is not provided", () => {
    const result = calculateAmountWithPercentage(
      { amount: "", decimals: 2 },
      10
    );
    expect(result).toBe("0");
  });

  it("should handle decimal points correctly", () => {
    const result = calculateAmountWithPercentage(
      { amount: "123.45", decimals: 4 },
      5
    );
    expect(result).toBe("117.2755");
  });
});

describe("minimumRecieveAmount", () => {
  it("should return the correct minimum receive amount", () => {
    const result = minimumRecieveAmount({ amount: "100", decimals: 2 }, 10);
    expect(result).toBe(90);
  });

  it("should handle decimal points correctly", () => {
    const result = minimumRecieveAmount({ amount: "123.45", decimals: 4 }, 5);
    expect(result).toBe(117.275);
  });
});

describe("calculateUsdAmount", () => {
  it("calculates correct USD amount", () => {
    const result = calculateUsdAmount({ amount: "1.5", price: 2500 });
    expect(result).toEqual(3750);
  });

  it("returns 0 if amount is not defined", () => {
    const result = calculateUsdAmount({ amount: undefined, price: 2500 });
    expect(result).toEqual(0);
  });
});

describe("calculateDeadline", () => {
  it("calculates correct deadline in milliseconds", () => {
    const result = calculateDeadline(30);
    const now = Date.now();
    expect(result).toBeGreaterThan(now);
    expect(result - now).toEqual(30 * 60 * 1000);
  });
});

describe("calculateBalance", () => {
  it("calculates balance with correct decimal places", () => {
    const result = calculateBalance({ balance: 15000, decimals: 4 });
    expect(result).toEqual("1.5");
  });
});

describe("calculatePoolSupply", () => {
  const token1 = { amount: "10", decimals: 18 };
  const token2 = { amount: "20", decimals: 6 };
  const pool = {
    totalSupply: "1000000000000000000",
    reserve1: "500000000000000000",
    reserve2: "20000000000",
  };

  it("should calculate pool supply correctly without pool", () => {
    expect(calculatePoolSupply(token1, token2)).toBeCloseTo(47.14);
  });

  it("should calculate pool supply correctly with pool", () => {
    expect(calculatePoolSupply(token1, token2, pool)).toBeCloseTo(4.41);
  });
});
describe("removeSupply", () => {
  it("should return 0 when supply and decimals are not provided", () => {
    expect(removeSupply(10)).toEqual(0);
  });

  it("should calculate the correct supply value to remove", () => {
    expect(removeSupply(10, "1000000000000000000", 18)).toEqual(
      100000000000000000
    );
  });
});

describe("removePoolTokenShare", () => {
  it("should return 0 when token is not provided", () => {
    expect(removePoolTokenShare(10)).toEqual("0");
  });

  it("should calculate the correct token balance to remove", () => {
    const token = {
      balance: BigNumber.from("1000000000000000000"),
    };
    expect(removePoolTokenShare(10, token)).toEqual("100000000000000000");
  });
});

describe("showRemovePoolTokenShare", () => {
  it("should return 0 when token is not provided", () => {
    expect(showRemovePoolTokenShare(10)).toEqual("0");
  });

  it("should calculate the correct token balance to remove and convert to normal units", () => {
    const token = {
      balance: BigNumber.from("1000000000000000000"),
    };
    expect(showRemovePoolTokenShare(10, token)).toEqual("0.10000000");
  });
});

describe("removeUserPoolSupply", () => {
  it("should return 0 when pool is not provided", () => {
    expect(removeUserPoolSupply(10)).toEqual(0);
  });

  it("should calculate the correct user pool balance value to remove", () => {
    const pool = {
      userPoolBalance: "1000000000000000000",
    };
    expect(removeUserPoolSupply(10, pool)).toEqual(100000000000000000);
  });
});

describe("convertAmount", () => {
  it("should calculate the correct amount after conversion", () => {
    expect(convertAmount("1", 2, 3)).toEqual(1.5);
  });
});

describe("calculatePoolRatio", () => {
  it("should return 0 when pool is not provided", () => {
    expect(calculatePoolRatio()).toEqual(0);
  });

  it("should calculate the correct ratio", () => {
    const pool = {
      reserve1: "1000000000000000000",
      reserve2: "2000000000000000000",
    };
    expect(calculatePoolRatio(pool)).toEqual(0.5);
  });

  it("should calculate the correct second ratio when first is false", () => {
    const pool = {
      reserve1: "1000000000000000000",
      reserve2: "2000000000000000000",
    };
    expect(calculatePoolRatio(pool, false)).toEqual(2);
  });
});

describe("calculatePoolShare", () => {
  it("calculates pool share correctly when given a valid pool object", () => {
    const pool = {
      totalSupply: "1000000000000000000000",
      userPoolBalance: "500000000000000000000",
    };
    expect(calculatePoolShare(pool)).toEqual(50);
  });

  it("returns 0 when given an invalid pool object", () => {
    const pool = undefined;
    expect(calculatePoolShare(pool)).toEqual(0);
  });
});

describe("showBalance", () => {
  it("formats balance with default decimal points", () => {
    const balance = {
      decimals: 18,
      balance: "1000000000000000000",
      symbol: "ETH",
    };
    expect(showBalance(balance)).toBe("1.0000 ETH");
  });

  it("formats balance with custom decimal points", () => {
    const balance = {
      decimals: 6,
      balance: "1000000",
      name: "USDC",
    };
    expect(showBalance(balance, 2)).toBe("10.00 USDC");
  });

  it("returns empty string when balance is 0", () => {
    const balance = {
      decimals: 18,
      balance: "0",
      symbol: "ETH",
    };
    expect(showBalance(balance)).toBe("");
  });
});

describe("toBalance", () => {
  it("converts balance to number with decimal points", () => {
    const balance = {
      decimals: 18,
      balance: "1000000000000000000",
    };
    expect(toBalance(balance)).toBe(1);
  });

  it("handles balance with fewer decimals than specified", () => {
    const balance = {
      decimals: 8,
      balance: "10000000",
    };
    expect(toBalance(balance)).toBe(0.1);
  });
});

describe("toUnits", () => {
  it("converts balance to units", () => {
    const balance = {
      decimals: 18,
      balance: "1000000000000000000",
    };
    expect(toUnits(balance)).toBe("1");
  });
});

describe("exponentNrSplit", () => {
  it("splits number string with exponent", () => {
    expect(exponentNrSplit("1e18")).toEqual({
      isExponent: true,
      split: ["1", "18"],
    });
  });

  it("splits number string without exponent", () => {
    expect(exponentNrSplit("1234567")).toEqual({
      isExponent: false,
      split: ["1234567"],
    });
  });
});

describe("noExponents", () => {
  it("should return the same input if it does not contain exponents", () => {
    const input = "1234.5678";
    const output = noExponents(input);
    expect(output).toEqual(input);
  });

  it("should convert input with exponents to regular number", () => {
    const input = "1.2345678e+18";
    const output = noExponents(input);
    expect(output).toEqual("1234567800000000000");
  });
});

describe("toDecimalPlaces", () => {
  it("should return the same input if it has fewer decimal places than the maximum allowed", () => {
    const input = "1.2345";
    const output = toDecimalPlaces(input, 5);
    expect(output).toEqual(input);
  });

  it("should trim input to the maximum allowed decimal places", () => {
    const input = "1.2345678";
    const output = toDecimalPlaces(input, 5);
    expect(output).toEqual("1.23456");
  });
});

describe("poolRatio", () => {
  it("should return the correct ratio when both tokens have decimals", () => {
    const token1 = { balance: "100", decimals: 18 };
    const token2 = { balance: "200", decimals: 18 };
    const output = poolRatio({ token1, token2 });
    expect(output).toEqual(2);
  });

  it("should return 0 when either token does not have decimals", () => {
    const token1 = { balance: "100", decimals: undefined };
    const token2 = { balance: "200", decimals: 18 };
    const output = poolRatio({ token1, token2 });
    expect(output).toEqual(0);
  });
});

describe("ensureAmount", () => {
  it("should not throw an error if the calculated amount is less than or equal to the token balance", () => {
    const token = { balance: "100", amount: "50", name: "Token" };
    expect(() => ensureAmount(token)).not.toThrow();
  });

  it("should throw an error if the calculated amount is greater than the token balance", () => {
    const token = { balance: "100", amount: "200", name: "Token" };
    expect(() => ensureAmount(token)).toThrow("Insufficient Token balance");
  });
});

describe("getOutputAmount", () => {
  it("should return the correct output amount", () => {
    const token = { amount: "10", decimals: 18 };
    const pool = {
      token1: { decimals: 18, reserve: "100" },
      token2: { decimals: 18, reserve: "200" },
    };
    expect(getOutputAmount(token, pool)).toEqual(6.655021834061136);
  });
});

describe("getInputAmount", () => {
  it("should return the correct input amount", () => {
    const token = { amount: "10", decimals: 18 };
    const pool = {
      token1: { decimals: 18, reserve: "100" },
      token2: { decimals: 18, reserve: "200" },
    };
    expect(getInputAmount(token, pool)).toEqual(15.093075413653052);
  });
});

describe("calculateImpactPercentage", () => {
  it("should return the correct impact percentage", () => {
    const sell = { amount: "10", decimals: 18 };
    const buy = { amount: "20", decimals: 18 };
    expect(calculateImpactPercentage(sell, buy)).toEqual(0.0);
  });
});

describe("getHashSumLastNr", () => {
  it("should return the correct hash sum last number", () => {
    const address = "0x123456789abcdef";
    expect(getHashSumLastNr(address)).toEqual(6);
  });
});

describe("toHumanAmount", () => {
  it("returns human-readable amount in B", () => {
    expect(toHumanAmount("1000000000")).toBe("1.00 B");
  });

  it("returns human-readable amount in M", () => {
    expect(toHumanAmount("1000000")).toBe("1.00 M");
  });

  it("returns human-readable amount in k", () => {
    expect(toHumanAmount("1000")).toBe("1.00 k");
  });

  it("returns same amount when it is less than 1000", () => {
    expect(toHumanAmount("999")).toBe("999");
  });
});

describe("formatAmount", () => {
  it("returns formatted amount in k", () => {
    expect(formatAmount(1000000, 18)).toBe("1.00 M");
  });

  it("returns formatted amount in B", () => {
    expect(formatAmount(1000000000, 18)).toBe("1.00 B");
  });

  it("returns formatted amount when less than 1000", () => {
    expect(formatAmount(999, 18)).toBe("999");
  });
});

describe("mean", () => {
  it("returns the average of an array of numbers", () => {
    expect(mean([1, 2, 3])).toBe(2);
  });
});

describe("variance", () => {
  it("returns the variance of an array of numbers", () => {
    expect(variance([1, 2, 3])).toBe(2 / 3);
  });
});

describe("std", () => {
  it("returns the standard deviation of an array of numbers", () => {
    expect(std([1, 2, 3])).toBe(Math.sqrt(2 / 3));
  });
});

describe("checkMinExistentialReefAmount", () => {
  it("should return valid if reef balance is sufficient", () => {
    const token = {
      name: "MyToken",
      amount: "1",
      balance: BigNumber.from("100"),
    };
    const reefBalance = BigNumber.from("10");
    const result = checkMinExistentialReefAmount(token, reefBalance);
    expect(result.valid).to.be.true;
  });

  it("should return invalid if reef balance is insufficient", () => {
    const token = {
      name: "MyToken",
      amount: "1",
      balance: BigNumber.from("100"),
    };
    const reefBalance = BigNumber.from("0.5");
    const result = checkMinExistentialReefAmount(token, reefBalance);
    expect(result.valid).to.be.false;
  });

  it("should return message with correct amount for EVM transaction", () => {
    const token = {
      name: "MyToken",
      amount: "1",
      balance: BigNumber.from("100"),
    };
    const reefBalance = BigNumber.from("0.5");
    const result = checkMinExistentialReefAmount(token, reefBalance);
    expect(result.message).to.equal(
      "0.503 REEF balance needed to call EVM transaction. Token transfer fee ~2.5 REEF."
    );
  });

  it("should return message with correct maximum transfer amount for native reef transfer", () => {
    const token = { name: "REEF", amount: "1", balance: BigNumber.from("100") };
    const reefBalance = BigNumber.from("10");
    const result = checkMinExistentialReefAmount(token, reefBalance);
    expect(result.message).to.equal(
      "Maximum transfer amount is ~6.496 REEF to allow for fees."
    );
  });
});

describe("ensureTokenAmount", () => {
  it("should throw an error if token balance is insufficient", () => {
    const token = {
      name: "MyToken",
      amount: "1",
      balance: BigNumber.from("0.5"),
    };
    expect(() => ensureTokenAmount(token)).to.throw(
      "Insufficient MyToken balance"
    );
  });

  it("should not throw an error if token balance is sufficient", () => {
    const token = {
      name: "MyToken",
      amount: "1",
      balance: BigNumber.from("1"),
    };
    expect(() => ensureTokenAmount(token)).to.not.throw();
  });
});

describe("ensureExistentialReefAmount", () => {
  const token: TokenWithAmount = {
    name: "it Token",
    symbol: "it",
    amount: "100",
    balance: BigNumber.from("200"),
    decimals: 18,
  };
  const reefBalance = BigNumber.from("10");

  it("should throw an error if the REEF balance is less than the required minimum", () => {
    expect(() => ensureExistentialReefAmount(token, reefBalance)).toThrow(
      "Insufficient REEF balance."
    );
  });

  it("should not throw an error if the REEF balance is equal to or greater than the required minimum", () => {
    const newReefBalance = BigNumber.from("300");
    expect(() =>
      ensureExistentialReefAmount(token, newReefBalance)
    ).not.toThrow();
  });
});
