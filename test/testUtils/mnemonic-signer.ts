import { Signer as SignerInterface, SignerResult } from "@polkadot/api/types";
import { u8aToHex, u8aWrapBytes } from "@polkadot/util";
import { TypeRegistry } from "@polkadot/types";
import { KeyringPair } from "@polkadot/keyring/types";
import type {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types";
import { KeypairType } from "@reef-defi/util-crypto/types";
import { Keyring as ReefKeyring } from "@reef-defi/keyring";

const CRYPTO_TYPE: KeypairType = "sr25519";
const SS58_FORMAT = 42;
const keyring = new ReefKeyring({ type: CRYPTO_TYPE, ss58Format: SS58_FORMAT });

async function keyPairFromMnemonic(mnemonic: string): Promise<KeyringPair> {
  return keyring.addFromMnemonic(mnemonic, {}, CRYPTO_TYPE);
}

export class MnemonicSigner implements SignerInterface {
  mnemonic: string;
  private nextId = 0;

  constructor(mnemonic: string) {
    this.mnemonic = mnemonic;
  }

  async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    const registry = new TypeRegistry();
    registry.setSignedExtensions(payload.signedExtensions);

    const pair: KeyringPair = await keyPairFromMnemonic(this.mnemonic);

    return {
      id: ++this.nextId,
      ...registry
        .createType("ExtrinsicPayload", payload, { version: payload.version })
        .sign(pair),
    };
  }

  async signRaw(payloadRaw: SignerPayloadRaw): Promise<SignerResult> {
    const pair: KeyringPair = await keyPairFromMnemonic(this.mnemonic);
    if (pair.address === payloadRaw.address) {
    }
    return {
      id: ++this.nextId,
      signature: u8aToHex(pair.sign(u8aWrapBytes(payloadRaw.data))),
    };
  }
}
