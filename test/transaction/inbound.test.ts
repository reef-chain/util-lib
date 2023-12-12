import { beforeAll, describe, expect, it } from "vitest";
import {
  initReefState,
  selectedTransactionHistory$,
  selectedTransactionHistory_status$,
} from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";

import { firstValueFrom, skip } from "rxjs";

describe("tx history inbound resolver test", () => {
  const accountId = "5EEiPfPx7iMJNNZN4UD4j8tdVox1fZqpEFbsFDmkKVzMLpLE";
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: {
        accounts: [
          {
            address: accountId,
            isSelected: true,
            meta: { source: "reef" },
          },
        ],
        injectedSigner: {},
      },
    });
  });

  it("should return tx history ", async () => {
    const observer = {
      next: val => {
        // do nothing
      },
      error: err => console.log("error=", err),
      complete: () => console.log("completed"),
    };
    // selectedTokenBalances$.subscribe(observer);

    const transfers = await firstValueFrom(
      selectedTransactionHistory_status$.pipe(skip(1))
    );
    console.log(transfers);
    expect(transfers.data != undefined);
  });
});
