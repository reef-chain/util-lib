import { describe, it, expect, beforeAll } from "vitest";
import { getSigner } from "../testUtils/signer";
import { Provider, Signer } from "@reef-chain/evm-provider";
import { AVAILABLE_NETWORKS, initProvider } from "../../src/network";
import { KeyringPair } from "@reef-defi/keyring/types";
import { getKeyring } from "../testUtils/keyring";
import { mnemonic1 as mnemonic } from "../testUtils/mnemonics";
import {
  getExtrinsicUrl,
  getContractUrl,
} from "../../src/token/transactionUtil";

describe("token transfer util tests", () => {
  let provider: Provider;
  let keyringPair: KeyringPair;
  let signer: Signer;

  beforeAll(async () => {
    provider = await initProvider("wss://rpc-testnet.reefscan.com/ws");
    await provider.api.isReadyOrError;
    keyringPair = await getKeyring(mnemonic);
    const address = "0x0bCCa87E32044992e15DD85De6a7382c618a2519";
    signer = getSigner(provider, keyringPair.address, mnemonic);
  });

  it("should return extrinsic url", async () => {
    const res = getExtrinsicUrl(
      "0xaaecd50afdaba4c6af5d8a9fc2c0319659ee35bf3d6d69dac1ccfc584d039061",
      AVAILABLE_NETWORKS.testnet
    );
    expect(res).toEqual(
      "https://testnet.reefscan.info/extrinsic/0xaaecd50afdaba4c6af5d8a9fc2c0319659ee35bf3d6d69dac1ccfc584d039061"
    );
  });

  it("should return contract url", async () => {
    const res = getContractUrl(
      "0x0bCCa87E32044992e15DD85De6a7382c618a2519",
      AVAILABLE_NETWORKS.testnet
    );
    expect(res).toEqual(
      "https://testnet.reefscan.info/contract/0x0bCCa87E32044992e15DD85De6a7382c618a2519"
    );
  });
});
