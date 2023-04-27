import { combineLatest, of } from "rxjs";
import { catchError, map, scan, shareReplay } from "rxjs/operators";
import { describe, it, expect } from "vitest";

// Import the function to be tested
import { accountsWithUpdatedIndexedData$ } from "../../../src/reefState/account/accountsIndexedData";

describe("accountsWithUpdatedIndexedData$", () => {
  it("should emit the expected result", () => {
    // Define some test data to use in the test
    const accountsWithChainBalance = {
      data: [{ data: { address: "0x123" } }],
      getStatusList: () => [],
    };
    const locallyUpdated = {
      data: [
        { data: { address: "0x456", isEvmClaimed: false, evmAddress: null } },
      ],
      getStatusList: () => [],
    };
    const indexed = {
      data: [{ address: "0x789", evm_address: null }],
      getStatusList: () => [],
    };

    // Define the expected output of the function
    const expectedOutput = {
      data: [
        { data: { address: "0x123", isEvmClaimed: false, evmAddress: null } },
      ],
      getStatusList: () => [],
    };

    // Set up a mock observable for each of the inputs to the combineLatest operator
    const accountsWithUpdatedChainDataBalances$ = of(accountsWithChainBalance);
    const accountsLocallyUpdatedData$ = of(locallyUpdated);
    const indexedAccountValues$ = of(indexed);

    // Call the function with the mock observables
    const result$ = accountsWithUpdatedIndexedData$(
      accountsWithUpdatedChainDataBalances$,
      accountsLocallyUpdatedData$,
      indexedAccountValues$
    );

    // Subscribe to the result observable and check that it emits the expected output
    result$.subscribe(result => {
      expect(result).toEqual(expectedOutput);
    });
  });
});
