import type {
  Signer as SignerInterface,
  SignerResult,
} from "@polkadot/api/types";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";
import type { HexString } from "@polkadot/util/types";
import Client from "@walletconnect/sign-client";
import { SessionTypes } from "@walletconnect/types";

import {
  WC_DEFAULT_METHODS,
  WC_MAINNET_CHAIN_ID,
  genesisHashToWcChainId,
} from "./utils";

let client: Client;
let session: SessionTypes.Struct;

export default class Signer implements SignerInterface {
  constructor(_client: Client, _session: SessionTypes.Struct) {
    client = _client;
    session = _session;
  }

  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    try {
      const result = await client!.request<{
        payload: string;
        signature: HexString;
      }>({
        chainId: genesisHashToWcChainId(payload.genesisHash),
        topic: session.topic,
        request: {
          method: WC_DEFAULT_METHODS.REEF_SIGN_TRANSACTION,
          params: {
            address: payload.address,
            transactionPayload: payload,
          },
        },
      });
      if (!result) return Promise.reject(new Error("_canceled"));
      return {
        id: 0,
        signature: result.signature,
      };
    } catch (e) {
      if (
        e.toString().includes("Missing or invalid. Record was recently deleted")
      ) {
        return Promise.reject(new Error("_invalid"));
      }
      return Promise.reject(new Error("_canceled"));
    }
  }

  public async signRaw(payload: SignerPayloadRaw): Promise<SignerResult> {
    try {
      const result = await client!.request<{
        signature: HexString;
      }>({
        chainId: WC_MAINNET_CHAIN_ID,
        topic: session.topic,
        request: {
          method: WC_DEFAULT_METHODS.REEF_SIGN_MESSAGE,
          params: {
            address: payload.address,
            message: payload.data,
          },
        },
      });
      if (!result) return Promise.reject(new Error("_canceled"));
      return {
        id: 0,
        signature: result.signature,
      };
    } catch (e) {
      return Promise.reject(new Error("_canceled"));
    }
  }
}
