import type {
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
} from "@polkadot/rpc-provider/types";
import type { AnyFunction } from "@polkadot/types/types";

import type {
  InjectedProvider,
  ProviderList,
  ProviderMeta,
} from "../extension-inject/types";

import { SendSnapRequest } from "./types";

let sendRequest: SendSnapRequest;

export default class PostMessageProvider implements InjectedProvider {
  private _isConnected = false;

  private _isClonable = false;

  public constructor(_sendRequest: SendSnapRequest) {
    sendRequest = _sendRequest;
  }

  public get hasSubscriptions(): boolean {
    return false;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public get isClonable(): boolean {
    return this._isClonable;
  }

  public clone(): PostMessageProvider {
    if (!this.isClonable) {
      throw new Error("Unclonable provider");
    }
    return new PostMessageProvider(sendRequest);
  }

  public async connect(): Promise<void> {
    console.error("PostMessageProvider.disconnect() is not implemented.");
  }

  public async disconnect(): Promise<void> {
    console.error("PostMessageProvider.disconnect() is not implemented.");
  }

  public listProviders(): Promise<ProviderList> {
    throw new Error("PostMessageProvider.listProviders() is not implemented.");
  }

  public on(
    _type: ProviderInterfaceEmitted,
    _sub: ProviderInterfaceEmitCb
  ): () => void {
    console.error("PostMessageProvider.on() is not implemented.");
    return (): void => {};
  }

  public async send(
    _method: string,
    _params: unknown[],
    _isCacheable?: boolean
  ): Promise<any> {
    console.error("PostMessageProvider.send() is not implemented.");
  }

  public async startProvider(_key: string): Promise<ProviderMeta> {
    throw new Error("PostMessageProvider.startProvider() is not implemented.");
  }

  public subscribe(
    _type: string,
    method: string,
    params: unknown[],
    _callback: AnyFunction
  ): Promise<number> {
    return this.send(method, params) as Promise<number>;
  }

  public async unsubscribe(
    _type: string,
    _method: string,
    _id: number
  ): Promise<boolean> {
    console.error("PostMessageProvider.unsubscribe() is not implemented.");
    return false;
  }
}
