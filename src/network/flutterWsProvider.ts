import { Observable, Subject } from "rxjs";
import { WsProvider } from "@polkadot/api";
import { WebSocket } from "@polkadot/x-ws";

export class FlutterWebSocket extends WebSocket {
  private sendToFlutterSubject: Subject<any> | null;

  constructor(url: string, sendToFlutterSubject: Subject<any> | null) {
    super(url);
    this.sendToFlutterSubject = sendToFlutterSubject;
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.sendToFlutterSubject) {
      this.sendToFlutterSubject.next({ data });
    } else {
      console.error(
        "FlutterWebSocket Error=== Flutter Web Socket not initialized!"
      );
    }
  }
  onFlutterWsMessage(data: MessageEvent<any>): void {
    this.onmessage(data);
  }
}

export class FlutterWsProvider extends WsProvider {
  private sendToFlutterSubject: Subject<{ data: any }> = new Subject<{
    data: any;
  }>();

  constructor(
    endpoint: string,
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

      (this as any)["__internal__websocket"] = new FlutterWebSocket(
        (this as any)["__internal__endpoints"][
          (this as any)["__internal__endpointIndex"]
        ],
        this.sendToFlutterSubject
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

  public connectToFlutter(): Observable<{ data: any }> {
    return this.sendToFlutterSubject.asObservable();
  }
}
