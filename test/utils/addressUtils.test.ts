import { describe, it, expect } from "vitest";
import {
  addReefSpecificStringFromAddress,
  removeReefSpecificStringFromAddress,
} from "../../src/utils/utils";

describe("addReefSpecificStringFromAddress", () => {
  it("should return reef specific string from address", () => {
    const result = addReefSpecificStringFromAddress(
      "0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2"
    );
    expect(result).toEqual(
      "0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2(ONLY for Reef chain!)"
    );
  });
});
describe("removeReefSpecificStringFromAddress", () => {
  it("should remove reef specific string from address", () => {
    const result = removeReefSpecificStringFromAddress(
      "0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2(ONLY for Reef chain!)"
    );
    expect(result).toEqual("0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2");
  });
  it("should not alter the address", () => {
    const result = removeReefSpecificStringFromAddress(
      "0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2"
    );
    expect(result).toEqual("0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2");
  });
});
