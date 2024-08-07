import { ReplaySubject } from "rxjs";
import { Network } from "../network/network";
import { WsProvider } from "@polkadot/api";

// const providerSubj: ReplaySubject<Provider> = new ReplaySubject<Provider>(1);
const selectedNetworkSubj: ReplaySubject<Network> = new ReplaySubject<Network>(
  1
);

export interface RpcConfig {
  autoConnectMs?: number;
  customWsProvider?: WsProvider;
}

export let rpcConfig: RpcConfig = {};

export const ACTIVE_NETWORK_LS_KEY = "reef-app-active-network";
export const selectedNetwork$ = selectedNetworkSubj.asObservable();
export const setSelectedNetwork = (network: Network): void => {
  if (network != null) {
    try {
      localStorage.setItem(ACTIVE_NETWORK_LS_KEY, JSON.stringify(network));
    } catch (e) {
      // when cookies disabled localStorage can throw
    }
  }
  selectedNetworkSubj.next(network);
};
selectedNetwork$.subscribe(network =>
  console.log("SELECTED NETWORK=", network.rpcUrl)
);

export const setRpcConfig = (conf: RpcConfig) => {
  rpcConfig = { ...rpcConfig, ...conf };
};
