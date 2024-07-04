import { WebSocket } from "@polkadot/x-ws";
import { WsProvider } from "@polkadot/api";

export class ReefWsProvider extends WsProvider {
  private customWsProvider?: any;

  constructor(
    endpoint: string,
    autoConnectMs: number,
    headers: Record<string, string> = {},
    timeout: number,
    cacheCapacity: number,
    customWsProvider?: any
  ) {
    super(endpoint, autoConnectMs, headers, timeout, cacheCapacity);
    this.customWsProvider = customWsProvider;
  }

  override connect(): any {
    if ((this as any)["__internal__websocket"]) {
      throw new Error("WebSocket is already connected");
    }

    try {
      (this as any)["__internal__endpointIndex"] = (
        this as any
      ).selectEndpointIndex((this as any)["__internal__endpoints"]);

      (this as any)["__internal__websocket"] =
        this.customWsProvider ?? new WebSocket((this as any).endpoint);

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
