import { beforeAll, describe, expect, it } from "vitest";
import * as stealthex from "../../../src/integrations/stealthex";

describe("contract data", () => {
  it("should return list all currencies", async () => {
    const response = await stealthex.listCurrencies();
    expect(response.length).toBeGreaterThan(0);
  });
  it("should get exchange rate", async () => {
    const response = await stealthex.getExchangeRange("btc", "mainnet");
    expect(response.min_amount).toBeGreaterThan(0);
  });
  it("should get estimated exchange rate", async () => {
    const response = await stealthex.getEstimatedExchange("btc", "mainnet", 1);
    expect(response).toBeGreaterThan(0);
  });
  it("should get create an exchange", async () => {
    const response = await stealthex.createExchange(
      "btc",
      "mainnet",
      "reef",
      "mainnet",
      1,
      "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP"
    );
    console.log(response);
    expect(response.status).equal("waiting");
  });
});
