# Reef chain extension utils

A set of utilities to help the development of web extensions for the Reef chain and their integration with dapps.

## Dapp integration

This library offers a set of utilities that manipulate the window.injectedWeb3 to retrieve all the providers added to the page.

`web3Enable(dappName: string): Promise<InjectedExtension[]>`: To be called before anything else, retrieves the list of all injected extensions/providers.

`web3Accounts(): Promise<InjectedAccountWithMeta[]>`: Returns a list of all the injected accounts, across all extensions (source in meta).

`web3AccountsSubscribe(cb: (accounts: InjectedAccountWithMeta[]) => any): Promise<Unsubcall>`: Subscribes to the accounts accross all extensions, returning a full list as changes are made.

`web3FromAddress(address: string): Promise<InjectedExtension>`: Retrieves a provider for a specific address.

`web3FromSource(name: string): Promise<InjectedExtension>`: Retrieves a provider identified by the name.

`isWeb3Injected: boolean`: Boolean to indicate if injectedWeb3 was found on the page

`web3EnablePromise: Promise<InjectedExtension[]> | null`: null or the promise as a result of the last call to web3Enable.

Usage example:

```js
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from '@reef-chain/extension-utils';
import { Provider } from "@reef-chain/evm-provider";
import { WsProvider } from "@polkadot/api";

// returns an array of all the injected sources
// (this needs to be called first, before other requests)
const allInjected = await web3Enable('my cool dapp');

// returns an array of { address, meta: { name, source } }
// meta.source contains the name of the extension that provides this account
const allAccounts = await web3Accounts();

// the address we use to use for signing, as injected
const SENDER = allAccounts[0].address;

// finds an injector for an address
const injector = await web3FromAddress(SENDER);

// connect to the testnet Reef node
const URL = "wss://rpc-testnet.reefscan.com/ws ";
const provider = new Provider({
  provider: new WsProvider(URL),
});
const api = provider.api;
await api.isReady;

// sign and send our transaction - notice here that the address of the account
// (as retrieved injected) is passed through as the param to the `signAndSend`,
// the API then calls the extension to present to the user and get it signed.
// Once complete, the api sends the tx + signature via the normal process
api.tx.balances
  .transfer(allAccounts[1].address, 123456)
  .signAndSend(SENDER, { signer: injector.signer }, (status) => { ... });
```

## Extension development

The extension injector manages access to the global objects available. As an extension developer, you don't need to manage access to the window object manually, by just calling enable here, the global object is setup and managed properly.

```js
import { injectExtension } from '@reef-chain/extension-utils';

// this is the function that will be exposed to be callable by the dapp. It resolves a promise
// with the injected interface, (see `Injected`) when the dapp at `originName` (url) is allowed
// to access functionality
function enableFn (originName: string): Promise<Injected> {
  ...
}

// injects the extension into the page
injectExtension(enableFn, { name: 'myExtension', version: '1.0.1' });
```
