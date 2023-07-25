import Pusher from "pusher-js";
import {
  combineLatest,
  from,
  map,
  Observable,
  shareReplay,
  switchMap,
} from "rxjs";
import { filter } from "rxjs/operators";
import { selectedNetwork$ } from "../reefState";
import { AVAILABLE_NETWORKS, Network } from "./network";

const PUSHER_KEY = "fc5ad78eb31981de6c67";
const APP_CLUSTER = "eu";
const INDEXED_BLOCK_CHANNEL_NAME = "reef-chain";
let pusherClient;
let block$: Observable<PusherLatestBlock>;

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

const latestBlockUpdates$ = combineLatest([
  from(getPusher()),
  selectedNetwork$,
]).pipe(
  switchMap(([pusher, network]: [Pusher, Network]) => {
    return new Observable<PusherLatestBlock>(obs => {
      const channelEvent =
        network.rpcUrl === AVAILABLE_NETWORKS.mainnet.rpcUrl
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

const getNftUpdatedAccounts = (blockUpdates: PusherLatestBlock): string[] => {
  return Array.from(
    new Set(
      blockUpdates.updatedAccounts.REEF1155Transfers.concat(
        blockUpdates.updatedAccounts.REEF721Transfers
      )
    )
  );
};

export const _getBlockAccountTransactionUpdates$ = (
  latestBlockUpdates: Observable<PusherLatestBlock>,
  filterAccountAddresses?: string[],
  filterTransactionType: AccountIndexedTransactionType[] = allIndexedTransactions
): Observable<LatestAddressUpdates> =>
  latestBlockUpdates.pipe(
    map((blockUpdates: PusherLatestBlock) => {
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
      if (filterAccountAddresses.some(addr => addr.startsWith("0x"))) {
        console.warn("@reef-chain/util-lib // Only filter by native address.");
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
    )
  );

export const getLatestBlockTokenUpdates$ = (
  filterAccountAddresses?: string[],
  filterTransactionType?: AccountIndexedTransactionType[]
) =>
  _getBlockAccountTransactionUpdates$(
    latestBlockUpdates$,
    filterAccountAddresses,
    filterTransactionType
  );

export const getLatestBlockContractEvents$ = (
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
