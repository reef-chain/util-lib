import { map, share, startWith, Subject, switchMap } from "rxjs";
import { getLatestBlockAccountUpdates$ } from "../../network";
import { selectedAccountAddressChange$ } from "../account/selectedAccountAddressChange";
import { AccountIndexedTransactionType } from "../../network/latestBlock";

export const selectedAccountFtBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr =>
      getLatestBlockAccountUpdates$(
        [addr.data.address],
        [AccountIndexedTransactionType.REEF20_TRANSFER]
      )
    ),
    map(() => true),
    share()
  );

export const selectedAccountNftBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr =>
      getLatestBlockAccountUpdates$(
        [addr.data.address],
        [AccountIndexedTransactionType.REEF_NFT_TRANSFER]
      )
    ),
    map(() => true),
    share()
  );

export const selectedAccountAnyBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr =>
      getLatestBlockAccountUpdates$(
        [addr.data.address],
        [
          AccountIndexedTransactionType.REEF_NFT_TRANSFER,
          AccountIndexedTransactionType.REEF20_TRANSFER,
        ]
      )
    ),
    map(() => true),
    share()
  );

export const reloadTokens = () => {
  forceTokenValuesReloadSubj.next(true);
  console.log("force lib reload tokens");
};
const forceTokenValuesReloadSubj = new Subject<boolean>();
export const forceReload$ = forceTokenValuesReloadSubj.pipe(
  // combineLatestWith(apolloClientWsConnState$, providerConnState$),
  // debounceTime(3000),
  startWith(true)
);
