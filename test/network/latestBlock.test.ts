import { beforeAll, describe, expect, it } from "vitest";
import {
  getLatestBlockTokenUpdates$,
  _getBlockAccountTokenUpdates$,
} from "../../src/network/latestBlock";
import { firstValueFrom, Observable, Subject } from "rxjs";
import { initReefState, selectedNetwork$ } from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";

describe("Latest block", () => {
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: {
        accounts: [
          {
            address: "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
            // address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            isSelected: true,
          },
        ],
        injectedSigner: {},
      },
    });
  });

  it("check correct data format", async () => {
    const pusherLatestBlockSubj = new Subject();
    setTimeout(function () {
      pusherLatestBlockSubj.next({
        blockHeight: 6699625,
        blockId: "0006699625-64afe",
        blockHash:
          "0x64afe1c5db31ed4a6e2657f8c3afb102739a50b4dc04fdb3a775df16e82ec096",
        updatedNativeAccounts: [
          "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
          "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
        ],
        updatedEvmAccounts: [
          "0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2",
          "0xfb730ec3f38aB358AafA2EdD3fB2C17a5337dD7C",
        ],
        updatedContracts: ["0xDA04bA1313d382374fDB1834Ed0dF441b51636C8"],
      });
    }, 1000);
    const latestBlock$ = _getBlockAccountTokenUpdates$(
      pusherLatestBlockSubj.asObservable() as Observable<any>,
      [
        "0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2",
        "0xfb730ec3f38aB358AafA2EdD3fB2C17a5337dD7C",
      ]
    );
    const block = await firstValueFrom(latestBlock$);
    expect(block).toBeDefined();
    expect(block.blockHash).toBeDefined();
    expect(block.blockId).toBeDefined();
    expect(block.blockHeight > 0).toBeTruthy();
    expect(block.addresses.length).toBe(2);

    const pusherLatestBlockSubj1 = new Subject();
    setTimeout(function () {
      pusherLatestBlockSubj1.next({
        blockHeight: 6699625,
        blockId: "0006699625-64afe",
        blockHash:
          "0x64afe1c5db31ed4a6e2657f8c3afb102739a50b4dc04fdb3a775df16e82ec096",
        updatedNativeAccounts: [
          "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
          "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
        ],
        updatedEvmAccounts: [
          "0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2",
          "0xfb730ec3f38aB358AafA2EdD3fB2C17a5337dD7C",
        ],
        updatedContracts: ["0xDA04bA1313d382374fDB1834Ed0dF441b51636C8"],
      });
    }, 3000);
    const latestBlock1$ = _getBlockAccountTokenUpdates$(
      pusherLatestBlockSubj1.asObservable() as Observable<any>,
      ["0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2"]
    );

    const block1 = await firstValueFrom(latestBlock1$);
    expect(block1.addresses.length).toBe(1);

    const pusherLatestBlockSubj2 = new Subject();
    setTimeout(function () {
      pusherLatestBlockSubj2.next({
        blockHeight: 6699625,
        blockId: "0006699625-64afe",
        blockHash:
          "0x64afe1c5db31ed4a6e2657f8c3afb102739a50b4dc04fdb3a775df16e82ec096",
        updatedNativeAccounts: [
          "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
          "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
        ],
        updatedEvmAccounts: [
          "0x7Ca7886e0b851e6458770BC1d85Feb6A5307b9a2",
          "0xfb730ec3f38aB358AafA2EdD3fB2C17a5337dD7C",
        ],
        updatedContracts: ["0xDA04bA1313d382374fDB1834Ed0dF441b51636C8"],
      });
    }, 1000);
    const latestBlock2$ = _getBlockAccountTokenUpdates$(
      pusherLatestBlockSubj2.asObservable() as Observable<any>,
      [""]
    );

    const block2 = await firstValueFrom(latestBlock2$);
    expect(block2.addresses.length).toBe(4);
  });

  it("should get latest latest data", async ctx => {
    const network = await firstValueFrom(selectedNetwork$);
    expect(network).toBeTruthy();
    const block = await firstValueFrom(getLatestBlockTokenUpdates$([]));
    expect(block.blockHeight).toBeGreaterThan(0);
  }, 30000);
});
