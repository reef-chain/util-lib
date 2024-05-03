import { SessionTypes } from "@walletconnect/types";

import type {
  InjectedAccount,
  InjectedAccounts,
  Unsubcall,
} from "../extension-inject/types";

let session: SessionTypes.Struct;

export default class Accounts implements InjectedAccounts {
  constructor(_session: SessionTypes.Struct) {
    session = _session;
  }

  public get(): Promise<InjectedAccount[]> {
    if (!session.namespaces.reef?.accounts?.length) return Promise.resolve([]);

    const addresses = Array.from(
      new Set(
        session.namespaces.reef.accounts.map(account => account.split(":")[2])
      )
    );
    const accounts: InjectedAccount[] = addresses.map(
      (address: string, index) => ({ address, isSelected: index === 0 })
    );
    return Promise.resolve(accounts);
  }

  public subscribe(cb: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    let unsubs = false;

    // NOTE: Not using subscription
    this.get()
      .then((val: any) => {
        if (!unsubs) {
          cb(val);
        }
      })
      .catch((error: Error) => console.error(error));

    return (): void => {
      unsubs = true;
    };
  }
}
