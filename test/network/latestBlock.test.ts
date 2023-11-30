import { beforeAll, describe, expect, it } from "vitest";
import {
  getLatestBlockAccountUpdates$,
  _getBlockAccountTransactionUpdates$,
  LatestBlockData,
  AccountIndexedTransactionType,
  latestBlockUpdates$,
} from "../../src/network/latestBlock";
import { firstValueFrom, Observable, skip, Subject, tap } from "rxjs";
import { initReefState, selectedNetwork$ } from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";

describe("Latest block", () => {
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.mainnet,
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

  it("check address filtering", async () => {
    const pusherLatestBlockSubj = new Subject();
    setTimeout(function () {
      pusherLatestBlockSubj.next({
        blockHeight: 6699625,
        blockId: "0006699625-64afe",
        blockHash:
          "0x64afe1c5db31ed4a6e2657f8c3afb102739a50b4dc04fdb3a775df16e82ec096",
        updatedAccounts: {
          REEF20Transfers: [
            "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
          ],
          REEF1155Transfers: [],
          REEF721Transfers: [],
          boundEvm: [],
        },
        updatedContracts: ["0xDA04bA1313d382374fDB1834Ed0dF441b51636C8"],
      } as LatestBlockData);
    }, 1000);
    const latestBlock$ = _getBlockAccountTransactionUpdates$(
      pusherLatestBlockSubj.asObservable() as Observable<any>,
      ["5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN"]
    );
    const block = await firstValueFrom(latestBlock$);
    expect(block).toBeDefined();
    expect(block.blockHash).toBeDefined();
    expect(block.blockId).toBeDefined();
    expect(block.blockHeight > 0).toBeTruthy();
    expect(block.addresses.length).toBe(1);

    const pusherLatestBlockSubj1 = new Subject();
    setTimeout(function () {
      pusherLatestBlockSubj1.next({
        blockHeight: 6699625,
        blockId: "0006699625-64afe",
        blockHash:
          "0x64afe1c5db31ed4a6e2657f8c3afb102739a50b4dc04fdb3a775df16e82ec096",
        updatedAccounts: {
          REEF20Transfers: [
            "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
          ],
          REEF1155Transfers: [],
          REEF721Transfers: [],
          boundEvm: [],
        },
        updatedContracts: ["0xDA04bA1313d382374fDB1834Ed0dF441b51636C8"],
      });
    }, 3000);
    const latestBlock1$ = _getBlockAccountTransactionUpdates$(
      pusherLatestBlockSubj1.asObservable() as Observable<any>,
      [
        "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
        "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
      ],
      [AccountIndexedTransactionType.REEF20_TRANSFER]
    );

    const block1 = await firstValueFrom(latestBlock1$);
    expect(block1.addresses.length).toBe(2);

    const pusherLatestBlockSubj2 = new Subject();
    setTimeout(function () {
      pusherLatestBlockSubj2.next({
        blockHeight: 6699625,
        blockId: "0006699625-64afe",
        blockHash:
          "0x64afe1c5db31ed4a6e2657f8c3afb102739a50b4dc04fdb3a775df16e82ec096",
        updatedAccounts: {
          REEF20Transfers: [
            "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
          ],
          REEF1155Transfers: [],
          REEF721Transfers: [],
          boundEvm: [],
        },
        updatedContracts: ["0xDA04bA1313d382374fDB1834Ed0dF441b51636C8"],
      });
    }, 1000);
    const latestBlock2$ = _getBlockAccountTransactionUpdates$(
      pusherLatestBlockSubj2.asObservable() as Observable<any>,
      [""]
    );

    const block2 = await firstValueFrom(latestBlock2$);
    expect(block2.addresses.length).toBe(2);

    const pusherLatestBlockSubj3 = new Subject();
    setTimeout(function () {
      pusherLatestBlockSubj3.next({
        blockHeight: 6699625,
        blockId: "0006699625-64afe",
        blockHash:
          "0x64afe1c5db31ed4a6e2657f8c3afb102739a50b4dc04fdb3a775df16e82ec096",
        updatedAccounts: {
          REEF20Transfers: [
            "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
          ],
          REEF1155Transfers: [
            "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
          ],
          REEF721Transfers: [
            "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
          ],
          boundEvm: [],
        },
        updatedContracts: ["0xDA04bA1313d382374fDB1834Ed0dF441b51636C8"],
      });
    }, 1000);
    const latestBlock3$ = _getBlockAccountTransactionUpdates$(
      pusherLatestBlockSubj3.asObservable() as Observable<any>,
      [""],
      [AccountIndexedTransactionType.REEF_NFT_TRANSFER]
    );

    const block3 = await firstValueFrom(latestBlock3$);
    expect(block3.addresses.length).toBe(2);

    const pusherLatestBlockSubj4 = new Subject();
    setTimeout(function () {
      pusherLatestBlockSubj4.next({
        blockHeight: 6699625,
        blockId: "0006699625-64afe",
        blockHash:
          "0x64afe1c5db31ed4a6e2657f8c3afb102739a50b4dc04fdb3a775df16e82ec096",
        updatedAccounts: {
          REEF20Transfers: [
            "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
          ],
          REEF1155Transfers: [
            "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN",
          ],
          REEF721Transfers: [
            "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
          ],
          boundEvm: ["5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP"],
        },
        updatedContracts: ["0xDA04bA1313d382374fDB1834Ed0dF441b51636C8"],
      });
    }, 1000);
    const latestBlock4$ = _getBlockAccountTransactionUpdates$(
      pusherLatestBlockSubj4.asObservable() as Observable<any>,
      ["5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP"],
      [AccountIndexedTransactionType.REEF_BIND_TX]
    );

    const block4 = await firstValueFrom(latestBlock4$);
    expect(block4.addresses.length).toBe(1);
  }, 10000);

  it("should get latest indexed block data", async ctx => {
    const network = await firstValueFrom(selectedNetwork$);
    expect(network).toBeTruthy();
    const block = await firstValueFrom(latestBlockUpdates$);
    expect(block.blockHeight).toBeGreaterThan(7821890);
  }, 20000);

  it("should get latest block account change data", async ctx => {
    const network = await firstValueFrom(selectedNetwork$);
    expect(network).toBeTruthy();
    const block = await firstValueFrom(getLatestBlockAccountUpdates$([]));
    expect(block?.blockHeight).toBeGreaterThan(0);
  }, 20000);

  it.skip("should get token update", async ctx => {
    const block = await firstValueFrom(
      getLatestBlockAccountUpdates$(
        [],
        [AccountIndexedTransactionType.REEF20_TRANSFER]
      ).pipe(
        tap(v => console.log("val=", v)),
        skip(100)
      )
    );
  }, 100000);
});
