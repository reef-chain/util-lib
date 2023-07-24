import { map, merge, share, startWith, Subject, switchMap } from "rxjs";
import { getLatestBlockTokenUpdates$ } from "../../network";
import { selectedAccountAddressChange$ } from "../account/selectedAccountAddressChange";

export const selectedAccountFtBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr => getLatestBlockTokenUpdates$([addr.data.address])),
    map(() => true),
    share()
  );

export const selectedAccountNftBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr => getLatestBlockTokenUpdates$([addr.data.address])),
    map(() => true),
    share()
  );

export const selectedAccountAnyBalanceUpdate$ = merge(
  selectedAccountFtBalanceUpdate$,
  selectedAccountNftBalanceUpdate$
).pipe(share());

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
