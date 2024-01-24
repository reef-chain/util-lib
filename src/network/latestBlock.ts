import { catchError, map, Observable, of, shareReplay, switchMap } from "rxjs";
import { filter } from "rxjs/operators";
import { initializeApp, FirebaseOptions } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { selectedNetwork$ } from "../reefState/networkState";
import { Network } from "./network";

const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyDBt2QgRSCo70wV_752sA0i6fOrDQfO5J4",
  authDomain: "reef-block-index.firebaseapp.com",
  databaseURL: "https://reef-block-index-default-rtdb.firebaseio.com",
  projectId: "reef-block-index",
  storageBucket: "reef-block-index.appspot.com",
  messagingSenderId: "265934184271",
  appId: "1:265934184271:web:8f55865e0438452a17af3a",
};

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

interface LatestBlock {
  blockHash: string;
  blockHeight: number;
  blockId: string;
}

interface UpdatedAccounts {
  REEF20Transfers?: string[];
  REEF721Transfers?: string[];
  REEF1155Transfers?: string[];
  boundEvm?: string[];
}

export interface LatestBlockData extends LatestBlock {
  updatedAccounts: UpdatedAccounts;
  updatedContracts: string[];
}

export interface LatestAddressUpdates extends LatestBlock {
  addresses: string[];
}

const app = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(app);

export const latestBlockUpdates$ = selectedNetwork$.pipe(
  filter((network: Network) => !!network),
  switchMap(({ name: network }: { name: string }) => {
    return new Observable<LatestBlockData>(obs => {
      const unsubscribe = onValue(ref(db, network), snapshot => {
        const data = snapshot.val();
        if (!data) return;
        const keys = Object.keys(data);
        if (!keys.length) return;
        const latestBlock = data[keys[0]];
        latestBlock.blockHeight = Number(keys[0]);
        obs.next(latestBlock);
      });

      return () => {
        unsubscribe();
      };
    });
  }),

  shareReplay(1)
);

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
