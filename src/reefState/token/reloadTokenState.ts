import { map, mergeWith, startWith, Subject, switchMap } from "rxjs";
import { getLatestBlockTokenUpdates$ } from "../../network";
import { selectedAccountAddressChange$ } from "../account/selectedAccountAddressChange";

export const selectedAccountBalanceUpdate$ = selectedAccountAddressChange$.pipe(
  switchMap(addr => getLatestBlockTokenUpdates$([addr.data.address])),
  map(() => true)
);

export const reloadTokens = () => {
  forceTokenValuesReloadSubj.next(true);
  console.log("force lib reload tokens");
};
const forceTokenValuesReloadSubj = new Subject<boolean>();
export const forceReloadTokens$ = forceTokenValuesReloadSubj.pipe(
  mergeWith(selectedAccountBalanceUpdate$),
  // combineLatestWith(apolloClientWsConnState$, providerConnState$),
  // debounceTime(3000),
  startWith(true)
);
