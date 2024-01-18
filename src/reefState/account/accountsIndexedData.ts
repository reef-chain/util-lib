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
import { accountsWithUpdatedChainDataBalances$ } from "./accountsWithUpdatedChainDataBalances";
import { ReefAccount } from "../../account/accountModel";
import { accountsLocallyUpdatedData$ } from "./accountsLocallyUpdatedData";
import { availableAddresses$ } from "./availableAddresses";
import {
  FeedbackStatusCode,
  isFeedbackDM,
  StatusDataObject,
  toFeedbackDM,
} from "../model/statusDataObject";
import { getAddressesErrorFallback } from "./errorUtil";
import { httpClientInstance$ } from "../../graphql/httpClient";
import {
  AccountIndexedTransactionType,
  getLatestBlockAccountUpdates$,
} from "../latestBlock";
import { getEvmAddressQuery } from "../../graphql/accounts.gql";
import { queryGql$ } from "../../graphql/gqlUtil";

// eslint-disable-next-line camelcase
interface AccountEvmAddrData {
  address: string;
  // eslint-disable-next-line camelcase
  evm_address?: string;
  isEvmClaimed?: boolean;
}

function toAccountEvmAddrData(result: any): AccountEvmAddrData[] {
  return result.data.accounts.map(
    acc =>
      ({
        address: acc.id,
        isEvmClaimed: !!acc.evmAddress,
        evm_address: acc.evmAddress,
      } as AccountEvmAddrData)
  );
}

const indexedAccountValues$: Observable<
  StatusDataObject<AccountEvmAddrData[]>
> = combineLatest([httpClientInstance$, availableAddresses$]).pipe(
  switchMap(([httpClient, signers]) => {
    if (!signers) {
      return of(
        toFeedbackDM(
          [],
          FeedbackStatusCode.MISSING_INPUT_VALUES,
          "Signer not set"
        )
      );
    }
    const addresses = signers.map((s: any) => s.address);
    return getLatestBlockAccountUpdates$(addresses, [
      AccountIndexedTransactionType.REEF_BIND_TX,
    ]).pipe(
      startWith(true),
      switchMap(_ => queryGql$(httpClient, getEvmAddressQuery(addresses)))
    );
  }),
  map((result: any): StatusDataObject<AccountEvmAddrData[]> => {
    if (result?.data?.accounts) {
      return toFeedbackDM(
        toAccountEvmAddrData(result),
        FeedbackStatusCode.COMPLETE_DATA,
        "Indexed evm address loaded"
      );
    }
    if (isFeedbackDM(result)) {
      return result;
    }
    throw new Error("No result from EVM_ADDRESS_UPDATE_GQL");
  }),
  catchError(err => {
    console.log("ERROR indexedAccountValues$=", err.message);
    return of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message));
  }),
  startWith(toFeedbackDM([], FeedbackStatusCode.LOADING)),
  shareReplay(1)
);

export const accountsWithUpdatedIndexedData$ = combineLatest([
  accountsWithUpdatedChainDataBalances$,
  accountsLocallyUpdatedData$,
  indexedAccountValues$,
]).pipe(
  scan(
    (
      state: {
        lastlocallyUpdated: StatusDataObject<StatusDataObject<ReefAccount>[]>;
        lastIndexed: StatusDataObject<AccountEvmAddrData[]>;
        lastSigners: StatusDataObject<StatusDataObject<ReefAccount>[]>;
        signers: StatusDataObject<StatusDataObject<ReefAccount>[]>;
      },
      [accountsWithChainBalance, locallyUpdated, indexed]: [
        StatusDataObject<StatusDataObject<ReefAccount>[]>,
        StatusDataObject<StatusDataObject<ReefAccount>[]>,
        StatusDataObject<AccountEvmAddrData[]>
      ]
    ) => {
      let updateBindValues: StatusDataObject<AccountEvmAddrData>[] = [];
      if (state.lastlocallyUpdated !== locallyUpdated) {
        // locally updated change
        updateBindValues = locallyUpdated.data.map(updSigner =>
          toFeedbackDM(
            {
              address: updSigner.data.address,
              isEvmClaimed: updSigner.data.isEvmClaimed,
              evmAddress: updSigner.data.evmAddress,
            },
            updSigner.getStatusList()
          )
        );
      } else if (state.lastIndexed !== indexed) {
        // indexed change
        updateBindValues = indexed.data.map((updSigner: AccountEvmAddrData) =>
          toFeedbackDM(
            {
              address: updSigner.address,
              isEvmClaimed: !!updSigner.evm_address,
              evmAddress: updSigner.evm_address,
            },
            indexed.getStatusList()
          )
        );
      } else {
        // balance change
        updateBindValues = state.lastSigners.data.map(updSigner =>
          toFeedbackDM(
            {
              address: updSigner.data.address,
              isEvmClaimed: updSigner.data.isEvmClaimed,
              evmAddress: updSigner.data.evmAddress,
            },
            updSigner.getStatusList()
          )
        );
      }
      updateBindValues.forEach((updVal: StatusDataObject<ReefAccount>) => {
        const signer = accountsWithChainBalance.data.find(
          sig => sig.data.address === updVal.data.address
        );
        if (signer) {
          const isEvmClaimedPropName = "isEvmClaimed";
          const resetEvmClaimedStat = signer
            .getStatusList()
            .filter(stat => stat.propName != isEvmClaimedPropName);
          updVal.getStatusList().forEach(updStat => {
            resetEvmClaimedStat.push({
              propName: isEvmClaimedPropName,
              code: updStat.code,
            });
          });
          if (updVal.hasStatus(FeedbackStatusCode.COMPLETE_DATA)) {
            signer.data.isEvmClaimed = !!updVal.data.isEvmClaimed;
            signer.data.evmAddress = updVal.data.evmAddress;
          }
          signer.setStatus(resetEvmClaimedStat);
        }
      });
      return {
        signers: accountsWithChainBalance,
        lastlocallyUpdated: locallyUpdated,
        lastIndexed: indexed,
        lastSigners: accountsWithChainBalance,
      };
    },
    {
      signers: toFeedbackDM([], FeedbackStatusCode.LOADING),
      lastlocallyUpdated: toFeedbackDM([], FeedbackStatusCode.LOADING),
      lastIndexed: toFeedbackDM([], FeedbackStatusCode.LOADING),
      lastSigners: toFeedbackDM([], FeedbackStatusCode.LOADING),
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
