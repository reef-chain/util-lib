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
  DEFAULT_REEF_METHODS,
  MAINNET_CHAIN_ID,
  genesisHashToChainId,
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
        chainId: genesisHashToChainId(payload.genesisHash),
        topic: session.topic,
        request: {
          method: DEFAULT_REEF_METHODS.REEF_SIGN_TRANSACTION,
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
      return Promise.reject(new Error("_canceled"));
    }
  }

  public async signRaw(payload: SignerPayloadRaw): Promise<SignerResult> {
    try {
      const result = await client!.request<{
        signature: HexString;
      }>({
        chainId: MAINNET_CHAIN_ID,
        topic: session.topic,
        request: {
          method: DEFAULT_REEF_METHODS.REEF_SIGN_MESSAGE,
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
