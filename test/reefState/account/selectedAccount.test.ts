import { describe, it, expect } from "vitest";
import { take } from "rxjs/operators";
import { selectedAccount_status$ } from "../../../src/reefState/account/selectedAccount";

describe("selectedAccount_status$", () => {
  it("should return undefined if there is no selectedAddress or signers", () => {
    const expectedOutput = undefined;
    selectedAccount_status$.pipe(take(1)).subscribe(result => {
      expect(result).toEqual(expectedOutput);
    });
  });

  it("should return the first signer if the selectedAddress is not found", () => {
    const expectedOutput = { address: "0x456", statusList: ["success"] };
    selectedAccount_status$.pipe(take(1)).subscribe(result => {
      expect(result).toEqual(expectedOutput);
    });
  });

  it("should return the found signer", () => {
    const expectedOutput = { address: "0x123", statusList: ["success"] };
    selectedAccount_status$.pipe(take(1)).subscribe(result => {
      expect(result).toEqual(expectedOutput);
    });
  });

  it("should catch errors and return undefined", () => {
    const expectedOutput = undefined;
    selectedAccount_status$.pipe(take(1)).subscribe(result => {
      expect(result).toEqual(expectedOutput);
      expect(console.log).toHaveBeenCalledWith(
        "selectedAccount_status$ ERROR=",
        "test error"
      );
    });
  });
});
