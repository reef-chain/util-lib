import { initReefState } from "../../src/reefState/initReefState";
import { describe, it, expect, beforeAll } from "vitest";
import { getSigner } from "../testUtils/signer";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { AVAILABLE_NETWORKS, initProvider } from "../../src/network";
import { KeyringPair } from "@reef-defi/keyring/types";
import { getKeyring } from "../testUtils/keyring";
import { mnemonic1 as mnemonic } from "../testUtils/mnemonics";
import { TEST_ACCOUNTS } from "../testUtils/test-accounts";
import { selectedAccount_status$ } from "../../src/reefState/account/selectedAccount";
import { firstValueFrom, race, skipWhile } from "rxjs";
import { selectedNFTs_status$ } from "../../src/reefState/tokenState.rx";
import { accountsWithUpdatedIndexedData$ } from "../../src/reefState/account/accountsIndexedData";
import {
  FeedbackStatusCode,
  StatusDataObject,
} from "../../src/reefState/model/statusDataObject";

describe("initReefState", () => {
  let provider: Provider;
  let keyringPair: KeyringPair;
  let signer: Signer;

  beforeAll(async () => {
    provider = await initProvider("wss://rpc-testnet.reefscan.com/ws");
    await provider.api.isReadyOrError;
    keyringPair = await getKeyring(mnemonic);
    signer = getSigner(provider, keyringPair.address, mnemonic);
    initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: { accounts: TEST_ACCOUNTS, injectedSigner: signer as any },
    });
  });
  it("should fetch first selected account", async () => {
    const res = await firstValueFrom(selectedAccount_status$.pipe());
    expect(res?.data).toEqual({
      address: "5GKKbUJx6DQ4rbTWavaNttanWAw86KrQeojgMNovy8m2QoXn",
      source: "reef",
    });
  });
  it("should test signer", async () => {
    const sigCompl = await firstValueFrom(
      accountsWithUpdatedIndexedData$.pipe(
        skipWhile(t => !t.hasStatus(FeedbackStatusCode.COMPLETE_DATA))
      )
    );
    expect(sigCompl.toJson().toString()).toEqual(
      `{"data":[{"data":{"address":"5GKKbUJx6DQ4rbTWavaNttanWAw86KrQeojgMNovy8m2QoXn","source":"reef","balance":{"type":"BigNumber","hex":"0x00"}},"_status":[{"code":6,"message":"Balance set","propName":"balance"},{"propName":"isEvmClaimed","code":2},{"propName":"isEvmClaimed","code":2}]},{"data":{"address":"5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP","source":"reef","isEvmClaimed":true,"evmAddress":"0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2","balance":{"type":"BigNumber","hex":"0x590442790aab592f979d"}},"_status":[{"code":6,"message":"Balance set","propName":"balance"},{"propName":"isEvmClaimed","code":2},{"propName":"isEvmClaimed","code":2},{"propName":"isEvmClaimed","code":6}]},{"data":{"address":"5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN","source":"reef","isEvmClaimed":true,"evmAddress":"0xfb730ec3f38aB358AafA2EdD3fB2C17a5337dD7C","balance":{"type":"BigNumber","hex":"0x4137bf52ef3f9a7be184"}},"_status":[{"code":6,"message":"Balance set","propName":"balance"},{"propName":"isEvmClaimed","code":2},{"propName":"isEvmClaimed","code":2},{"propName":"isEvmClaimed","code":6}]}],"status":[{"code":6,"message":"Balance set"}]}`
    );
  });
  it("should test nfts", async () => {
    let nfts = await firstValueFrom(selectedNFTs_status$);
    nfts = await firstValueFrom(
      selectedNFTs_status$.pipe(
        skipWhile(nfts => nfts.hasStatus(FeedbackStatusCode.LOADING))
      )
    );
    if (nfts.data.length) {
      console.log(
        nfts.hasStatus(FeedbackStatusCode.PARTIAL_DATA_LOADING),
        "Nft data should not be complete yet."
      );
    }
    nfts = await firstValueFrom(
      selectedNFTs_status$.pipe(
        skipWhile((nfts: StatusDataObject<any>) => {
          return !(
            nfts.hasStatus(FeedbackStatusCode.COMPLETE_DATA) &&
            nfts.getStatusList().length === 1
          );
        })
      )
    );
    // console.log(!nfts.data.find(nft => !nft.hasStatus(FeedbackStatusCode.COMPLETE_DATA)), 'Nft data not complete')
    expect(nfts.toJson().toString()).toEqual(
      `{"data":[],"status":[{"code":6}]}`
    );
  });
});
