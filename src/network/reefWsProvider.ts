import { WsProvider } from "@polkadot/api";
import { WebSocket } from "@polkadot/x-ws";
import { Subject } from "rxjs";

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
    super.send(data);
    console.log("sending mesaage====================");
    if (this.sendToFlutterSubject) {
      this.sendToFlutterSubject.next({ data });
    } else {
      console.log(
        "FlutterWebSocket Error=== Flutter Web Socket not initialized!"
      );
    }
  }
}

export class ReefWsProvider extends WsProvider {
  constructor(
    endpoint?: string,
    autoConnectMs?: number,
    headers: Record<string, string> = {},
    timeout?: number,
    cacheCapacity?: number
  ) {
    super(endpoint, autoConnectMs, headers, timeout, cacheCapacity);
  }

  override connect(): any {
    if ((this as any)["__internal__websocket"]) {
      throw new Error("WebSocket is already connected");
    }

    try {
      (this as any)["__internal__endpointIndex"] = (
        this as any
      ).selectEndpointIndex((this as any)["__internal__endpoints"]);

      // note: if i directly pass the websocket and don't create a new instance then in that case the provider doesn't initialize i.e this.customWebSocket doesnt work, hence need to initialize it here and using custom web socket
      (this as any)["__internal__websocket"] = new FlutterWebSocket(
        this.endpoint
      );

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
