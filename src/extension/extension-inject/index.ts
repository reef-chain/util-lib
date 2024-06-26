// Copyright 2019-2021 @polkadot/extension-utils authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Injected, InjectedWindow, InjectOptions } from "./types";

export const REEF_EXTENSION_IDENT = "reef";
export const REEF_SNAP_IDENT = "reef-snap";
export const REEF_EASY_WALLET_IDENT = "reef-easy-wallet";
export const REEF_WALLET_CONNECT_IDENT = "reef-wallet-connect";
export const ExtensionsIdents = [
  REEF_EXTENSION_IDENT,
  REEF_SNAP_IDENT,
  REEF_EASY_WALLET_IDENT,
  REEF_WALLET_CONNECT_IDENT,
];

export const REEF_INJECTED_EVENT = "reef-injected";

// It is recommended to always use the function below to shield the extension and dapp from
// any future changes. The exposed interface will manage access between the 2 environments,
// be it via window (current), postMessage (under consideration) or any other mechanism
export function injectExtension(
  enable: (origin: string) => Promise<Injected>,
  { name, version }: InjectOptions
): void {
  // small helper with the typescript types, just cast window
  const windowInject = window as Window & InjectedWindow;

  if (windowInject) {
    // don't clobber the existing object, we will add it (or create as needed)
    windowInject.injectedWeb3 = windowInject.injectedWeb3 || {};

    // add our enable function
    windowInject.injectedWeb3[name] = {
      enable: (origin: string): Promise<Injected> => enable(origin),
      version,
    };
  }
}

export function isInjected(name: string): boolean {
  const windowInject = window as Window & InjectedWindow;

  return !!windowInject?.injectedWeb3 && !!windowInject?.injectedWeb3[name];
}

export function isInjectionStarted(name: string): boolean {
  const windowInject = window as any;

  return (
    !!windowInject._reefInjectionStart &&
    !!windowInject._reefInjectionStart[name]
  );
}

export function startInjection(name: string) {
  if (!(window as any)._reefInjectionStart) {
    (window as any)._reefInjectionStart = {};
  }

  (window as any)._reefInjectionStart[name] = true;
}

export * from "./types";
