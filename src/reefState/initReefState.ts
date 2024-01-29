import { setSelectedNetwork } from "./networkState";
import { AVAILABLE_NETWORKS, Network } from "../network/network";
import { accountsJsonSigningKeySubj, setAccounts } from "./account/setAccounts";
import { setNftIpfsResolverFn } from "./token/nftUtils";
import { AccountJson } from "@reef-defi/extension-base/background/types";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { InjectedAccountWithMeta as InjectedAccountWithMetaReef } from "@reef-defi/extension-inject/types";
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

type destroyConnection = () => void;

export const initReefState = ({
  network,
  jsonAccounts,
  ipfsHashResolverFn,
  reefscanEventsConfig,
}: StateOptions): destroyConnection => {
  /*const subscription = selectedNetwork$
    .pipe(
      tap(network => {
        // initApolloClient(network, client);
        initHttpClient(network, httpClient);
      }),
      catchError(err => {
        console.log("initReefState kill$ ERROR=", err.message);
        return of(null);
      })
    )*/
  /*const subscription = selectedNetwork$.pipe(
        switchMap((network) => initProvider(network.rpcUrl)
            .then((provider) => ({
                provider,
                network,
            }))),
        scan((state: { provider: Provider | undefined }, newVal: { provider: Provider, network }) => {
            if (state.provider) {
                disconnectProvider(state.provider);
            }
            return {provider: newVal.provider, network: newVal.network};
        }, {provider: undefined}),
        tap((p_n: { provider: Provider, network: Network }) => {
            setSelectedProvider(p_n.provider);
        }),
        tap((p_n) => {
            initApolloClient(p_n.network, client);
        }),
        finalizeWithValue(((p_n) => p_n?disconnectProvider(p_n.provider):null)),
        catchError((err) => {
            console.log('initReefState kill$ ERROR=', err.message);
            return of(null);
        }),
    )*/
  /*.subscribe({
      error: e => {
        console.log("initReefState ERR=", e);
      },
    });*/
  setNftIpfsResolverFn(ipfsHashResolverFn);
  if (reefscanEventsConfig) {
    setReefscanEventsConnConfig(reefscanEventsConfig);
  }
  setSelectedNetwork(network || AVAILABLE_NETWORKS.mainnet);
  /*if (signers) {
        accountsSubj.next(signers);
    }*/
  if (jsonAccounts) {
    accountsJsonSigningKeySubj.next(jsonAccounts.injectedSigner);
    setAccounts(jsonAccounts.accounts);
  }
  // return () => subscription.unsubscribe();
  return () => {
    /* do nothing */
  };
};

/*

function initApolloClient(
  selectedNetwork?: Network,
  client?: ApolloClient<any>
) {
  if (selectedNetwork) {
    if (!client) {
      const gqlUrls = getGQLUrls(selectedNetwork);
      if (gqlUrls) {
        setGraphQlUrls(gqlUrls);
      }
    } else {
      apolloClientSubj.next(client);
    }
  }
}
*/
