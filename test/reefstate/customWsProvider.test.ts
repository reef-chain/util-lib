import { describe, it, expect } from "vitest";
import { initReefState } from "../../src/reefState/initReefState";
import { AVAILABLE_NETWORKS } from "../../src/network";
import { firstValueFrom } from "rxjs";
import { selectedProvider$ } from "../../src/reefState";
import { WsProvider } from "@polkadot/api";
import {
  ProviderInterfaceEmitted,
  ProviderInterfaceEmitCb,
} from "@polkadot/rpc-provider/types";

class CustomWsProvider extends WsProvider {
  constructor(url: string) {
    console.log("using a custom provider for ", url);
    super(url);
  }

  // just simple provider
  send<T = any>(
    method: string,
    params: unknown[],
    isCacheable?: boolean | undefined,
    subscription?: any | undefined
  ): any {
    console.log("sending request from custom provider");
    super.send(method, params, isCacheable, subscription);
  }
}

describe("should test custom ws provider", () => {
  it("should connect to regular provider", async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: {
        accounts: [
          {
            address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            isSelected: true,
            meta: { source: "reef" },
          },
        ],
        injectedSigner: {},
      },
    });
    const provider = await firstValueFrom(selectedProvider$);
    const api = provider.api;

    const lastHeader = await api.rpc.chain.getHeader();
    expect(lastHeader.number).toBeDefined();
  }),
    it("should connect to custom ws provider", async () => {
      initReefState({
        network: AVAILABLE_NETWORKS.testnet,
        jsonAccounts: {
          accounts: [
            {
              address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
              isSelected: true,
              meta: { source: "reef" },
            },
          ],
          injectedSigner: {},
        },
        rpcConfig: {
          customWsProvider: new CustomWsProvider(
            AVAILABLE_NETWORKS.testnet.rpcUrl
          ),
        },
      });
      const provider = await firstValueFrom(selectedProvider$);
      const api = provider.api;

      const lastHeader = await api.rpc.chain.getHeader();
      expect(lastHeader.number).toBeDefined();
    });
});
