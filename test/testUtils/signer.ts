import { Provider, Signer } from "@reef-defi/evm-provider";
import { MnemonicSigner } from "./mnemonic-signer";

export const getSigner = (
  provider: Provider,
  address: string,
  mnemonic?: string
) => {
  const hardCodedMnemonic =
    "judge box bless much media say shrug crunch gun scorpion afraid object";
  const implementedSigner = new MnemonicSigner(mnemonic ?? hardCodedMnemonic);
  return new Signer(provider, address, implementedSigner as any);
};
