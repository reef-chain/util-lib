import { ethers } from "ethers";
import { of, Observable } from "rxjs";
import {
  nativeTransferSigner$,
  nativeTransfer$,
  reef20Transfer$,
} from "../../src/transaction/token-transfer-util";
import { describe, expect, it } from "vitest";
import jest from "jest";
import { beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";

const MOCK_AMOUNT = "1000000000000000000"; // 1 ETH
const MOCK_TO_ADDRESS = "0x1234567890123456789012345678901234567890";

describe("nativeTransferSigner$", () => {
  it("should return an Observable", () => {
    const mockSigner = {
      getSubstrateAddress: jest.fn(() => Promise.resolve("mockAddress")),
      provider: {
        api: {},
      },
      signingKey: {},
    };
    const result = nativeTransferSigner$(
      MOCK_AMOUNT,
      mockSigner,
      MOCK_TO_ADDRESS
    );
    expect(result).toBeInstanceOf(Observable);
  });
});

describe("nativeTransfer$", () => {
  it("should return an Observable", () => {
    const mockProvider = {
      api: {
        query: {
          system: {
            account: jest.fn(() =>
              Promise.resolve({ data: { free: "2000000000000000000" } })
            ),
          },
        },
        tx: {
          balances: {
            transfer: jest.fn(() => ({
              signAndSend: jest.fn(() => Promise.resolve()),
            })),
          },
        },
      },
    };
    const mockSigner = {};
    const result = nativeTransfer$(
      MOCK_AMOUNT,
      "mockFromAddress",
      MOCK_TO_ADDRESS,
      mockProvider,
      mockSigner
    );
    expect(result).toBeInstanceOf(Observable);
  });
});

describe("reef20Transfer$", () => {
  it("should return an Observable", () => {
    const mockProvider = {};
    const mockTokenAmount = "100";
    const mockTokenContract = new ethers.Contract("mockAddress", [], {});
    const result = reef20Transfer$(
      MOCK_TO_ADDRESS,
      mockProvider,
      mockTokenAmount,
      mockTokenContract
    );
    expect(result).toBeInstanceOf(Observable);
  });
});
