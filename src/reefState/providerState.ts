import {
  combineLatestWith,
  defer,
  distinctUntilChanged,
  finalize,
  map,
  mergeScan,
  Observable,
  shareReplay,
  startWith,
  Subject,
  tap,
} from "rxjs";
import { Provider } from "@reef-defi/evm-provider";
import { disconnectProvider, initProvider } from "../network/providerUtil";
import { filter } from "rxjs/operators";
import { selectedNetwork$ } from "./networkState";
import {
  getCollectedWsStateValue$,
  WsConnectionState,
} from "./ws-connection-state";
import { Network } from "../network/network";
import { forceReload$ } from "./token/force-reload-tokens";

const providerConnStateSubj = new Subject<WsConnectionState>();
export const providerConnState$: Observable<WsConnectionState> =
  getCollectedWsStateValue$(providerConnStateSubj);

async function connectProvider(
  currNet: Network,
  resolve: (
    value:
      | PromiseLike<{
          provider: Provider | undefined;
          network: Network;
        }>
      | { provider: Provider | undefined; network: Network }
  ) => void
) {
  try {
    const pr: Provider = await initProvider(
      currNet.rpcUrl,
      providerConnStateSubj
    );
    console.log("PROVIDER CONNECTED");
    resolve({ provider: pr, network: currNet });
  } catch (err) {
    resolve({ provider: undefined, network: currNet });
  }
}

export const selectedNetworkProvider$: Observable<{
  provider: Provider;
  network: Network;
}> = selectedNetwork$.pipe(
  combineLatestWith(forceReload$),
  mergeScan(
    (
      pr_url: {
        provider: Provider | undefined;
        network: Network | undefined;
      },
      [currNet, _]: [Network, any]
    ) => {
      if (
        pr_url.network?.rpcUrl === currNet.rpcUrl &&
        !!pr_url.provider &&
        pr_url.provider.api.isConnected
      ) {
        return Promise.resolve(pr_url);
      }
      return new Promise<{ provider: Provider | undefined; network: Network }>(
        (resolve, _reject) => {
          // if (pr_url.provider) {
          //   try {
          disconnectProvider(pr_url.provider)
            .catch(param => {
              console.log("Error disconnecting provider=", param.message);
            })
            .finally(() => {
              return connectProvider(currNet, resolve);
            });
          console.log("PROVIDER DISCONNECTED");
          /*} catch (e: any) {

            }*/
          // }
          // await connectProvider(currNet, resolve);
        }
      );
    },
    { provider: undefined, network: undefined }
  ),
  filter(p_n => !!p_n.provider && !!p_n.network),
  map(p_n => p_n as { provider: Provider; network: Network }),
  distinctUntilChanged((v1, v2) => v1.network.rpcUrl === v2.network.rpcUrl),
  // TODO check if it's called on last unsubscribe
  finalizeWithValue(n_p => (n_p ? disconnectProvider(n_p.provider) : null)),
  shareReplay(1)
);

export const selectedProvider$ = selectedNetworkProvider$.pipe(
  map(n_p => n_p.provider),
  shareReplay(1)
);
export const instantProvider$ = selectedProvider$.pipe(
  startWith(undefined),
  shareReplay(1)
);

function finalizeWithValue<T>(callback: (value: T) => void) {
  return (source: Observable<T>) =>
    defer(() => {
      let lastValue: T;
      return source.pipe(
        tap(value => (lastValue = value)),
        finalize(() => callback(lastValue))
      );
    });
}
