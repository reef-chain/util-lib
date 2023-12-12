import {
  catchError,
  combineLatest,
  from,
  map,
  mergeWith,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs";
import {
  NFT,
  Token,
  TokenBalance,
  TokenTransfer,
  TokenWithAmount,
} from "../token/tokenModel";
import { reefPrice$ } from "../token/reefPrice";
import {
  loadAccountTokens_sdo,
  replaceReefBalanceFromAccount,
} from "./token/selectedAccountTokenBalances";
import { selectedAccount_status$ } from "./account/selectedAccount";
import { selectedNetwork$ } from "./networkState";
import { Pool } from "../token/pool";
import { selectedAccountAddressChange$ } from "./account/selectedAccountAddressChange";
import { Network } from "../network/network";
import { ReefAccount } from "../account/accountModel";
import { fetchPools$ } from "../pools/pools";
import {
  collectFeedbackDMStatus,
  FeedbackStatusCode,
  StatusDataObject,
  toFeedbackDM,
} from "./model/statusDataObject";
import { loadSignerNfts } from "./token/nftUtils";
import { loadTransferHistory } from "./token/transferHistory";
import { getReefAccountSigner } from "../account/accountSignerUtils";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { toTokensWithPrice_sdo } from "./token/tokenUtil";
import { getReefswapNetworkConfig } from "../network/dex";
import { filter } from "rxjs/operators";
import { BigNumber } from "ethers";
import { selectedNetworkProvider$, selectedProvider$ } from "./providerState";
import {
  selectedAccountAnyBalanceUpdate$,
  selectedAccountFtBalanceUpdate$,
  selectedAccountNftBalanceUpdate$,
} from "./token/reloadTokenState";
import { getLatestBlockAccountUpdates$ } from "../network";
import { httpClientInstance$ } from "../graphql/httpClient";
import { AccountIndexedTransactionType } from "../network/latestBlock";
import { forceReload$ } from "./token/force-reload-tokens";

const reloadingValues$ = combineLatest([
  selectedNetwork$,
  selectedAccountAddressChange$,
  forceReload$,
]).pipe(shareReplay(1));

const selectedAccountReefBalance$ = selectedAccount_status$.pipe(
  map(acc => {
    return acc?.data.balance;
  }),
  filter(bal => !!bal && bal.gt(BigNumber.from("0"))),
  startWith(undefined),
  shareReplay(1)
);

export const selectedTokenBalances_status$: Observable<
  StatusDataObject<StatusDataObject<Token | TokenBalance>[]>
> = combineLatest([
  httpClientInstance$,
  selectedAccountAddressChange$,
  forceReload$,
  selectedAccountFtBalanceUpdate$.pipe(startWith(true)),
]).pipe(
  switchMap(vals => {
    const [httpClient, signer, forceReload, _] = vals;
    return getLatestBlockAccountUpdates$(
      [signer.data.address],
      [AccountIndexedTransactionType.REEF20_TRANSFER]
    ).pipe(
      startWith(true),
      switchMap(_ => {
        return loadAccountTokens_sdo(vals).pipe(
          switchMap(
            (
              tkns: StatusDataObject<StatusDataObject<Token | TokenBalance>[]>
            ) => {
              // console.log("loading account token balances", tkns);
              return combineLatest([
                of(tkns),
                selectedAccountReefBalance$,
              ]).pipe(
                map(arrVal =>
                  replaceReefBalanceFromAccount(arrVal[0], arrVal[1])
                )
              );
            }
          ),
          catchError((err: any) => {
            console.log("ERROR2 selectedTokenBalances_status$=", err);
            return of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message));
          })
        );
      }),
      catchError((err: any) => {
        console.log("ERROR0 selectedTokenBalances_status$=", err);
        return of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message));
      })
    );
  }),
  mergeWith(
    reloadingValues$.pipe(
      map(() => toFeedbackDM([], FeedbackStatusCode.LOADING))
    )
  ),
  catchError((err: any) => {
    console.log("ERROR1 selectedTokenBalances_status$=", err.message);
    return of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message));
  }),
  shareReplay(1)
);

export const selectedPools_status$: Observable<
  StatusDataObject<StatusDataObject<Pool | null>[]>
> = combineLatest([
  selectedTokenBalances_status$,
  selectedNetworkProvider$,
  selectedAccountAddressChange$,
]).pipe(
  switchMap(
    (
      valArr: [
        StatusDataObject<StatusDataObject<Token | TokenBalance>[]>,
        { provider: Provider; network: Network },
        StatusDataObject<ReefAccount>
      ]
    ) => {
      const [tkns, networkProvider, signer] = valArr;
      if (!signer) {
        return of(
          toFeedbackDM(
            [],
            FeedbackStatusCode.MISSING_INPUT_VALUES,
            "No pools signer"
          )
        );
      }
      return from(
        getReefAccountSigner(signer.data, networkProvider.provider)
      ).pipe(
        switchMap((sig: Signer | undefined) =>
          fetchPools$(
            tkns.data,
            sig as Signer,
            getReefswapNetworkConfig(networkProvider.network).factoryAddress
          ).pipe(
            map((poolsArr: StatusDataObject<Pool | null>[]) =>
              toFeedbackDM(
                poolsArr || [],
                poolsArr?.length
                  ? collectFeedbackDMStatus(poolsArr)
                  : FeedbackStatusCode.NOT_SET
              )
            )
          )
        )
      );
    }
  ),
  mergeWith(
    reloadingValues$.pipe(
      map(() => toFeedbackDM([], FeedbackStatusCode.LOADING))
    )
  ),
  shareReplay(1)
);

// TODO pools and tokens emit events at same time - check how to make 1 event from it
export const selectedTokenPrices_status$: Observable<
  StatusDataObject<StatusDataObject<TokenWithAmount>[]>
> = combineLatest([
  selectedTokenBalances_status$,
  reefPrice$,
  selectedPools_status$,
]).pipe(
  map(toTokensWithPrice_sdo),
  mergeWith(
    reloadingValues$.pipe(
      map(() => toFeedbackDM([], FeedbackStatusCode.LOADING))
    )
  ),
  catchError(err => {
    console.log("ERROR selectedTokenPrices_status$", err.message);
    return of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message));
  }),
  shareReplay(1)
);

/*export const availableReefPools_status$: Observable<
  StatusDataObject<AvailablePool[]>
> = combineLatest([httpClientInstance$, selectedProvider$]).pipe(
  switchMap(loadAvailablePools),
  map(toAvailablePools),
  map(pools => toFeedbackDM(pools, FeedbackStatusCode.COMPLETE_DATA)),
  catchError(err =>
    of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message))
  ),
  startWith(toFeedbackDM([], FeedbackStatusCode.LOADING)),
  shareReplay(1)
);*/

export const selectedNFTs_status$: Observable<
  StatusDataObject<StatusDataObject<NFT>[]>
> = combineLatest([
  httpClientInstance$,
  selectedAccountAddressChange$,
  forceReload$,
  selectedAccountNftBalanceUpdate$.pipe(startWith(true)),
]).pipe(
  switchMap(v => loadSignerNfts(v)),
  mergeWith(
    reloadingValues$.pipe(
      map(() => toFeedbackDM([], FeedbackStatusCode.LOADING))
    )
  ),
  catchError(err =>
    of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message))
  ),
  shareReplay(1)
);

// TODO combine  selectedNetwork$ and selectedProvider$
export const selectedTransactionHistory_status$: Observable<
  StatusDataObject<TokenTransfer[]>
> = combineLatest([
  httpClientInstance$,
  selectedAccountAddressChange$,
  selectedNetwork$,
  selectedProvider$,
  forceReload$,
  selectedAccountAnyBalanceUpdate$.pipe(startWith(true)),
]).pipe(
  switchMap(loadTransferHistory),
  map(vArr =>
    toFeedbackDM(vArr, FeedbackStatusCode.COMPLETE_DATA, "History loaded")
  ),
  mergeWith(
    reloadingValues$.pipe(
      map(() => toFeedbackDM([], FeedbackStatusCode.LOADING))
    )
  ),
  catchError(err =>
    of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message))
  ),
  shareReplay(1)
);
