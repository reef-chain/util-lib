import type {
  IsDefaultExtension,
  ReefInjected,
} from "../extension-inject/types";
import type { SendSnapRequest } from "./types";

import Accounts from "./Accounts";
import Metadata from "./Metadata";
import PostMessageProvider from "./PostMessageProvider";
import ReefSigner from "./ReefSigner";
import ReefProvider from "./ReefProvider";
import SigningKey from "./Signer";

export default class implements ReefInjected {
  public readonly accounts: Accounts;
  public readonly metadata: Metadata;
  public readonly provider: PostMessageProvider;
  public readonly signer: SigningKey;
  public readonly reefSigner: ReefSigner;
  public readonly reefProvider: ReefProvider;
  public readonly isDefaultExtension?: IsDefaultExtension | null | undefined;

  constructor(
    sendRequest: SendSnapRequest,
    isDefaultExtension?: IsDefaultExtension
  ) {
    this.accounts = new Accounts(sendRequest);
    this.metadata = new Metadata(sendRequest);
    this.provider = new PostMessageProvider(sendRequest);
    this.signer = new SigningKey(sendRequest);
    this.reefProvider = new ReefProvider(sendRequest);
    this.reefSigner = new ReefSigner(
      this.accounts,
      this.signer,
      this.reefProvider
    );
    this.isDefaultExtension = isDefaultExtension;
  }
}
