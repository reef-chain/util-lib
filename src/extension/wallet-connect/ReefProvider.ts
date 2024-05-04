import { WsProvider } from "@polkadot/api";
import { Provider } from "@reef-chain/evm-provider";
import { SessionTypes } from "@walletconnect/types";

import { ReefInjectedProvider, Unsubcall } from "../extension-inject/types";
import { AVAILABLE_NETWORKS } from "../../network/network";
import { MAINNET_CHAIN_ID, TESTNET_CHAIN_ID } from "./utils";

let session: SessionTypes.Struct;

export default class ReefProvider implements ReefInjectedProvider {
  private rpcUrl: string | null = null;
  private provider: Provider | null = null;

  constructor(_session: SessionTypes.Struct) {
    session = _session;
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
    const account = session.namespaces.reef?.accounts?.length
      ? session.namespaces.reef.accounts[0]
      : undefined;
    if (!account) throw new Error("Provider URL not found");

    let rpcUrl = undefined;
    if (account.startsWith(MAINNET_CHAIN_ID)) {
      rpcUrl = AVAILABLE_NETWORKS.mainnet.rpcUrl;
    } else if (account.startsWith(TESTNET_CHAIN_ID)) {
      rpcUrl = AVAILABLE_NETWORKS.testnet.rpcUrl;
    } else {
      throw new Error("Provider URL not found");
    }

    if (rpcUrl !== this.rpcUrl || !this.provider) {
      this.provider = new Provider({
        provider: new WsProvider(rpcUrl),
      });
    }

    try {
      await this.provider.api.isReadyOrError;
    } catch (e) {
      console.log("Provider API not ready", e);
      throw e;
    }

    this.rpcUrl = rpcUrl;
    return this.provider;
  }
}
