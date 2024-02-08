import { accountsWithUpdatedIndexedData$ } from "./accountsIndexedData";
import {
  InjectedAccount,
  InjectedAccountWithMeta,
} from "@polkadot/extension-inject/types";
import {
  InjectedAccount as InjectedAccountReef,
  InjectedAccountWithMeta as InjectedAccountWithMetaReef,
  REEF_EXTENSION_IDENT,
} from "../../extension";

export const accounts_status$ = accountsWithUpdatedIndexedData$;

export const toInjectedAccountsWithMeta = (
  injAccounts: InjectedAccount[] | InjectedAccountReef[],
  extensionSourceName: string = REEF_EXTENSION_IDENT
): InjectedAccountWithMeta[] | InjectedAccountWithMetaReef[] => {
  return injAccounts.map(
    acc =>
      ({
        address: acc.address,
        meta: {
          name: acc.name,
          source: extensionSourceName,
        },
      } as InjectedAccountWithMeta | InjectedAccountWithMetaReef)
  );
};
