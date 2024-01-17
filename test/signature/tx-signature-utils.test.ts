import { Provider } from "@reef-defi/evm-provider";
import { describe, it, expect, beforeAll } from "vitest";
import { initProvider } from "../../src/network";
import { decodePayloadMethod } from "../../src/signature/tx-signature-util";

describe("decodePayloadMethod", () => {
  let provider: Provider;
  const methodData =
    "0x150000000000000000000000000000000000010000001101a9059cbb0000000000000000000000007ca7886e0b851e6458770bc1d85feb6a5307b9a2000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000cb3c040000000000d0070000";

  beforeAll(async () => {
    provider = await initProvider("wss://rpc-testnet.reefscan.com/ws");
    await provider.api.isReadyOrError;
  });
  it("should decode method data", async () => {
    const res: any = await decodePayloadMethod(provider, methodData);
    expect(res.methodName).toEqual(
      "evm.call(target, input, value, gasLimit, storageLimit)"
    );
  });
});
