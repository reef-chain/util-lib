import Pusher from "pusher-js";
import {
  catchError,
  from,
  map,
  mergeScan,
  Observable,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import { filter } from "rxjs/operators";
import { selectedNetwork$ } from "../reefState/networkState";
import { AVAILABLE_NETWORKS, Network } from "./network";

const PUSHER_KEY = "fc5ad78eb31981de6c67";
const APP_CLUSTER = "eu";
const INDEXED_BLOCK_CHANNEL_NAME = "reef-chain";

export const enum AccountIndexedTransactionType {
  REEF20_TRANSFER,
  REEF_NFT_TRANSFER,
  REEF_BIND_TX,
}

const allIndexedTransactions = [
  AccountIndexedTransactionType.REEF_BIND_TX,
  AccountIndexedTransactionType.REEF_NFT_TRANSFER,
  AccountIndexedTransactionType.REEF20_TRANSFER,
];

const getPusherClient = (
  pusherKey: string,
  pusherCluster: string
): Promise<Pusher> => {
  return new Promise((resolve, reject) => {
    const pClient = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });
    pClient.connection.bind("error", function (err) {
      if (err.error.data.code === 4004) {
        console.log("Pusher Service Over limit!");
        return;
      }
      console.log("Pusher Service ERR", err);
      reject("Pusher connect error=" + err?.error?.message);
    });

    pClient.connection.bind("connected", () => {
      console.log("pusher connected");
      resolve(pClient);
    });
  });
};

interface LatestBlock {
  blockHash: string;
  blockHeight: number;
  blockId: string;
}

export interface PusherLatestBlock extends LatestBlock {
  updatedAccounts: {
    REEF20Transfers: string[];
    REEF721Transfers: string[];
    REEF1155Transfers: string[];
    boundEvm: string[];
  };
  updatedContracts: string[];
}

export interface LatestAddressUpdates extends LatestBlock {
  addresses: string[];
}

export interface PusherConfig {
  pusherKey: string;
  pusherCluster: string;
}

export const latestBlockUpdates$ = selectedNetwork$.pipe(
  mergeScan(
    (acc: { pusher?: Pusher; network?: Network; pusherKey?: string }, curr) => {
      let pusher$;
      let pusherKey;
      if (
        !acc.pusherKey ||
        (curr.options as PusherConfig)?.pusherKey !== acc.pusherKey
      ) {
        acc.pusher?.disconnect();
        pusherKey = (curr.options as PusherConfig)?.pusherKey || PUSHER_KEY;
        pusher$ = from(
          getPusherClient(
            pusherKey,
            (curr.options as PusherConfig)?.pusherCluster || APP_CLUSTER
          )
        );
      }
      if (!pusher$) {
        pusher$ = of(acc.pusher);
      }
      return pusher$.pipe(
        map(pusher => ({ pusher, network: curr, pusherKey }))
      );
    },
    { pusher: undefined, network: undefined, pusherKey: undefined }
  ),
  filter((v): v is NonNullable<never> => !!v.pusher && !!v.network),
  switchMap(({ pusher, network }: { pusher: Pusher; network: Network }) => {
    return new Observable<PusherLatestBlock>(obs => {
      const channelEvent =
        network.name === AVAILABLE_NETWORKS.mainnet.name
          ? "block-finalised"
          : "block-finalised-testnet";
      const channel = pusher.subscribe(INDEXED_BLOCK_CHANNEL_NAME);
      channel.bind(channelEvent, data => {
        obs.next(data);
      });

      return () => {
        channel.unsubscribe();
      };
    });
  }),

  shareReplay(1)
);

const getUpdatedAccounts = (
  blockUpdates: PusherLatestBlock,
  filterTransactionType?: AccountIndexedTransactionType
) => {
  switch (filterTransactionType) {
    case AccountIndexedTransactionType.REEF_NFT_TRANSFER:
      return Array.from(
        new Set(
          blockUpdates.updatedAccounts.REEF1155Transfers.concat(
            blockUpdates.updatedAccounts.REEF721Transfers
          )
        )
      );
    case AccountIndexedTransactionType.REEF20_TRANSFER:
      return blockUpdates.updatedAccounts.REEF20Transfers;
    case AccountIndexedTransactionType.REEF_BIND_TX:
      return blockUpdates.updatedAccounts.boundEvm;
  }
  const allUpdated = Object.keys(blockUpdates.updatedAccounts).reduce(
    (mergedArr: string[], key: string) => {
      return mergedArr.concat(blockUpdates.updatedAccounts[key]);
    },
    []
  );
  return Array.from(new Set(allUpdated));
};

function hasTransactionForTypes(
  blockUpdates: PusherLatestBlock,
  filterTransactionType: AccountIndexedTransactionType[]
) {
  if (!filterTransactionType.length) {
    return true;
  }

  return filterTransactionType.some(tt => {
    switch (tt) {
      case AccountIndexedTransactionType.REEF20_TRANSFER:
        if (blockUpdates.updatedAccounts.REEF20Transfers.length) {
          return true;
        }
        break;
      case AccountIndexedTransactionType.REEF_NFT_TRANSFER:
        if (
          blockUpdates.updatedAccounts.REEF721Transfers.length ||
          blockUpdates.updatedAccounts.REEF1155Transfers.length
        ) {
          return true;
        }
        break;
      case AccountIndexedTransactionType.REEF_BIND_TX:
        if (blockUpdates.updatedAccounts.boundEvm.length) {
          return true;
        }
        break;
    }
    return false;
  });
}

export const _getBlockAccountTransactionUpdates$ = (
  latestBlockUpdates$: Observable<PusherLatestBlock>,
  filterAccountAddresses?: string[],
  filterTransactionType: AccountIndexedTransactionType[] = allIndexedTransactions
): Observable<LatestAddressUpdates> =>
  latestBlockUpdates$.pipe(
    map((blockUpdates: PusherLatestBlock) => {
      if (
        filterAccountAddresses &&
        filterAccountAddresses.some(addr => addr.startsWith("0x"))
      ) {
        console.warn("@reef-chain/util-lib // Only filter by native address.");
      }

      const allUpdatedAccounts = Array.from(
        new Set(
          filterTransactionType?.reduce((accs: string[], curr) => {
            return accs.concat(getUpdatedAccounts(blockUpdates, curr));
          }, [])
        )
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
    filter(
      v =>
        (filterAccountAddresses && v != null && !!v.addresses.length) ||
        !filterAccountAddresses ||
        !filterAccountAddresses?.length
    ),
    filter(value =>
      hasTransactionForTypes(
        value as unknown as PusherLatestBlock,
        filterTransactionType
      )
    ),
    catchError(err => {
      console.log("_getBlockAccountTransactionUpdates$ err=", err.message);
      return of(null);
    })
  ) as Observable<LatestAddressUpdates>;

export const getLatestBlockAccountUpdates$ = (
  filterAccountAddresses?: string[],
  filterTransactionType?: AccountIndexedTransactionType[]
) =>
  _getBlockAccountTransactionUpdates$(
    latestBlockUpdates$,
    filterAccountAddresses,
    filterTransactionType
  ).pipe(
    catchError(err => {
      console.log("getLatestBlockAccountUpdates$ err=", err.message);
      return of(null);
    })
  );

export const getLatestBlockContractEvents$ = (
  filterContractAddresses?: string[]
): Observable<LatestAddressUpdates> =>
  latestBlockUpdates$.pipe(
    map((blockUpdates: PusherLatestBlock) => {
      if (!filterContractAddresses || !filterContractAddresses.length) {
        return blockUpdates.updatedContracts;
      }
      const updatedContracts = blockUpdates.updatedContracts.filter(addr =>
        filterContractAddresses.some(a => addr.trim() === a.trim())
      );
      if (!updatedContracts.length) {
        return null;
      }
      return {
        ...blockUpdates,
        addresses: updatedContracts,
      } as LatestAddressUpdates;
    }),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    filter(v => !!v),
    catchError(err => {
      console.log("getLatestBlockContractEvents$ err=", err.message);
      return of(null);
    })
  ) as Observable<LatestAddressUpdates>;
