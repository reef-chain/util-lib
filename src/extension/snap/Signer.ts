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
      const approved = await sendRequest("requestSignature", payload);
      if (!approved) return Promise.reject(new Error("_canceled"));
      const result = await sendRequest("approveSignExtrinsic", payload);
      return { ...result };
    } catch (e) {
      return Promise.reject(new Error("_canceled"));
    }
  }

  public async signRaw(payload: SignerPayloadRaw): Promise<SignerResult> {
    try {
      const approved = await sendRequest("signPayload", payload);
      if (!approved) return Promise.reject(new Error("_canceled"));
      const result = await sendRequest("approveSignBytes", payload);
      return { ...result };
    } catch (e) {
      return Promise.reject(new Error("_canceled"));
    }
  }
}
