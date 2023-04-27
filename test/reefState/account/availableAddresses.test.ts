import { TestScheduler } from "rxjs/testing";
import { availableAddresses$ } from "../../../src/reefState/account/availableAddresses";
import { describe, it, expect } from "vitest";
import jest from "jest";
import { beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";

describe("availableAddresses$", () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("should transform the account data correctly", () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const accountData = [
        { address: "0x123", meta: { source: "extension" } },
        { address: "0x456", source: "injected" },
      ];
      const accountsJsonSubj = cold("--a|", { a: accountData });

      expectObservable(availableAddresses$).toBe("--a|", {
        a: [
          { address: "0x123", source: "extension" },
          { address: "0x456", source: "injected" },
        ],
      });
    });
  });
});
