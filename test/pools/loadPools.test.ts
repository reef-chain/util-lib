import { beforeAll, describe, it, expect } from "vitest";
import { firstValueFrom, skip, skipWhile, tap } from "rxjs";
import { initReefState, selectedPools_status$ } from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";
import { fetchPools$, loadPool } from "../../src/pools/pools";

describe("pools", () => {
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
  it("should load pool details", async () => {
    const res = await firstValueFrom(selectedPools_status$.pipe(skip(10)));
    expect(res.data.length).toBeGreaterThan(0);
  });
});
