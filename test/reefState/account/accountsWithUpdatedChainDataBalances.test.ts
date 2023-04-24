import { of } from "rxjs";
import { TestScheduler } from "rxjs/testing";
import { accountsWithUpdatedChainDataBalances$ } from "../../../src/reefState/account/accountsWithUpdatedChainDataBalances";
import { describe, it, expect } from "vitest";
import jest from "jest";
import { beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";

describe("accountsWithUpdatedChainDataBalances$", () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("should emit updated account balances", () => {
    const instantProviderMock = of(null);
    const availableAddressesMock = of([
      { address: "0x123", balance: null },
      { address: "0x456", balance: null },
    ]);
    const balancesAndSignersMock = {
      balances: [
        { address: "0x123", balance: "1000000000000000000" },
        { address: "0x456", balance: "2000000000000000000" },
      ],
      signers: [
        { address: "0x123", balance: null },
        { address: "0x456", balance: null },
      ],
    };

    scheduler.run(({ expectObservable }) => {
      const source$ = accountsWithUpdatedChainDataBalances$.pipe(
        switchMap(() => of(balancesAndSignersMock))
      );
      expectObservable(source$).toBe("(a|)", {
        a: {
          status: "success",
          message: "Balance set",
          data: [
            { address: "0x123", balance: "1000000000000000000" },
            { address: "0x456", balance: "2000000000000000000" },
          ],
        },
      });
    });
  });

  it("should emit an error status if there is an error", () => {
    const instantProviderMock = of(null);
    const availableAddressesMock = of([
      { address: "0x123", balance: null },
      { address: "0x456", balance: null },
    ]);

    scheduler.run(({ expectObservable }) => {
      const source$ = accountsWithUpdatedChainDataBalances$.pipe(
        switchMap(() => throwError("Error fetching balances"))
      );
      expectObservable(source$).toBe("(a|)", {
        a: {
          status: "error",
          message: "Error chain balance=Error fetching balances",
          data: null,
        },
      });
    });
  });
});
