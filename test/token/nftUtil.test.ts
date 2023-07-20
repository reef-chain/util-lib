import { describe, it, expect, beforeAll } from "vitest";
import { resolveNftImageLinks } from "../../src/token/nftUtil";
import { Provider } from "@reef-defi/evm-provider";
import { initProvider } from "../../src/network/providerUtil";

describe("resolveNftImageLinks$", () => {
  let provider: Provider;

  beforeAll(async () => {
    provider = await initProvider("wss://rpc.reefscan.com/ws");
  });

  it("should resolve nft image links", () => {
    // const result = resolveNftImageLinks(
    //     [null],
    // );
  });
});
