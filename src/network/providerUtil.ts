import { Provider } from "@reef-chain/evm-provider";
import { WsProvider } from "@polkadot/api";
import { Subject, firstValueFrom } from "rxjs";
import { WsConnectionState } from "../reefState/ws-connection-state";
import { selectedProvider$ } from "../reefState";

export type InitProvider = (
  providerUrl: string,
  providerConnStateSubj?: Subject<WsConnectionState>
) => Promise<Provider>;

export async function initProvider(
  providerUrl: string,
  providerConnStateSubj?: Subject<WsConnectionState>
) {
  const newProvider = new Provider({
    //@ts-ignore
    provider: new WsProvider(providerUrl),
  });
  try {
    newProvider.api.on("connected", v =>
      providerConnStateSubj?.next({
        isConnected: true,
        status: {
          value: "connected",
          timestamp: new Date().getTime(),
          data: v,
        },
      })
    );
    newProvider.api.on("error", v =>
      providerConnStateSubj?.next({
        isConnected: false,
        status: { value: "error", timestamp: new Date().getTime(), data: v },
      })
    );
    newProvider.api.on("disconnected", v =>
      providerConnStateSubj?.next({
        isConnected: false,
        status: {
          value: "disconnected",
          timestamp: new Date().getTime(),
          data: v,
        },
      })
    );
    newProvider.api.on("ready", v =>
      providerConnStateSubj?.next({
        isConnected: true,
        status: {
          value: "connected",
          timestamp: new Date().getTime(),
          data: v,
        },
      })
    );
    await newProvider.api.isReadyOrError;
  } catch (e) {
    console.log("Provider isReadyOrError ERROR=", e);
    throw e;
  }
  return newProvider;
}

async function getReefStateProvider() {
  const provider = await firstValueFrom(selectedProvider$);
  if (!provider) {
    return null;
  }
  return provider;
}

export async function disconnectProvider(provider?: Provider) {
  if (!provider) {
    provider = await getReefStateProvider();
  }
  console.log("DISCCCCCCC=", !!provider);

  if (provider) {
    try {
      await provider.api.isReadyOrError;
      await provider.api.disconnect();
    } catch (e: any) {
      console.log("Provider disconnect err=", e.message);
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
