import { KeypairType } from "@reef-defi/util-crypto/types";
import { Keyring as ReefKeyring } from "@reef-defi/keyring";
import { KeyringPair } from "@reef-defi/keyring/types";
import { mnemonic1 as hardCodedMnemonic } from "./mnemonics";
import { cryptoWaitReady } from "@reef-defi/util-crypto";

export const getKeyring = async (mnemonic?: string): Promise<KeyringPair> => {
  const CRYPTO_TYPE: KeypairType = "sr25519";
  const SS58_FORMAT = 42;
  const keyring = new ReefKeyring({
    type: CRYPTO_TYPE,
    ss58Format: SS58_FORMAT,
  });
  let keyringPair: KeyringPair;
  await cryptoWaitReady();
  keyringPair = keyring.addFromUri(
    mnemonic ?? hardCodedMnemonic,
    {},
    CRYPTO_TYPE
  );
  return keyringPair;
};
