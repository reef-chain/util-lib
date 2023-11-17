import { describe, it, expect } from "vitest";
import {
  getTokenPrice,
  getTokenListPrices,
  retrieveReefCoingeckoPrice,
} from "../../src/token/prices";
import { REEF_TOKEN, isNativeTransfer } from "../../src/token/index";

describe("prices", () => {
  it("should return reef token price", async () => {
    const res = await getTokenPrice("reef");
    expect(res).toBeGreaterThan(0.0);
  });
  it("should return bool for native transfer", () => {
    const res = isNativeTransfer(REEF_TOKEN);
    expect(res).toEqual(true);
  });
});

describe("getTokenListPrices", () => {
  it("should return valid prices for a list of existing tokens", async () => {
    const prices = await getTokenListPrices(["ethereum", "bitcoin"]);
    expect(prices.ethereum).toBeGreaterThan(0);
    expect(prices.bitcoin).toBeGreaterThan(0);
  });

  it("should not return a price for a non-existent token", async () => {
    const prices = await getTokenListPrices(["ethereum", "nonexistenttoken"]);
    expect(prices.ethereum).toBeGreaterThan(0);
    expect(prices.nonexistenttoken).toBeUndefined();
  });
});

describe("retrieveReefCoingeckoPrice", () => {
  it("should return a valid price for the reef token", async () => {
    const price = await retrieveReefCoingeckoPrice();
    expect(price).toBeGreaterThan(0);
  });
});
