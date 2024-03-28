import { RpcConfig, setRpcConfig, setSelectedNetwork } from "./networkState";
import { setSelectedExtension } from "./extensionState";
import { AVAILABLE_NETWORKS, Network } from "../network/network";
import { accountsJsonSigningKeySubj, setAccounts } from "./account/setAccounts";
import { setNftIpfsResolverFn } from "./token/nftUtils";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import {
  InjectedAccountWithMeta as InjectedAccountWithMetaReef,
  AccountJson,
} from "../extension";
import { Signer as InjectedSigningKey } from "@polkadot/api/types";
import { IpfsUrlResolverFn } from "./ipfsUrlResolverFn";
import {
  ReefscanEventsConnConfig,
  setReefscanEventsConnConfig,
} from "../utils/reefscanEvents";

export interface StateOptions {
  network?: Network;
  extension?: string;
  jsonAccounts?: {
    accounts:
      | AccountJson[]
      | InjectedAccountWithMeta[]
      | InjectedAccountWithMetaReef[];
    injectedSigner: InjectedSigningKey;
  };
  ipfsHashResolverFn?: IpfsUrlResolverFn;
  reefscanEventsConfig?: ReefscanEventsConnConfig;
  rpcConfig?: RpcConfig;
}

export const initReefState = ({
  network,
  extension,
  jsonAccounts,
  ipfsHashResolverFn,
  reefscanEventsConfig,
  rpcConfig,
}: StateOptions) => {
  setNftIpfsResolverFn(ipfsHashResolverFn);
  if (reefscanEventsConfig) {
    setReefscanEventsConnConfig(reefscanEventsConfig);
  }
  if (rpcConfig) {
    setRpcConfig(rpcConfig);
  }
  setSelectedNetwork(network || AVAILABLE_NETWORKS.mainnet);
  setSelectedExtension(extension);
  if (jsonAccounts) {
    accountsJsonSigningKeySubj.next(jsonAccounts.injectedSigner);
    setAccounts(jsonAccounts.accounts);
  }
};
