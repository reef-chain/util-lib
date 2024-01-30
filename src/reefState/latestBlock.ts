import { catchError, map, Observable, of, ReplaySubject, take } from "rxjs";
import { filter } from "rxjs/operators";
import { selectedNetwork$ } from "./networkState";
import { Network, NetworkName } from "../network/network";
import {
  getConnectedIndexerEmitter$,
  getBlockDataEmitter,
  getIndexerEventsNetworkChannel,
  ReefscanEventsConnConfig,
  emitterConfig,
} from "../utils/reefscanEvents";
import {
  AccountIndexedTransactionType,
  allIndexedTransactions,
  LatestAddressUpdates,
  LatestBlockData,
  UpdatedAccounts,
} from "./latestBlockModel";

export const publishIndexerEvent = (
  blockData: LatestBlockData,
  network: NetworkName,
  key: string,
  config?: ReefscanEventsConnConfig
) => {
  const channel = getIndexerEventsNetworkChannel(network);
  getConnectedIndexerEmitter$(config || emitterConfig)
    .pipe(take(1))
    .subscribe(conn =>
      conn?.publish({ key, channel, message: JSON.stringify(blockData) })
    );
};

// if networkNameOrSelectedNetwork is undefined reefState selectedNetwork observable is used
export const getLatestBlockUpdates$ = (
  networkNameOrSelectedNetwork?: NetworkName
) => {
  let selNetwork$: Observable<NetworkName>;
  if (!networkNameOrSelectedNetwork) {
    selNetwork$ = selectedNetwork$.pipe(
      filter((network: Network) => !!network),
      map(v => v.name)
    );
  } else {
    const rsNetwork = new ReplaySubject<NetworkName>(1);
    rsNetwork.next(networkNameOrSelectedNetwork);
    selNetwork$ = rsNetwork.asObservable();
  }

  // return getBlockDataFirebase(selNetwork$);
  return getBlockDataEmitter(selNetwork$);
};

const getUpdatedAccounts = (
  blockUpdates: LatestBlockData,
  filterTransactionType?: AccountIndexedTransactionType
) => {
  const updatedAccounts: UpdatedAccounts = blockUpdates.updatedAccounts || {};
  switch (filterTransactionType) {
    case AccountIndexedTransactionType.REEF_NFT_TRANSFER:
      // eslint-disable-next-line no-case-declarations
      const reef1155Transfers = updatedAccounts.REEF1155Transfers || [];
      return Array.from(
        new Set(
          reef1155Transfers.concat(updatedAccounts.REEF721Transfers || [])
        )
      );
    case AccountIndexedTransactionType.REEF20_TRANSFER:
      return updatedAccounts.REEF20Transfers || [];
    case AccountIndexedTransactionType.REEF_BIND_TX:
      return updatedAccounts.boundEvm || [];
  }
  const allUpdated = Object.keys(updatedAccounts).reduce(
    (mergedArr: string[], key: string) => {
      return mergedArr.concat(updatedAccounts[key] || []);
    },
    []
  );

  return Array.from(new Set(allUpdated));
};

function hasTransactionForTypes(
  blockUpdates: LatestBlockData,
  filterTransactionType: AccountIndexedTransactionType[]
) {
  if (!filterTransactionType.length) {
    return true;
  }

  return filterTransactionType.some(tt => {
    const updatedAccounts = blockUpdates.updatedAccounts || {};
    switch (tt) {
      case AccountIndexedTransactionType.REEF20_TRANSFER:
        if (updatedAccounts.REEF20Transfers?.length) {
          return true;
        }
        break;
      case AccountIndexedTransactionType.REEF_NFT_TRANSFER:
        if (
          updatedAccounts.REEF721Transfers?.length ||
          updatedAccounts.REEF1155Transfers?.length
        ) {
          return true;
        }
        break;
      case AccountIndexedTransactionType.REEF_BIND_TX:
        if (updatedAccounts.boundEvm?.length) {
          return true;
        }
        break;
    }
    return false;
  });
}

export const _getBlockAccountTransactionUpdates$ = (
  latestBlockUpdates$: Observable<LatestBlockData>,
  filterAccountAddresses?: string[],
  filterTransactionType: AccountIndexedTransactionType[] = allIndexedTransactions
): Observable<LatestAddressUpdates> =>
  latestBlockUpdates$.pipe(
    map((blockUpdates: LatestBlockData) => {
      if (
        filterAccountAddresses &&
        filterAccountAddresses.some(addr => addr.startsWith("0x"))
      ) {
        console.warn("@reef-chain/util-lib // Only filter by native address.");
      }

      const allUpdatedAccounts = Array.from(
        new Set(
          filterTransactionType?.reduce((accs: string[], txType) => {
            return accs.concat(getUpdatedAccounts(blockUpdates, txType));
          }, [])
        )
      ).filter(v => !!v);
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
        value as unknown as LatestBlockData,
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
  filterTransactionType?: AccountIndexedTransactionType[],
  networkNameOrSelectedNetwork?: NetworkName
) =>
  _getBlockAccountTransactionUpdates$(
    getLatestBlockUpdates$(networkNameOrSelectedNetwork),
    filterAccountAddresses,
    filterTransactionType
  ).pipe(
    catchError(err => {
      console.log("getLatestBlockAccountUpdates$ err=", err.message);
      return of(null);
    })
  );

export const getLatestBlockContractEvents$ = (
  filterContractAddresses?: string[],
  networkNameOrReefStateNetwork?: NetworkName
): Observable<LatestAddressUpdates> => {
  return getLatestBlockUpdates$(networkNameOrReefStateNetwork).pipe(
    map((blockUpdates: LatestBlockData) => {
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
};
