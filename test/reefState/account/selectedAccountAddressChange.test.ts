import { of } from "rxjs";
import { TestScheduler } from "rxjs/testing";
import { distinctUntilChanged, filter, shareReplay } from "rxjs/operators";
import { selectedAccountAddressChange$ } from "../../../src/reefState/account/selectedAccountAddressChange";
import { describe, it, expect } from "vitest";
import { beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";

describe("selectedAccountAddressChange$", () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("should emit distinct account address changes", () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const account1 = { address: "0x123", balance: "100" };
      const account2 = { address: "0x456", balance: "200" };
      const account3 = { address: "0x789", balance: "300" };

      const status1 = {
        data: account1,
        status: "COMPLETE_DATA",
        statusList: [],
      };
      const status2 = {
        data: account2,
        status: "COMPLETE_DATA",
        statusList: [],
      };
      const status3 = {
        data: account3,
        status: "COMPLETE_DATA",
        statusList: [],
      };

      const source$ = cold("abc", {
        a: null,
        b: status1,
        c: status2,
      });
      const expected$ = "x-y";
      const expectedValues = {
        x: status1,
        y: status3,
      };

      const result$ = source$.pipe(
        selectedAccountAddressChange$,
        filter(v => !!v),
        distinctUntilChanged((s1, s2) => s1.data.address === s2.data.address),
        shareReplay(1)
      );

      expectObservable(result$).toBe(expected$, expectedValues);
    });
  });
});
