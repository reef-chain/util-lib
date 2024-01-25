import { describe, it, expect, beforeAll } from "vitest";
import { KeypairType } from "@reef-defi/util-crypto/types";
import { Keyring as ReefKeyring } from "@reef-defi/keyring";
import { cryptoWaitReady } from "@reef-defi/util-crypto";
import { KeyringPair } from "@reef-defi/keyring/types";
import { Provider } from "@reef-chain/evm-provider";
import { initProvider } from "../../src/network/providerUtil";
import { getEvmAddress } from "../../src/account/addressUtil";

describe("availableAddresses", () => {
  let provider: Provider;
  const mnemonic =
    "judge box bless much media say shrug crunch gun scorpion afraid object";
  const CRYPTO_TYPE: KeypairType = "sr25519";
  const SS58_FORMAT = 42;
  const keyring = new ReefKeyring({
    type: CRYPTO_TYPE,
    ss58Format: SS58_FORMAT,
  });

  let keyringPair: KeyringPair;

  beforeAll(async () => {
    await cryptoWaitReady();
    provider = await initProvider("wss://rpc-testnet.reefscan.com/ws");
    keyringPair = keyring.addFromMnemonic(mnemonic, {}, CRYPTO_TYPE);
  });

  it("should fetch evm address", async () => {
    const res = await getEvmAddress(keyringPair.address, provider);
    expect(res).toEqual("0x6d58ad955bdff99121ec07d2a4e96829f5f04746");
  });
  it("should throw error if evm doesn't exist", async () => {
    await expect(
      getEvmAddress(
        "5GQaLP6ap6JW4MbS22gVXLnUJxiVxCZzPA88cQfPSRZCYRNF",
        provider
      )
    ).rejects.toThrow("EVM address does not exist");
  });
});
