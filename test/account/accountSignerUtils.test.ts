import { describe, it, expect, beforeAll } from "vitest";
import { KeyringPair } from "@reef-defi/keyring/types";
import { Provider, Signer } from "@reef-chain/evm-provider";
import { initProvider } from "../../src/network/providerUtil";
import { getSigner } from "../testUtils/signer";
import { mnemonic1 as mnemonic } from "../testUtils/mnemonics";
import { getKeyring } from "../testUtils/keyring";
import { getReefAccountSigner } from "../../src/account/accountSignerUtils";
import { ReefAccount } from "../../src/account/accountModel";

describe("account signer utils", () => {
  let provider: Provider;
  let keyringPair: KeyringPair;
  let signer: Signer;

  beforeAll(async () => {
    provider = await initProvider("wss://rpc-testnet.reefscan.com/ws");
    keyringPair = await getKeyring(mnemonic);
    signer = getSigner(provider, keyringPair.address);
  });

  it("should not return any signer if no provider", async () => {
    try {
      const res = await getReefAccountSigner(
        { address: "", source: "" } as ReefAccount,
        null as any
      );
      expect(res).toEqual(undefined);
    } catch (error) {}
  });
  it("should return same substrate address as signer", async () => {
    const res = getSigner(provider, keyringPair.address);
    expect(res._substrateAddress).toEqual(
      "5FnuRnDoK9J6b7RfeixeWUKs63ikPqN5mVMVXd3qD14SArbC"
    );
  });
});
