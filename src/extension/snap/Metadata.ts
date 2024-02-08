import type {
  InjectedMetadata,
  InjectedMetadataKnown,
  MetadataDef,
} from "../extension-inject/types";

import { SendSnapRequest } from "./types";

let sendRequest: SendSnapRequest;

export default class Metadata implements InjectedMetadata {
  constructor(_sendRequest: SendSnapRequest) {
    sendRequest = _sendRequest;
  }

  public get(): Promise<InjectedMetadataKnown[]> {
    return sendRequest("listMetadata");
  }

  public provide(definition: MetadataDef): Promise<boolean> {
    return sendRequest("provideMetadata", definition);
  }
}
