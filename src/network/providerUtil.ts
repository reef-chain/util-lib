import { Provider } from "@reef-chain/evm-provider";
import { Subject, firstValueFrom } from "rxjs";
import { WsConnectionState } from "../reefState/ws-connection-state";
import { selectedProvider$ } from "../reefState";
import { RpcConfig } from "../reefState/networkState";
import { ReefWsProvider } from "./reefWsProvider";
import { WsProvider } from "@polkadot/api";
import { rpc } from "@polkadot/types/interfaces/definitions";

export type InitProvider = (
  providerUrl: string,
  providerConnStateSubj?: Subject<WsConnectionState>,
  rpcConfig?: RpcConfig
) => Promise<Provider>;

export async function initProvider(
  providerUrl: string,
  providerConnStateSubj?: Subject<WsConnectionState>,
  rpcConfig?: RpcConfig
) {
  let newProvider;
  try {
    newProvider = new Provider({
      //@ts-ignore
      provider: rpcConfig?.customWsProvider
        ? new ReefWsProvider(
            providerUrl,
            rpcConfig?.autoConnectMs,
            rpcConfig.customWsProvider
          )
        : new WsProvider(providerUrl, rpcConfig?.autoConnectMs),
    });
  } catch (e) {
    console.log("ERROR provider init=", e.message);
    throw new Error(e);
  }
  try {
    newProvider.api.on("connected", v => {
      console.log("util-lib providerConnected");
      providerConnStateSubj?.next({
        isConnected: true,
        status: {
          value: "connected",
          timestamp: new Date().getTime(),
          // !!! don't pass data from input parameters since can't be JSON encoded
          // data: v,
        },
      });
    });
    newProvider.api.on("error", v => {
      console.log("util-lib providerError");
      providerConnStateSubj?.next({
        isConnected: false,
        status: {
          value: "error",
          timestamp: new Date().getTime(),
          // !!! don't pass data from input parameters since can't be JSON encoded,
          // data: v
        },
      });
    });
    newProvider.api.on("disconnected", v => {
      console.log("util-lib providerDISConnected");
      providerConnStateSubj?.next({
        isConnected: false,
        status: {
          value: "disconnected",
          timestamp: new Date().getTime(),
          // !!! don't pass data from input parameters since can't be JSON encoded
          // data: v,
        },
      });
    });
    newProvider.api.on("ready", _ => {
      console.log("util-lib providerReady");
      providerConnStateSubj?.next({
        isConnected: true,
        status: {
          value: "connected",
          timestamp: new Date().getTime(),
          // !!! don't pass data from input parameters since can't be JSON encoded
          // data: v,
        },
      });
    });
    await newProvider.api.isReadyOrError;
  } catch (e) {
    console.log("Provider isReadyOrError ERROR=", e.message);
    providerConnStateSubj?.next({
      isConnected: false,
      status: {
        value: "error",
        timestamp: new Date().getTime(),
        data: e.message,
      },
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
    const disconnected = new Promise((resolve, reject) => {
      provider.api.once("disconnected", v => {
        console.log("disconnected provider");
        resolve(true);
      });
    });

    try {
      await provider.api.isReadyOrError;
      provider.api.disconnect();
      return disconnected;
    } catch (e: any) {
      console.log("Provider disconnect err=", e.message);
      throw new Error(e);
    }
  }
  return false;
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
      await disconnectProvider(provider);
      return new Promise((resolve, reject) => {
        // needs to be in next tick
        setTimeout(async () => {
          try {
            await connectProvider(provider);
          } catch (e) {
            console.log("ERROR connecting provider", e.message);
            resolve(false);
          }
          resolve(true);
        }, 0);
      });
      // return Promise.resolve(true);
      // return await connectProvider(provider);
    } catch (e: any) {
      console.log("Provider reconnect err=", e.message);
    }
  }
  return false;
}
