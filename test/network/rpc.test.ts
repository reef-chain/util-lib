import { describe, it, expect, beforeAll } from "vitest";
import {
  balanceOf,
  checkIfERC20ContractExist,
  getREEF20Contract,
} from "../../src/network/rpc";
import { getSigner } from "../testUtils/signer";
import { Provider } from "@reef-chain/evm-provider";
import { initProvider } from "../../src/network";
import { KeyringPair } from "@reef-defi/keyring/types";
import { getKeyring } from "../testUtils/keyring";
import { mnemonic1 as mnemonic } from "../testUtils/mnemonics";

// { name: 'Anukula', symbol: 'ANU', decimals: 18 }

describe("rpc tests", () => {
  let provider: Provider;
  let keyringPair: KeyringPair;
  let res: any;
  let balanceOfRes: any;
  let getREEF20ContractRes: any;
  beforeAll(async () => {
    provider = await initProvider("wss://rpc-testnet.reefscan.com/ws");
    await provider.api.isReadyOrError;
    keyringPair = await getKeyring(mnemonic);
    const address = "0x0bCCa87E32044992e15DD85De6a7382c618a2519";
    const signer = getSigner(provider, keyringPair.address, mnemonic);
    res = await checkIfERC20ContractExist(address, signer);
    balanceOfRes = await balanceOf(address, address, signer);
    getREEF20ContractRes = await getREEF20Contract(address, signer);
  });
  it("should return name of erc20 contract", async () => {
    expect(res?.name).toEqual("Anukula");
  });
  it("should return symbol of erc20 contract", async () => {
    expect(res?.symbol).toEqual("ANU");
  });
  it("should return decimals of erc20 contract", async () => {
    expect(res?.decimals).toEqual(18);
  });
  it("should return balance of address", async () => {
    expect(parseInt(balanceOfRes._hex, 16)).toEqual(0);
  });
  it("should return contract at address", async () => {
    expect(typeof getREEF20ContractRes.contract.functions.allowance).toEqual(
      "function"
    );
  });
});
