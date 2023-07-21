import { describe, it, expect, beforeAll } from "vitest";
import { getSigner } from "../testUtils/signer";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { initProvider } from "../../src/network";
import { KeyringPair } from "@reef-defi/keyring/types";
import { getKeyring } from "../testUtils/keyring";
import { mnemonic1 as mnemonic } from "../testUtils/mnemonics";
import { getREEF20Contract } from "../../src/network/rpc";
import {
  nativeTransferSigner$,
  nativeTransfer$,
  reef20Transfer$,
} from "../../src/transaction/token-transfer-util";
import { Observable } from "rxjs";

describe("token transfer util tests", () => {
  let provider: Provider;
  let keyringPair: KeyringPair;
  let signer: Signer;
  let getREEF20ContractRes: any;

  beforeAll(async () => {
    provider = await initProvider("wss://rpc-testnet.reefscan.com/ws");
    await provider.api.isReadyOrError;
    keyringPair = await getKeyring(mnemonic);
    const address = "0x0bCCa87E32044992e15DD85De6a7382c618a2519";
    signer = getSigner(provider, keyringPair.address, mnemonic);
    getREEF20ContractRes = await getREEF20Contract(address, signer);
  });

  it("should be an Observable for nativeTransferSigner$", async () => {
    const res = nativeTransferSigner$(
      "10000000000000000000",
      signer,
      "5HWEZvfy8uUsxqNTNuxrkMrDmAmkECzC2GCjcn2KLtKZuJaw"
    );
    expect(res).toBeInstanceOf(Observable);
  });
  it("should be an Observable nativeTransfer$", async () => {
    const res = nativeTransfer$(
      "10000000000000000000",
      keyringPair.address,
      "5HWEZvfy8uUsxqNTNuxrkMrDmAmkECzC2GCjcn2KLtKZuJaw",
      provider,
      { signer } as any
    );
    expect(res).toBeInstanceOf(Observable);
  });
  it("should be an Observable for reef20Transfer$", async () => {
    const res = reef20Transfer$(
      "5HWEZvfy8uUsxqNTNuxrkMrDmAmkECzC2GCjcn2KLtKZuJaw",
      provider,
      "10000000000000000000",
      getREEF20ContractRes.contract
    );
    expect(res).toBeInstanceOf(Observable);
  });
});
