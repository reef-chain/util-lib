import { TestScheduler } from "rxjs/testing";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ethers } from "ethers";
import {
  parseAndRethrowErrorFromObserver,
  TxStatusError,
  getNativeTransactionStatusHandler$,
  getEvmTransactionStatus$,
} from "../../src/transaction/transaction-status-util";
import { describe, expect, it } from "vitest";
import { beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";

describe("parseAndRethrowErrorFromObserver", () => {
  let testScheduler: TestScheduler;
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it("should parse and throw an error", () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable } = helpers;
      const observer = cold("-#");
      const txIdent = "testTx";
      const error = new Error("test error");

      const expected = "-#";

      expectObservable(
        observer.pipe(parseAndRethrowErrorFromObserver(observer, txIdent))
      ).toBe(expected, null, new TxStatusError(error.message, txIdent));
    });
  });
});

describe("getNativeTransactionStatusHandler$", () => {
  it("should emit TxStage.BROADCAST when status is broadcast", () => {
    const txIdent = "some-tx-ident";
    const { handler, status$ } = getNativeTransactionStatusHandler$(txIdent);
    const result = { status: { isBroadcast: true } };

    handler(result);

    expect(status$.getValue()).toEqual({ txStage: TxStage.BROADCAST, txIdent });
  });

  it("should emit TxStage.INCLUDED_IN_BLOCK when status is in block", () => {
    const txIdent = "some-tx-ident";
    const { handler, status$ } = getNativeTransactionStatusHandler$(txIdent);
    const result = { status: { isInBlock: "some-block-hash" } };

    handler(result);

    expect(status$.getValue()).toEqual({
      txStage: TxStage.INCLUDED_IN_BLOCK,
      txData: { blockHash: "some-block-hash" },
      txIdent,
    });
  });

  it("should emit TxStage.BLOCK_FINALIZED when status is finalized", () => {
    const txIdent = "some-tx-ident";
    const { handler, status$ } = getNativeTransactionStatusHandler$(txIdent);
    const result = { status: { isFinalized: "some-block-hash" } };

    handler(result);

    expect(status$.getValue()).toEqual({
      txStage: TxStage.BLOCK_FINALIZED,
      txData: { blockHash: "some-block-hash" },
      txIdent,
    });
    expect(status$.isStopped).toBe(false);

    // Wait for setTimeout to complete
    setTimeout(() => {
      expect(status$.isStopped).toBe(true);
    });
  });
});

describe("getEvmTransactionStatus$", () => {
  let rpcApi: ApiPromise;
  let provider: ethers.providers.JsonRpcProvider;

  beforeAll(async () => {
    // Connect to the Polkadot node's WebSocket endpoint
    const wsProvider = new WsProvider("wss://your-polkadot-node-endpoint");
    rpcApi = await ApiPromise.create({ provider: wsProvider });

    // Connect to the Ethereum node's JSON-RPC endpoint
    const ethProvider = new ethers.providers.JsonRpcProvider(
      "https://your-ethereum-node-endpoint"
    );
    provider = ethProvider;
  });

  afterAll(() => {
    // Disconnect from the nodes
    rpcApi.disconnect();
    provider.disconnect();
  });

  it("should emit transaction status events", async () => {
    // Create an Ethereum wallet for sending the transaction
    const wallet = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);

    // Create a transaction to send some ETH to another address
    const tx = {
      to: "0x1234567890123456789012345678901234567890",
      value: ethers.utils.parseEther("1"),
    };

    // Send the transaction using the wallet
    const sentTx = await wallet.sendTransaction(tx);

    // Wait for the transaction status events to be emitted
    const status$ = getEvmTransactionStatus$(
      sentTx.wait(),
      rpcApi,
      sentTx.hash
    );

    let lastEvent;
    status$.subscribe(event => {
      lastEvent = event;
    });

    // Wait for the transaction to be included in a block
    await status$
      .pipe(
        filter(event => event.txStage === TxStage.INCLUDED_IN_BLOCK),
        take(1)
      )
      .toPromise();

    // Wait for the block to be finalized
    await status$
      .pipe(
        filter(event => event.txStage === TxStage.BLOCK_FINALIZED),
        take(1)
      )
      .toPromise();

    // Check the last event emitted by the observable
    expect(lastEvent).toEqual({
      txStage: TxStage.BLOCK_FINALIZED,
      txData: expect.anything(),
      txIdent: sentTx.hash,
    });
  });
});
