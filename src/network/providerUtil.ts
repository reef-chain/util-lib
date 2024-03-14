import { Provider } from "@reef-chain/evm-provider";
import { WsProvider } from "@polkadot/api";
import { Subject, firstValueFrom } from "rxjs";
import { WsConnectionState } from "../reefState/ws-connection-state";
import { selectedProvider$ } from "../reefState";

export type InitProvider = (
  providerUrl: string,
  providerConnStateSubj?: Subject<WsConnectionState>,
  autoConnectMs?: number
) => Promise<Provider>;

export async function initProvider(
  providerUrl: string,
  providerConnStateSubj?: Subject<WsConnectionState>,
  autoConnectMs?: number
) {
  let newProvider;
  try {
    newProvider = new Provider({
      //@ts-ignore
      provider: new WsProvider(providerUrl, autoConnectMs),
    });
  } catch (e) {
    console.log("ERROR provider init=", e.message);
    throw new Error(e);
  }
  try {
    newProvider.api.on("connected", v => {
      console.log("util-lib providerConnected", v);
      providerConnStateSubj?.next({
        isConnected: true,
        status: {
          value: "connected",
          timestamp: new Date().getTime(),
          data: v,
        },
      });
    });
    newProvider.api.on("error", v => {
      console.log("util-lib providerError", v);
      providerConnStateSubj?.next({
        isConnected: false,
        status: { value: "error", timestamp: new Date().getTime(), data: v },
      });
    });
    newProvider.api.on("disconnected", v => {
      console.log("util-lib providerDISConnected", v);
      providerConnStateSubj?.next({
        isConnected: false,
        status: {
          value: "disconnected",
          timestamp: new Date().getTime(),
          data: v,
        },
      });
    });
    newProvider.api.on("ready", v => {
      console.log("util-lib providerReady", v);
      providerConnStateSubj?.next({
        isConnected: true,
        status: {
          value: "connected",
          timestamp: new Date().getTime(),
          data: v,
        },
      });
    });
    await newProvider.api.isReadyOrError;
  } catch (e) {
    console.log("Provider isReadyOrError ERROR=", e);
    providerConnStateSubj?.next({
      isConnected: false,
      status: { value: "error", timestamp: new Date().getTime(), data: e },
    });
    throw e;
  }
  return newProvider;
}

async function getReefStateProvider(): Promise<Provider | null> {
  const provider: unknown = await Promise.race([
    firstValueFrom(selectedProvider$),
    new Promise(resolve => setTimeout(() => resolve(null), 50)),
  ]);
  if (!provider) {
    return null;
  }
  return provider as Provider;
}

export async function disconnectProvider(provider?: Provider) {
  if (!provider) {
    provider = await getReefStateProvider();
  }

  if (provider) {
    try {
      await provider.api.isReadyOrError;
      await provider.api.disconnect();
    } catch (e: any) {
      console.log("Provider disconnect err=", e.message);
      throw new Error(e);
    }
  }
}

export async function connectProvider(provider?: Provider): Promise<boolean> {
  if (!provider) {
    provider = await getReefStateProvider();
  }
  if (provider) {
    try {
      const connected = await provider.api.isConnected;
      if (connected !== true) {
        await provider.api.connect();
      }
      return true;
    } catch (e: any) {
      console.log("Provider connect err=", e.message);
    }
  }
  return false;
}

export async function reconnectProvider(provider?: Provider): Promise<boolean> {
  if (!provider) {
    provider = await getReefStateProvider();
  }
  console.log("RECONNNNN utillib=", !!provider);
  if (provider) {
    try {
      console.log("reccc provi util-lib", !!provider);
      await disconnectProvider(provider);
      return await connectProvider(provider);
    } catch (e: any) {
      console.log("Provider reconnect err=", e.message);
    }
  }
  return false;
}
