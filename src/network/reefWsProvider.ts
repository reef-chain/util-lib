import { WsProvider } from "@polkadot/api";
import { WebSocket } from "@polkadot/x-ws";
import { Subject } from "rxjs";

export class ReefWsProvider extends WsProvider {
  private customWebSocket: WsProvider;

  constructor(
    customWebSocket: WsProvider,
    endpoint?: string,
    autoConnectMs?: number,
    headers: Record<string, string> = {},
    timeout?: number,
    cacheCapacity?: number
  ) {
    super(endpoint, autoConnectMs, headers, timeout, cacheCapacity);
    this.customWebSocket = customWebSocket;
  }

  override connect(): any {
    if ((this as any)["__internal__websocket"]) {
      throw new Error("WebSocket is already connected");
    }

    try {
      (this as any)["__internal__endpointIndex"] = (
        this as any
      ).selectEndpointIndex((this as any)["__internal__endpoints"]);

      (this as any)["__internal__websocket"] = this.customWebSocket;

      if ((this as any)["__internal__websocket"]) {
        (this as any)["__internal__websocket"].onclose = (this as any)[
          "__internal__onSocketClose"
        ];
        (this as any)["__internal__websocket"].onerror = (this as any)[
          "__internal__onSocketError"
        ];
        (this as any)["__internal__websocket"].onmessage = (this as any)[
          "__internal__onSocketMessage"
        ];
        (this as any)["__internal__websocket"].onopen = (this as any)[
          "__internal__onSocketOpen"
        ];
      }
    } catch (error) {
      console.error(error);

      (this as any)["__internal__emit"]("error", error);

      throw error;
    }
  }
}

export class FlutterWebSocket extends WebSocket {
  private sendToFlutterSubject: Subject<any> | null;

  constructor(url: string) {
    super(url);
    this.sendToFlutterSubject;
  }

  connectFlutterWs(_sendToFlutterSubject: Subject<any>) {
    this.sendToFlutterSubject = _sendToFlutterSubject;
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.sendToFlutterSubject) {
      this.sendToFlutterSubject.next({ data });
    } else {
      console.log(
        "FlutterWebSocket Error=== Flutter Web Socket not initialized!"
      );
    }
  }
}
