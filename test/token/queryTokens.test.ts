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
import { accountsWithUpdatedIndexedData$ } from "../../src/reefState/account/accountsIndexedData";
import { BigNumber } from "ethers";
import { accounts_status$ } from "../../src/reefState";

const selectedAddress = "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN";
describe("get tokens", () => {
  const signingKey = {};
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.mainnet,
      jsonAccounts: {
        accounts: [
          {
            name: "test acc",
            address: selectedAddress,
            // address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            isSelected: true,
          },
        ],
        injectedSigner: signingKey,
      },
    });
  });

  it("test account indexed data", async () => {
    const res = await firstValueFrom(
      accountsWithUpdatedIndexedData$.pipe(
        skipWhile(
          value =>
            !value.hasStatus(FeedbackStatusCode.COMPLETE_DATA) ||
            value.getStatusList().length != 1
        )
      )
    );
    console.log("acc=", res.data[0].data);
    console.log(
      "balance =",
      res.data[0].data.balance?.div(BigNumber.from(10).pow(18)).toString()
    );
    expect(res.getStatusList().length).toBe(1);
    expect(res.hasStatus(FeedbackStatusCode.COMPLETE_DATA)).toBe(true);
    expect(res.data.length).greaterThan(0);
    expect(res.data[0].data.address).toEqual(selectedAddress);
    expect(res.data[0].data.balance?.gt("0")).toBeTruthy();
    expect(
      res.data[0].data.availableBalance?.gt(res.data[0].data.freeBalance)
    ).toBeTruthy();
    expect(res.data[0].data.isEvmClaimed).toBeDefined();
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
    console.log(
      "TTT=",
      res.data.map(t => t.data)
    );
    expect(res.data.length).greaterThan(0);
  });

  it("should return token prices", async () => {
    const res = await firstValueFrom(
      selectedTokenPrices_status$.pipe(
        // tap(v=>console.log('val=',v.data[1]?.data?.balance?.toString(), ' // acc=',v.data[1]?.data?.address)),
        // skip(100),
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
