import { describe, it, expect } from "vitest";
import { initReefState } from "../../src/reefState/initReefState";
import {
  AVAILABLE_NETWORKS,
  FlutterWebSocket,
  ReefWsProvider,
} from "../../src/network";
import { Subject, firstValueFrom } from "rxjs";
import { selectedProvider$ } from "../../src/reefState";

describe("should test custom ws provider", () => {
  // it("should connect to regular provider", async () => {
  //   initReefState({
  //     network: AVAILABLE_NETWORKS.testnet,
  //     jsonAccounts: {
  //       accounts: [
  //         {
  //           address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
  //           isSelected: true,
  //           meta: { source: "reef" },
  //         },
  //       ],
  //       injectedSigner: {},
  //     },
  //   });
  //   const provider = await firstValueFrom(selectedProvider$);
  //   const api = provider.api;

  //   const lastHeader = await api.rpc.chain.getHeader();
  //   expect(lastHeader.number).toBeDefined();
  // }),
  it("should connect to custom ws provider", async () => {
    const mobileWsProvider = new ReefWsProvider(
      AVAILABLE_NETWORKS.testnet.rpcUrl
    );
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
        customWsProvider: mobileWsProvider,
      },
    });
    const response = await firstValueFrom(mobileWsProvider.connectToFlutter());
    expect(response["data"]).toBeDefined();
  });
});
