import { beforeAll, describe, expect, it } from "vitest";
import { initReefState } from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";
import { resolveTokenUrl } from "../../src/utils/tokenIconUtils";

import { firstValueFrom, skip } from "rxjs";

describe("tx history inbound resolver test", () => {
  const accountId = "5EEiPfPx7iMJNNZN4UD4j8tdVox1fZqpEFbsFDmkKVzMLpLE";
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.mainnet,
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
      "0x70A82e21ec223c8691a0e44BEDC4790976Ea530c",
      "0x82269bBbf0ce08b0100380F968F333ecb8063c34",
      "0x468ff1d6544DE171394De9D9F47f3D276f7355bb",
      "0xecA974FF47843A05711D75a21293822Edd33C12F",
      "0x95a2AF50040B7256a4B4c405a4AfD4DD573DA115",
    ]);
    // console.log("result===",result);
  });
});
