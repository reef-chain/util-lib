import { beforeAll, describe, expect, it } from "vitest";
import { firstValueFrom } from "rxjs";
import { availableAddresses$ } from "../../src/reefState/account/availableAddresses";
import { selectedAccount_status$ } from "../../src/reefState/account/selectedAccount";
import { initReefState } from "../../src/reefState/initReefState";
import { AVAILABLE_NETWORKS } from "../../src/network/network";
import { cryptoWaitReady } from "@reef-defi/util-crypto";
import { KeyringPair } from "@reef-defi/keyring/types";
import { Provider } from "@reef-defi/evm-provider";
import { initProvider } from "../../src/network/providerUtil";
import { KeypairType } from "@reef-defi/util-crypto/types";
import { Keyring as ReefKeyring } from "@reef-defi/keyring";
import { setSelectedAddress } from "../../src/reefState/account/setAccounts";

describe("Available Addresses", () => {
  const TEST_ACCOUNTS = [
    {
      address: "5GKKbUJx6DQ4rbTWavaNttanWAw86KrQeojgMNovy8m2QoXn",
      name: "acc1",
      meta: { source: "reef" },
    },
    {
      address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
      name: "test-mobile",
      meta: { source: "reef" },
    },
    {
      address: "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
      name: "test1",
      meta: { source: "reef" },
    },
  ];
  const mnemonic =
    "judge box bless much media say shrug crunch gun scorpion afraid object";
  const CRYPTO_TYPE: KeypairType = "sr25519";
  const SS58_FORMAT = 42;
  const keyring = new ReefKeyring({
    type: CRYPTO_TYPE,
    ss58Format: SS58_FORMAT,
  });
  let allSig: any;

  let keyringPair: KeyringPair;
  beforeAll(async () => {
    await cryptoWaitReady();
    keyringPair = keyring.addFromMnemonic(mnemonic, {}, CRYPTO_TYPE);
    await initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: {
        accounts: TEST_ACCOUNTS,
        injectedSigner: keyringPair as any,
      },
    });
    allSig = await firstValueFrom(availableAddresses$);
  });
  it("set selected address", async () => {
    const selSig = await firstValueFrom(selectedAccount_status$);
    if (!selSig) {
      setSelectedAddress(allSig[0].address);
    }
    expect(selSig?.data.address).toEqual(
      "5GKKbUJx6DQ4rbTWavaNttanWAw86KrQeojgMNovy8m2QoXn"
    );
  });
});
