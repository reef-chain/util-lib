import { selectedAccount_status$ } from "./selectedAccount";
import { filter } from "rxjs/operators";
import { ReefAccount } from "../../account/accountModel";
import { distinctUntilChanged, shareReplay, switchMap } from "rxjs";
import { StatusDataObject } from "../model/statusDataObject";

export const selectedAccountAddressChange$ = selectedAccount_status$.pipe(
  filter((v): v is StatusDataObject<ReefAccount> => !!v),
  distinctUntilChanged((s1, s2) => s1.data.address === s2.data.address),
  switchMap(_ => selectedAccount_status$),
  shareReplay(1)
);
