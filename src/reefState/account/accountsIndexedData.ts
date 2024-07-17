import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs";
import { AccountIndexedData, ReefAccount } from "../../account/accountModel";
import { accountsLocallyUpdatedData$ } from "./accountsLocallyUpdatedData";
import { availableAddresses$ } from "./availableAddresses";
import {
  FeedbackStatusCode,
  StatusDataObject,
  toFeedbackDM,
} from "../model/statusDataObject";
import { getAddressesErrorFallback } from "./errorUtil";
import { httpClientInstance$ } from "../../graphql/httpClient";
import { getLatestBlockAccountUpdates$ } from "../latestBlock";
import { getIndexedAccountsQuery } from "../../graphql/accounts.gql";
import { queryGql$ } from "../../graphql/gqlUtil";
import { AccountIndexedTransactionType } from "../latestBlockModel";
import { AxiosInstance } from "axios";
import { BigNumber } from "ethers";

function toAccountIndexedData(accounts: any[]): AccountIndexedData[] {
  return accounts?.map(
    acc =>
      ({
        address: acc.id,
        isEvmClaimed: !!acc.evmAddress,
        evmAddress: acc.evmAddress,
        balance: BigNumber.from(acc.availableBalance || 0),
        // server indexer issues:
        // acc.availableBalance is free - not locked
        // acc.freeBalance is total balance - locked+free
        freeBalance: BigNumber.from(acc.availableBalance || 0),
        availableBalance: BigNumber.from(acc.freeBalance || 0),
        lockedBalance: BigNumber.from(acc.lockedBalance || 0),
      } as AccountIndexedData)
  );
}

const indexedAccountValues$: Observable<
  StatusDataObject<StatusDataObject<ReefAccount>[]>
> = combineLatest([httpClientInstance$, availableAddresses$]).pipe(
  switchMap(([httpClient, reefAccounts]) => {
    if (!reefAccounts) {
      return of(
        toFeedbackDM(
          [],
          FeedbackStatusCode.MISSING_INPUT_VALUES,
          "Signer not set"
        )
      );
    }
    const addresses = reefAccounts.map((s: any) => s.address);
    return getLatestBlockAccountUpdates$(addresses, [
      AccountIndexedTransactionType.REEF_BIND_TX,
    ]).pipe(
      startWith(true),
      switchMap(_ =>
        queryGql$(
          httpClient as AxiosInstance,
          getIndexedAccountsQuery(addresses)
        )
      ),
      map(res => {
        return {
          reefAccounts,
          indexedAccsData: toAccountIndexedData(res.data?.accounts),
        };
      })
    );
  }),
  map(
    (result: {
      reefAccounts: ReefAccount[];
      indexedAccsData: AccountIndexedData[];
    }): StatusDataObject<StatusDataObject<ReefAccount>[]> => {
      return toFeedbackDM(
        result.reefAccounts?.map(rAcc =>
          toFeedbackDM(
            {
              ...rAcc,
              ...result.indexedAccsData.find(
                iAcc => iAcc.address === rAcc.address
              ),
            } as ReefAccount,
            FeedbackStatusCode.COMPLETE_DATA
          )
        ) as StatusDataObject<ReefAccount>[],
        FeedbackStatusCode.COMPLETE_DATA,
        "Indexed evm address loaded"
      );
      // throw new Error("No result from EVM_ADDRESS_UPDATE_GQL");
    }
  ),
  catchError(err => {
    console.log("ERROR indexedAccountValues$=", err.message);
    return of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message));
  }),
  startWith(toFeedbackDM([], FeedbackStatusCode.LOADING)),
  shareReplay(1)
);

export const accountsWithUpdatedIndexedData$ = combineLatest([
  accountsLocallyUpdatedData$,
  indexedAccountValues$,
]).pipe(
  scan(
    (
      state: {
        lastlocallyUpdated: StatusDataObject<StatusDataObject<ReefAccount>[]>;
        lastIndexed: StatusDataObject<StatusDataObject<ReefAccount>[]>;
        // lastSigners: StatusDataObject<StatusDataObject<ReefAccount>[]>;
        signers: StatusDataObject<StatusDataObject<ReefAccount>[]>;
      },
      [locallyUpdated, indexed]: [
        StatusDataObject<StatusDataObject<ReefAccount>[]>,
        StatusDataObject<StatusDataObject<ReefAccount>[]>
      ]
    ) => {
      let accounts = toFeedbackDM<StatusDataObject<ReefAccount>[]>(
        [],
        FeedbackStatusCode.NOT_SET
      );

      if (state.lastlocallyUpdated !== locallyUpdated) {
        // locally updated change
        accounts = toFeedbackDM(
          indexed.data.map(iAcc => {
            const upd = locallyUpdated.data.find(
              uAcc => uAcc.data.address === iAcc.data.address
            );
            if (upd) {
              return toFeedbackDM(
                { ...iAcc.data, ...upd.data } as ReefAccount,
                upd.getStatusList()
              );
            }
            return iAcc;
          }),
          locallyUpdated.getStatusList().concat(indexed.getStatusList())
        );
      }

      if (state.lastIndexed !== indexed) {
        // indexed change
        accounts = toFeedbackDM(indexed.data, indexed.getStatusList());
      }

      return {
        signers: accounts,
        lastlocallyUpdated: locallyUpdated,
        lastIndexed: indexed,
      };
    },
    {
      signers: toFeedbackDM<StatusDataObject<ReefAccount>[]>(
        [],
        FeedbackStatusCode.LOADING
      ),
      lastlocallyUpdated: toFeedbackDM<StatusDataObject<ReefAccount>[]>(
        [],
        FeedbackStatusCode.LOADING
      ),
      lastIndexed: toFeedbackDM<StatusDataObject<ReefAccount>[]>(
        [],
        FeedbackStatusCode.LOADING
      ),
    }
  ),
  map(
    (values: { signers: StatusDataObject<StatusDataObject<ReefAccount>[]> }) =>
      values.signers
  ),
  catchError(err =>
    getAddressesErrorFallback(err, "Error signers updated data =")
  ),
  shareReplay(1)
);
