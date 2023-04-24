import { WsProvider, ApiPromise } from "@polkadot/api";
import { decodePayloadMethod } from "../../src/signature/tx-signature-util";
import { describe, it, expect } from "vitest";
import { beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";

describe("decodePayloadMethod", () => {
  let provider: WsProvider;
  let api: ApiPromise;

  beforeAll(async () => {
    provider = new WsProvider("wss://rpc-example.com");
    // TODO why defined api if it's not used
    api = await ApiPromise.create({ provider });
  });

  afterAll(async () => {
    provider.disconnect();
  });

  it("should decode method data for a contract method", async () => {
    // Replace the values below with your own method data and ABI
    const methodDataEncoded = "0x...";
    const abi = [
      {
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ];
    const decodedMethodData = await decodePayloadMethod(
      provider,
      methodDataEncoded,
      abi
    );

    expect(decodedMethodData.methodName).toEqual("balanceOf(address)");
    expect(decodedMethodData.args).toEqual(["0x123..."]);
    expect(decodedMethodData.info).toEqual(
      "Get the account balance of another account with address _owner."
    );
    expect(decodedMethodData.vm.evm.contractAddress).toEqual("0x456...");
    expect(decodedMethodData.vm.evm.decodedData.name).toEqual("balanceOf");
    expect(decodedMethodData.vm.evm.decodedData.params[0].toString()).toEqual(
      "0x123..."
    );
  });
});
