import { describe, it, expect } from "vitest";
import { BigNumber } from "ethers";
import jest from "jest";

import {
  removeUndefinedItem,
  formatAgoDate,
  dropDuplicatesMultiKey,
  removeReefSpecificStringFromAddress,
  addReefSpecificStringFromAddress,
  trim,
  toAddressShortDisplay,
  shortAddress,
  ensure,
  toReefBalanceDisplay,
  uniqueCombinations,
  errorStatus,
  ensureVoidRun,
} from "../../src/utils/utils";

describe("removeReefSpecificStringFromAddress", () => {
  it("removes Reef specific string from address", () => {
    const address = "0x1234abcd (ONLY for Reef chain!)";
    const expectedAddress = "0x1234abcd";
    expect(removeReefSpecificStringFromAddress(address)).toBe(expectedAddress);
  });

  it("does not remove anything if Reef specific string not found", () => {
    const address = "0x1234abcd";
    const expectedAddress = "0x1234abcd";
    expect(removeReefSpecificStringFromAddress(address)).toBe(expectedAddress);
  });
});

describe("addReefSpecificStringFromAddress", () => {
  it("adds Reef specific string to address", () => {
    const address = "0x1234abcd";
    const expectedAddress = "0x1234abcd (ONLY for Reef chain!)";
    expect(addReefSpecificStringFromAddress(address)).toBe(expectedAddress);
  });
});

describe("removeUndefinedItem", () => {
  it("should return true if item is defined", () => {
    const definedItem = "defined";
    expect(removeUndefinedItem(definedItem)).toBe(true);
  });

  it("should return false if item is undefined", () => {
    const undefinedItem = undefined;
    expect(removeUndefinedItem(undefinedItem)).toBe(false);
  });
});

describe("formatAgoDate", () => {
  it("should format the date correctly for a recent timestamp", () => {
    const timestamp = Date.now() - 1000;
    const formatted = formatAgoDate(timestamp);
    expect(formatted).toMatch(/\d+sec ago/);
  });

  it("should format the date correctly for a timestamp within the past hour", () => {
    const timestamp = Date.now() - 1000 * 60;
    const formatted = formatAgoDate(timestamp);
    expect(formatted).toMatch(/\d+min ago/);
  });

  it("should format the date correctly for a timestamp within the past day", () => {
    const timestamp = Date.now() - 1000 * 60 * 60;
    const formatted = formatAgoDate(timestamp);
    expect(formatted).toMatch(/\d+h ago/);
  });

  it("should format the date correctly for a timestamp more than one day ago", () => {
    const timestamp = Date.now() - 1000 * 60 * 60 * 24;
    const formatted = formatAgoDate(timestamp);
    expect(formatted).toMatch(/\w{3} \w{3} \d{2} \d{4}/);
  });
});

describe("dropDuplicatesMultiKey", () => {
  it("should remove duplicate objects based on multiple keys", () => {
    const objects = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 1, name: "Charlie" },
      { id: 3, name: "Dave" },
      { id: 2, name: "Eve" },
    ];
    const filtered = dropDuplicatesMultiKey(objects, ["id", "name"]);
    expect(filtered).toEqual([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Dave" },
    ]);
  });

  it("should return the original array if no duplicates found", () => {
    const objects = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ];
    const filtered = dropDuplicatesMultiKey(objects, ["id", "name"]);
    expect(filtered).toEqual(objects);
  });
});

describe("trim", () => {
  it("should return the original value if it is shorter than the specified size", () => {
    expect(trim("hello")).toBe("hello");
  });

  it("should return a truncated value with ellipsis if it is longer than the specified size", () => {
    expect(trim("abcdefghijklmnopqrstuvwxyz", 10)).toBe("abcde...vwxyz");
  });
});

describe("toAddressShortDisplay", () => {
  it("should return the first 7 characters of the address with ellipsis", () => {
    expect(
      toAddressShortDisplay("0x1234567890abcdef1234567890abcdef12345678")
    ).toBe("0x12345...5678");
  });
});

describe("shortAddress", () => {
  it("should return the first and last 5 characters of the address with ellipsis if the address is longer than 10 characters", () => {
    expect(shortAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(
      "0x1234...5678"
    );
  });

  it("should return the entire address if it is 10 characters or shorter", () => {
    expect(shortAddress("0x1234567890")).toBe("0x1234567890");
  });
});

describe("ensure", () => {
  it("should throw an error if the condition is false", () => {
    expect(() => ensure(false, "it message")).toThrowError("it message");
  });

  it("should not throw an error if the condition is true", () => {
    expect(() => ensure(true, "it message")).not.toThrowError();
  });
});

describe("toReefBalanceDisplay", () => {
  it('should return a string in the format "X REEF" for a positive BigNumber value', () => {
    const value = BigNumber.from(1000000000000000000);
    expect(toReefBalanceDisplay(value)).toBe("1 REEF");
  });

  it('should return a string in the format "- REEF" for a non-positive BigNumber value or undefined', () => {
    expect(toReefBalanceDisplay()).toBe("- REEF");
    expect(toReefBalanceDisplay(BigNumber.from(0))).toBe("- REEF");
  });
});

describe("uniqueCombinations", () => {
  it("should return an array of unique combinations of the input array", () => {
    const input = [1, 2, 3];
    const output = uniqueCombinations(input);
    expect(output).toHaveLength(3);
    expect(output).toContainEqual([1, 2]);
    expect(output).toContainEqual([1, 3]);
    expect(output).toContainEqual([2, 3]);
  });
});

describe("errorStatus", () => {
  it("should return a ButtonStatus object with isValid set to false and the specified text", () => {
    const text = "it error message";
    expect(errorStatus(text)).toEqual({ isValid: false, text });
  });
});

describe("ensureVoidRun", () => {
  it("should run the function if `canRun` is true", () => {
    const mockFn = jest.fn();
    const obj = { prop: "value" };
    const canRun = true;

    ensureVoidRun(canRun)(mockFn, obj);

    expect(mockFn).toHaveBeenCalledWith(obj);
  });

  it("should not run the function if `canRun` is false", () => {
    const mockFn = jest.fn();
    const obj = { prop: "value" };
    const canRun = false;

    ensureVoidRun(canRun)(mockFn, obj);

    expect(mockFn).not.toHaveBeenCalled();
  });
});
