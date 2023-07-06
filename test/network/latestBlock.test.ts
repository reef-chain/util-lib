import {
  initProvider,
  disconnectProvider,
} from "../../src/network/providerUtil";
import { Provider } from "@reef-defi/evm-provider";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getLatestBlock$ } from "../../src/network/latestBlock";
import { firstValueFrom } from "rxjs";

describe("Latest block functions", () => {
  it("should get latest block", async () => {
    const latestBlock$ = getLatestBlock$();
    const block = await firstValueFrom(latestBlock$);
    expect(block).toBeDefined();
    expect(block.blockHash).toBeDefined();
    expect(block.blockId).toBeDefined();
    expect(block.blockHeight > 0).toBeTruthy();
  });
});
