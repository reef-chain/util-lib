import { setSelectedNetwork } from "./networkState";
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
  jsonAccounts?: {
    accounts:
      | AccountJson[]
      | InjectedAccountWithMeta[]
      | InjectedAccountWithMetaReef[];
    injectedSigner: InjectedSigningKey;
  };
  ipfsHashResolverFn?: IpfsUrlResolverFn;
  reefscanEventsConfig?: ReefscanEventsConnConfig;
}

export const initReefState = ({
  network,
  jsonAccounts,
  ipfsHashResolverFn,
  reefscanEventsConfig,
}: StateOptions) => {
  setNftIpfsResolverFn(ipfsHashResolverFn);
  if (reefscanEventsConfig) {
    setReefscanEventsConnConfig(reefscanEventsConfig);
  }
  setSelectedNetwork(network || AVAILABLE_NETWORKS.mainnet);
  if (jsonAccounts) {
    accountsJsonSigningKeySubj.next(jsonAccounts.injectedSigner);
    setAccounts(jsonAccounts.accounts);
  }
};
