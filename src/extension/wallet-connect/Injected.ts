import Client from "@walletconnect/sign-client";
import { SessionTypes } from "@walletconnect/types";

import type { ReefInjected } from "../extension-inject/types";

import Accounts from "./Accounts";
import SigningKey from "./Signer";
import ReefProvider from "./ReefProvider";
import ReefSigner from "./ReefSigner";

export default class implements ReefInjected {
  public readonly accounts: Accounts;
  public readonly signer: SigningKey;
  public readonly reefProvider: ReefProvider;
  public readonly reefSigner: ReefSigner;

  constructor(client: Client, session: SessionTypes.Struct) {
    this.accounts = new Accounts(session);
    this.signer = new SigningKey(client, session);
    this.reefProvider = new ReefProvider(session);
    this.reefSigner = new ReefSigner(
      this.accounts,
      this.signer,
      this.reefProvider
    );
  }
}
