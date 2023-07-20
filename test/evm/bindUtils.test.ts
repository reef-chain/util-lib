import { bindEvmAddress } from "../../src/evm/bindUtil";
import { describe, it, expect, beforeAll } from "vitest";
import { KeyringPair } from "@reef-defi/keyring/types";
import { KeypairType } from "@reef-defi/util-crypto/types";
import { Keyring as ReefKeyring } from "@reef-defi/keyring";
import { cryptoWaitReady } from "@reef-defi/util-crypto";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { initProvider } from "../../src/network/providerUtil";
import { MnemonicSigner } from "./test";

describe("bindEvmAddress", () => {
  let provider: Provider;
  const mnemonic =
    "judge box bless much media say shrug crunch gun scorpion afraid object";
  const mnemonic2 =
    "design eyebrow enroll obey hat strategy lesson order shield patrol sadness bunker";
  const CRYPTO_TYPE: KeypairType = "sr25519";
  const SS58_FORMAT = 42;
  const keyring = new ReefKeyring({
    type: CRYPTO_TYPE,
    ss58Format: SS58_FORMAT,
  });
  let keyringPair: KeyringPair;

  beforeAll(async () => {
    provider = await initProvider("wss://rpc-testnet.reefscan.com/ws");
    await cryptoWaitReady();
    keyringPair = keyring.addFromUri(mnemonic, {}, CRYPTO_TYPE);
  });

  it("should return an empty string if no signer or provider", () => {
    const result = bindEvmAddress(null as any, null as any);
    expect(result).to.equal("");
  });

  it("should return an empty string evm already claimed", async () => {
    const implementedSigner = new MnemonicSigner(mnemonic);
    const signer = new Signer(provider, keyringPair.address, implementedSigner);

    const result = bindEvmAddress({ signer } as any, provider);
    expect(parseFloat(result)).toBeGreaterThan(0);
  });
});
