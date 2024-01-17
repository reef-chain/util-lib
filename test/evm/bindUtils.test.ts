import { bindEvmAddress } from "../../src/evm/bindUtil";
import { describe, it, expect, beforeAll } from "vitest";
import { KeyringPair } from "@reef-defi/keyring/types";
import { Provider } from "@reef-defi/evm-provider";
import { initProvider } from "../../src/network/providerUtil";
import { getSigner } from "../testUtils/signer";
import { mnemonic1 as mnemonic } from "../testUtils/mnemonics";
import { getKeyring } from "../testUtils/keyring";

describe("bindEvmAddress", () => {
  let provider: Provider;
  let keyringPair: KeyringPair;

  beforeAll(async () => {
    provider = await initProvider("wss://rpc-testnet.reefscan.com/ws");
    keyringPair = await getKeyring(mnemonic);
  });

  it("should return an empty string if no signer or provider", () => {
    const result = bindEvmAddress(null as any, null as any);
    expect(result).to.equal("");
  });

  it("should return an empty string evm already claimed", async () => {
    const signer = getSigner(provider, keyringPair.address, mnemonic);
    const result = bindEvmAddress({ signer } as any, provider);
    expect(parseFloat(result)).toBeGreaterThan(0);
  });
});
