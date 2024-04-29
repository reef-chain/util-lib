import type {
  Signer as SignerInterface,
  SignerResult,
} from "@polkadot/api/types";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";

import { SendSnapRequest } from "./types";

let sendRequest: SendSnapRequest;

export default class Signer implements SignerInterface {
  constructor(_sendRequest: SendSnapRequest) {
    sendRequest = _sendRequest;
  }

  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    try {
      const result = await sendRequest("requestSignature", payload);
      if (!result) return Promise.reject(new Error("_canceled"));
      return { ...result };
    } catch (e) {
      return Promise.reject(new Error("_canceled"));
    }
  }

  public async signRaw(payload: SignerPayloadRaw): Promise<SignerResult> {
    try {
      const result = await sendRequest("requestSignature", payload);
      if (!result) return Promise.reject(new Error("_canceled"));
      return { ...result };
    } catch (e) {
      return Promise.reject(new Error("_canceled"));
    }
  }
}
