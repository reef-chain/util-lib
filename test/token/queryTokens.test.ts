import { beforeAll, describe, expect, it } from "vitest";
import { initReefState } from "../../src/reefState/initReefState";
import {
  selectedNFTs_status$,
  selectedTokenBalances_status$,
  selectedTokenPrices_status$,
  selectedTransactionHistory_status$,
} from "../../src/reefState/tokenState.rx";
import { FeedbackStatusCode } from "../../src/reefState/model/statusDataObject";
import { firstValueFrom, skip, skipWhile, tap } from "rxjs";
import { AVAILABLE_NETWORKS } from "../../src/network/network";
import { REEF_ADDRESS } from "../../src/token/tokenModel";
import { httpClientInstance$ } from "../../src/graphql/httpClient";
import { accountsWithUpdatedIndexedData$ } from "../../src/reefState/account/accountsIndexedData";

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

  it.only("req", async () => {
    const httpClient = await firstValueFrom(httpClientInstance$);
    const addresses = ["5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN"];
    // const vv = await firstValueFrom(indexedAccountValues$.pipe(
    //     tap(v=>console.log('val=',v)),
    //     skip(9)));
    const vv = await firstValueFrom(
      accountsWithUpdatedIndexedData$.pipe(
        // tap(v => console.log("val=", v)),
        skip(3)
      )
    );
    // console.log('val=',vv);
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

  it("should return history", async () => {
    const res = await firstValueFrom(
      selectedTransactionHistory_status$.pipe(
        tap(v => console.log("NNNvv", v)),
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
