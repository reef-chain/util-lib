import { WsProvider } from "@polkadot/api";
import { Provider } from "@reef-chain/evm-provider";

import { ReefInjectedProvider, Unsubcall } from "../extension-inject/types";
import { SendSnapRequest } from "./types";

export default class ReefProvider implements ReefInjectedProvider {
  private readonly sendRequest: SendSnapRequest;
  private rpcUrl: string | null = null;
  private provider: Provider | null = null;

  constructor(_sendRequest: SendSnapRequest) {
    this.sendRequest = _sendRequest;
    this.getNetworkProvider();
  }

  subscribeSelectedNetwork(cb: (rpcUrl: string) => void): void {
    // NOTE: Not using subscription
    cb(this.rpcUrl || "");
  }

  subscribeSelectedNetworkProvider(
    cb: (provider: Provider) => void
  ): Unsubcall {
    // NOTE: Not using subscription
    if (this.provider) {
      cb(this.provider);
    }
    return (): void => {};
  }

  public async getNetworkProvider(): Promise<Provider> {
    const network = await this.sendRequest("getNetwork");
    if (!network?.rpcUrl) throw new Error("Provider URL not found");

    if (network.rpcUrl !== this.rpcUrl || !this.provider) {
      this.provider = new Provider({
        provider: new WsProvider(network.rpcUrl),
      });
    }

    try {
      await this.provider.api.isReadyOrError;
    } catch (e) {
      console.log("Provider API not ready", e);
      throw e;
    }

    this.rpcUrl = network.rpcUrl;
    return this.provider;
  }
}
