import { beforeAll, describe, expect, it } from "vitest";
import {
  FeedbackStatusCode,
  initReefState,
  selectedNFTs_status$,
  selectedTokenBalances_status$,
  selectedTokenPrices_status$,
} from "../../src/reefState";
import { firstValueFrom, skip, skipWhile, tap } from "rxjs";
import { AVAILABLE_NETWORKS } from "../../src/network";
import { REEF_ADDRESS } from "../../src/token";

describe("get tokens", () => {
  const signingKey = {};
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.mainnet,
      jsonAccounts: {
        accounts: [
          {
            address: "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
            // address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            isSelected: true,
          },
        ],
        injectedSigner: signingKey,
      },
    });
  });

  it("should return ft balances", async () => {
    const res = await firstValueFrom(
      selectedTokenBalances_status$.pipe(
        skipWhile(
          value =>
            !value.hasStatus(FeedbackStatusCode.COMPLETE_DATA) ||
            value.getStatusList().length != 1
        )
      )
    );
    expect(res.getStatusList().length).toBe(1);
    expect(res.hasStatus(FeedbackStatusCode.COMPLETE_DATA)).toBe(true);
    expect(res.data.length).greaterThan(0);
  });

  it("should return token prices", async () => {
    const res = await firstValueFrom(
      selectedTokenPrices_status$.pipe(
        skipWhile(value => {
          const reef = value.data.find(v => v.data.address === REEF_ADDRESS);
          return reef ? !reef.data.price : true;
        })
      )
    );
    expect(res.hasStatus(FeedbackStatusCode.COMPLETE_DATA)).toBe(true);
    const reef = res.data.find(v => v.data.address === REEF_ADDRESS);
    expect(reef?.data.price).greaterThan(0);
    expect(res.data.length).greaterThan(0);
  }, 20000);

  it("should return nfts", async () => {
    const res = await firstValueFrom(
      selectedNFTs_status$.pipe(
        tap(v => console.log("NNN", v)),
        skipWhile(
          value =>
            !value.hasStatus(FeedbackStatusCode.COMPLETE_DATA) ||
            value.getStatusList().length != 1
        )
      )
    );
    expect(res.hasStatus(FeedbackStatusCode.COMPLETE_DATA)).toBe(true);
    expect(res.data.length).greaterThan(0);
  }, 20000);
});
