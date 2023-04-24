import {
  initProvider,
  disconnectProvider,
} from "../../src/network/providerUtil";
import { Provider } from "@reef-defi/evm-provider";
import { describe, it, expect } from "vitest";
import { /*beforeEach, afterEach,*/ beforeAll, afterAll } from "@jest/globals";

describe("Provider functions", () => {
  let provider: Provider;

  beforeAll(async () => {
    // Set up the provider
    provider = await initProvider("wss://rpc.reefscan.info");
  });

  afterAll(async () => {
    // Disconnect the provider after the tests are finished
    await disconnectProvider(provider);
  });

  it("should initialize a new provider", async () => {
    expect(provider).toBeDefined();
    expect(provider.api.isConnected).toBe(true);
  });

  it("should disconnect the provider", async () => {
    await disconnectProvider(provider);
    expect(provider.api.isConnected).toBe(false);
  });
});
