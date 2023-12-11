import { beforeAll, describe, it } from "vitest";
import { initReefState, selectedTokenBalances$ } from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";
import { firstValueFrom, skip } from "rxjs";
const axios = require("axios");
const { from, map } = require("rxjs");

describe("graphql tests", () => {
  const accountId = "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP";
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

  it("should log list of tokens", async () => {
    const response = await firstValueFrom(selectedTokenBalances$.pipe(skip(2)));
    console.log(
      response?.find(
        token => token.address === "0x6685129d58bbf9FCd567770eFf1b9875e1fA24Bc"
      )
    );
  });
});
