import { accountsJsonSubj } from "./setAccounts";
import {
  InjectedAccountWithMeta as InjectedAccountWithMetaReef,
  InjectedAccountWithMeta,
  REEF_EXTENSION_IDENT,
  AccountJson,
} from "../../extension";
import { ReefAccount, ReefSigner } from "../../account/accountModel";
import { map, Observable, shareReplay } from "rxjs";
import { filter } from "rxjs/operators";

// export const availableAddresses$: Observable<ReefAccount[]> = merge(accountsJsonSubj, accountsSubj).pipe(
export const availableAddresses$: Observable<ReefAccount[]> =
  accountsJsonSubj.pipe(
    filter((v: any) => !!v),
    map(
      (
        acc: (
          | ReefSigner
          | AccountJson
          | InjectedAccountWithMeta
          | InjectedAccountWithMetaReef
        )[]
      ) =>
        acc!.map(a => {
          let source =
            (a as InjectedAccountWithMeta).meta?.source ||
            (a as ReefAccount).source;
          if (!source) {
            source = REEF_EXTENSION_IDENT;
            console.log("No extension source set for account=", a);
          }
          let meta = (a as InjectedAccountWithMeta).meta
            ? (a as InjectedAccountWithMeta).meta
            : { source };

          return { address: a.address, ...meta } as ReefAccount;
        })
    ),
    shareReplay(1)
  );
