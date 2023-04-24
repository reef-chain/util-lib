import {
  getTokenPrice,
  getTokenListPrices,
  getTokenEthAddressListPrices,
  retrieveReefCoingeckoPrice,
} from "../../src/token/prices";
import { describe, it, expect } from "vitest";

describe("getTokenPrice", () => {
  it("should return a valid price for an existing token", async () => {
    const price = await getTokenPrice("ethereum");
    expect(price).toBeGreaterThan(0);
  });

  it("should return a fallback price for a non-existent token", async () => {
    const price = await getTokenPrice("nonexistenttoken");
    expect(price).toBeGreaterThan(0);
  });

  it("should return a valid price for the reef token", async () => {
    const price = await getTokenPrice("reef");
    expect(price).toBeGreaterThan(0);
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

describe("getTokenEthAddressListPrices", () => {
  it("should return valid prices for a list of existing token addresses", async () => {
    const prices = await getTokenEthAddressListPrices([
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    ]);
    expect(
      prices["0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"]
    ).toBeGreaterThan(0);
    expect(
      prices["0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"]
    ).toBeGreaterThan(0);
  });

  it("should not return a price for a non-existent token address", async () => {
    const prices = await getTokenEthAddressListPrices([
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0xnonexistentaddress",
    ]);
    expect(
      prices["0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"]
    ).toBeGreaterThan(0);
    expect(prices["0xnonexistentaddress"]).toBeUndefined();
  });
});

describe("retrieveReefCoingeckoPrice", () => {
  it("should return a valid price for the reef token", async () => {
    const price = await retrieveReefCoingeckoPrice();
    expect(price).toBeGreaterThan(0);
  });
});
