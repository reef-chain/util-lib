import { beforeAll, describe, expect, it } from "vitest";
import { initReefState } from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";
import { resolveTokenUrl } from "../../src/utils/tokenIconUtils";

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

  it("should resolve token icon url", async () => {
    const result = await resolveTokenUrl([
      "0xecA974FF47843A05711D75a21293822Edd33C12F",
      "0xdBFcE10C9D858ACD7B983139508236D81A96F16F",
      "0xC854392F5feBCF3174c2f2737170a0E2AAfD81bf",
    ]);
    expect(result["0xC854392F5feBCF3174c2f2737170a0E2AAfD81bf"]).toEqual(
      "https://reef.infura-ipfs.io/ipfs/QmaTofmsLmi1sxGw2vuads9uzGJrH9T9ARNEY9WGQRKrTC"
    );
  });
});
