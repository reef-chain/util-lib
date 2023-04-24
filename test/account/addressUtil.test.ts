import { getEvmAddress } from "../../src/account/addressUtil";
import { Provider } from "@reef-defi/evm-provider";
import { describe, it, expect } from "vitest";
import jest from "jest";
import { beforeEach, afterEach } from "@jest/globals";

// Mock Provider class
jest.mock("@reef-defi/evm-provider", () => {
  return {
    Provider: jest.fn().mockImplementation(() => ({
      api: {
        query: {
          evmAccounts: {
            evmAddresses: jest.fn(),
          },
        },
      },
    })),
  };
});

describe("getEvmAddress", () => {
  let provider: any;

  beforeEach(() => {
    provider = new Provider("ws://localhost:9944");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the input address if it is not an EVM address", async () => {
    const address = "0x1234567890123456789012345678901234567890123";
    const result = await getEvmAddress(address, provider);
    expect(result).toEqual(address);
  });

  it("should return the corresponding EVM address", async () => {
    const address = "5135a58b5f103b25a73a1fffc57c584b7d8b9576d59e70ff";
    const expected = "0xb080b6dD9e077eA6c4A4E4a4fD5126f07Ba0Fb2D";
    provider.api.query.evmAccounts.evmAddresses.mockResolvedValueOnce(expected);
    const result = await getEvmAddress(address, provider);
    expect(result).toEqual(expected);
  });

  it("should throw an error if the EVM address does not exist", async () => {
    const address = "5135a58b5f103b25a73a1fffc57c584b7d8b9576d59e70ff";
    provider.api.query.evmAccounts.evmAddresses.mockResolvedValueOnce(null);
    await expect(getEvmAddress(address, provider)).rejects.toThrow(
      "EVM address does not exist"
    );
  });
});
