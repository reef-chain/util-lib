import { Provider } from '@reef-defi/evm-provider';
import { WsProvider } from '@polkadot/api';
import { Codec } from '@polkadot/types/types';

export async function initProvider(providerUrl: string) {
  const newProvider = new Provider({
    provider: new WsProvider(providerUrl),
  });
  try {
    await newProvider.api.isReadyOrError;
  } catch (e) {
    console.log('Provider isReadyOrError ERROR=', e);
    throw e;
  }
  return newProvider;
}

export async function disconnectProvider(provider: Provider) {
  await provider.api.disconnect();
}
