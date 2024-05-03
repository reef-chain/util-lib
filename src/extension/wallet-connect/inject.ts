import Client from "@walletconnect/sign-client";
import { SessionTypes } from "@walletconnect/types";

import WcInjected from "./Injected";
import Injected from "./Injected";
import { InjectOptions, InjectedWindow } from "../extension-inject";
import { WcConnection } from "./connect";

export function injectWcAsExtension(
  { client, session }: WcConnection,
  { name, version }: InjectOptions
): void {
  // small helper with the typescript types, just cast window
  const windowInject = window as Window & InjectedWindow;

  if (windowInject) {
    // don't clobber the existing object, we will add it (or create as needed)
    windowInject.injectedWeb3 = windowInject.injectedWeb3 || {};

    // add our enable function
    windowInject.injectedWeb3[name] = {
      enable: (_origin: string): Promise<Injected> => enableWc(client, session),
      version,
    };
  }
}

async function enableWc(
  client: Client,
  session: SessionTypes.Struct
): Promise<Injected> {
  return new WcInjected(client, session);
}
