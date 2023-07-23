import { beforeAll, describe, expect, it } from "vitest";
import {
  FeedbackStatusCode,
  initReefState,
  selectedTokenBalances_status$,
  selectedTokenPrices_status$,
} from "../src/reefState";
import { firstValueFrom, skip, skipWhile, tap } from "rxjs";
import { AVAILABLE_NETWORKS } from "../src/network";
import { REEF_ADDRESS } from "../src/token";
import { getContractAbi } from "../src/signature/tx-signature-util";

describe("contract data", () => {
  const signingKey = {};
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: {
        accounts: [
          {
            address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            isSelected: true,
          },
        ],
        injectedSigner: signingKey,
      },
    });
  });

  it("should return contract ABI", async () => {
    const res1 = await getContractAbi(REEF_ADDRESS);
    expect(res1.length).toBe(14);

    const res = await getContractAbi(
      "0x9cA9C51Cf5F145f146C1BD2084158AA689B296d8"
    );
    expect(res.length).toBe(73);
  });
});
