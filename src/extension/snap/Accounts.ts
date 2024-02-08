import type {
  InjectedAccount,
  InjectedAccounts,
  Unsubcall,
} from "../extension-inject/types";

import type { SendSnapRequest } from "./types";

let sendRequest: SendSnapRequest;

export default class Accounts implements InjectedAccounts {
  constructor(_sendRequest: SendSnapRequest) {
    sendRequest = _sendRequest;
  }

  public get(): Promise<InjectedAccount[]> {
    return sendRequest("listAccounts");
  }

  public subscribe(cb: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    let unsubs = false;

    // NOTE: Not using subscription
    sendRequest("listAccounts")
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
