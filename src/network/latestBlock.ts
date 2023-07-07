import Pusher from "pusher-js";
import { from, map, Observable, shareReplay, switchMap, tap } from "rxjs";
import { filter } from "rxjs/operators";

const PUSHER_KEY = "fc5ad78eb31981de6c67";
const APP_CLUSTER = "eu";
let pusherClient;
let block$: Observable<PusherLatestBlock>;

const getPusher = async () => {
  if (!pusherClient) {
    pusherClient = new Pusher(PUSHER_KEY, {
      cluster: APP_CLUSTER,
    });

    pusherClient.connection.bind("error", function (err) {
      if (err.error.data.code === 4004) {
        console.log("Pusher Service Over limit!");
      }
    });
    const connectedPromise = new Promise(resolve => {
      pusherClient.connection.bind("connected", v => {
        resolve(true);
      });
    });
    await connectedPromise;
  }
  return pusherClient;
};

interface LatestBlock {
  blockHash: string;
  blockHeight: number;
  blockId: string;
}

interface PusherLatestBlock extends LatestBlock {
  updatedEvmAccounts: string[];
  updatedNativeAccounts: string[];
  updatedContracts: string[];
}

export interface LatestAddressUpdates extends LatestBlock {
  addresses: string[];
}

const latestBlockUpdates$ = from(getPusher()).pipe(
  switchMap((pusher: Pusher) => {
    return new Observable<PusherLatestBlock>(obs => {
      const channel = pusher.subscribe("reef-chain");
      channel.bind("block-finalised", data => {
        obs.next(data);
      });

      return () => {
        channel.unsubscribe();
      };
    });
  }),
  shareReplay(1)
);

export const _getBlockAccountTokenUpdates$ = (
  filterAccountAddresses: string[],
  latestBlockUpdates: Observable<PusherLatestBlock>
): Observable<LatestAddressUpdates> =>
  latestBlockUpdates.pipe(
    map((blockUpdates: PusherLatestBlock) => {
      const allUpdatedAccounts = blockUpdates.updatedEvmAccounts.concat(
        blockUpdates.updatedNativeAccounts
      );
      if (
        !filterAccountAddresses ||
        !filterAccountAddresses.filter(v => !!v).length
      ) {
        return {
          ...blockUpdates,
          addresses: allUpdatedAccounts,
        } as LatestAddressUpdates;
      }
      const filtered = allUpdatedAccounts.filter(addr =>
        filterAccountAddresses.some(a => addr.trim() === a.trim())
      );
      return { ...blockUpdates, addresses: filtered } as LatestAddressUpdates;
    }),
    filter(v => v != null && !!v.addresses.length)
  );

export const blockAccountTokenUpdates$ = (filterAccountAddresses: string[]) =>
  _getBlockAccountTokenUpdates$(filterAccountAddresses, latestBlockUpdates$);

export const blockContractEvents$ = (
  filterContractAddresses?: string[]
): Observable<string[]> =>
  latestBlockUpdates$.pipe(
    map((blockUpdates: PusherLatestBlock): string[] => {
      if (!filterContractAddresses || !filterContractAddresses.length) {
        return blockUpdates.updatedContracts;
      }
      return blockUpdates.updatedContracts.filter(addr =>
        filterContractAddresses.some(a => addr.trim() === a.trim())
      );
    }),
    filter(v => v != null && !!v.length)
  );
