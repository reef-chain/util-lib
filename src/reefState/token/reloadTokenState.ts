import { map, merge, mergeWith, startWith, Subject, switchMap } from "rxjs";
import { getLatestBlockTokenUpdates$ } from "../../network";
import { selectedAccountAddressChange$ } from "../account/selectedAccountAddressChange";

export const selectedAccountFtBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr => getLatestBlockTokenUpdates$([addr.data.address])),
    map(() => true)
  );

export const selectedAccountNftBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr => getLatestBlockTokenUpdates$([addr.data.address])),
    map(() => true)
  );

export const selectedAccountAnyBalanceUpdate$ = merge(
  selectedAccountFtBalanceUpdate$,
  selectedAccountNftBalanceUpdate$
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
