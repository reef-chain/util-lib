import { describe, it, expect } from "vitest";
import { network } from "../../src/index";

describe("dex functions", () => {
  it("should return testnet reefswap config", () => {
    const res = network.getReefswapNetworkConfig(
      network.AVAILABLE_NETWORKS.testnet
    );
    expect(res).toEqual({
      factoryAddress: "0x06D7a7334B9329D0750FFd0a636D6C3dFA77E580",
      routerAddress: "0xa29DFc7329ac30445Ba963E313fD26E171722057",
      graphqlDexsUrl: "https://squid.subsquid.io/reef-swap-testnet/graphql",
    });
  });
});
